"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPage() {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const onBeforeInstall = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setPromptEvent(e);
    };
    const onInstalled = () => setInstalled(true);
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!promptEvent) return;
    promptEvent.prompt();
    const choice = await promptEvent.userChoice;
    if (choice.outcome === "accepted") setInstalled(true);
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Install SAGIP PWA</h1>
      <p className="mb-4">
        Add this app to your home screen for offline access and a native-like
        experience.
      </p>
      <button
        className="px-4 py-2 rounded bg-black text-white disabled:opacity-50"
        onClick={handleInstall}
        disabled={!promptEvent || installed}
      >
        {installed ? "Installed" : "Add to Home Screen"}
      </button>
      {!promptEvent && !installed && (
        <p className="text-sm text-gray-600 mt-3">
          Tip: Open this site in Chrome/Edge on Android to see the install
          prompt.
        </p>
      )}
    </div>
  );
}

