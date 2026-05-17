/* eslint-disable @typescript-eslint/no-require-imports */
import { sanitize, sanitizeAndTrim, moderateContent } from '@/lib/utils';

describe('sanitize', () => {
  it('removes script tags', () => {
    expect(sanitize('<script>alert("xss")</script>Hello')).toBe('Hello');
  });

  it('removes onclick handlers', () => {
    expect(sanitize('Click <a onclick="evil()">here</a>')).toBe('Click <a>here</a>');
  });

  it('removes javascript: URLs', () => {
    expect(sanitize('Visit <a href="javascript:alert(1)">link</a>')).toBe('Visit <a>link</a>');
  });

  it('preserves normal text', () => {
    expect(sanitize('Hello, world!')).toBe('Hello, world!');
  });

  it('handles empty string', () => {
    expect(sanitize('')).toBe('');
  });
});

describe('sanitizeAndTrim', () => {
  it('sanitizes and trims', () => {
    expect(sanitizeAndTrim('  <script>x</script>  Hello world  ')).toBe('Hello world');
  });

  it('handles empty string', () => {
    expect(sanitizeAndTrim('')).toBe('');
  });

  it('trims whitespace only input', () => {
    expect(sanitizeAndTrim('   \n\t   ')).toBe('');
  });
});

describe('moderateContent', () => {
  it('returns null for clean content', () => {
    const result = moderateContent('I am feeling stressed about exams.');
    expect(result).toBeNull();
  });

  it('flags explicit sexual content', () => {
    const result = moderateContent('explicit sexual content here');
    expect(result).not.toBeNull();
  });

  it('flags extreme violence', () => {
    const result = moderateContent('extreme graphic violence gore');
    expect(result).not.toBeNull();
  });
});

describe('validateEnv', () => {
  it('returns empty array when all required vars are set', () => {
    const original = process.env.AUTH_SECRET;
    process.env.AUTH_SECRET = 'a'.repeat(32);
    const originalDb = process.env.MONGODB_URI;
    process.env.MONGODB_URI = 'mongodb://localhost';
    const originalAI = process.env.GROQ_API_KEY;
    process.env.GROQ_API_KEY = 'test-key';

    const { validateEnv } = require('@/lib/validateEnv');
    const issues = validateEnv();
    expect(issues).toHaveLength(0);

    process.env.AUTH_SECRET = original;
    process.env.MONGODB_URI = originalDb;
    process.env.GROQ_API_KEY = originalAI;
  });

  it('flags missing AUTH_SECRET', () => {
    const original = process.env.AUTH_SECRET;
    delete process.env.AUTH_SECRET;
    const originalDb = process.env.MONGODB_URI;
    process.env.MONGODB_URI = 'mongodb://localhost';
    const originalAI = process.env.GROQ_API_KEY;
    process.env.GROQ_API_KEY = 'test-key';

    const { validateEnv } = require('@/lib/validateEnv');
    const issues = validateEnv();
    expect(issues.some((i: { key: string }) => i.key === 'AUTH_SECRET')).toBe(true);

    process.env.AUTH_SECRET = original;
    process.env.MONGODB_URI = originalDb;
    process.env.GROQ_API_KEY = originalAI;
  });

  it('flags short AUTH_SECRET', () => {
    const original = process.env.AUTH_SECRET;
    process.env.AUTH_SECRET = 'short';
    const originalDb = process.env.MONGODB_URI;
    process.env.MONGODB_URI = 'mongodb://localhost';
    const originalAI = process.env.GROQ_API_KEY;
    process.env.GROQ_API_KEY = 'test-key';

    const { validateEnv } = require('@/lib/validateEnv');
    const issues = validateEnv();
    expect(issues.some((i: { key: string }) => i.key === 'AUTH_SECRET')).toBe(true);

    process.env.AUTH_SECRET = original;
    process.env.MONGODB_URI = originalDb;
    process.env.GROQ_API_KEY = originalAI;
  });
});

describe('rate limiter', () => {
  it('allows first request', () => {
    const { rateLimit } = require('@/lib/rateLimit');
    const result = rateLimit({ id: 'test-1', limit: 10, window: 60000 });
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(9);
  });

  it('tracks multiple requests', () => {
    const { rateLimit } = require('@/lib/rateLimit');
    const id = `test-rate-${Date.now()}`;
    const first = rateLimit({ id, limit: 5, window: 60000 });
    expect(first.remaining).toBe(4);
    const second = rateLimit({ id, limit: 5, window: 60000 });
    expect(second.remaining).toBe(3);
  });

  it('blocks when limit exceeded', () => {
    const { rateLimit } = require('@/lib/rateLimit');
    const id = `test-block-${Date.now()}`;
    for (let i = 0; i < 3; i++) {
      rateLimit({ id, limit: 3, window: 60000 });
    }
    const result = rateLimit({ id, limit: 3, window: 60000 });
    expect(result.success).toBe(false);
    expect(result.remaining).toBe(0);
  });
});

describe('cn utility', () => {
  it('merges class names', () => {
    const { cn } = require('@/lib/utils');
    expect(cn('foo', 'bar')).toBe('foo bar');
    expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz');
    expect(cn('foo', undefined, 'bar')).toBe('foo bar');
  });

  it('handles conditional classes', () => {
    const { cn } = require('@/lib/utils');
    const isActive = true;
    expect(cn('base', isActive && 'active')).toBe('base active');
    expect(cn('base', !isActive && 'inactive')).toBe('base');
  });
});
