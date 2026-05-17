import '@testing-library/jest-dom';

process.env.AUTH_SECRET = 'test-secret-that-is-at-least-32-chars-long!!';
process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
process.env.GROQ_API_KEY = 'test-groq-key';
process.env.NEXT_PUBLIC_POSTHOG_KEY = 'test-posthog-key';
