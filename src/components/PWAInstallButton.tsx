import React, { useState } from 'react';
import { Check, Loader2, Download } from 'lucide-react';
import { usePWA, PWAInstallButtonProps } from '../lib/pwa';

const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  className = '',
  children,
  onInstallSuccess,
  onInstallError,
}) => {
  const { isInstallable, isInstalled, installApp } = usePWA();
  const [isInstalling, setIsInstalling] = useState(false);

  const handleInstall = async () => {
    if (!isInstallable || isInstalling) return;

    setIsInstalling(true);
    try {
      await installApp();
      onInstallSuccess?.();
    } catch (error) {
      console.error('PWA install failed:', error);
      onInstallError?.(error as Error);
    } finally {
      setIsInstalling(false);
    }
  };

  if (isInstalled) {
    return (
      <div className={`inline-flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg ${className}`}>
        <Check className="w-4 h-4" />
        <span className="text-sm font-medium">App Installed</span>
      </div>
    );
  }

  if (!isInstallable) {
    return null;
  }

  return (
    <button
      onClick={handleInstall}
      disabled={isInstalling}
      className={`inline-flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg transition-all duration-200 hover:scale-105 shadow-lg ${className}`}
    >
      {isInstalling ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Download className="w-4 h-4" />
      )}
      <span className="text-sm font-medium">
        {isInstalling ? 'Installing...' : (children || 'Install App')}
      </span>
    </button>
  );
};

export default PWAInstallButton;
