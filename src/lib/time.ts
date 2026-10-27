const HOUR = 3600000;

// Fotoğraflar 24 saat sonra kaybolur: kalan saati döndürür.
export function hoursLeft(createdAt: number) {
  return Math.max(0, 24 - Math.floor((Date.now() - createdAt) / HOUR));
}
export const hoursAgo = (h: number) => Date.now() - h * HOUR;
