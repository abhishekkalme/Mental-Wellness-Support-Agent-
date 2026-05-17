'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, BookText, Wind, Moon, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

const QUICK_ACTIONS = [
  {
    id: 'mood',
    label: 'Check-in',
    icon: Heart,
    href: '/mood',
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
  },
  {
    id: 'journal',
    label: 'Journal',
    icon: BookText,
    href: '/journal',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
  },
  {
    id: 'breathing',
    label: 'Breathe',
    icon: Wind,
    href: '/breathing',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
  },
  {
    id: 'sleep',
    label: 'Sleep',
    icon: Moon,
    href: '/sleep',
    color: 'text-[#C8B6FF]',
    bg: 'bg-[#C8B6FF]/10',
  },
  {
    id: 'chat',
    label: 'AI Chat',
    icon: MessageSquare,
    href: '/chat',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
  },
];

export function QuickActionsSection() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-5 gap-2 md:gap-3"
    >
      {QUICK_ACTIONS.map((a, i) => (
        <motion.div key={a.id} variants={itemVariants} transition={{ delay: i * 0.03 }}>
          <Link
            href={a.href}
            className={cn(
              'flex flex-col items-center gap-2 p-3 md:p-4 rounded-2xl border border-white/5 transition-all',
              'bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/15 active:scale-[0.97] block'
            )}
          >
            <div
              className={cn(
                'w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center',
                a.bg
              )}
            >
              <a.icon className={cn('w-5 h-5 md:w-6 md:h-6', a.color)} />
            </div>
            <span className="text-[10px] md:text-xs font-medium text-white/50 text-center">
              {a.label}
            </span>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  );
}
