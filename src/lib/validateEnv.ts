type EnvIssue = {
  key: string;
  message: string;
};

let _envChecked = false;

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

  // Warn about missing PostHog analytics key (non-blocking)
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    console.warn('⚠️  [NEXT_PUBLIC_POSTHOG_KEY] Not set. Analytics will be disabled.');
  }

  return issues;
}

export function logEnvIssues(): void {
  if (_envChecked) return;
  _envChecked = true;
  const issues = validateEnv();
  if (issues.length > 0) {
    console.warn('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.warn('⚠️  Environment Configuration Issues:');
    issues.forEach(({ key, message }) => {
      console.warn(`  • [${key}] ${message}`);
    });
    console.warn('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  } else {
    console.log('✅ All required environment variables are configured.');
  }

  // Trace key AI variables (sanitized)
  console.log('[Env] Environment variable audit:');
  console.log(`  • GROQ_API_KEY: ${process.env.GROQ_API_KEY ? 'Present' : 'MISSING'}`);
  console.log(`  • GEMINI_API_KEY: ${process.env.GEMINI_API_KEY ? 'Present' : 'MISSING'}`);
  console.log(`  • MONGODB_URI: ${process.env.MONGODB_URI ? 'Present' : 'MISSING'}`);
  console.log(`  • AUTH_SECRET: ${process.env.AUTH_SECRET ? 'Present' : 'MISSING'}`);
  console.log(`  • AUTH_TRUST_HOST: ${process.env.AUTH_TRUST_HOST || 'Unset'}`);

  const isProduction = process.env.NODE_ENV === 'production';
  const hasTrustHost = process.env.AUTH_TRUST_HOST === 'true';
  if (isProduction && !hasTrustHost) {
    console.warn(
      '⚠️  WARNING: AUTH_TRUST_HOST=true is required for NextAuth in production deployments. Set it in your deployment platform.'
    );
  }
}

export const isProduction = process.env.NODE_ENV === 'production';
export const trustHost = process.env.AUTH_TRUST_HOST === 'true';
export const needsTrustHost = isProduction && !trustHost;

export function checkProductionReadiness(): void {
  const issues = validateEnv();
  if (issues.length > 0) {
    const msg = issues.map((i) => `[${i.key}] ${i.message}`).join('; ');
    throw new Error(`Production readiness failed: ${msg}`);
  }
  if (needsTrustHost) {
    throw new Error('AUTH_TRUST_HOST=true is required for NextAuth in production.');
  }
}
