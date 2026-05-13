'use client';

import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import Link from 'next/link';
import { ChevronRight, Heart } from 'lucide-react';
import { useMemo } from 'react';

const moodColors: Record<string, string> = {
  excellent: 'bg-emerald-400',
  good: 'bg-blue-400',
  okay: 'bg-yellow-400',
  bad: 'bg-orange-400',
  terrible: 'bg-red-400',
};

const moodLabels: Record<string, string> = {
  excellent: 'Excellent',
  good: 'Good',
  okay: 'Okay',
  bad: 'Bad',
  terrible: 'Terrible',
};

export function MoodSparkline() {
  const store = useStore();

  const recentMoods = useMemo(() => {
    return store.moodHistory.slice(-14).map((m) => m.mood);
  }, [store.moodHistory]);

  const todayMood =
    store.moodHistory.length > 0 ? store.moodHistory[store.moodHistory.length - 1] : null;

  if (!todayMood) {
    return (
      <Link
        id="ftue-mood"
        href="/mood"
        className="glass-panel p-5 bg-white/5 border-white/5 rounded-2xl block group hover:bg-white/10 hover:border-rose-400/20 transition-all h-full"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-white/50 uppercase tracking-wider">Mood</h3>
          <ChevronRight className="w-3 h-3 text-white/20 group-hover:text-white/40 transition-colors" />
        </div>
        <div className="flex flex-col items-center justify-center py-4 text-center">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center mb-2">
            <Heart className="w-5 h-5 text-rose-400" />
          </div>
          <p className="text-sm text-white/30 font-medium">Tap to check in</p>
        </div>
      </Link>
    );
  }

  const color =
    todayMood.mood === 'excellent' || todayMood.mood === 'good'
      ? 'text-emerald-400'
      : todayMood.mood === 'okay'
        ? 'text-yellow-400'
        : 'text-rose-400';

  return (
    <Link
      id="ftue-mood"
      href="/mood"
      className="glass-panel p-5 bg-white/5 border-white/5 rounded-2xl block group hover:bg-white/10 hover:border-rose-400/20 transition-all h-full"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold text-white/50 uppercase tracking-wider">Mood</h3>
        <ChevronRight className="w-3 h-3 text-white/20 group-hover:text-white/40 transition-colors" />
      </div>
      <div className="flex items-center gap-2 mb-3">
        <span className={`text-lg font-bold capitalize ${color}`}>
          {moodLabels[todayMood.mood] || todayMood.mood}
        </span>
      </div>
      {recentMoods.length > 0 && (
        <div className="flex items-end gap-[2px] h-8">
          {recentMoods.map((mood, i) => (
            <motion.div
              key={i}
              initial={{ height: 0 }}
              animate={{ height: '100%' }}
              transition={{ duration: 0.3, delay: i * 0.02 }}
              className={`flex-1 rounded-sm ${moodColors[mood] || 'bg-white/10'}`}
              style={{ opacity: i < recentMoods.length - 7 ? 0.3 : 1 }}
            />
          ))}
        </div>
      )}
      <p className="text-[10px] text-white/30 mt-2">{store.moodHistory.length} total entries</p>
    </Link>
  );
}
