import React from 'react';
import { Download, Smartphone, Monitor, Check } from 'lucide-react';
import PWAInstallButton from './PWAInstallButton';
import { usePWA } from '../lib/pwa';

const InstallAppSection: React.FC = () => {
  const { isInstallable, isInstalled } = usePWA();

  if (isInstalled) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
        <div className="flex items-center justify-center space-x-3">
          <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full">
            <Check className="w-6 h-6 text-green-600" />
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-green-800">App Installed!</h3>
            <p className="text-green-600">Exostore is now available from your home screen.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isInstallable) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 mb-8 text-white">
      <div className="text-center">
        <div className="flex items-center justify-center space-x-4 mb-4">
          <div className="flex items-center justify-center w-16 h-16 bg-white/20 rounded-full">
            <Download className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-2xl font-bold mb-2">Install Exostore App</h3>
            <p className="text-blue-100 mb-4">
              Get the full app experience! Install Exostore for faster access, offline browsing, and app-like navigation.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-6">
          <div className="flex items-center space-x-2 text-blue-100">
            <Smartphone className="w-5 h-5" />
            <span>Works on mobile</span>
          </div>
          <div className="flex items-center space-x-2 text-blue-100">
            <Monitor className="w-5 h-5" />
            <span>Works on desktop</span>
          </div>
          <div className="flex items-center space-x-2 text-blue-100">
            <Download className="w-5 h-5" />
            <span>No app store needed</span>
          </div>
        </div>

        <div className="flex justify-center">
          <PWAInstallButton className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 text-lg font-semibold shadow-lg">
            <span className="flex items-center space-x-2">
              <Download className="w-5 h-5" />
              <span>Install Now - It's Free!</span>
            </span>
          </PWAInstallButton>
        </div>

        <p className="text-xs text-blue-200 mt-4">
          Click the button above or look for the install icon in your browser's address bar
        </p>
      </div>
    </div>
  );
};

export default InstallAppSection;
