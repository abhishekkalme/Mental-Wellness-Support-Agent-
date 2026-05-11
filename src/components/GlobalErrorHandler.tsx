'use client';

import { useEffect, useRef } from 'react';

export default function GlobalErrorHandler() {
  const retryCountRef = useRef(0);
  const maxRetries = 3;

  useEffect(() => {
    const handler = (event: PromiseRejectionEvent) => {
      const error = event.reason;
      if (error?.name === 'AbortError') return;

      console.error('[Unhandled Rejection]', error);

      if (retryCountRef.current < maxRetries && error?.name === 'TypeError') {
        retryCountRef.current += 1;
        console.warn(`[Recovery] Retrying... attempt ${retryCountRef.current}`);
      } else if (retryCountRef.current >= maxRetries) {
        console.error('[Recovery] Max retries reached. Please refresh the page.');
      }
    };

    window.addEventListener('unhandledrejection', handler);
    return () => {
      window.removeEventListener('unhandledrejection', handler);
      retryCountRef.current = 0;
    };
  }, []);

  return null;
}
