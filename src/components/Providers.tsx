'use client';

import { Suspense } from 'react';
import { SessionProvider } from 'next-auth/react';
import { LazyMotion, domMax, MotionConfig } from 'framer-motion';
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
      <AnalyticsWrapper />
    </SessionProvider>
  );
}
