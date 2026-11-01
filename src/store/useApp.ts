import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { uploadMoment } from '../lib/uploadMoment';
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
const MIN_ROUTE_DISTANCE_KM = 0.004;

// UUID v4 format is required by public.moments.id (Postgres uuid).
function createMomentId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const random = Math.floor(Math.random() * 16);
    const value = char === 'x' ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

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
        if (!me) throw new Error('Konum alınmadan fotoğraf konumlandırılamaz.');

        const now = Date.now();
        const momentId = createMomentId();
        const moment: Moment = {
          id: momentId,
          author: 'Sen',
          mine: true,
          uri,
          caption: caption.trim(),
          createdAt: now,
          latitude: me.latitude,
          longitude: me.longitude,
        };

        if (supabase) {
          const { data, error: sessionError } = await supabase.auth.getSession();
          if (sessionError) throw sessionError;
          const user = data.session?.user;
          if (!user) throw new Error('Fotoğrafı yüklemek için önce giriş yapmalısın.');

          const uploaded = await uploadMoment(uri, user.id, moment.id);
          const { error: insertError } = await supabase.from('moments').insert({
            id: moment.id,
            user_id: user.id,
            storage_path: uploaded.path,
            caption: moment.caption,
            latitude: moment.latitude,
            longitude: moment.longitude,
          });

          if (insertError) {
            await supabase.storage.from('moments').remove([uploaded.path]);
            throw insertError;
          }

          // The row now exists, so the Storage SELECT policy can authorize
          // creation of a signed URL for this private image.
          const { data: signedData, error: signedUrlError } = await supabase.storage
            .from('moments')
            .createSignedUrl(uploaded.path, 60 * 60 * 24);

          if (signedUrlError || !signedData?.signedUrl) {
            await supabase.from('moments').delete().eq('id', moment.id);
            await supabase.storage.from('moments').remove([uploaded.path]);
            throw signedUrlError ?? new Error('Fotoğraf bağlantısı oluşturulamadı.');
          }

          moment.uri = signedData.signedUrl;
        }

        set((s) => ({
          moments: [moment, ...s.moments.filter((item) => !isExpired(item.createdAt))],
        }));
      },

      pruneExpiredMoments: () =>
        set((s) => ({
          moments: s.moments.filter((moment) => !isExpired(moment.createdAt)),
        })),

      syncSession: async () => {
        if (!supabase) return;
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (!data.session) return;

        const user = data.session.user;
        const username = (user.user_metadata?.username as string | undefined) || user.email?.split('@')[0] || 'picroad-user';

        const { error: profileError } = await supabase.from('profiles').upsert({
          id: user.id,
          username: username.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 24) || `user_${user.id.slice(0, 8)}`,
          display_name: user.user_metadata?.display_name || null,
        }, { onConflict: 'id' });

        if (profileError) throw profileError;
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
