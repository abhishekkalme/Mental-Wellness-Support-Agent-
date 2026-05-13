'use client';

import { useStore } from '@/store/useStore';
import Link from 'next/link';
import { ChevronRight, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import { isSameDay, subDays } from 'date-fns';

export function SleepRecovery() {
  const store = useStore();
  const sleepHistory = store.sleepHistory || [];
  const lastSleep = sleepHistory[sleepHistory.length - 1];
  const hours = lastSleep?.durationHours || 0;
  const quality = lastSleep?.quality || 0;

  const recentWeek = sleepHistory.filter((s) => {
    const d = new Date(s.date);
    const weekAgo = subDays(new Date(), 6);
    return d >= weekAgo;
  });
  const daysLogged = recentWeek.length;
  const consistency = Math.round((daysLogged / 7) * 100);

  if (!lastSleep) {
    return (
      <Link
        href="/sleep"
        className="glass-panel p-5 bg-white/5 border-white/5 rounded-2xl block group hover:bg-white/10 hover:border-indigo-400/20 transition-all h-full"
      >
        <h3 className="text-xs font-bold text-white/50 uppercase tracking-wider flex items-center gap-1.5 mb-3">
          <Moon className="w-3 h-3 text-indigo-400" /> Sleep
        </h3>
        <div className="flex flex-col items-center justify-center py-4 text-center">
          <p className="text-sm text-white/30 font-medium">Log your first night</p>
        </div>
      </Link>
    );
  }

  const hourColor = hours >= 7 ? 'text-white' : hours >= 5 ? 'text-amber-400' : 'text-rose-400';
  const qualityColor =
    quality >= 4 ? 'bg-indigo-400' : quality >= 3 ? 'bg-indigo-300' : 'bg-indigo-200';

  return (
    <Link
      href="/sleep"
      className="glass-panel p-5 bg-white/5 border-white/5 rounded-2xl block group hover:bg-white/10 hover:border-indigo-400/20 transition-all h-full"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold text-white/50 uppercase tracking-wider flex items-center gap-1.5">
          <Moon className="w-3 h-3 text-indigo-400" /> Sleep
        </h3>
        <ChevronRight className="w-3 h-3 text-white/20 group-hover:text-white/40 transition-colors" />
      </div>
      <div className="flex items-baseline gap-1.5 mb-2">
        <span className={`text-2xl font-bold ${hourColor}`}>{hours.toFixed(1)}</span>
        <span className="text-xs text-white/40">hours</span>
      </div>
      {quality > 0 && (
        <div className="flex gap-1 mb-3">
          {[1, 2, 3, 4, 5].map((q) => (
            <div
              key={q}
              className={`w-2 h-2 rounded-full transition-all ${q <= quality ? qualityColor : 'bg-white/10'}`}
            />
          ))}
        </div>
      )}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-white/30">Weekly consistency</span>
          <span className="text-white/60 font-bold">{consistency}%</span>
        </div>
        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${consistency}%` }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="h-full bg-indigo-400 rounded-full"
          />
        </div>
      </div>
    </Link>
  );
}
