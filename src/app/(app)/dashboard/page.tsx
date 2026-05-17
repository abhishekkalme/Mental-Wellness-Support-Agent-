'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { format, isSameDay } from 'date-fns';
import { signOut } from 'next-auth/react';
import { useStore } from '@/store/useStore';
import type { Mood, OnboardingData } from '@/lib/types';
import toast from 'react-hot-toast';
import {
  computeWellbeingScore,
  buildWeeklyTrend,
  buildRecentActivity,
  useAiInsight,
} from './hooks';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { WelcomeZeroState } from '@/components/dashboard/WelcomeZeroState';
import { WellbeingPulse } from '@/components/dashboard/WellbeingPulse';
import { QuickCheckIn } from '@/components/dashboard/QuickCheckIn';
import { TodaysFocusSection } from '@/components/dashboard/TodaysFocusSection';
import { InsightCard } from '@/components/dashboard/InsightCard';
import { WeeklyTrendSection } from '@/components/dashboard/WeeklyTrendSection';
import { QuickActionsSection } from '@/components/dashboard/QuickActionsSection';
import { RecentActivitySection } from '@/components/dashboard/RecentActivitySection';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const name = useStore((s) => s.name);
  const onboardingData = useStore((s) => s.onboardingData) as OnboardingData | undefined;
  const moodHistory = useStore((s) => s.moodHistory);
  const sleepHistory = useStore((s) => s.sleepHistory);
  const habits = useStore((s) => s.habits);
  const journalEntries = useStore((s) => s.journalEntries);
  const breathingHistory = useStore((s) => s.breathingHistory);
  const lastSyncedAt = useStore((s) => s.lastSyncedAt);
  const addMoodEntry = useStore((s) => s.addMoodEntry);
  const syncRemoteData = useStore((s) => s.syncRemoteData);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (useStore.persist.hasHydrated()) {
      setHydrated(true);
    } else {
      const unsub = useStore.persist.onFinishHydration(() => setHydrated(true));
      const timer = setTimeout(() => setHydrated(true), 3500);
      return () => {
        unsub();
        clearTimeout(timer);
      };
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (Date.now() - (lastSyncedAt || 0) <= 60000) return;
    syncRemoteData().catch(() => toast.error('Sync failed. Your data may not be up to date.'));
  }, [hydrated, lastSyncedAt, syncRemoteData]);

  const wellbeing = useMemo(
    () =>
      computeWellbeingScore(moodHistory, sleepHistory, habits, journalEntries, breathingHistory),
    [moodHistory, sleepHistory, habits, journalEntries, breathingHistory]
  );

  const hasData =
    moodHistory.length >= 1 ||
    sleepHistory.length >= 1 ||
    breathingHistory.length >= 1 ||
    journalEntries.length >= 1 ||
    habits.length >= 1;

  const alreadyCheckedInToday = useMemo(
    () => moodHistory.some((m: any) => isSameDay(new Date(m.timestamp), new Date())),
    [moodHistory]
  );

  const handleQuickCheckIn = useCallback(
    (mood: Mood) => {
      const intensityMap: Record<Mood, number> = {
        excellent: 9,
        good: 7,
        okay: 5,
        bad: 3,
        terrible: 1,
      };
      addMoodEntry({
        id: Date.now().toString(),
        mood,
        intensity: intensityMap[mood],
        notes: '',
        timestamp: new Date().toISOString(),
      });
    },
    [addMoodEntry]
  );

  const isNewUser = !moodHistory.length && !journalEntries.length && !sleepHistory.length;

  const { displayInsight, insightLoading, insightFailed, fetchInsight } = useAiInsight(
    hasData,
    isNewUser,
    onboardingData,
    moodHistory,
    sleepHistory,
    journalEntries,
    habits,
    breathingHistory
  );

  const weekData = useMemo(
    () => buildWeeklyTrend(moodHistory, sleepHistory, breathingHistory, journalEntries, habits),
    [moodHistory, sleepHistory, breathingHistory, journalEntries, habits]
  );

  const recentItems = useMemo(
    () => buildRecentActivity(moodHistory, journalEntries, sleepHistory, breathingHistory),
    [moodHistory, journalEntries, sleepHistory, breathingHistory]
  );

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#0A0C0B] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#E2FF6F] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!hydrated) return <DashboardSkeleton />;

  return (
    <div className="min-h-screen bg-[#0A0C0B]">
      <main
        id="main-content"
        className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8 space-y-5 md:space-y-6 pb-28 md:pb-8"
      >
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <DashboardHeader />
        </motion.div>

        {!hasData ? (
          <WelcomeZeroState name={name} onboardingData={onboardingData} />
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-5 md:space-y-6"
          >
            {wellbeing && <WellbeingPulse wellbeing={wellbeing} />}
            <QuickCheckIn onCheckIn={handleQuickCheckIn} alreadyCheckedIn={alreadyCheckedInToday} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <TodaysFocusSection />
              <InsightCard
                displayInsight={displayInsight}
                insightLoading={insightLoading}
                insightFailed={insightFailed}
                onRetry={fetchInsight}
              />
            </div>
            <WeeklyTrendSection weekData={weekData} />
            <QuickActionsSection />
            <RecentActivitySection items={recentItems} />
          </motion.div>
        )}
      </main>
    </div>
  );
}
