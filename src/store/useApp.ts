import { create } from 'zustand';
import { distanceKm } from '../lib/geo';
import { isExpired } from '../lib/time';
import type { LatLng } from '../lib/geo';

export type LocationStatus = 'loading' | 'ready' | 'denied' | 'error';

export type Moment = {
  id: string;
  author: string;
  mine: boolean;
  uri: string;
  caption: string;
  createdAt: number;
  latitude: number;
  longitude: number;
};

type State = {
  me: LatLng | null;
  route: LatLng[];
  moments: Moment[];
  locationStatus: LocationStatus;
  updateMe: (c: LatLng) => void;
  setLocationStatus: (status: LocationStatus) => void;
  addMoment: (uri: string, caption?: string) => void;
  pruneExpiredMoments: () => void;
};

const MAX_ROUTE_POINTS = 5000;
const MIN_ROUTE_DISTANCE_KM = 0.008;

export const useApp = create<State>((set, get) => ({
  me: null,
  route: [],
  moments: [],
  locationStatus: 'loading',

  setLocationStatus: (locationStatus) => set({ locationStatus }),

  updateMe: (c) =>
    set((s) => {
      const last = s.route[s.route.length - 1];
      const movedEnough = !last || distanceKm(last, c) >= MIN_ROUTE_DISTANCE_KM;

      return {
        me: c,
        route: movedEnough ? [...s.route, c].slice(-MAX_ROUTE_POINTS) : s.route,
        locationStatus: 'ready',
      };
    }),

  addMoment: (uri, caption = '') => {
    const me = get().me;
    if (!me) return;

    const now = Date.now();
    const m: Moment = {
      id: `${now.toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
      author: 'Sen',
      mine: true,
      uri,
      caption: caption.trim(),
      createdAt: now,
      latitude: me.latitude,
      longitude: me.longitude,
    };

    set((s) => ({
      moments: [m, ...s.moments.filter((moment) => !isExpired(moment.createdAt))],
    }));
  },

  pruneExpiredMoments: () =>
    set((s) => ({
      moments: s.moments.filter((moment) => !isExpired(moment.createdAt)),
    })),
}));
