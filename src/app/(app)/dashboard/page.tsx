'use client';

import { motion } from 'framer-motion';
import { useState, useEffect, useRef, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { format, subDays, isSameDay } from 'date-fns';
import {
  Bell,
  User,
  ShieldAlert,
  Activity,
  Moon,
  Wind,
  BookOpen,
  Loader2,
  TrendingUp,
  Sparkles,
  ChevronRight,
  LogOut,
  Home,
} from 'lucide-react';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { TodaysFocus } from '@/components/dashboard/TodaysFocus';
import { DashboardHero } from '@/components/dashboard/DashboardHero';
import { HabitStreaks } from '@/components/dashboard/HabitStreaks';
import { MoodSparkline } from '@/components/dashboard/MoodSparkline';
import { SleepRecovery } from '@/components/dashboard/SleepRecovery';
import { WeeklyMomentum } from '@/components/dashboard/WeeklyMomentum';
import { EmptyDashboard } from '@/components/dashboard/EmptyDashboard';
import { AIInsight } from '@/components/dashboard/AIInsight';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { signOut } from 'next-auth/react';

const SYNC_STALE_MS = 60_000;

function SkeletonGrid() {
  return (
    <div className="min-h-screen bg-[#0A0C0B] p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="space-y-3 pt-4">
        <div className="h-8 w-72 bg-white/10 rounded animate-pulse" />
        <div className="h-4 w-40 bg-white/5 rounded animate-pulse" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <div className="h-64 bg-white/5 rounded-2xl animate-pulse" />
        </div>
        <div className="h-48 bg-white/5 rounded-2xl animate-pulse" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-white/5 rounded-2xl animate-pulse" />
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const store = useStore();
  const [mounted, setMounted] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [syncError, setSyncError] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!store) return;
    const timer = setTimeout(() => setHydrated(true), 100);
    return () => clearTimeout(timer);
  }, [store]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

  useEffect(() => {
    if (!hydrated) return;
    const stale = Date.now() - (store.lastSyncedAt || 0) > SYNC_STALE_MS;
    if (!stale) return;

    setSyncError(false);
    store.syncRemoteData().catch((err) => {
      console.warn('[Dashboard] sync failed:', err);
      setSyncError(true);
    });
  }, [hydrated, store, store.lastSyncedAt]);

  const isDataSufficient =
    store.moodHistory.length >= 1 ||
    store.sleepHistory.length >= 1 ||
    store.breathingHistory.length >= 1 ||
    store.journalEntries.length >= 1 ||
    store.habits.length >= 1;

  const breathingToday = useMemo(() => {
    const today = new Date();
    return store.breathingHistory
      .filter((r) => isSameDay(new Date(r.date), today))
      .reduce((acc, r) => acc + r.durationSeconds, 0);
  }, [store.breathingHistory]);

  const journalToday = useMemo(() => {
    const today = new Date();
    return store.journalEntries
      .filter((r) => isSameDay(new Date(r.timestamp), today))
      .reduce((acc, r) => acc + r.content.split(' ').length, 0);
  }, [store.journalEntries]);

  const breathingWeek = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const d = subDays(new Date(), 6 - i);
      const dayRecords = store.breathingHistory.filter((r) => isSameDay(new Date(r.date), d));
      return dayRecords.reduce((acc, r) => acc + r.durationSeconds, 0) / 60;
    });
  }, [store.breathingHistory]);

  const maxBreathing = Math.max(...breathingWeek, 1);

  const journalWeek = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const d = subDays(new Date(), 6 - i);
      const dayRecords = store.journalEntries.filter((r) => isSameDay(new Date(r.timestamp), d));
      return dayRecords.reduce((acc, r) => acc + r.content.split(' ').length, 0);
    });
  }, [store.journalEntries]);

  const maxJournal = Math.max(...journalWeek, 1);

  useEffect(() => {
    if (!isDataSufficient) return;
    if (aiInsight !== null) return;

    setAiLoading(true);
    fetch('/api/insights/correlation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        moodHistory: store.moodHistory.slice(-30),
        sleepHistory: store.sleepHistory.slice(-30),
        journalEntries: store.journalEntries.slice(-20),
        habits: store.habits,
        breathingHistory: store.breathingHistory.slice(-30),
      }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.insight) setAiInsight(d.insight);
      })
      .catch(() => {})
      .finally(() => setAiLoading(false));
  }, [
    isDataSufficient,
    store.moodHistory,
    store.sleepHistory,
    store.journalEntries,
    store.habits,
    store.breathingHistory,
  ]);

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#0A0C0B] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#E2FF6F] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!hydrated) {
    return <SkeletonGrid />;
  }

  return (
    <div className="min-h-screen bg-[#0A0C0B]">
      <header className="sticky top-0 z-40 bg-[#0A0C0B]/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center justify-between h-14 px-4 md:px-6">
          <div className="flex items-center gap-4">
            <div>
              <p className="text-white/40 text-xs">{dateStr}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <Link href="/crisis">
              <Button
                variant="outline"
                size="sm"
                className="bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500/20 gap-2 rounded-full h-9 px-3 md:px-4"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-sm font-medium">SOS</span>
              </Button>
            </Link>

            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-white/40 hover:text-white border border-white/10 hover:border-white/20 transition-all"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
              </button>
              {showNotifications && (
                <div className="absolute top-12 right-0 w-72 bg-[#141716] border border-white/10 rounded-2xl p-4 shadow-2xl z-50">
                  <h3 className="font-bold text-white mb-2 text-sm">Notifications</h3>
                  <div className="text-white/40 text-xs py-4 text-center">
                    No new notifications yet.
                    <br />
                    <span className="text-white/20">Your activity will appear here.</span>
                  </div>
                </div>
              )}
            </div>

            <Link href="/" title="Home">
              <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 hover:border-[#E2FF6F]/30 transition-all flex items-center justify-center text-white/40 hover:text-[#E2FF6F]">
                <Home className="w-4 h-4" />
              </div>
            </Link>
            {/* <Link href="/admin" title="Admin">
              <div className="w-9 h-9 rounded-xl bg-white/5 overflow-hidden border border-white/10 hover:border-[#E2FF6F]/30 transition-all">
                <div className="w-full h-full bg-[#E2FF6F]/10 flex items-center justify-center text-[#E2FF6F]">
                  <User className="w-4 h-4" />
                </div>
              </div>
            </Link> */}
            <button
              onClick={() => {
                useStore.getState().clearStore();
                useStore.getState().clearPersistedData();
                signOut({ callbackUrl: '/' });
              }}
              className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 hover:border-red-400/30 hover:bg-red-500/10 transition-all flex items-center justify-center text-white/40 hover:text-red-400"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-5 md:space-y-6 pb-24 md:pb-6">
        <DashboardHero />

        {syncError && (
          <p className="text-xs text-amber-500/80 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-2">
            Could not refresh from server. Showing local data.
          </p>
        )}

        {!isDataSufficient ? (
          <>
            <EmptyDashboard />
            <AIInsight />
          </>
        ) : (
          <div className="space-y-5 md:space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-5">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="lg:col-span-8"
              >
                <TodaysFocus />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="lg:col-span-4"
              >
                <HabitStreaks />
              </motion.div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <MoodSparkline />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <SleepRecovery />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                <Link
                  href="/breathing"
                  className="glass-panel p-5 bg-white/5 border-white/5 rounded-2xl block group hover:bg-white/10 hover:border-cyan-400/20 transition-all h-full"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-bold text-white/50 uppercase tracking-wider flex items-center gap-1.5">
                      <Wind className="w-3 h-3 text-cyan-400" /> Breathe
                    </h3>
                    <ChevronRight className="w-3 h-3 text-white/20 group-hover:text-white/40 transition-colors" />
                  </div>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span
                      className={`text-2xl font-bold ${breathingToday > 0 ? 'text-white' : 'text-white/40'}`}
                    >
                      {Math.round(breathingToday / 60)}
                    </span>
                    <span className="text-xs text-white/40">min</span>
                  </div>
                  <div className="flex items-end gap-[2px] h-8">
                    {breathingWeek.map((mins, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-sm transition-all"
                        style={{
                          height: `${(mins / maxBreathing) * 100}%`,
                          backgroundColor:
                            mins > 0 ? 'rgba(34,211,238,0.6)' : 'rgba(255,255,255,0.05)',
                          minHeight: 2,
                        }}
                      />
                    ))}
                  </div>
                  <p className="text-[10px] text-white/30 mt-2">
                    {store.breathingHistory.length} sessions
                  </p>
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Link
                  href="/journal"
                  className="glass-panel p-5 bg-white/5 border-white/5 rounded-2xl block group hover:bg-white/10 hover:border-amber-400/20 transition-all h-full"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-bold text-white/50 uppercase tracking-wider flex items-center gap-1.5">
                      <BookOpen className="w-3 h-3 text-amber-400" /> Journal
                    </h3>
                    <ChevronRight className="w-3 h-3 text-white/20 group-hover:text-white/40 transition-colors" />
                  </div>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span
                      className={`text-2xl font-bold ${journalToday > 0 ? 'text-white' : 'text-white/40'}`}
                    >
                      {journalToday}
                    </span>
                    <span className="text-xs text-white/40">words</span>
                  </div>
                  <div className="flex items-end gap-[2px] h-8">
                    {journalWeek.map((words, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-sm transition-all"
                        style={{
                          height: `${(words / maxJournal) * 100}%`,
                          backgroundColor:
                            words > 0 ? 'rgba(251,191,36,0.6)' : 'rgba(255,255,255,0.05)',
                          minHeight: 2,
                        }}
                      />
                    ))}
                  </div>
                  <p className="text-[10px] text-white/30 mt-2">
                    {store.journalEntries.length} entries
                  </p>
                </Link>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <QuickActions />
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-5">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="lg:col-span-8"
              >
                <WeeklyMomentum />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="lg:col-span-4"
              >
                <AIInsight />
              </motion.div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
