import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import { supabase } from '../lib/supabase';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
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
  hydrated: boolean;
  updateMe: (c: LatLng) => void;
  setLocationStatus: (status: LocationStatus) => void;
  addMoment: (uri: string, caption?: string) => Promise<void>;
  pruneExpiredMoments: () => void;
  syncSession: () => Promise<void>;
};

const MAX_ROUTE_POINTS = 5000;
const MIN_ROUTE_DISTANCE_KM = 0.008;

export const useApp = create<State>()(
  persist(
    (set, get) => ({
      me: null,
      route: [],
      moments: [],
      locationStatus: 'loading',
      hydrated: false,

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

      addMoment: async (uri, caption = '') => {
        const me = get().me;
        if (!me) return;

        const now = Date.now();
        let storedUri = uri;

        try {
          const directory = FileSystem.documentDirectory;
          if (directory) {
            const extension = uri.split('.').pop()?.split('?')[0] || 'jpg';
            const destination = `${directory}moments/`;
            await FileSystem.makeDirectoryAsync(destination, { intermediates: true });
            storedUri = `${destination}${now.toString(36)}-${Math.random().toString(36).slice(2, 8)}.${extension}`;
            await FileSystem.copyAsync({ from: uri, to: storedUri });
          }
        } catch {
          storedUri = uri;
        }
        const m: Moment = {
          id: `${now.toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
          author: 'Sen',
          mine: true,
          uri: storedUri,
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

      syncSession: async () => {
        if (!supabase) return;
        const { data } = await supabase.auth.getSession();
        if (!data.session) return;

        const user = data.session.user;
        const username = (user.user_metadata?.username as string | undefined) || user.email?.split('@')[0] || 'picroad-user';

        await supabase.from('profiles').upsert({
          id: user.id,
          username: username.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 24) || `user_${user.id.slice(0, 8)}`,
          display_name: user.user_metadata?.display_name || null,
        }, { onConflict: 'id' });
      },
    }),
    {
      name: 'picroad-local-v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        me: state.me,
        route: state.route,
        moments: state.moments.filter((moment) => !isExpired(moment.createdAt)),
      }),
      onRehydrateStorage: () => (state) => {
        state?.pruneExpiredMoments();
        state && useApp.setState({ hydrated: true });
      },
    },
  ),
);
