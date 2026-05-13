'use client';

import { useStore } from '@/store/useStore';
import { useMemo } from 'react';
import { TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { format, subDays, isSameDay } from 'date-fns';

export function WeeklyMomentum() {
  const store = useStore();

  const weekData = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 7 }).map((_, i) => {
      const d = subDays(today, 6 - i);
      const dateStr = format(d, 'yyyy-MM-dd');

      const hasMood = store.moodHistory.some((m) => isSameDay(new Date(m.timestamp), d));
      const hasSleep = store.sleepHistory.some((s) => isSameDay(new Date(s.date), d));
      const hasBreathing = store.breathingHistory.some((b) => isSameDay(new Date(b.date), d));
      const hasJournal = store.journalEntries.some((j) => isSameDay(new Date(j.timestamp), d));
      const hasHabit = store.habits.some((h) => h.completedDates.includes(dateStr));

      const count = [hasMood, hasSleep, hasBreathing, hasJournal, hasHabit].filter(Boolean).length;
      return {
        day: format(d, 'EEE'),
        short: format(d, 'EEEEE'),
        active: count >= 2,
        count,
        date: d,
      };
    });
  }, [
    store.moodHistory,
    store.sleepHistory,
    store.breathingHistory,
    store.journalEntries,
    store.habits,
  ]);

  const activeDays = weekData.filter((d) => d.active).length;

  const totalEntries =
    store.moodHistory.length +
    store.sleepHistory.length +
    store.journalEntries.length +
    store.breathingHistory.length +
    store.habits.reduce((sum, h) => sum + h.completedDates.length, 0);

  const momentum = Math.round((activeDays / 7) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel p-5 md:p-6 bg-white/5 border-white/5 rounded-2xl space-y-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#E2FF6F]" />
          <span className="text-xs font-bold text-white/50 uppercase tracking-wider">Momentum</span>
        </div>
        <span className="text-lg font-bold text-[#E2FF6F]">{momentum}%</span>
      </div>

      <div className="flex gap-2">
        {weekData.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
            <motion.div
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className={`w-full rounded-full origin-bottom transition-all ${
                d.active ? 'bg-[#E2FF6F]' : 'bg-white/10'
              }`}
              style={{ height: `${Math.max(20, d.count * 20)}%`, minHeight: 4 }}
            />
            <span
              className={`text-[9px] font-bold uppercase ${
                d.active ? 'text-[#E2FF6F]' : 'text-white/20'
              }`}
            >
              {d.short}
            </span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between text-[11px] text-white/30 border-t border-white/5 pt-3">
        <span>
          <span className="text-white font-bold">{activeDays}</span>/7 active days
        </span>
        <span>
          <span className="text-white font-bold">{totalEntries}</span> total entries
        </span>
      </div>
    </motion.div>
  );
}
