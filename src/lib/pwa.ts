// PWA utilities and service worker registration
import { useEffect, useState } from 'react';

export interface PWAInstallPrompt {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export interface PWAHook {
  isInstallable: boolean;
  isInstalled: boolean;
  isOffline: boolean;
  installApp: () => Promise<void>;
  updateAvailable: boolean;
  updateApp: () => void;
}

// Service Worker registration
export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if ('serviceWorker' in navigator) {
    try {
      console.log('[PWA] Registering service worker...');
      
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'imports'
      });

      console.log('[PWA] Service worker registered successfully:', registration);

      // Handle updates
      registration.addEventListener('updatefound', () => {
        console.log('[PWA] New service worker found');
        const newWorker = registration.installing;
        
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('[PWA] New service worker installed, update available');
              // Notify user about update
              window.dispatchEvent(new CustomEvent('pwa-update-available'));
            }
          });
        }
      });

      return registration;
    } catch (error) {
      console.error('[PWA] Service worker registration failed:', error);
      return null;
    }
  } else {
    console.warn('[PWA] Service workers not supported');
    return null;
  }
};

// PWA Install Hook
export const usePWA = (): PWAHook => {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [installPrompt, setInstallPrompt] = useState<PWAInstallPrompt | null>(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const checkInstallStatus = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isIOSStandalone = (window.navigator as any).standalone === true;
      setIsInstalled(isStandalone || isIOSStandalone);
    };

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('[PWA] Install prompt available');
      e.preventDefault();
      setInstallPrompt(e as any);
      setIsInstallable(true);
    };

    // Listen for app installed
    const handleAppInstalled = () => {
      console.log('[PWA] App installed');
      setIsInstalled(true);
      setIsInstallable(false);
      setInstallPrompt(null);
    };

    // Listen for network status
    const handleOnline = () => {
      console.log('[PWA] Back online');
      setIsOffline(false);
    };

    const handleOffline = () => {
      console.log('[PWA] Gone offline');
      setIsOffline(true);
    };

    // Listen for PWA updates
    const handleUpdateAvailable = () => {
      console.log('[PWA] Update available');
      setUpdateAvailable(true);
    };

    // Initial checks
    checkInstallStatus();

    // Add event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('pwa-update-available', handleUpdateAvailable);

    // Register service worker
    registerServiceWorker();

    // Cleanup
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('pwa-update-available', handleUpdateAvailable);
    };
  }, []);

  const installApp = async (): Promise<void> => {
    if (!installPrompt) {
      throw new Error('Install prompt not available');
    }

    try {
      console.log('[PWA] Showing install prompt');
      await installPrompt.prompt();
      const result = await installPrompt.userChoice;
      
      console.log('[PWA] Install prompt result:', result.outcome);
      
      if (result.outcome === 'accepted') {
        setIsInstallable(false);
        setInstallPrompt(null);
      }
    } catch (error) {
      console.error('[PWA] Install failed:', error);
      throw error;
    }
  };

  const updateApp = (): void => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      console.log('[PWA] Triggering app update');
      navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  };

  return {
    isInstallable,
    isInstalled,
    isOffline,
    installApp,
    updateAvailable,
    updateApp,
  };
};

// PWA Install Button Component Props
export interface PWAInstallButtonProps {
  className?: string;
  children?: React.ReactNode;
  onInstallSuccess?: () => void;
  onInstallError?: (error: Error) => void;
}

// Utility functions
export const getPWADisplayMode = (): string => {
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return 'standalone';
  }
  if (window.matchMedia('(display-mode: minimal-ui)').matches) {
    return 'minimal-ui';
  }
  if (window.matchMedia('(display-mode: fullscreen)').matches) {
    return 'fullscreen';
  }
  return 'browser';
};

export const isPWAMode = (): boolean => {
  return getPWADisplayMode() !== 'browser';
};

export const canShare = (): boolean => {
  return 'share' in navigator;
};

export const shareContent = async (shareData: ShareData): Promise<void> => {
  if (canShare()) {
    try {
      await navigator.share(shareData);
      console.log('[PWA] Content shared successfully');
    } catch (error) {
      console.error('[PWA] Share failed:', error);
      throw error;
    }
  } else {
    throw new Error('Web Share API not supported');
  }
};

// Background sync utility
export const registerBackgroundSync = async (tag: string): Promise<void> => {
  if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
    try {
      const registration = await navigator.serviceWorker.ready;
      // Type assertion for background sync
      const syncManager = (registration as any).sync;
      if (syncManager) {
        await syncManager.register(tag);
        console.log('[PWA] Background sync registered:', tag);
      }
    } catch (error) {
      console.error('[PWA] Background sync registration failed:', error);
      throw error;
    }
  } else {
    console.warn('[PWA] Background sync not supported');
  }
};

// Push notifications
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission();
    console.log('[PWA] Notification permission:', permission);
    return permission;
  } else {
    console.warn('[PWA] Notifications not supported');
    return 'denied';
  }
};

export const showNotification = (title: string, options?: NotificationOptions): void => {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      icon: '/pwa/icon-192x192.png',
      badge: '/pwa/icon-72x72.png',
      ...options,
    });
  }
};

console.log('[PWA] PWA utilities loaded successfully');
