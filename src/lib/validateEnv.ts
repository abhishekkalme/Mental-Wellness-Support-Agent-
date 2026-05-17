type EnvIssue = {
  key: string;
  message: string;
};

export function validateEnv(): EnvIssue[] {
  const issues: EnvIssue[] = [];

  if (!process.env.AUTH_SECRET) {
    issues.push({
      key: 'AUTH_SECRET',
      message: 'AUTH_SECRET is not set. NextAuth requires a secret for session encryption.',
    });
  } else if (process.env.AUTH_SECRET.length < 32) {
    issues.push({
      key: 'AUTH_SECRET',
      message: 'AUTH_SECRET should be at least 32 characters for security.',
    });
  }

  if (!process.env.MONGODB_URI) {
    issues.push({
      key: 'MONGODB_URI',
      message: 'MONGODB_URI is not set. Database features will fail.',
    });
  }

  const hasAnyAIKey =
    process.env.GROQ_API_KEY ||
    process.env.GEMINI_API_KEY ||
    process.env.ANTHROPIC_API_KEY ||
    process.env.OPENAI_API_KEY;

  if (!hasAnyAIKey) {
    issues.push({
      key: 'AI_API_KEYS',
      message: 'No AI API key configured. AI features will not work.',
    });
  }

  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    issues.push({
      key: 'NEXT_PUBLIC_POSTHOG_KEY',
      message: 'PostHog analytics key not set. Analytics will be disabled.',
    });
  }

  return issues;
}

export const isProduction = process.env.NODE_ENV === 'production';
export const trustHost = process.env.AUTH_TRUST_HOST === 'true';
export const needsTrustHost = isProduction && !trustHost;
