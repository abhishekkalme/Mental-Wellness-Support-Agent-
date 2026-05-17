'use client';

import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getWellbeingStatus } from '@/app/(app)/dashboard/hooks';

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

export function WellbeingPulse({
  wellbeing,
}: {
  wellbeing: { score: number; streak: number; sleepAvg: number; moodAvg: number } | null;
}) {
  if (!wellbeing) return null;
  const status = getWellbeingStatus(wellbeing.score);

  return (
    <motion.div variants={itemVariants} className="surface-card p-5 md:p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs font-bold text-white/40 uppercase tracking-wider">
            Wellbeing Score
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <motion.span
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="text-4xl md:text-5xl font-bold text-white tracking-tight tabular-nums"
            >
              {wellbeing.score}
            </motion.span>
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className={cn(
                'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider',
                status.color,
                'bg-white/5 border border-white/10'
              )}
            >
              <span className={cn('w-1.5 h-1.5 rounded-full', status.dot)} />
              {status.label}
            </motion.span>
          </div>
        </div>
      </div>
      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${wellbeing.score}%` }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          style={{
            background:
              wellbeing.score >= 55
                ? 'linear-gradient(90deg, #E2FF6F 0%, #a3e635 100%)'
                : wellbeing.score >= 35
                  ? 'linear-gradient(90deg, #fbbf24 0%, #f59e0b 100%)'
                  : 'linear-gradient(90deg, #f87171 0%, #ef4444 100%)',
          }}
        />
      </div>
      <div className="flex gap-4 md:gap-6 mt-4 text-xs">
        <div>
          <span className="text-white/40">Avg mood: </span>
          <span className="text-white font-medium tabular-nums">
            {wellbeing.moodAvg.toFixed(1)}/5
          </span>
        </div>
        <div>
          <span className="text-white/40">Sleep: </span>
          <span className="text-white font-medium tabular-nums">
            {wellbeing.sleepAvg.toFixed(1)}h
          </span>
        </div>
        {wellbeing.streak > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center gap-1"
          >
            <Flame className="w-3 h-3 text-orange-400" />
            <span className="text-white font-medium tabular-nums">{wellbeing.streak}d</span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
