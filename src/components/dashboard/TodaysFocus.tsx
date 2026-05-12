'use client';

import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { Check, Plus, Flame, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export function TodaysFocus() {
  const store = useStore();
  const today = format(new Date(), 'yyyy-MM-dd');

  const habitsList = Array.isArray(store.habits) ? store.habits : [];
  const habits = habitsList.filter((h) => h && h.frequency === 'daily').slice(0, 4);

  const currentStreak = habitsList.length > 0 
    ? Math.max(
        ...habitsList.map((h) => {
          let streak = 0;
          const checkDate = new Date();
          const completedDates = Array.isArray(h.completedDates) ? h.completedDates : [];
          while (completedDates.includes(format(checkDate, 'yyyy-MM-dd'))) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
            if (streak > 365) break; // Safety break
          }
          return streak;
        }),
        0
      )
    : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white/60 uppercase tracking-wider">
          Today&apos;s Focus
        </h3>
        <Link
          href="/habits"
          className="text-xs text-[#E2FF6F] hover:text-[#d4f056] transition-colors flex items-center gap-1"
        >
          View all <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="space-y-2">
        {habits.length === 0 ? (
          <div className="text-center py-6 px-4 rounded-2xl bg-white/5 border border-white/5">
            <p className="text-sm text-white/40 mb-3">No habits set for today</p>
            <Link
              href="/habits"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#E2FF6F]/10 text-[#E2FF6F] text-sm font-medium hover:bg-[#E2FF6F]/20 transition-colors"
            >
              <Plus className="w-4 h-4" /> Create habit
            </Link>
          </div>
        ) : (
          habits.map((habit, index) => {
            const isCompleted = habit.completedDates.includes(today);
            return (
              <motion.button
                key={habit.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => store.toggleHabit(habit.id, today)}
                className={cn(
                  'w-full flex items-center gap-4 p-4 rounded-xl',
                  'border transition-all duration-300',
                  isCompleted
                    ? 'bg-[#E2FF6F]/5 border-[#E2FF6F]/20'
                    : 'bg-white/5 border-white/5 hover:border-white/10'
                )}
              >
                <div
                  className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all',
                    isCompleted ? 'bg-[#E2FF6F] border-[#E2FF6F]' : 'border-white/20'
                  )}
                >
                  {isCompleted && <Check className="w-4 h-4 text-black" />}
                </div>
                <span
                  className={cn(
                    'flex-1 text-left font-medium',
                    isCompleted ? 'text-white/40 line-through' : 'text-white'
                  )}
                >
                  {habit.name}
                </span>
                <span className="text-xs text-white/30">{habit.frequency}</span>
              </motion.button>
            );
          })
        )}
      </div>

      {habits.length > 0 && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/10">
          <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
            <Flame className="w-5 h-5 text-orange-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-white">{currentStreak} Day Streak</p>
            <p className="text-xs text-white/40">Keep it going!</p>
          </div>
        </div>
      )}
    </div>
  );
}
