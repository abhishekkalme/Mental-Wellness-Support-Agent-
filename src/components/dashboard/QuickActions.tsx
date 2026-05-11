'use client';

import { motion } from 'framer-motion';
import { Heart, BookText, Wind } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const actions = [
  {
    id: 'mood',
    label: 'Mood',
    icon: Heart,
    href: '/mood',
    color: 'from-rose-400 to-rose-500',
    bgColor: 'bg-rose-500/10',
    iconColor: 'text-rose-400',
  },
  {
    id: 'journal',
    label: 'Journal',
    icon: BookText,
    href: '/journal',
    color: 'from-amber-400 to-amber-500',
    bgColor: 'bg-amber-500/10',
    iconColor: 'text-amber-400',
  },
  {
    id: 'breathing',
    label: 'Breathe',
    icon: Wind,
    href: '/breathing',
    color: 'from-cyan-400 to-cyan-500',
    bgColor: 'bg-cyan-500/10',
    iconColor: 'text-cyan-400',
  },
];

export function QuickActions() {
  return (
    <div className="grid grid-cols-3 gap-3">
      {actions.map((action, index) => (
        <motion.div
          key={action.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Link
            href={action.href}
            className={cn(
              'flex flex-col items-center gap-2 p-4 rounded-2xl',
              'bg-white/5 border border-white/5',
              'hover:bg-white/10 hover:border-white/10',
              'transition-all duration-300 group'
            )}
          >
            <div
              className={cn(
                'w-12 h-12 rounded-xl flex items-center justify-center',
                action.bgColor,
                'group-hover:scale-110 transition-transform'
              )}
            >
              <action.icon className={cn('w-6 h-6', action.iconColor)} />
            </div>
            <span className="text-xs font-medium text-white/60 group-hover:text-white transition-colors">
              {action.label}
            </span>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
