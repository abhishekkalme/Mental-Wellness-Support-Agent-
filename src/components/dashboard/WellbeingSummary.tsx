'use client';

import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { Moon, Heart, Brain, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export function WellbeingSummary() {
  const store = useStore();

  const sleepHistoryList = store.sleepHistory || [];
  const lastSleep = sleepHistoryList[sleepHistoryList.length - 1];
  const sleepHours = lastSleep?.durationHours || 0;

  const moodHistory = (store.moodHistory || []).slice(-7);
  const moodScore =
    moodHistory.length > 0
      ? moodHistory.reduce((acc, m) => {
          const scores: Record<string, number> = {
            excellent: 100,
            good: 75,
            okay: 50,
            bad: 25,
            terrible: 0,
          };
          return acc + (scores[m.mood] || 50);
        }, 0) / moodHistory.length
      : 0;

  const breathingHistory = store.breathingHistory || [];
  const breathingMinutes = Math.round(
    breathingHistory
      .filter((r) => r.date && new Date(r.date).toDateString() === new Date().toDateString())
      .reduce((acc, r) => acc + (r.durationSeconds || 0), 0) / 60
  );

  const metrics = [
    {
      id: 'sleep',
      label: 'Sleep',
      value: sleepHours > 0 ? `${sleepHours.toFixed(1)}h` : '--',
      icon: Moon,
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-500/10',
      progress: sleepHours > 0 ? Math.min(100, (sleepHours / 8) * 100) : 0,
    },
    {
      id: 'mood',
      label: 'Mood',
      value: moodScore > 0 ? `${Math.round(moodScore)}%` : '--',
      icon: Heart,
      color: 'text-rose-400',
      bgColor: 'bg-rose-500/10',
      progress: moodScore,
    },
    {
      id: 'mindfulness',
      label: 'Mindful',
      value: breathingMinutes > 0 ? `${breathingMinutes}m` : '--',
      icon: Brain,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
      progress: breathingMinutes > 0 ? Math.min(100, breathingMinutes * 3) : 0,
    },
  ];

  const activeMetrics = metrics.filter((m) => m.progress > 0);
  const overallScore = activeMetrics.length > 0
    ? Math.round(activeMetrics.reduce((acc, m) => acc + (m.progress || 0), 0) / activeMetrics.length)
    : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white/60 uppercase tracking-wider">Wellbeing</h3>
        <div className="flex items-center gap-1.5">
          <TrendingUp className="w-3 h-3 text-[#E2FF6F]" />
          <span className="text-xs text-[#E2FF6F] font-medium">{overallScore}% this week</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className={cn(
              'p-4 rounded-2xl',
              'bg-white/5 border border-white/5',
              'hover:border-white/10 transition-all duration-300'
            )}
          >
            <div
              className={cn(
                'w-8 h-8 rounded-xl flex items-center justify-center mb-3',
                metric.bgColor
              )}
            >
              <metric.icon className={cn('w-4 h-4', metric.color)} />
            </div>
            <p className="text-xl font-bold text-white">{metric.value}</p>
            <p className="text-[10px] text-white/40 uppercase tracking-wider mt-1">
              {metric.label}
            </p>

            <div className="mt-3 h-1.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${metric.progress}%` }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className={cn('h-full rounded-full', metric.bgColor)}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {moodHistory.length > 0 && (
        <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
          <p className="text-xs text-white/40 mb-3 uppercase tracking-wider">Mood Trend (7 days)</p>
          <div className="flex items-end gap-1 h-8">
            {moodHistory.map((entry, i) => {
              const scores: Record<string, number> = {
                excellent: 100,
                good: 75,
                okay: 50,
                bad: 25,
                terrible: 0,
              };
              const height = scores[entry.mood] || 50;
              return (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className={cn(
                    'flex-1 rounded-sm',
                    entry.mood === 'excellent'
                      ? 'bg-emerald-400'
                      : entry.mood === 'good'
                        ? 'bg-blue-400'
                        : entry.mood === 'okay'
                          ? 'bg-yellow-400'
                          : entry.mood === 'bad'
                            ? 'bg-orange-400'
                            : 'bg-red-400'
                  )}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
