import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api';
import { EvacCenter, CurrentPlanResponse, PublishedPlan } from '@/lib/types';

const CENTERS_CACHE_KEY = 'sagip_evac_centers_cache_v1';
const PLAN_CACHE_KEY = 'sagip_plan_cache_v1';

export function useEvacCenters(refreshIntervalMs: number = 30000) {
  const [centers, setCenters] = useState<EvacCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      // Only set loading if we don't have data yet
      setLoading(prev => prev && centers.length === 0);
      const res = await apiClient.listEvacCenters();
      setCenters(res.items);
      try {
        localStorage.setItem(CENTERS_CACHE_KEY, JSON.stringify({ ts: Date.now(), items: res.items }));
      } catch { /* ignore */ }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch evacuation centers');
      // Attempt offline fallback if we haven't loaded yet
      if (centers.length === 0) {
        try {
          const raw = localStorage.getItem(CENTERS_CACHE_KEY);
          if (raw) {
            const parsed = JSON.parse(raw);
            setCenters(parsed.items || []);
          }
        } catch { /* ignore */ }
      }
    } finally {
      setLoading(false);
    }
  }, [centers.length]);

  useEffect(() => {
    // Warm load from cache first for instant UI
    try {
      const raw = localStorage.getItem(CENTERS_CACHE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.items)) {
          setCenters(parsed.items);
        }
      }
    } catch { /* ignore */ }
    load();
    // Disable auto-refresh to prevent UI disruption
    // if (refreshIntervalMs > 0) {
    //   const id = setInterval(load, refreshIntervalMs);
    //   return () => clearInterval(id);
    // }
  }, [load, refreshIntervalMs]);

  return { centers, loading, error, reload: load };
}

export function useCurrentPlan() {
  const [plan, setPlan] = useState<PublishedPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlan = useCallback(async () => {
    try {
      setLoading(true);
      const res: CurrentPlanResponse = await apiClient.getCurrentPlan();
      if (res.exists && res.plan) {
        setPlan(res.plan);
        try { localStorage.setItem(PLAN_CACHE_KEY, JSON.stringify({ ts: Date.now(), plan: res.plan })); } catch { /* ignore */ }
      } else {
        setPlan(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch current plan');
      // Offline fallback
      try {
        const raw = localStorage.getItem(PLAN_CACHE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed.plan) {
            setPlan(parsed.plan);
          }
        }
      } catch { /* ignore */ }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Load cached immediately
    try {
      const raw = localStorage.getItem(PLAN_CACHE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.plan) {
          setPlan(parsed.plan);
        }
      }
    } catch { /* ignore */ }
    fetchPlan();
  }, [fetchPlan]);

  return { plan, loading, error, reload: fetchPlan };
}

export function useHotlinesFromPlan() {
  const { plan, loading, error } = useCurrentPlan();
  return { hotlines: plan?.hotlines ?? [], loading, error };
}

export function useChecklistFromPlan() {
  const { plan, loading, error } = useCurrentPlan();
  return { checklist: plan?.checklist ?? [], loading, error };
}
