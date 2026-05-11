'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';

export function Analytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  useEffect(() => {
    const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!posthogKey) return;

    const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com';

    import('posthog-js')
      .then((posthogModule) => {
        const posthog = posthogModule.posthog;
        if (!posthog) return;

        posthog.init(posthogKey, {
          api_host: posthogHost,
          person_profiles: 'always',
          capture_pageview: false,
          capture_pageleave: true,
          session_recording: {
            maskAllInputs: true,
          },
          advanced_disable_feature_flags_on_first_load: true,
          loaded: (ph) => {
            if (process.env.NODE_ENV === 'development') {
              ph.opt_out_capturing();
            }
          },
        });

        // Only capture pageview on navigation, not on popstate (back/forward)
        posthog.capture('$pageview', {
          $current_url: window.location.href,
          $pathname: pathname,
          $search: searchParams.toString(),
          user_id: session?.user?.id || undefined,
          user_email: session?.user?.email || undefined,
        });
      })
      .catch(() => {});

    return () => {
      import('posthog-js')
        .then((posthogModule) => {
          const posthog = posthogModule.posthog;
          posthog?.reset();
        })
        .catch(() => {});
    };
  }, [pathname, searchParams, session]);

  return null;
}
