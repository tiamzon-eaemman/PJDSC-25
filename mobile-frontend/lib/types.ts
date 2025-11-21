// API Types based on backend models
// Backend-derived evacuation center type
export interface EvacCenter {
  id: string;
  name: string;
  capacity?: number;
  current?: number; // current occupancy count
  active?: boolean; // true means OPEN
  standby?: number; // backend meaning (e.g. standby staff count)
  center?: [number, number]; // [lat, lng]
}

// Plan related backend types
export interface TyphoonDetails {
  name: string;
  signal: number;
  wind_kmh: number;
  movement: string;
  // optional future fields:
  // pressure_hpa?: number;
  // gust_kmh?: number;
}

export interface PlanHotline {
  label: string;
  number: string;
}

export interface PlanChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface PublishedPlan {
  id?: string;
  text: string; // hazard summary narrative
  typhoon: TyphoonDetails;
  hotlines: PlanHotline[];
  checklist: PlanChecklistItem[];
  map_link?: string | null;
  updated_at?: string;
}

export interface CurrentPlanResponse {
  exists: boolean;
  plan?: PublishedPlan;
}

// Legacy advisory placeholders retained for existing components.
export interface Advisory {
  id: string;
  type: 'thunderstorm' | 'landslide' | 'flood' | 'storm_surge' | 'wind';
  title: string;
  affectedAreas: string[];
  severity?: 'low' | 'medium' | 'high' | 'critical';
  date?: string;
  time?: string;
  description?: string;
}

export interface AdvisoryGroup {
  date: string;
  advisories: Advisory[];
}

// Navigation types
export type TabType = 'info' | 'home' | 'alerts';

export interface NavigationTab {
  id: TabType;
  icon: string;
  label: string;
  active?: boolean;
}
