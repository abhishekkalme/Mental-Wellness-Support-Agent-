'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useStore } from '@/store/useStore';
import { format, subDays, isSameDay } from 'date-fns';
import type { Mood, OnboardingData } from '@/lib/types';
import toast from 'react-hot-toast';

export interface WellbeingResult {
  score: number;
  streak: number;
  sleepAvg: number;
  moodAvg: number;
}

export interface InsightData {
  icon: string;
  message: string;
  action: { label: string; href: string } | null;
}

export interface WeekDayData {
  day: string;
  short: string;
  date: Date;
  activities: { mood: boolean; sleep: boolean; breath: boolean; journal: boolean; habit: boolean };
  count: number;
  active: boolean;
}

export interface RecentItem {
  id: string;
  type: string;
  summary: string;
  time: string;
  href: string;
  color: string;
}

export const MOOD_OPTIONS = [
  { mood: 'excellent' as Mood, emoji: '✨', label: 'Excellent', color: 'text-emerald-400' },
  { mood: 'good' as Mood, emoji: '😊', label: 'Good', color: 'text-blue-400' },
  { mood: 'okay' as Mood, emoji: '😐', label: 'Okay', color: 'text-yellow-400' },
  { mood: 'bad' as Mood, emoji: '🌧️', label: 'Bad', color: 'text-orange-400' },
  { mood: 'terrible' as Mood, emoji: '⛈️', label: 'Terrible', color: 'text-red-400' },
];

const MOOD_SCORES: Record<Mood, number> = {
  excellent: 5,
  good: 4,
  okay: 3,
  bad: 2,
  terrible: 1,
};

export function computeWellbeingScore(
  moodHistory: any[],
  sleepHistory: any[],
  habits: any[],
  journalEntries: any[],
  breathingHistory: any[]
): WellbeingResult | null {
  const hasAny =
    moodHistory.length > 0 ||
    sleepHistory.length > 0 ||
    habits.length > 0 ||
    journalEntries.length > 0 ||
    breathingHistory.length > 0;
  if (!hasAny) return null;

  const moodAvg =
    moodHistory.length > 0
      ? moodHistory.reduce((a, m) => a + (MOOD_SCORES[m.mood as Mood] || 3), 0) / moodHistory.length
      : 3;
  const moodNorm = ((moodAvg - 1) / 4) * 100;

  const sleepAvg =
    sleepHistory.length > 0
      ? sleepHistory.reduce((a, s: any) => a + s.durationHours, 0) / sleepHistory.length
      : 0;
  const sleepNorm = Math.min(100, (sleepAvg / 8) * 100);

  const longestStreak =
    habits.length > 0
      ? Math.max(
          ...habits.map((h: any) => {
            let s = 0;
            const d = new Date();
            const dates = Array.isArray(h.completedDates) ? h.completedDates : [];
            while (dates.includes(format(d, 'yyyy-MM-dd'))) {
              s++;
              d.setDate(d.getDate() - 1);
              if (s > 365) break;
            }
            return s;
          }),
          0
        )
      : 0;
  const streakNorm = Math.min(100, longestStreak * 10);

  const journalFreq = Math.min(100, journalEntries.length * 14);
  const breathMins = breathingHistory.reduce((a: number, r: any) => a + r.durationSeconds, 0) / 60;
  const breathNorm = Math.min(100, breathMins * 2);

  const total =
    moodNorm * 0.35 + sleepNorm * 0.25 + streakNorm * 0.2 + journalFreq * 0.1 + breathNorm * 0.1;

  return { score: Math.round(total), streak: longestStreak, sleepAvg, moodAvg };
}

export function getWellbeingStatus(score: number) {
  if (score >= 75) return { label: 'Thriving', color: 'text-emerald-400', dot: 'bg-emerald-400' };
  if (score >= 55) return { label: 'Balanced', color: 'text-[#E2FF6F]', dot: 'bg-[#E2FF6F]' };
  if (score >= 35) return { label: 'Managing', color: 'text-amber-400', dot: 'bg-amber-400' };
  return { label: 'Needs care', color: 'text-rose-400', dot: 'bg-rose-400' };
}

export function calculateStreak(completedDates: string[]): number {
  let s = 0;
  const d = new Date();
  while (completedDates.includes(format(d, 'yyyy-MM-dd'))) {
    s++;
    d.setDate(d.getDate() - 1);
    if (s > 365) break;
  }
  return s;
}

export function buildWeeklyTrend(
  moodHistory: any[],
  sleepHistory: any[],
  breathingHistory: any[],
  journalEntries: any[],
  habits: any[]
): WeekDayData[] {
  return Array.from({ length: 7 }).map((_, i) => {
    const d = subDays(new Date(), 6 - i);
    const dateStr = format(d, 'yyyy-MM-dd');
    const mood = moodHistory.some((m: any) => isSameDay(new Date(m.timestamp), d));
    const sleep = sleepHistory.some((s: any) => isSameDay(new Date(s.date), d));
    const breath = breathingHistory.some((b: any) => isSameDay(new Date(b.date), d));
    const journal = journalEntries.some((j: any) => isSameDay(new Date(j.timestamp), d));
    const habit = habits.some((h: any) => h.completedDates?.includes(dateStr));
    const count = [mood, sleep, breath, journal, habit].filter(Boolean).length;
    return {
      day: format(d, 'EEE'),
      short: format(d, 'EEEEE'),
      date: d,
      activities: { mood, sleep, breath, journal, habit },
      count,
      active: count >= 2,
    };
  });
}

export function getOnboardingInsights(od: OnboardingData | undefined): InsightData[] {
  if (!od) return [];
  const tips: InsightData[] = [];
  const p = od.priorities || [];
  const bc = od.biggestChallenge;

  if (p.includes('sleep') || bc === 'sleep')
    tips.push({
      icon: '🌙',
      message: 'You mentioned sleep is important. Start by logging your first night.',
      action: { label: 'Log sleep', href: '/sleep' },
    });
  if (p.includes('focus') || p.includes('clarity'))
    tips.push({
      icon: '🧠',
      message: 'Deep work starts with a calm mind. Try a 3-minute breathing exercise.',
      action: { label: 'Breathe now', href: '/breathing' },
    });
  if (
    p.includes('anxiety') ||
    p.includes('emotional') ||
    od.feeling === 'anxious' ||
    od.feeling === 'stressed'
  )
    tips.push({
      icon: '💜',
      message: 'You said reducing anxiety is a priority. Try daily journaling.',
      action: { label: 'Write journal', href: '/journal' },
    });
  if (p.includes('habits'))
    tips.push({
      icon: '⭐',
      message: 'Building habits takes consistency, not perfection. Start with one today.',
      action: { label: 'Set habit', href: '/habits' },
    });
  if (bc === 'overthinking')
    tips.push({
      icon: '🧠',
      message: 'Overthinking? Try the 5-4-3-2-1 grounding technique.',
      action: { label: 'Grounding exercise', href: '/breathing' },
    });
  if (bc === 'procrastination')
    tips.push({
      icon: '⚡',
      message: 'Procrastination starts with one small step. Try a 5-minute timer.',
      action: { label: 'Set a timer', href: '/breathing' },
    });
  return tips;
}

export function getLocalInsight(
  sleepHistory: any[],
  moodHistory: any[],
  habits: any[],
  journalEntries: any[]
): InsightData | null {
  const today = format(new Date(), 'yyyy-MM-dd');

  if (sleepHistory.length > 0 && (sleepHistory[sleepHistory.length - 1]?.quality || 5) < 3)
    return {
      icon: '🌙',
      message:
        'Your recent sleep quality has been low. Consistent sleep times—even on weekends—can significantly improve your mood and focus.',
      action: { label: 'Sleep better', href: '/sleep' },
    };

  if (
    moodHistory.length >= 3 &&
    moodHistory.slice(-3).every((m: any) => m && (m.mood === 'bad' || m.mood === 'terrible'))
  )
    return {
      icon: '💔',
      message:
        "You've logged low moods for 3 consecutive days. Consider talking to someone—a friend, counselor, or trusted mentor.",
      action: { label: 'Find a therapist', href: '/therapists' },
    };

  if (habits.some((h: any) => h.completedDates?.includes(today)))
    return {
      icon: '✅',
      message:
        'Great job completing your habits today! Consistency compounds—small daily wins build lasting resilience.',
      action: null,
    };

  if (moodHistory.length >= 7) {
    const recent = moodHistory.slice(-7);
    const avg =
      recent.reduce((a: number, m: any) => a + (MOOD_SCORES[m.mood as Mood] || 3), 0) /
      recent.length;
    if (avg >= 3.5)
      return {
        icon: '✨',
        message:
          "You've had a consistently positive week! Keep doing what's working—this momentum is powerful.",
        action: null,
      };
  }

  if (habits.length === 0 && (moodHistory.length > 0 || journalEntries.length > 0))
    return {
      icon: '⭐',
      message:
        "You're actively tracking but haven't set habits. Start with just one small daily habit—5 minutes of deep breathing counts.",
      action: { label: 'Start a habit', href: '/habits' },
    };

  if (journalEntries.length >= 3) {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    if (!journalEntries.some((j: any) => j.timestamp && new Date(j.timestamp).getTime() > weekAgo))
      return {
        icon: '📝',
        message:
          "You haven't journaled in over a week. Even 3 sentences a day can reduce stress and improve clarity.",
        action: { label: 'Write now', href: '/journal' },
      };
  }

  return null;
}

export function buildRecentActivity(
  moodHistory: any[],
  journalEntries: any[],
  sleepHistory: any[],
  breathingHistory: any[]
): RecentItem[] {
  const entries: RecentItem[] = [];

  if (moodHistory.length > 0) {
    const last = moodHistory[moodHistory.length - 1];
    entries.push({
      id: `mood-${last.id}`,
      type: 'Mood',
      summary: `Feeling ${last.mood}`,
      time: format(new Date(last.timestamp), 'MMM d, h:mm a'),
      href: '/mood',
      color: 'text-rose-400',
    });
  }
  if (journalEntries.length > 0) {
    const last = journalEntries[journalEntries.length - 1];
    entries.push({
      id: `journal-${last.id}`,
      type: 'Journal',
      summary: last.content.length > 80 ? last.content.slice(0, 80) + '...' : last.content,
      time: format(new Date(last.timestamp), 'MMM d, h:mm a'),
      href: '/journal',
      color: 'text-amber-400',
    });
  }
  if (sleepHistory.length > 0) {
    const last = sleepHistory[sleepHistory.length - 1];
    entries.push({
      id: `sleep-${last.id}`,
      type: 'Sleep',
      summary: `${last.durationHours.toFixed(1)}h · Quality ${last.quality}/5`,
      time: format(new Date(last.date), 'MMM d'),
      href: '/sleep',
      color: 'text-[#C8B6FF]',
    });
  }
  if (breathingHistory.length > 0) {
    const last = breathingHistory[breathingHistory.length - 1];
    entries.push({
      id: `breath-${last.id}`,
      type: 'Breathing',
      summary: `${Math.round(last.durationSeconds / 60)} min · ${last.pattern}`,
      time: format(new Date(last.date), 'MMM d, h:mm a'),
      href: '/breathing',
      color: 'text-cyan-400',
    });
  }

  return entries
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 4);
}

export function useAiInsight(
  hasData: boolean,
  isNewUser: boolean,
  onboardingData: OnboardingData | undefined,
  moodHistory: any[],
  sleepHistory: any[],
  journalEntries: any[],
  habits: any[],
  breathingHistory: any[]
) {
  const [serverInsight, setServerInsight] = useState<string | null>(null);
  const [insightLoading, setInsightLoading] = useState(false);
  const [insightFailed, setInsightFailed] = useState(false);

  const localInsight = useMemo(
    () => getLocalInsight(sleepHistory, moodHistory, habits, journalEntries),
    [sleepHistory, moodHistory, habits, journalEntries]
  );

  const onboardingTips = useMemo(() => getOnboardingInsights(onboardingData), [onboardingData]);

  const fetchInsight = useCallback(async () => {
    if (!hasData || isNewUser || serverInsight !== null) return;
    setInsightLoading(true);
    setInsightFailed(false);
    try {
      const res = await fetch('/api/insights/correlation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          moodHistory: moodHistory.slice(-30),
          sleepHistory: sleepHistory.slice(-30),
          journalEntries: journalEntries.slice(-20),
          habits,
          breathingHistory: breathingHistory.slice(-30),
        }),
      });
      if (!res.ok) throw new Error('API error');
      const d = await res.json();
      if (d?.insight) setServerInsight(d.insight);
      else throw new Error('No insight');
    } catch {
      setInsightFailed(true);
    } finally {
      setInsightLoading(false);
    }
  }, [
    hasData,
    isNewUser,
    serverInsight,
    moodHistory,
    sleepHistory,
    journalEntries,
    habits,
    breathingHistory,
  ]);

  useEffect(() => {
    if (hasData && !isNewUser && serverInsight === null && !insightLoading && !insightFailed) {
      fetchInsight();
    }
  }, [hasData, isNewUser]);

  const displayInsight = useMemo(() => {
    if (isNewUser) return onboardingTips[0] || null;
    if (serverInsight) return { icon: '💡', message: serverInsight, action: null } as InsightData;
    if (insightFailed && localInsight) return localInsight;
    return null;
  }, [isNewUser, onboardingTips, serverInsight, insightFailed, localInsight]);

  return {
    displayInsight,
    insightLoading,
    insightFailed,
    fetchInsight,
    insightLoadingState:
      insightLoading || (hasData && !isNewUser && !serverInsight && !insightFailed),
  };
}
