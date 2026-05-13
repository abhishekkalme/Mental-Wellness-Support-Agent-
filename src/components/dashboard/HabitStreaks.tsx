'use client';

import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { Flame, Plus, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

export function HabitStreaks() {
  const store = useStore();
  const habits = Array.isArray(store.habits) ? store.habits : [];
  const today = format(new Date(), 'yyyy-MM-dd');

  const streaks = habits
    .map((h) => {
      let streak = 0;
      const checkDate = new Date();
      const completedDates = Array.isArray(h.completedDates) ? h.completedDates : [];
      while (completedDates.includes(format(checkDate, 'yyyy-MM-dd'))) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
        if (streak > 365) break;
      }
      return { ...h, streak };
    })
    .sort((a, b) => b.streak - a.streak)
    .slice(0, 3);

  const bestStreak = Math.max(...streaks.map((s) => s.streak), 0);
  const completedToday = habits.filter((h) => h.completedDates.includes(today)).length;
  const rate = habits.length ? Math.round((completedToday / habits.length) * 100) : 0;

  if (habits.length === 0) {
    return (
      <Link
        href="/habits"
        className="glass-panel p-5 bg-white/5 border-white/5 rounded-2xl block group hover:bg-white/10 transition-all"
      >
        <h3 className="text-xs font-bold text-white/50 uppercase tracking-wider mb-3">Streaks</h3>
        <div className="flex items-center gap-2 text-[#E2FF6F] text-sm font-medium">
          <Plus className="w-4 h-4" /> Create your first habit
        </div>
      </Link>
    );
  }

  return (
    <div className="glass-panel p-5 bg-white/5 border-white/5 rounded-2xl space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-white/50 uppercase tracking-wider">Streaks</h3>
        <Link
          href="/habits"
          className="flex items-center gap-0.5 text-[10px] text-[#E2FF6F] hover:text-[#d4f056] transition-colors"
        >
          View all <ChevronRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="space-y-2">
        {streaks.map((habit, i) => (
          <motion.div
            key={habit.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className="flex items-center justify-between py-1"
          >
            <span className="text-sm text-white/80 truncate mr-2">{habit.name}</span>
            <span className="flex items-center gap-1 text-orange-400 text-sm font-bold shrink-0">
              <Flame className="w-3.5 h-3.5" /> {habit.streak}
            </span>
          </motion.div>
        ))}
      </div>
      <div className="pt-2 border-t border-white/5 space-y-2">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-white/30">Today</span>
          <span className={completedToday > 0 ? 'text-[#E2FF6F] font-bold' : 'text-white/40'}>
            {completedToday}/{habits.length} done
          </span>
        </div>
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${rate}%` }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="h-full bg-gradient-to-r from-orange-400 to-amber-400 rounded-full"
          />
        </div>
        {bestStreak > 0 && <p className="text-[10px] text-white/30">Best streak: {bestStreak}d</p>}
      </div>
    </div>
  );
}
