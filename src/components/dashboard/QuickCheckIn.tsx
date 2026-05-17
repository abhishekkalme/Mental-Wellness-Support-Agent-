'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MOOD_OPTIONS } from '@/app/(app)/dashboard/hooks';
import type { Mood } from '@/lib/types';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

export function QuickCheckIn({
  onCheckIn,
  alreadyCheckedIn,
}: {
  onCheckIn: (mood: Mood) => void;
  alreadyCheckedIn: boolean;
}) {
  const [showDone, setShowDone] = useState(false);

  const handleClick = useCallback(
    (mood: Mood) => {
      onCheckIn(mood);
      setShowDone(true);
      setTimeout(() => setShowDone(false), 2000);
    },
    [onCheckIn]
  );

  if (alreadyCheckedIn && !showDone) return null;

  return (
    <motion.div variants={itemVariants} className="surface-card p-5 md:p-6">
      {showDone ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center justify-center gap-3 py-4"
        >
          <div className="w-10 h-10 rounded-full bg-[#4ade80]/20 flex items-center justify-center">
            <Check className="w-5 h-5 text-[#4ade80]" />
          </div>
          <p className="text-white font-bold">Check-in saved!</p>
        </motion.div>
      ) : (
        <>
          <h2 className="text-sm font-bold text-white mb-1">How are you feeling right now?</h2>
          <p className="text-xs text-white/40 mb-4">
            A quick check-in helps personalize your dashboard
          </p>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1"
          >
            {MOOD_OPTIONS.map((opt) => (
              <motion.button
                key={opt.mood}
                variants={itemVariants}
                whileTap={{ scale: 0.93 }}
                onClick={() => handleClick(opt.mood)}
                className={cn(
                  'flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl border transition-all shrink-0 min-w-[70px]',
                  'border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/20'
                )}
              >
                <span className="text-2xl">{opt.emoji}</span>
                <span className={cn('text-[10px] font-bold', opt.color)}>{opt.label}</span>
              </motion.button>
            ))}
          </motion.div>
        </>
      )}
    </motion.div>
  );
}
