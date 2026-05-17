type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const inMemoryStore = new Map<string, RateLimitEntry>();
const CLEANUP_INTERVAL = 60_000;
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  inMemoryStore.forEach((entry, key) => {
    if (entry.resetAt < now) {
      inMemoryStore.delete(key);
    }
  });
}

setInterval(cleanup, CLEANUP_INTERVAL);

function inMemoryRateLimit(
  key: string,
  interval: number,
  max: number
): { success: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  cleanup();

  let entry = inMemoryStore.get(key);

  if (!entry || entry.resetAt < now) {
    entry = { count: 0, resetAt: now + interval };
    inMemoryStore.set(key, entry);
  }

  entry.count++;
  const remaining = Math.max(0, max - entry.count);
  const resetIn = Math.ceil((entry.resetAt - now) / 1000);

  return { success: entry.count <= max, remaining, resetIn };
}

function nonEmpty(val: string | undefined): val is string {
  return typeof val === 'string' && val.length > 0;
}

async function redisRateLimit(
  key: string,
  interval: number,
  max: number
): Promise<{ success: boolean; remaining: number; resetIn: number }> {
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  const redisUrl = process.env.REDIS_URL;

  const hasUpstash = nonEmpty(upstashUrl) && nonEmpty(upstashToken);
  const hasRedis = nonEmpty(redisUrl);

  if (!hasUpstash && !hasRedis) {
    if (process.env.NODE_ENV === 'production') {
      console.warn(
        '[RateLimit] No Redis/Upstash configured — using in-memory fallback (not suitable for multi-instance deployment)'
      );
    }
    return inMemoryRateLimit(key, interval, max);
  }

  if (hasUpstash) {
    try {
      const { Redis } = await import('@upstash/redis');
      const redis = new Redis({ url: upstashUrl!, token: upstashToken! });
      const now = Date.now();
      const resetAt = now + interval;
      const count = await redis.incr(key);
      await redis.expireat(key, Math.ceil(resetAt / 1000));
      const remaining = Math.max(0, max - count);
      const resetIn = Math.ceil((resetAt - now) / 1000);
      return { success: count <= max, remaining, resetIn };
    } catch (error) {
      console.error('[RateLimit] Upstash error:', error);
      return inMemoryRateLimit(key, interval, max);
    }
  }

  if (hasRedis) {
    try {
      const { default: Redis } = await import('ioredis');
      const redis = new Redis(redisUrl!, {
        maxRetriesPerRequest: 1,
        lazyConnect: true,
        retryStrategy: () => null,
      });
      await redis.connect().catch(() => {});
      const now = Date.now();
      const resetAt = now + interval;
      const multi = redis.multi();
      multi.incr(key);
      multi.expireat(key, Math.ceil(resetAt / 1000));
      const results = await multi.exec();
      await redis.quit().catch(() => {});
      if (!results) return inMemoryRateLimit(key, interval, max);
      const count = results[0][1] as number;
      const remaining = Math.max(0, count <= max ? max - count : 0);
      const resetIn = Math.ceil((resetAt - now) / 1000);
      return { success: count <= max, remaining, resetIn };
    } catch {
      return inMemoryRateLimit(key, interval, max);
    }
  }

  return inMemoryRateLimit(key, interval, max);
}

export function rateLimit(options: { interval: number; max: number; keyPrefix?: string }) {
  const { interval, max, keyPrefix = 'rl' } = options;

  return async (
    identifier: string
  ): Promise<{ success: boolean; remaining: number; resetIn: number }> => {
    const key = `${keyPrefix}:${identifier}`;
    return redisRateLimit(key, interval, max);
  };
}

export function getClientIdentifier(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip');
  const ip = cfConnectingIp || realIp || (forwarded ? forwarded.split(',')[0].trim() : null);
  const authHeader = request.headers.get('authorization');
  const cookieHeader = request.headers.get('cookie');
  const sessionId = authHeader || cookieHeader || '';
  const combined = (ip || 'unknown') + (sessionId.slice(0, 32) || '');
  return hashString(combined);
}

function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

export const chatRateLimit = rateLimit({ interval: 60_000, max: 20, keyPrefix: 'chat' });
export const dataRateLimit = rateLimit({ interval: 60_000, max: 120, keyPrefix: 'data' });
export const authRateLimit = rateLimit({ interval: 15 * 60_000, max: 10, keyPrefix: 'auth' });
