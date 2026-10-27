import { create } from 'zustand';
import { hoursAgo } from '../lib/time';
import type { LatLng } from '../lib/geo';

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
  seeded: boolean;
  updateMe: (c: LatLng) => void;
  addMoment: (uri: string, caption?: string) => void;
};

const img = (seed: string) => `https://picsum.photos/seed/${seed}/400/400`;

// Örnek arkadaş fotoğrafları: ilk konum gelince kullanıcının çevresine yerleştirilir.
const seed = (c: LatLng): Moment[] => [
  { id: 'm1', author: 'Maya', mine: false, uri: img('maya'), caption: 'Sabah kahvesi', createdAt: hoursAgo(5), latitude: c.latitude + 0.0015, longitude: c.longitude - 0.002 },
  { id: 'm2', author: 'Jules', mine: false, uri: img('jules'), caption: 'Manzaralı rota', createdAt: hoursAgo(1), latitude: c.latitude + 0.0005, longitude: c.longitude + 0.0025 },
  { id: 'm3', author: 'Leo', mine: false, uri: img('leo'), caption: 'Çiçekçi sokağı', createdAt: hoursAgo(8), latitude: c.latitude - 0.002, longitude: c.longitude + 0.001 },
];

export const useApp = create<State>((set, get) => ({
  me: null,
  route: [],
  moments: [],
  seeded: false,
  updateMe: (c) =>
    set((s) => ({
      me: c,
      route: [...s.route, c],
      moments: s.seeded ? s.moments : seed(c),
      seeded: true,
    })),
  addMoment: (uri, caption = '') => {
    const me = get().me;
    if (!me) return;
    const m: Moment = {
      id: String(Date.now()),
      author: 'Sen',
      mine: true,
      uri,
      caption,
      createdAt: Date.now(),
      latitude: me.latitude,
      longitude: me.longitude,
    };
    set((s) => ({ moments: [m, ...s.moments] }));
  },
}));
