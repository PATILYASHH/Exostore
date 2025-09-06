import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Download, X, RefreshCw } from 'lucide-react';
import { usePWA } from '../lib/pwa';

const PWAStatus: React.FC = () => {
  const { isOffline, updateAvailable, updateApp } = usePWA();
  const [showOfflineBanner, setShowOfflineBanner] = useState(false);
  const [showUpdateBanner, setShowUpdateBanner] = useState(false);

  useEffect(() => {
    setShowOfflineBanner(isOffline);
  }, [isOffline]);

  useEffect(() => {
    setShowUpdateBanner(updateAvailable);
  }, [updateAvailable]);

  const handleUpdate = () => {
    updateApp();
  };

  if (!showOfflineBanner && !showUpdateBanner) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      {/* Offline Banner */}
      {showOfflineBanner && (
        <div className="bg-yellow-500 text-white px-4 py-2 text-center text-sm font-medium">
          <div className="flex items-center justify-center space-x-2">
            <WifiOff className="w-4 h-4" />
            <span>You're offline. Some features may be limited.</span>
            <button
              onClick={() => setShowOfflineBanner(false)}
              className="ml-4 p-1 hover:bg-yellow-600 rounded"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Update Banner */}
      {showUpdateBanner && (
        <div className="bg-blue-600 text-white px-4 py-2 text-center text-sm font-medium">
          <div className="flex items-center justify-center space-x-2">
            <RefreshCw className="w-4 h-4" />
            <span>A new version is available!</span>
            <button
              onClick={handleUpdate}
              className="ml-2 px-3 py-1 bg-blue-700 hover:bg-blue-800 rounded text-xs font-semibold transition-colors"
            >
              Update Now
            </button>
            <button
              onClick={() => setShowUpdateBanner(false)}
              className="ml-2 p-1 hover:bg-blue-700 rounded"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PWAStatus;
