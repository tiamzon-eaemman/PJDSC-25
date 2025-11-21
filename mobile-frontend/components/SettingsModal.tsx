"use client";

import { X, Wrench } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getApiBaseUrl, setApiBaseUrl } from '@/lib/api';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [url, setUrl] = useState('');
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setUrl(getApiBaseUrl());
      setNote(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const onSave = () => {
    const trimmed = url.trim().replace(/\/$/, '');
    if (!/^https?:\/\//.test(trimmed)) {
      setNote('Enter a valid http(s) URL');
      return;
    }
    setApiBaseUrl(trimmed);
    setNote('Saved. Reloading to apply...');
    setTimeout(() => {
      if (typeof window !== 'undefined') window.location.reload();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-[#0E1624] rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-yellow-400" />
            <h2 className="text-lg font-bold text-white">Settings</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/5 transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        <div className="p-5 space-y-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Backend API Base URL (development only)</label>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="http://localhost:8000"
              className="w-full bg-[#131C2D] border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {note && <div className="text-xs text-yellow-400">{note}</div>}
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={onClose} className="px-3 py-2 text-xs rounded-lg bg-white/10 hover:bg-white/15">Cancel</button>
            <button onClick={onSave} className="px-3 py-2 text-xs rounded-lg bg-blue-600 hover:bg-blue-500">Save</button>
          </div>
          <div className="text-[10px] text-gray-500 pt-1">This setting is for development only and overrides NEXT_PUBLIC_BACKEND_URL.</div>
        </div>
      </div>
    </div>
  );
}
