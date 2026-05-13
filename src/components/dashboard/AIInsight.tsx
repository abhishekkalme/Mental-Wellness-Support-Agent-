'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { Sparkles, ArrowRight, Moon, Brain, Target, Heart, Zap } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const INSIGHT_TEMPLATES = [
  {
    check: (s: any) =>
      Array.isArray(s.sleepHistory) &&
      s.sleepHistory.length > 0 &&
      (s.sleepHistory[s.sleepHistory.length - 1]?.quality || 5) < 3,
    message:
      'Your recent sleep quality has been low. Consistent sleep times—even on weekends—can significantly improve your mood and focus.',
    action: { label: 'Sleep better', href: '/sleep' },
  },
  {
    check: (s: any) => {
      const mood = s.moodHistory;
      if (!Array.isArray(mood) || mood.length < 3) return false;
      const last = mood.slice(-3);
      return last.every((m) => m && (m.mood === 'bad' || m.mood === 'terrible'));
    },
    message:
      "You've logged low moods for 3 consecutive days. Consider talking to someone—a friend, counselor, or trusted mentor.",
    action: { label: 'Find a therapist', href: '/therapists' },
  },
  {
    check: (s: any) => {
      const habits = s.habits;
      if (!Array.isArray(habits) || !habits.length) return false;
      const today = new Date().toISOString().split('T')[0];
      return habits.some((h) => Array.isArray(h.completedDates) && h.completedDates.includes(today));
    },
    message:
      'Great job completing your habits today! Consistency compounds—small daily wins build lasting resilience.',
    action: null,
  },
  {
    check: (s: any) => {
      const mood = s.moodHistory;
      if (!Array.isArray(mood) || mood.length < 7) return false;
      const recent = mood.slice(-7);
      const avg =
        recent.reduce(
          (a, m) =>
            a +
            (m.mood === 'excellent'
              ? 5
              : m.mood === 'good'
                ? 4
                : m.mood === 'okay'
                  ? 3
                  : m.mood === 'bad'
                    ? 2
                    : 1),
          0
        ) / recent.length;
      return avg >= 3.5;
    },
    message:
      "You've had a consistently positive week! Keep doing what's working—this momentum is powerful.",
    action: null,
  },
  {
    check: (s: any) =>
      Array.isArray(s.habits) &&
      s.habits.length === 0 &&
      (Array.isArray(s.moodHistory) && s.moodHistory.length > 0 ||
       Array.isArray(s.journalEntries) && s.journalEntries.length > 0),
    message:
      "You're actively tracking your wellness but haven't set any habits yet. Start with just one small daily habit—5 minutes of deep breathing counts.",
    action: { label: 'Start a habit', href: '/habits' },
  },
  {
    check: (s: any) => {
      const journal = s.journalEntries;
      if (!Array.isArray(journal) || journal.length < 3) return false;
      const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      return !journal.some((j) => j.timestamp && new Date(j.timestamp).getTime() > weekAgo);
    },
    message:
      "You haven't journaled in over a week. Even 3 sentences a day can reduce stress and improve clarity.",
    action: { label: 'Write now', href: '/journal' },
  },
];

const NEW_USER_TEMPLATES = (onboardingData: any) => {
  const templates = [];
  const priorities = onboardingData?.priorities || [];
  const feeling = onboardingData?.feeling || '';
  const biggestChallenge = onboardingData?.biggestChallenge || '';

  if (priorities.includes('sleep') || biggestChallenge === 'sleep') {
    templates.push({
      message: "You mentioned sleep is important to you. Start by logging your first night's rest.",
      action: { label: 'Log sleep', href: '/sleep' },
      icon: Moon,
    });
  }

  if (priorities.includes('focus') || priorities.includes('clarity')) {
    templates.push({
      message: 'Deep work starts with a calm mind. Try a 3-minute breathing exercise before your next task.',
      action: { label: 'Breathe now', href: '/breathing' },
      icon: Brain,
    });
  }

  if (priorities.includes('anxiety') || priorities.includes('emotional') || feeling === 'anxious' || feeling === 'stressed') {
    templates.push({
      message: "You said reducing anxiety is a priority. Consider starting a daily journaling practice.",
      action: { label: 'Write journal', href: '/journal' },
      icon: Heart,
    });
  }

  if (priorities.includes('habits') || priorities.includes('clarity')) {
    templates.push({
      message: "Building habits takes consistency, not perfection. Start with one small habit today.",
      action: { label: 'Set habit', href: '/habits' },
      icon: Target,
    });
  }

  if (priorities.includes('energy') || feeling === 'tired') {
    templates.push({
      message: "Low energy? Small movements and hydration can make a big difference right now.",
      action: { label: 'Log mood', href: '/mood' },
      icon: Zap,
    });
  }

  if (biggestChallenge === 'overthinking') {
    templates.push({
      message: "Overthinking? Try the 5-4-3-2-1 grounding technique when your mind races.",
      action: { label: 'Try rescue exercises', href: '/rescue' },
      icon: Brain,
    });
  }

  if (biggestChallenge === 'procrastination') {
    templates.push({
      message: "Procrastination often starts with one small step. Try the Pomodoro technique.",
      action: { label: 'Set a timer', href: '/breathing' },
      icon: Target,
    });
  }

  return templates;
};

export function AIInsight() {
  const store = useStore();
  const onboardingData = store.onboardingData as any;
  const isNewUser = !store.moodHistory.length && !store.journalEntries.length && !store.sleepHistory.length;

  const newUserInsights = useMemo(() => NEW_USER_TEMPLATES(onboardingData), [
    onboardingData.priorities,
    onboardingData.feeling,
    onboardingData.biggestChallenge,
  ]);

  const insight = useMemo(
    () => {
      for (const t of INSIGHT_TEMPLATES) {
        if (t.check(store as any)) return { ...t, icon: Sparkles };
      }
      return null;
    },
    [store.moodHistory.length, store.sleepHistory.length, store.habits.length, store.journalEntries.length]
  );

  const showInsight = isNewUser ? newUserInsights[0] : insight;

  if (!showInsight) {
    return (
      <div
        className={cn(
          'p-5 rounded-2xl',
          'bg-gradient-to-r from-[#E2FF6F]/5 to-transparent',
          'border border-[#E2FF6F]/10'
        )}
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#E2FF6F]/10 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-[#E2FF6F]" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">
              Keep tracking to unlock personalized insights
            </p>
            <Link
              href="/mood"
              className="inline-flex items-center gap-1 mt-2 text-xs text-[#E2FF6F] hover:text-[#d4f056] transition-colors"
            >
              Log your first mood <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const IconComponent = showInsight.icon || Sparkles;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'p-5 rounded-2xl',
        'bg-gradient-to-r from-[#E2FF6F]/5 to-transparent',
        'border border-[#E2FF6F]/10 hover:border-[#E2FF6F]/20 transition-all duration-300'
      )}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#E2FF6F]/10 flex items-center justify-center shrink-0">
          <IconComponent className="w-5 h-5 text-[#E2FF6F]" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-white">{showInsight.message}</p>
          {showInsight.action && (
            <Link
              href={showInsight.action.href}
              className="inline-flex items-center gap-1 mt-2 text-xs text-[#E2FF6F] hover:text-[#d4f056] transition-colors"
            >
              {showInsight.action.label} <ArrowRight className="w-3 h-3" />
            </Link>
          )}
          {isNewUser && newUserInsights.length > 1 && (
            <p className="text-[10px] text-white/30 mt-1">
              {newUserInsights.length - 1} more personalized tip{newUserInsights.length > 2 ? 's' : ''} based on your profile
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
