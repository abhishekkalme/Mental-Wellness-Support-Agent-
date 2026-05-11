import crypto from 'crypto';

export function contentHash(text: string): string {
  return crypto.createHash('sha256').update(text.toLowerCase().trim()).digest('hex').slice(0, 16);
}

export class EmbeddingCache {
  private cache = new Map<string, { vector: number[]; timestamp: number }>();
  private maxAgeMs: number;
  private maxEntries: number;

  constructor(maxAgeMs = 30 * 60 * 1000, maxEntries = 500) {
    this.maxAgeMs = maxAgeMs;
    this.maxEntries = maxEntries;
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  get(text: string): number[] | null {
    const key = contentHash(text);
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > this.maxAgeMs) {
      this.cache.delete(key);
      return null;
    }
    return entry.vector;
  }

  set(text: string, vector: number[]): void {
    if (this.cache.size >= this.maxEntries) {
      const oldest = [...this.cache.entries()].sort((a, b) => a[1].timestamp - b[1].timestamp)[0];
      this.cache.delete(oldest[0]);
    }
    this.cache.set(contentHash(text), { vector, timestamp: Date.now() });
  }

  private cleanup(): void {
    const cutoff = Date.now() - this.maxAgeMs;
    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < cutoff) this.cache.delete(key);
    }
  }
}

export class LlmResponseCache {
  private cache = new Map<string, { reply: string; timestamp: number }>();
  private ttlMs: number;
  private maxEntries: number;
  private dedupMap = new Map<string, number>();

  constructor(ttlMs = 15 * 60 * 1000, maxEntries = 200) {
    this.ttlMs = ttlMs;
    this.maxEntries = maxEntries;
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  private makeKey(userId: string, content: string, context: string): string {
    const h = crypto
      .createHash('sha256')
      .update([userId, contentHash(content), contentHash(context)].join('|'))
      .digest('hex');
    return h;
  }

  get(userId: string, content: string, context: string): string | null {
    const key = this.makeKey(userId, content, context);
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > this.ttlMs) {
      this.cache.delete(key);
      return null;
    }
    return entry.reply;
  }

  set(userId: string, content: string, context: string, reply: string): void {
    if (this.cache.size >= this.maxEntries) {
      const oldest = [...this.cache.entries()].sort((a, b) => a[1].timestamp - b[1].timestamp)[0];
      this.cache.delete(oldest[0]);
    }
    const key = this.makeKey(userId, content, context);
    this.cache.set(key, { reply, timestamp: Date.now() });
  }

  tryAcquireDedup(userId: string, content: string): boolean {
    const key = `${userId}:${contentHash(content)}`;
    const last = this.dedupMap.get(key);
    const now = Date.now();
    if (last && now - last < 30_000) return false;
    this.dedupMap.set(key, now);
    setTimeout(() => this.dedupMap.delete(key), 30_000);
    return true;
  }

  private cleanup(): void {
    const cutoff = Date.now() - this.ttlMs;
    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < cutoff) this.cache.delete(key);
    }
    for (const [key, ts] of this.dedupMap.entries()) {
      if (Date.now() - ts > 60_000) this.dedupMap.delete(key);
    }
  }
}

export class RetrievalCache {
  private cache = new Map<string, { results: string[]; timestamp: number }>();
  private ttlMs: number;
  private maxEntries: number;

  constructor(ttlMs = 10 * 60 * 1000, maxEntries = 300) {
    this.ttlMs = ttlMs;
    this.maxEntries = maxEntries;
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  private makeKey(userId: string, query: string): string {
    return `${userId}:${contentHash(query)}`;
  }

  get(userId: string, query: string): string[] | null {
    const key = this.makeKey(userId, query);
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > this.ttlMs) {
      this.cache.delete(key);
      return null;
    }
    return entry.results;
  }

  set(userId: string, query: string, results: string[]): void {
    if (this.cache.size >= this.maxEntries) {
      const oldest = [...this.cache.entries()].sort((a, b) => a[1].timestamp - b[1].timestamp)[0];
      this.cache.delete(oldest[0]);
    }
    this.cache.set(this.makeKey(userId, query), {
      results,
      timestamp: Date.now(),
    });
  }

  private cleanup(): void {
    const cutoff = Date.now() - this.ttlMs;
    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < cutoff) this.cache.delete(key);
    }
  }
}

export const embeddingCache = new EmbeddingCache();
export const llmResponseCache = new LlmResponseCache();
export const retrievalCache = new RetrievalCache();
