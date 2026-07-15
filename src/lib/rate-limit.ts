type RateLimitEntry = {
  count: number;
  resetTime: number;
};

const store = new Map<string, RateLimitEntry>();

function cleanupExpiredEntries(now = Date.now()) {
  for (const [key, entry] of store.entries()) {
    if (entry.resetTime <= now) {
      store.delete(key);
    }
  }
}

export function rateLimit(key: string, maxRequests: number, windowMs: number) {
  const now = Date.now();
  cleanupExpiredEntries(now);

  const current = store.get(key);

  if (!current || current.resetTime <= now) {
    const entry = { count: 1, resetTime: now + windowMs };
    store.set(key, entry);
    return {
      allowed: true,
      count: entry.count,
      remaining: Math.max(0, maxRequests - entry.count),
      resetTime: entry.resetTime,
    };
  }

  current.count += 1;
  const allowed = current.count <= maxRequests;

  return {
    allowed,
    count: current.count,
    remaining: Math.max(0, maxRequests - current.count),
    resetTime: current.resetTime,
  };
}
