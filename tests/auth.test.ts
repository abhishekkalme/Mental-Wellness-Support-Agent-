import { validateEnv } from '@/lib/validateEnv';

describe('Auth Utilities', () => {
  describe('validateEnv', () => {
    it('returns no issues when all required vars are set', () => {
      const issues = validateEnv();
      expect(issues).toBeDefined();
    });

    it('flags missing AUTH_SECRET', () => {
      const original = process.env.AUTH_SECRET;
      delete process.env.AUTH_SECRET;
      const issues = validateEnv();
      expect(issues.some((i) => i.key === 'AUTH_SECRET')).toBe(true);
      process.env.AUTH_SECRET = original;
    });

    it('flags short AUTH_SECRET', () => {
      const original = process.env.AUTH_SECRET;
      process.env.AUTH_SECRET = 'short';
      const issues = validateEnv();
      expect(issues.some((i) => i.key === 'AUTH_SECRET')).toBe(true);
      process.env.AUTH_SECRET = original;
    });

    it('flags missing MONGODB_URI', () => {
      const original = process.env.MONGODB_URI;
      delete process.env.MONGODB_URI;
      const issues = validateEnv();
      expect(issues.some((i) => i.key === 'MONGODB_URI')).toBe(true);
      process.env.MONGODB_URI = original;
    });
  });
});
