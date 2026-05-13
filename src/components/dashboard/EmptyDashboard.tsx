'use client';

import { motion } from 'framer-motion';
import { Heart, BookOpen, Wind, Moon, Target, Sparkles } from 'lucide-react';
import Link from 'next/link';

const actions = [
  {
    label: 'Log Mood',
    href: '/mood',
    icon: Heart,
    bg: 'bg-rose-500/10',
    iconColor: 'text-rose-400',
  },
  {
    label: 'Write Journal',
    href: '/journal',
    icon: BookOpen,
    bg: 'bg-amber-500/10',
    iconColor: 'text-amber-400',
  },
  {
    label: 'Breathe',
    href: '/breathing',
    icon: Wind,
    bg: 'bg-cyan-500/10',
    iconColor: 'text-cyan-400',
  },
  {
    label: 'Track Sleep',
    href: '/sleep',
    icon: Moon,
    bg: 'bg-indigo-500/10',
    iconColor: 'text-indigo-400',
  },
  {
    label: 'Set Habit',
    href: '/habits',
    icon: Target,
    bg: 'bg-[#E2FF6F]/10',
    iconColor: 'text-[#E2FF6F]',
  },
];

export function EmptyDashboard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="glass-panel p-8 md:p-10 rounded-2xl bg-white/5 border-white/5 text-center"
    >
      <div className="w-16 h-16 rounded-2xl bg-[#E2FF6F]/10 text-[#E2FF6F] flex items-center justify-center mx-auto mb-5">
        <Sparkles className="w-8 h-8" />
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">Welcome to MindCare</h2>
      <p className="text-white/40 max-w-md mx-auto mb-8 text-base">
        Start tracking to unlock insights and discover patterns in your wellbeing.
      </p>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 max-w-2xl mx-auto">
        {actions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className={`flex flex-col items-center gap-2 p-4 rounded-2xl ${action.bg} border border-white/5 hover:scale-105 transition-all`}
          >
            <action.icon className={`w-6 h-6 ${action.iconColor}`} />
            <span className="text-[10px] font-bold text-white/70 text-center leading-tight">
              {action.label}
            </span>
          </Link>
        ))}
      </div>
    </motion.div>
  );
}
