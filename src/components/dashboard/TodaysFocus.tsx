'use client';

import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { Check, Plus, Flame, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export function TodaysFocus() {
  const store = useStore();
  const today = format(new Date(), 'yyyy-MM-dd');

  const habitsList = Array.isArray(store.habits) ? store.habits : [];
  const habits = habitsList.filter((h) => h && h.frequency === 'daily').slice(0, 5);

  const currentStreak =
    habitsList.length > 0
      ? Math.max(
          ...habitsList.map((h) => {
            let streak = 0;
            const checkDate = new Date();
            const completedDates = Array.isArray(h.completedDates) ? h.completedDates : [];
            while (completedDates.includes(format(checkDate, 'yyyy-MM-dd'))) {
              streak++;
              checkDate.setDate(checkDate.getDate() - 1);
              if (streak > 365) break;
            }
            return streak;
          }),
          0
        )
      : 0;

  const completedToday = habitsList.filter((h) => h.completedDates.includes(today)).length;
  const rate = habitsList.length ? Math.round((completedToday / habitsList.length) * 100) : 0;

  if (habits.length === 0) {
    return (
      <div
        id="ftue-todays-focus"
        className="glass-panel p-6 bg-white/5 border-white/5 rounded-2xl space-y-4"
      >
        <h3 className="text-xs font-bold text-white/50 uppercase tracking-wider">
          Today&apos;s Focus
        </h3>
        <div className="text-center py-8">
          <div className="w-12 h-12 rounded-xl bg-[#E2FF6F]/10 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-6 h-6 text-[#E2FF6F]" />
          </div>
          <p className="text-sm text-white/40 mb-4">No habits set for today</p>
          <Link
            href="/habits"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#E2FF6F]/10 text-[#E2FF6F] text-sm font-bold hover:bg-[#E2FF6F]/20 transition-all"
          >
            <Plus className="w-4 h-4" /> Create habit
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      id="ftue-todays-focus"
      className="glass-panel p-6 bg-white/5 border-white/5 rounded-2xl space-y-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-white/50 uppercase tracking-wider">
          Today&apos;s Focus
        </h3>
        <Link
          href="/habits"
          className="text-[10px] text-[#E2FF6F] hover:text-[#d4f056] transition-colors"
        >
          View all
        </Link>
      </div>

      <div className="space-y-2">
        {habits.map((habit, index) => {
          const isCompleted = habit.completedDates.includes(today);
          return (
            <motion.button
              key={habit.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.06 }}
              onClick={() => store.toggleHabit(habit.id, today)}
              className={cn(
                'w-full flex items-center gap-3 p-3.5 rounded-xl border transition-all duration-300 text-left',
                isCompleted
                  ? 'bg-[#E2FF6F]/5 border-[#E2FF6F]/20'
                  : 'bg-black/20 border-white/5 hover:border-white/10'
              )}
            >
              <div
                className={cn(
                  'w-5 h-5 rounded-full flex items-center justify-center border-2 transition-all shrink-0',
                  isCompleted ? 'bg-[#E2FF6F] border-[#E2FF6F]' : 'border-white/20'
                )}
              >
                {isCompleted && <Check className="w-3 h-3 text-black" />}
              </div>
              <span
                className={cn(
                  'flex-1 text-sm font-medium',
                  isCompleted ? 'text-white/40 line-through' : 'text-white'
                )}
              >
                {habit.name}
              </span>
            </motion.button>
          );
        })}
      </div>

      <div className="flex items-center gap-3 p-3.5 rounded-xl bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/10">
        <div className="w-9 h-9 rounded-xl bg-orange-500/20 flex items-center justify-center shrink-0">
          <Flame className="w-5 h-5 text-orange-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-white">
              {currentStreak > 0 ? `${currentStreak} Day Streak` : 'Start your streak'}
            </p>
            <span className="text-xs font-bold text-[#E2FF6F]">{rate}%</span>
          </div>
          <div className="mt-1.5 h-1 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${rate}%` }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="h-full bg-gradient-to-r from-orange-400 to-amber-400 rounded-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
