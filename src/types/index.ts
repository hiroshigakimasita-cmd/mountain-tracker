export type MountainCategory = '百名山' | '二百名山' | '三百名山' | 'その他';

export const MOUNTAIN_CATEGORIES: MountainCategory[] = [
  '百名山',
  '二百名山',
  '三百名山',
  'その他',
];

export interface Mountain {
  id: string;
  name: string;
  elevation: number;
  lat: number;
  lng: number;
  category: MountainCategory;
  isClimbed: boolean;
  climbDate: string | null;
  notes: string;
  gpxTrackIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface GpxTrack {
  id: string;
  name: string;
  fileName: string;
  coordinates: [number, number][];
  totalDistance: number | null;
  elevationGain: number | null;
  trackDate: string | null;
  color: string;
  rawGpx: string;
  mountainId: string | null;
  createdAt: string;
}

export interface MountainFilter {
  searchText: string;
  categories: MountainCategory[];
  climbedStatus: 'all' | 'climbed' | 'unclimbed';
}

export interface AppData {
  mountains: Mountain[];
  gpxTracks: GpxTrack[];
  version: number;
}

export type MapMode = 'view' | 'addMountain';

export interface MountainFormData {
  name: string;
  elevation: string;
  lat: string;
  lng: string;
  category: MountainCategory;
  isClimbed: boolean;
  climbDate: string;
  notes: string;
}

// ---- Access Planner Types ----

export type ShinkansenLine =
  | '東海道新幹線'
  | '山陽新幹線'
  | '東北新幹線'
  | '上越新幹線'
  | '北陸新幹線'
  | '北海道新幹線'
  | '秋田新幹線'
  | '山形新幹線';

export interface ShinkansenStation {
  name: string;
  lat: number;
  lng: number;
  line: ShinkansenLine;
}

export interface Airport {
  name: string;
  code: string;
  lat: number;
  lng: number;
}

export interface TimesCarShareStation {
  name: string;
  lat: number;
  lng: number;
  nearHub: string;
}

export interface AccessOption {
  type: 'shinkansen' | 'flight' | 'nightbus';
  label: string;
  distanceKm: number;
  estimatedDrivingMinutes: number;
  bookingUrl: string;
  bookingHint: string;
  details: string;
}

export interface AccessPlan {
  mountain: Mountain;
  date: string;
  nearestStations: AccessOption[];
  nearestAirports: AccessOption[];
  nightBus: AccessOption;
  carShareStations: TimesCarShareStation[];
}
