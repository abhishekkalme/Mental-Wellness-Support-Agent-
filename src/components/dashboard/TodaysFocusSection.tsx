'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, Plus, Check, Flame } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useStore } from '@/store/useStore';
import { calculateStreak } from '@/app/(app)/dashboard/hooks';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

export function TodaysFocusSection() {
  const habits = useStore((s) => s.habits);
  const toggleHabit = useStore((s) => s.toggleHabit);
  const today = format(new Date(), 'yyyy-MM-dd');

  const dailyHabits = useMemo(
    () => habits.filter((h) => h.frequency === 'daily').slice(0, 5),
    [habits]
  );

  const currentStreak = useMemo(() => {
    if (!habits.length) return 0;
    return Math.max(...habits.map((h) => calculateStreak(h.completedDates)));
  }, [habits]);

  const completedToday = useMemo(
    () => habits.filter((h) => h.completedDates.includes(today)).length,
    [habits, today]
  );
  const rate = habits.length ? Math.round((completedToday / habits.length) * 100) : 0;

  if (!dailyHabits.length) {
    return (
      <motion.div variants={itemVariants} className="surface-card p-5 md:p-6">
        <h2 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-4">
          Today&apos;s Focus
        </h2>
        <div className="text-center py-6">
          <div className="w-10 h-10 rounded-xl bg-[#E2FF6F]/10 flex items-center justify-center mx-auto mb-3">
            <Sparkles className="w-5 h-5 text-[#E2FF6F]" />
          </div>
          <p className="text-sm text-white/40 mb-3">No habits set yet</p>
          <Link
            href="/habits"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#E2FF6F]/10 text-[#E2FF6F] text-sm font-bold hover:bg-[#E2FF6F]/20 transition-all"
          >
            <Plus className="w-4 h-4" /> Create habit
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div variants={itemVariants} className="surface-card p-5 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-bold text-white/40 uppercase tracking-wider">
          Today&apos;s Focus
        </h2>
        <Link
          href="/habits"
          className="text-[10px] text-[#E2FF6F] hover:text-[#d4f056] transition-colors font-medium"
        >
          View all
        </Link>
      </div>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-2 mb-4"
      >
        {dailyHabits.map((habit, i) => {
          const done = habit.completedDates.includes(today);
          return (
            <motion.button
              key={habit.id}
              variants={itemVariants}
              transition={{ delay: i * 0.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => toggleHabit(habit.id, today)}
              className={cn(
                'w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left',
                done
                  ? 'bg-[#E2FF6F]/5 border-[#E2FF6F]/20'
                  : 'bg-white/[0.03] border-white/5 hover:border-white/15'
              )}
            >
              <div
                className={cn(
                  'w-5 h-5 rounded-full flex items-center justify-center border-2 transition-all shrink-0',
                  done ? 'bg-[#E2FF6F] border-[#E2FF6F]' : 'border-white/20'
                )}
              >
                {done && <Check className="w-3 h-3 text-black" />}
              </div>
              <span
                className={cn(
                  'flex-1 text-sm font-medium',
                  done ? 'text-white/40 line-through' : 'text-white/80'
                )}
              >
                {habit.name}
              </span>
            </motion.button>
          );
        })}
      </motion.div>
      <motion.div
        variants={itemVariants}
        className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-orange-500/8 to-amber-500/8 border border-orange-500/10"
      >
        <div className="w-9 h-9 rounded-xl bg-orange-500/15 flex items-center justify-center shrink-0">
          <Flame
            className={cn('w-5 h-5', currentStreak > 0 ? 'text-orange-400' : 'text-orange-400/40')}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-bold text-white">
              {currentStreak > 0 ? `${currentStreak} day streak` : 'Start your streak'}
            </p>
            <span className="text-xs font-bold text-[#E2FF6F] tabular-nums">{rate}%</span>
          </div>
          <div className="mt-1.5 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-orange-400 to-amber-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${rate}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
