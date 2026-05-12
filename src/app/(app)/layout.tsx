'use client';

import { DashboardSidebar } from '@/components/DashboardSidebar';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { cn } from '@/lib/utils';
import { useSession } from 'next-auth/react';
import { LoadingScreen } from '@/components/LoadingScreen';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isOnboarding = pathname === '/onboarding';
  const syncRemoteData = useStore((state) => state.syncRemoteData);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [hasHydrated, setHasHydrated] = useState(false);
  const { status } = useSession();

  const isSessionLoading = status === 'loading';

  useEffect(() => {
    // Check if store already hydrated
    if (useStore.persist.hasHydrated()) {
      setHasHydrated(true);
    } else {
      const unsub = useStore.persist.onFinishHydration(() => setHasHydrated(true));
      // Safety timeout: Ensure we force render within 3.5s if hydration hangs
      const timer = setTimeout(() => setHasHydrated(true), 3500);
      return () => {
        unsub();
        clearTimeout(timer);
      };
    }
  }, []);

  useEffect(() => {
    if (hasHydrated && status === 'authenticated') {
      syncRemoteData();
    }
  }, [syncRemoteData, hasHydrated, status]);

  if (isOnboarding) {
    return (
      <div className="min-h-screen bg-[#0A0C0B] relative overflow-hidden">
        <div className="fixed inset-0 z-0 pointer-events-none opacity-20">
          <Image
            src="/assets/images/forest-bg.png"
            alt="Background"
            fill
            className="object-cover blur-[80px] scale-110"
            loading="lazy"
          />
        </div>
        <div className="relative z-10">{children}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0C0B] relative overflow-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20">
        <Image
          src="/assets/images/forest-bg.png"
          alt="Background"
          fill
          className="object-cover blur-[80px] scale-110"
          loading="lazy"
        />
      </div>

      <div className="hidden md:block">
        <DashboardSidebar
          isExpanded={isSidebarExpanded}
          onToggle={() => setIsSidebarExpanded(!isSidebarExpanded)}
        />
      </div>

      <div
        className={cn(
          'transition-all duration-300',
          'md:pl-[72px] lg:pl-[72px] xl:pl-[240px]',
          isSidebarExpanded ? 'xl:pl-[240px]' : 'xl:pl-[72px]'
        )}
      >
        <div className="min-h-screen pb-24 md:pb-0">{!hasHydrated || isSessionLoading ? <LoadingScreen /> : children}</div>
      </div>
      <MobileBottomNav />
    </div>
  );
}
