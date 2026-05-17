'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, Heart, BookText, Wind, Moon, Brain, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { OnboardingData } from '@/lib/types';

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

export function WelcomeZeroState({
  name,
  onboardingData,
}: {
  name: string;
  onboardingData: OnboardingData | undefined;
}) {
  const tips: { icon: any; message: string; action: { label: string; href: string } }[] = [];
  const p = onboardingData?.priorities || [];
  const bc = onboardingData?.biggestChallenge;
  if (onboardingData) {
    if (p.includes('sleep') || bc === 'sleep')
      tips.push({
        icon: Moon,
        message: 'You mentioned sleep is important. Start by logging your first night.',
        action: { label: 'Log sleep', href: '/sleep' },
      });
    if (p.includes('focus') || p.includes('clarity'))
      tips.push({
        icon: Brain,
        message: 'Deep work starts with a calm mind. Try a 3-minute breathing exercise.',
        action: { label: 'Breathe now', href: '/breathing' },
      });
    if (
      p.includes('anxiety') ||
      p.includes('emotional') ||
      onboardingData.feeling === 'anxious' ||
      onboardingData.feeling === 'stressed'
    )
      tips.push({
        icon: Heart,
        message: 'You said reducing anxiety is a priority. Try daily journaling.',
        action: { label: 'Write journal', href: '/journal' },
      });
    if (p.includes('habits'))
      tips.push({
        icon: Sparkles,
        message: 'Building habits takes consistency, not perfection. Start with one today.',
        action: { label: 'Set habit', href: '/habits' },
      });
    if (bc === 'overthinking')
      tips.push({
        icon: Brain,
        message: 'Overthinking? Try the 5-4-3-2-1 grounding technique.',
        action: { label: 'Grounding exercise', href: '/breathing' },
      });
    if (bc === 'procrastination')
      tips.push({
        icon: Zap,
        message: 'Procrastination starts with one small step. Try a 5-minute timer.',
        action: { label: 'Set a timer', href: '/breathing' },
      });
  }

  return (
    <motion.div variants={itemVariants} className="surface-card p-8 md:p-10 text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="w-16 h-16 rounded-2xl bg-[#E2FF6F]/10 flex items-center justify-center mx-auto mb-5"
      >
        <Sparkles className="w-8 h-8 text-[#E2FF6F]" />
      </motion.div>
      <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
        Welcome{name ? `, ${name}` : ''} to MindCare
      </h2>
      <p className="text-white/60 max-w-md mx-auto mb-8 text-base leading-relaxed">
        Start with one small step. Track your mood, write a thought, or take a deep breath.
      </p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-lg mx-auto mb-8">
        {[
          {
            label: 'Log Mood',
            href: '/mood',
            icon: Heart,
            color: 'text-rose-400',
            bg: 'bg-rose-500/10',
          },
          {
            label: 'Write Journal',
            href: '/journal',
            icon: BookText,
            color: 'text-amber-400',
            bg: 'bg-amber-500/10',
          },
          {
            label: 'Breathe',
            href: '/breathing',
            icon: Wind,
            color: 'text-cyan-400',
            bg: 'bg-cyan-500/10',
          },
          {
            label: 'Track Sleep',
            href: '/sleep',
            icon: Moon,
            color: 'text-[#C8B6FF]',
            bg: 'bg-[#C8B6FF]/10',
          },
        ].map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className={cn(
              'flex flex-col items-center gap-2 p-4 rounded-2xl border border-white/5 transition-all hover:bg-white/10',
              a.bg
            )}
          >
            <a.icon className={cn('w-6 h-6', a.color)} />
            <span className="text-[10px] font-bold text-white/70 text-center leading-tight">
              {a.label}
            </span>
          </Link>
        ))}
      </div>
      {tips.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="inline-flex items-center gap-3 px-5 py-3 rounded-xl bg-[#E2FF6F]/5 border border-[#E2FF6F]/10 max-w-md"
        >
          {React.createElement(tips[0].icon, { className: 'w-5 h-5 text-[#E2FF6F] shrink-0' })}
          <p className="text-sm text-white/70 text-left">{tips[0].message}</p>
        </motion.div>
      )}
    </motion.div>
  );
}
