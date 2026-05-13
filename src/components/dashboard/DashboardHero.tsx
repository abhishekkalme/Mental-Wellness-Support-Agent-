'use client';

import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { Sparkles } from 'lucide-react';

export function DashboardHero() {
  const store = useStore();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  const hasData =
    store.moodHistory.length >= 1 ||
    store.sleepHistory.length >= 1 ||
    store.breathingHistory.length >= 1 ||
    store.journalEntries.length >= 1 ||
    store.habits.length >= 1;

  const moodScore =
    store.moodHistory.length > 0
      ? Math.round(
          store.moodHistory.reduce((acc, m) => {
            const scores: Record<string, number> = {
              excellent: 100,
              good: 75,
              okay: 50,
              bad: 25,
              terrible: 0,
            };
            return acc + (scores[m.mood] || 50);
          }, 0) / store.moodHistory.length
        )
      : 0;

  const sleepScore =
    store.sleepHistory.length > 0
      ? Math.round(
          (store.sleepHistory.reduce((acc, s) => acc + (s.durationHours || 0), 0) /
            store.sleepHistory.length) *
            12.5
        )
      : 0;

  const wellbeingScore = hasData ? Math.round((moodScore + sleepScore) / 2) : 0;

  const getStatus = () => {
    if (wellbeingScore >= 75)
      return { label: 'Thriving', color: 'text-emerald-400', dot: 'bg-emerald-400' };
    if (wellbeingScore >= 55)
      return { label: 'Balanced', color: 'text-[#E2FF6F]', dot: 'bg-[#E2FF6F]' };
    if (wellbeingScore >= 35)
      return { label: 'Managing', color: 'text-amber-400', dot: 'bg-amber-400' };
    if (wellbeingScore >= 15)
      return { label: 'Struggling', color: 'text-rose-400', dot: 'bg-rose-400' };
    return null;
  };

  const status = getStatus();

  return (
    <motion.div id="ftue-hero" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              {getGreeting()}
              {store.name ? `, ${store.name}` : ''}
            </h1>
            {status && (
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${status.color} bg-white/5 border border-white/10`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                {status.label}
              </span>
            )}
          </div>
          <p className="text-sm text-white/40">{dateStr}</p>
        </div>
      </div>
    </motion.div>
  );
}
