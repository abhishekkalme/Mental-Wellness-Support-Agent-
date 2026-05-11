'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

const moods = [
  {
    emoji: '😊',
    label: 'Good',
    color: 'bg-[#E2FF6F]/10',
    border: 'border-[#E2FF6F]/30',
    text: 'text-[#E2FF6F]',
  },
  {
    emoji: '😌',
    label: 'Calm',
    color: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    text: 'text-emerald-400',
  },
  {
    emoji: '😐',
    label: 'Okay',
    color: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    text: 'text-amber-400',
  },
  {
    emoji: '😔',
    label: 'Stressed',
    color: 'bg-orange-500/10',
    border: 'border-orange-500/30',
    text: 'text-orange-400',
  },
  {
    emoji: '😢',
    label: 'Sad',
    color: 'bg-indigo-500/10',
    border: 'border-indigo-500/30',
    text: 'text-indigo-400',
  },
  {
    emoji: '😴',
    label: 'Tired',
    color: 'bg-slate-500/10',
    border: 'border-slate-500/30',
    text: 'text-slate-400',
  },
];

export function MoodCheckIn() {
  const [selected, setSelected] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState('');

  const handleSelect = (label: string) => {
    setSelected(label);
    setAnnouncement(`You selected ${label} mood`);
    setTimeout(() => setAnnouncement(''), 2000);
  };

  return (
    <div className="space-y-6 md:space-y-8" role="region" aria-label="Mood check-in">
      <div aria-live="polite" aria-atomic="true" className="sr-only" role="status">
        {announcement}
      </div>
      <div className="space-y-1 md:space-y-2 text-center md:text-left">
        <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
          How are you feeling today?
        </h3>
        <p className="text-sm md:text-base text-white/40 font-medium tracking-wide">
          Take a moment to check in with yourself.
        </p>
      </div>

      <div
        className="glass-panel p-4 md:p-6 flex flex-wrap gap-3 md:gap-5 items-center justify-center md:justify-between border-white/5 shadow-2xl overflow-x-auto no-scrollbar"
        role="group"
        aria-label="Select your current mood"
      >
        {moods.map((mood) => (
          <motion.button
            key={mood.label}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSelect(mood.label)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleSelect(mood.label);
              }
            }}
            aria-pressed={selected === mood.label}
            aria-label={`${mood.label} mood: ${mood.emoji}`}
            className={`flex-1 min-w-[100px] md:min-w-[140px] flex flex-col items-center gap-3 md:gap-4 p-4 md:p-8 rounded-[24px] md:rounded-[36px] border transition-all duration-500 relative overflow-hidden group ${
              selected === mood.label
                ? `${mood.color} ${mood.border} shadow-[0_0_40px_-10px_rgba(226,255,111,0.2)]`
                : 'bg-white/5 border-transparent hover:bg-white/10 hover:border-white/10'
            }`}
          >
            {selected === mood.label && (
              <motion.div
                layoutId="mood-glow"
                className="absolute inset-0 bg-gradient-to-t from-[#E2FF6F]/5 to-transparent opacity-50"
              />
            )}
            <span
              className="text-4xl md:text-5xl drop-shadow-xl group-hover:scale-105 transition-transform duration-500"
              aria-hidden="true"
            >
              {mood.emoji}
            </span>
            <span
              className={`font-bold tracking-tight text-xs md:text-sm ${selected === mood.label ? mood.text : 'text-white/30'}`}
            >
              {mood.label}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
