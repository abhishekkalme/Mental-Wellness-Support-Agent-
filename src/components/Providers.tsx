'use client';

import { Suspense } from 'react';
import { SessionProvider } from 'next-auth/react';
import { LazyMotion, domMax, MotionConfig } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { Analytics } from './Analytics';

function AnalyticsWrapper() {
  return (
    <Suspense fallback={null}>
      <Analytics />
    </Suspense>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <LazyMotion features={domMax}>
        <MotionConfig reducedMotion="user">{children}</MotionConfig>
      </LazyMotion>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#141716',
            color: '#fff',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.08)',
            fontSize: '14px',
          },
          success: {
            iconTheme: { primary: '#E2FF6F', secondary: '#000' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#fff' },
          },
        }}
      />
      <AnalyticsWrapper />
    </SessionProvider>
  );
}
