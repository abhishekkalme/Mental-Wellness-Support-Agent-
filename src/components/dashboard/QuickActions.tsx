'use client';

import { motion } from 'framer-motion';
import { Heart, BookText, Wind, Moon, Target, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const actions = [
  {
    id: 'mood',
    label: 'Check-in',
    icon: Heart,
    href: '/mood',
    bgColor: 'bg-rose-500/10',
    iconColor: 'text-rose-400',
    hoverColor: 'hover:border-rose-400/20',
  },
  {
    id: 'journal',
    label: 'Journal',
    icon: BookText,
    href: '/journal',
    bgColor: 'bg-amber-500/10',
    iconColor: 'text-amber-400',
    hoverColor: 'hover:border-amber-400/20',
  },
  {
    id: 'breathing',
    label: 'Breathe',
    icon: Wind,
    href: '/breathing',
    bgColor: 'bg-cyan-500/10',
    iconColor: 'text-cyan-400',
    hoverColor: 'hover:border-cyan-400/20',
  },
  {
    id: 'sleep',
    label: 'Sleep',
    icon: Moon,
    href: '/sleep',
    bgColor: 'bg-indigo-500/10',
    iconColor: 'text-indigo-400',
    hoverColor: 'hover:border-indigo-400/20',
  },
  {
    id: 'habits',
    label: 'Habits',
    icon: Target,
    href: '/habits',
    bgColor: 'bg-[#E2FF6F]/10',
    iconColor: 'text-[#E2FF6F]',
    hoverColor: 'hover:border-[#E2FF6F]/20',
  },
  {
    id: 'chat',
    label: 'AI Chat',
    icon: MessageSquare,
    href: '/chat',
    bgColor: 'bg-purple-500/10',
    iconColor: 'text-purple-400',
    hoverColor: 'hover:border-purple-400/20',
  },
];

export function QuickActions() {
  return (
    <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
      {actions.map((action, index) => (
        <motion.div
          key={action.id}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <Link
            href={action.href}
            className={cn(
              'flex flex-col items-center gap-2 p-3 md:p-4 rounded-2xl',
              'bg-white/5 border border-white/5',
              'hover:bg-white/10',
              'transition-all duration-300 group',
              action.hoverColor
            )}
          >
            <div
              className={cn(
                'w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center',
                action.bgColor,
                'group-hover:scale-110 transition-transform'
              )}
            >
              <action.icon className={cn('w-5 h-5 md:w-6 md:h-6', action.iconColor)} />
            </div>
            <span className="text-[10px] md:text-xs font-medium text-white/50 group-hover:text-white transition-colors">
              {action.label}
            </span>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
