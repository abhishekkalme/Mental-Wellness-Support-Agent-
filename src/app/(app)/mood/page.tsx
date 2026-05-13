'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef } from 'react';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Mood } from '@/lib/types';
import { format } from 'date-fns';
import { Check, Calendar, Heart } from 'lucide-react';
import Link from 'next/link';

const activities = [
  'Work',
  'Exercise',
  'Study',
  'Family',
  'Friends',
  'Gaming',
  'Reading',
  'Sleep',
  'Chores',
];

export default function MoodPage() {
  const store = useStore();

  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);

  const [intensity, setIntensity] = useState(5);

  const [notes, setNotes] = useState('');

  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);

  const [submitted, setSubmitted] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  const moods = [
    {
      type: 'excellent',
      emoji: '✨',
      label: 'Excellent',
      color: 'text-emerald-400 border-emerald-400/40',
    },
    {
      type: 'good',
      emoji: '😊',
      label: 'Good',
      color: 'text-blue-400 border-blue-400/40',
    },
    {
      type: 'okay',
      emoji: '😐',
      label: 'Okay',
      color: 'text-yellow-400 border-yellow-400/40',
    },
    {
      type: 'bad',
      emoji: '🌧️',
      label: 'Bad',
      color: 'text-orange-400 border-orange-400/40',
    },
    {
      type: 'terrible',
      emoji: '⛈️',
      label: 'Terrible',
      color: 'text-red-400 border-red-400/40',
    },
  ] as const;

  const toggleActivity = (activity: string) => {
    setSelectedActivities((prev) =>
      prev.includes(activity) ? prev.filter((x) => x !== activity) : [...prev, activity]
    );
  };

  const saveMood = () => {
    if (!selectedMood) return;

    store.addMoodEntry({
      id: Date.now().toString(),
      mood: selectedMood,
      intensity,
      notes,
      activities: selectedActivities,
      timestamp: new Date().toISOString(),
    });

    setSubmitted(true);

    setTimeout(() => {
      setSubmitted(false);
      setSelectedMood(null);
      setIntensity(5);
      setNotes('');
      setSelectedActivities([]);
    }, 2500);
  };

  return (
    <main className="max-w-7xl mx-auto p-4 md:p-10 space-y-6 md:space-y-10 relative">
      {/* Ambient glow */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#E2FF6F]/5 blur-[150px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-rose-500/5 blur-[150px] rounded-full" />
      </div>

      {/* Header */}
      <div className="relative z-10 pt-4 md:pt-0">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight">Daily Check-in</h1>
        <p className="text-white/40 text-lg md:text-xl mt-2 md:mt-3">
          How are you feeling right now?
        </p>
      </div>

      <div className="relative z-10">
        {store.moodHistory.length === 0 && !submitted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel p-12 md:p-16 flex flex-col items-center text-center gap-8"
          >
            <div className="w-20 h-20 rounded-full bg-[#E2FF6F]/10 flex items-center justify-center">
              <Heart className="w-10 h-10 text-[#E2FF6F]" />
            </div>
            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-white">No check-ins yet</h2>
              <p className="text-white/40 max-w-md">
                Start tracking your mood to see patterns over time
              </p>
            </div>
            <Button
              onClick={() => formRef.current?.scrollIntoView({ behavior: 'smooth' })}
              className="h-12 px-8 bg-[#E2FF6F] hover:bg-[#d4f056] text-black font-bold rounded-full"
            >
              Log Your First Check-in
            </Button>
          </motion.div>
        )}

        {submitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel p-16 flex flex-col items-center text-center gap-6"
          >
            <div className="w-20 h-20 rounded-full bg-[#E2FF6F]/20 flex items-center justify-center">
              <Check className="w-10 h-10 text-[#E2FF6F]" />
            </div>
            <h2 className="text-3xl font-bold text-white">Check-in Complete</h2>
            <p className="text-white/40 max-w-md">Your emotional state has been saved.</p>
          </motion.div>
        ) : (
          <div className="grid lg:grid-cols-[1.3fr_0.9fr] gap-8">
            {/* Left */}
            <div ref={formRef} className="glass-panel p-6 md:p-8 space-y-10">
              {/* Mood */}
              <div className="space-y-5">
                <h3 className="text-lg font-semibold text-white">1. Select your mood</h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-4">
                  {moods.map((mood) => {
                    const active = selectedMood === mood.type;

                    return (
                      <motion.button
                        whileHover={{ y: -4, scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                        key={mood.type}
                        onClick={() => setSelectedMood(mood.type as Mood)}
                        className={`
                        h-28 rounded-2xl border flex flex-col items-center justify-center gap-2
                        transition-all duration-300 relative overflow-hidden
                        ${
                          active
                            ? `${mood.color} bg-white/[0.06] shadow-lg shadow-[#E2FF6F]/5`
                            : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/20'
                        }
                      `}
                      >
                        {active && (
                          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] to-transparent" />
                        )}
                        <span className="text-3xl relative">{mood.emoji}</span>
                        <span className="text-xs font-semibold relative">{mood.label}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Form */}
              <AnimatePresence>
                {selectedMood && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-8"
                  >
                    {/* Intensity */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-white">Intensity</span>
                        <span className="text-[#E2FF6F] font-bold tabular-nums">
                          {intensity}/10
                        </span>
                      </div>

                      <div className="relative">
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={intensity}
                          onChange={(e) => setIntensity(Number(e.target.value))}
                          className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-[#E2FF6F] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#E2FF6F] [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-[#E2FF6F]/30"
                        />
                        <div className="flex justify-between text-[10px] text-white/20 mt-1.5 px-0.5">
                          <span>Mild</span>
                          <span>Intense</span>
                        </div>
                      </div>
                    </div>

                    {/* Activities */}
                    <div className="space-y-4">
                      <h3 className="font-medium text-white/80">Activities</h3>

                      <div className="flex flex-wrap gap-2">
                        {activities.map((activity) => (
                          <button
                            key={activity}
                            onClick={() => toggleActivity(activity)}
                            className={`
                              px-4 py-2 rounded-full text-sm font-medium border
                              transition-all duration-200
                              ${
                                selectedActivities.includes(activity)
                                  ? 'bg-[#E2FF6F] text-black border-[#E2FF6F] shadow-lg shadow-[#E2FF6F]/20'
                                  : 'border-white/[0.08] bg-white/[0.02] text-white/50 hover:text-white hover:bg-white/[0.06] hover:border-white/20'
                              }
                            `}
                          >
                            {activity}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Notes */}
                    <div className="space-y-4">
                      <h3 className="font-medium text-white/80">Notes</h3>

                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="What's on your mind?"
                        className="w-full h-32 rounded-2xl bg-white/[0.03] border border-white/[0.08] p-4 resize-none text-white/80 placeholder:text-white/20 focus:border-[#E2FF6F]/30 focus:outline-none transition-all"
                      />
                    </div>

                    <Button
                      onClick={saveMood}
                      className="w-full h-14 bg-[#E2FF6F] hover:bg-[#d4f056] text-black font-bold rounded-2xl shadow-lg shadow-[#E2FF6F]/20"
                    >
                      Save Check-in
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Timeline */}
            <div className="glass-panel p-6 md:p-8">
              <div className="flex items-center gap-3 mb-8">
                <Calendar className="w-5 h-5 text-[#E2FF6F]" />
                <h3 className="text-xl font-semibold text-white">Timeline</h3>
              </div>

              {store.moodHistory.length === 0 ? (
                <div className="h-[400px] flex flex-col items-center justify-center text-center space-y-5">
                  <div className="w-16 h-16 rounded-full bg-[#E2FF6F]/10 flex items-center justify-center">
                    <Heart className="w-7 h-7 text-[#E2FF6F]" />
                  </div>
                  <div>
                    <p className="text-white/40 text-lg font-medium mb-1">No entries yet.</p>
                    <p className="text-white/20 text-sm">
                      Start tracking your mood to see patterns over time.
                    </p>
                  </div>
                  <button
                    onClick={() => formRef.current?.scrollIntoView({ behavior: 'smooth' })}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#E2FF6F]/10 border border-[#E2FF6F]/30 text-[#E2FF6F] font-bold text-sm hover:bg-[#E2FF6F]/20 transition-all"
                  >
                    <Heart className="w-4 h-4" />
                    Log Your First Mood
                  </button>
                </div>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                  {store.moodHistory
                    .slice()
                    .reverse()
                    .map((entry) => (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="relative pl-6 border-l-2 border-white/[0.06] hover:border-[#E2FF6F]/30 transition-colors group"
                      >
                        <div className="absolute left-0 top-1.5 w-3 h-3 -translate-x-[7px] rounded-full bg-white/10 group-hover:bg-[#E2FF6F]/40 transition-colors" />
                        <div className="p-4 rounded-xl bg-white/[0.02] group-hover:bg-white/[0.04] transition-all">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">
                              {moods.find((m) => m.type === entry.mood)?.emoji}
                            </span>
                            <p className="font-semibold text-white capitalize">{entry.mood}</p>
                          </div>
                          <p className="text-xs text-white/30">
                            {format(new Date(entry.timestamp), 'MMM d • h:mm a')}
                          </p>
                          {entry.notes && (
                            <p className="text-sm mt-2 text-white/50 leading-relaxed">
                              {entry.notes}
                            </p>
                          )}
                          {entry.activities && entry.activities.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {entry.activities.map((a) => (
                                <span
                                  key={a}
                                  className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/[0.04] text-white/30 border border-white/[0.06]"
                                >
                                  {a}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
