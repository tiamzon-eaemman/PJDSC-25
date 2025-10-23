"use client";

import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function MobilePWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SAGIP Mobile PWA: Service Worker registered', registration);
          
          // Check for updates
          registration.addEventListener('updatefound', () => {
            console.log('SAGIP Mobile PWA: Update found');
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New content is available, prompt user to refresh
                  if (confirm('New version available! Refresh to update?')) {
                    window.location.reload();
                  }
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('SAGIP Mobile PWA: Service Worker registration failed', error);
        });
    }

    // Handle install prompt
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    // Handle app installed
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    // Handle online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    // Add event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check initial online status
    setIsOnline(navigator.onLine);

    // Cleanup
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log('SAGIP Mobile PWA: Install prompt outcome:', outcome);
      setDeferredPrompt(null);
    }
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50">
      {/* Offline indicator */}
      {!isOnline && (
        <div className="bg-orange-500 text-white px-4 py-2 rounded-lg mb-2 text-center">
          📡 You're offline - Some features may be limited
        </div>
      )}

      {/* Install prompt */}
      {deferredPrompt && !isInstalled && (
        <div className="bg-blue-600 text-white px-4 py-3 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Install SAGIP</h3>
              <p className="text-sm opacity-90">Get quick access to disaster management tools</p>
            </div>
            <button
              onClick={handleInstallClick}
              className="bg-white text-blue-600 px-4 py-2 rounded font-medium hover:bg-gray-100 transition-colors"
            >
              Install
            </button>
          </div>
        </div>
      )}

      {/* Installed confirmation */}
      {isInstalled && (
        <div className="bg-green-600 text-white px-4 py-2 rounded-lg text-center">
          ✅ SAGIP installed successfully!
        </div>
      )}
    </div>
  );
}
