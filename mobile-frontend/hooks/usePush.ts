"use client";

import { useEffect, useState } from 'react';
import { getApiBaseUrl } from '@/lib/api';

interface UsePushOptions {
  autoSubscribe?: boolean;
}

export function usePush({ autoSubscribe = true }: UsePushOptions = {}) {
  const [supported, setSupported] = useState<boolean>(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [subscribed, setSubscribed] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSupported('serviceWorker' in navigator && 'PushManager' in window);
    setPermission(Notification.permission);
  }, []);

  useEffect(() => {
    if (!autoSubscribe || !supported) return;
    (async () => {
      try {
        if (Notification.permission === 'default') {
          const p = await Notification.requestPermission();
          setPermission(p);
          if (p !== 'granted') return;
        }
        if (Notification.permission !== 'granted') return;
        const reg = await navigator.serviceWorker.ready;
        let sub = await reg.pushManager.getSubscription();
        if (!sub) {
          const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
          sub = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: vapidKey ? urlBase64ToUint8Array(vapidKey) : undefined,
          });
        }
        if (sub) {
          await fetch(getApiBaseUrl() + '/push/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subscription: sub.toJSON() })
          });
          setSubscribed(true);
        }
      } catch (e: any) {
        setError(e.message || 'Push subscription error');
      }
    })();
  }, [autoSubscribe, supported]);

  return { supported, permission, subscribed, error };
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
