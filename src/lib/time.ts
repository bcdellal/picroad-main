const HOUR = 3600000;
export const MOMENT_TTL = 24 * HOUR;

export function isExpired(createdAt: number, now = Date.now()) {
  return now - createdAt >= MOMENT_TTL;
}

export function hoursLeft(createdAt: number, now = Date.now()) {
  const remaining = MOMENT_TTL - (now - createdAt);
  return Math.max(0, Math.ceil(remaining / HOUR));
}

export const hoursAgo = (h: number) => Date.now() - h * HOUR;
