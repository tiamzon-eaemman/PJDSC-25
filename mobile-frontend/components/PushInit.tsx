"use client";
import { useEffect } from 'react';
import { usePush } from '@/hooks/usePush';

export default function PushInit() {
  const { supported, permission, subscribed, error } = usePush({ autoSubscribe: true });
  useEffect(() => {
    if (error) console.warn('Push error', error);
  }, [error]);
  return null;
}
