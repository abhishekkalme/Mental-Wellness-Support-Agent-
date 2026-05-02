"use client";

import { SessionProvider } from "next-auth/react";
import { LazyMotion, domMax, MotionConfig } from "framer-motion";
import { PageTransition } from "./PageTransition";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <LazyMotion features={domMax}>
        <MotionConfig reducedMotion="user">
          <PageTransition>
            {children}
          </PageTransition>
        </MotionConfig>
      </LazyMotion>
    </SessionProvider>
  );
}
