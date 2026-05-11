type RateLimitEntry = {
  count: number;
  resetAt: number;
};

// In-memory store with automatic cleanup
const inMemoryStore = new Map<string, RateLimitEntry>();
const CLEANUP_INTERVAL = 60_000;
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [key, entry] of inMemoryStore.entries()) {
    if (entry.resetAt < now) {
      inMemoryStore.delete(key);
    }
  }
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

// Redis-backed rate limiter — used when REDIS_URL is set
async function redisRateLimit(
  key: string,
  interval: number,
  max: number
): Promise<{ success: boolean; remaining: number; resetIn: number }> {
  const redisUrl = process.env.REDIS_URL || process.env.UPSTASH_REDIS_REST_URL;

  // In production, Redis is required. Fail loudly if not configured.
  if (process.env.NODE_ENV === 'production' && !redisUrl) {
    console.error(
      '[RateLimit] REDIS_URL or UPSTASH_REDIS_REST_URL is required in production. ' +
        'Falling back to in-memory store which does not work across multiple instances.'
    );
    return inMemoryRateLimit(key, interval, max);
  }

  if (!redisUrl) {
    return inMemoryRateLimit(key, interval, max);
  }

  try {
    const { default: Redis } = await import('ioredis');
    const redis = new Redis(redisUrl, {
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

    if (!results) {
      return inMemoryRateLimit(key, interval, max);
    }

    const count = results[0][1] as number;
    const remaining = Math.max(0, max - count);
    const resetIn = Math.ceil((resetAt - now) / 1000);

    return { success: count <= max, remaining, resetIn };
  } catch {
    return inMemoryRateLimit(key, interval, max);
  }
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
export const dataRateLimit = rateLimit({ interval: 60_000, max: 60, keyPrefix: 'data' });
export const authRateLimit = rateLimit({ interval: 15 * 60_000, max: 10, keyPrefix: 'auth' });
