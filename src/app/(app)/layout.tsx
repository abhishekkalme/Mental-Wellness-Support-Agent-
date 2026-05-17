'use client';

import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { useStore } from '@/store/useStore';
import { cn } from '@/lib/utils';
import { useSession } from 'next-auth/react';

const DashboardSidebar = dynamic(
  () => import('@/components/DashboardSidebar').then((m) => m.DashboardSidebar),
  { ssr: false }
);
const MobileBottomNav = dynamic(
  () => import('@/components/MobileBottomNav').then((m) => m.MobileBottomNav),
  { ssr: false }
);
const LoadingScreen = dynamic(
  () => import('@/components/LoadingScreen').then((m) => m.LoadingScreen),
  { ssr: false }
);

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isOnboarding = pathname === '/onboarding';
  const syncRemoteData = useStore((state) => state.syncRemoteData);
  const clearStore = useStore((state) => state.clearStore);
  const clearPersistedData = useStore((state) => state.clearPersistedData);
  const lastSyncedUserId = useStore((state) => state.lastSyncedUserId);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [hasHydrated, setHasHydrated] = useState(false);
  const { data: session, status: sessionStatus } = useSession();
  const status = session ? 'authenticated' : 'unauthenticated';
  const isSessionLoading = sessionStatus === 'loading';
  const prevStatusRef = useRef(status);

  useEffect(() => {
    if (useStore.persist.hasHydrated()) {
      setHasHydrated(true);
    } else {
      const unsub = useStore.persist.onFinishHydration(() => setHasHydrated(true));
      const timer = setTimeout(() => setHasHydrated(true), 3500);
      return () => {
        unsub();
        clearTimeout(timer);
      };
    }
  }, []);

  useEffect(() => {
    if (prevStatusRef.current === 'authenticated' && status === 'unauthenticated') {
      clearStore();
      clearPersistedData();
    }
    prevStatusRef.current = status;
  }, [status, clearStore, clearPersistedData]);

  useEffect(() => {
    if (hasHydrated && status === 'authenticated') {
      const currentUserId = session?.user?.id || '';
      if (currentUserId && currentUserId !== lastSyncedUserId) {
        clearStore();
        useStore.setState({ lastSyncedAt: 0, lastSyncedUserId: currentUserId });
        syncRemoteData(currentUserId);
      } else if (!lastSyncedUserId) {
        useStore.setState({ lastSyncedAt: 0 });
        syncRemoteData(currentUserId);
      }
    }
  }, [hasHydrated, status, session?.user?.id]);

  if (isOnboarding) {
    return (
      <div className="min-h-screen bg-[#0A0C0B] relative overflow-hidden">
        <div className="relative z-10">{children}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0C0B] relative">
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
        <div className="min-h-screen pb-24 md:pb-0">
          {!hasHydrated || isSessionLoading ? <LoadingScreen /> : children}
        </div>
      </div>
      <MobileBottomNav />
    </div>
  );
}
