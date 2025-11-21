import { EvacCenter, CurrentPlanResponse, PublishedPlan } from './types';

// Base URL should point to FastAPI root (no trailing /api since backend routes are at root)
const DEFAULT_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://192.168.68.127:8000';

let runtimeBaseUrl: string | null = null;

export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    const saved = window.localStorage.getItem('sagip_api_base_url');
    if (saved) return saved.replace(/\/$/, '');
  }
  return (runtimeBaseUrl || DEFAULT_BASE_URL).replace(/\/$/, '');
}

export function setApiBaseUrl(url: string) {
  runtimeBaseUrl = url;
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('sagip_api_base_url', url);
    }
  } catch { /* ignore */ }
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${getApiBaseUrl()}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`API ${endpoint} failed: ${response.status} ${text}`);
    }
    return response.json();
  }

  // Healthz
  async healthz(): Promise<{ status: string }> {
    return this.request<{ status: string }>(`/healthz`);
  }

  // Evacuation Centers
  async listEvacCenters(): Promise<{ count: number; items: EvacCenter[] }> {
    return this.request<{ count: number; items: EvacCenter[] }>(`/evac_centers`);
  }

  async updateEvacCenterCapacity(centerId: string, capacity: number): Promise<EvacCenter> {
    return this.request<EvacCenter>(`/evac_centers/${centerId}/capacity`, {
      method: 'PUT',
      body: JSON.stringify({ capacity }),
    });
  }

  async updateEvacCenterCurrent(centerId: string, current: number): Promise<EvacCenter> {
    return this.request<EvacCenter>(`/evac_centers/${centerId}/current`, {
      method: 'PUT',
      body: JSON.stringify({ current }),
    });
  }

  // Current published plan (hazard summary / typhoon advisory / hotlines / checklist)
  async getCurrentPlan(): Promise<CurrentPlanResponse> {
    return this.request<CurrentPlanResponse>(`/plan`);
  }

  async putCurrentPlan(plan: PublishedPlan): Promise<{ updated: boolean; plan: PublishedPlan }> {
    // Backend expects payload matching LGUSinglePlanPayload fields
    const payload = {
      text: plan.text,
      typhoon: plan.typhoon,
      hotlines: plan.hotlines,
      checklist: plan.checklist,
      map_link: plan.map_link ?? null,
    };
    return this.request<{ updated: boolean; plan: PublishedPlan }>(`/plan`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }
}

export const apiClient = new ApiClient(getApiBaseUrl());
