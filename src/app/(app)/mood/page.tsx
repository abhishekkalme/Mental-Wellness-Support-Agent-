'use client';

import { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Mood } from '@/lib/types';
import { format, isSameDay, subDays } from 'date-fns';
import { Check, Heart, Plus, Calendar } from 'lucide-react';

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

const moods = [
  {
    type: 'excellent' as Mood,
    emoji: '✨',
    label: 'Excellent',
    color: 'text-emerald-400',
    border: 'border-emerald-400/40',
    bg: 'bg-emerald-500/10',
  },
  {
    type: 'good' as Mood,
    emoji: '😊',
    label: 'Good',
    color: 'text-blue-400',
    border: 'border-blue-400/40',
    bg: 'bg-blue-500/10',
  },
  {
    type: 'okay' as Mood,
    emoji: '😐',
    label: 'Okay',
    color: 'text-yellow-400',
    border: 'border-yellow-400/40',
    bg: 'bg-yellow-500/10',
  },
  {
    type: 'bad' as Mood,
    emoji: '🌧️',
    label: 'Bad',
    color: 'text-orange-400',
    border: 'border-orange-400/40',
    bg: 'bg-orange-500/10',
  },
  {
    type: 'terrible' as Mood,
    emoji: '⛈️',
    label: 'Terrible',
    color: 'text-red-400',
    border: 'border-red-400/40',
    bg: 'bg-red-500/10',
  },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

export default function MoodPage() {
  const store = useStore();
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [intensity, setIntensity] = useState(5);
  const [notes, setNotes] = useState('');
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  const recentMoods = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = subDays(new Date(), 6 - i);
      const entry = store.moodHistory.find((m) => isSameDay(new Date(m.timestamp), d));
      return entry ? moods.find((m) => m.type === entry.mood) || null : null;
    });
  }, [store.moodHistory]);

  const toggleActivity = (a: string) =>
    setSelectedActivities((p) => (p.includes(a) ? p.filter((x) => x !== a) : [...p, a]));

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

  const wordCount = notes.trim() ? notes.trim().split(/\s+/).length : 0;

  return (
    <main
      id="main-content"
      className="max-w-7xl mx-auto p-4 md:p-10 space-y-6 md:space-y-10 relative"
    >
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 pt-4 md:pt-0"
      >
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight">Daily Check-in</h1>
        <p className="text-white/70 text-lg md:text-xl mt-2 md:mt-3">
          How are you feeling right now?
        </p>
      </motion.div>

      <div className="relative z-10">
        <AnimatePresence mode="wait">
          {store.moodHistory.length === 0 && !submitted && !selectedMood && (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              className="surface-card p-12 md:p-16 flex flex-col items-center text-center gap-8"
            >
              <div className="w-20 h-20 rounded-full bg-[#E2FF6F]/10 flex items-center justify-center">
                <Heart className="w-10 h-10 text-[#E2FF6F]" />
              </div>
              <div className="space-y-3">
                <h2 className="text-2xl font-bold text-white">No check-ins yet</h2>
                <p className="text-white/70 max-w-md">
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

          {submitted && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="surface-card p-16 flex flex-col items-center text-center gap-6"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                className="w-20 h-20 rounded-full bg-[#E2FF6F]/20 flex items-center justify-center"
              >
                <Check className="w-10 h-10 text-[#E2FF6F]" />
              </motion.div>
              <h2 className="text-3xl font-bold text-white">Check-in Complete</h2>
              <p className="text-white/70 max-w-md">Your emotional state has been saved.</p>
            </motion.div>
          )}

          {!submitted && (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid lg:grid-cols-[1.3fr_0.9fr] gap-8"
            >
              <div ref={formRef} className="surface-card p-6 md:p-8 space-y-10">
                <div className="space-y-5">
                  <h3 className="text-lg font-semibold text-white">1. Select your mood</h3>
                  <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-4"
                  >
                    {moods.map((mood) => {
                      const active = selectedMood === mood.type;
                      return (
                        <motion.button
                          key={mood.type}
                          variants={item}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setSelectedMood(mood.type)}
                          className={`h-28 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all duration-300 relative overflow-hidden ${
                            active
                              ? `${mood.color} ${mood.bg} border-[${mood.color}] shadow-lg`
                              : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/20'
                          }`}
                        >
                          {active && (
                            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] to-transparent" />
                          )}
                          <span className="text-3xl relative">{mood.emoji}</span>
                          <span className="text-xs font-semibold relative">{mood.label}</span>
                        </motion.button>
                      );
                    })}
                  </motion.div>
                </div>

                <AnimatePresence>
                  {selectedMood && (
                    <motion.div
                      key="form-fields"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      className="space-y-8"
                    >
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
                            aria-label="Mood intensity"
                            aria-valuenow={intensity}
                            aria-valuemin={1}
                            aria-valuemax={10}
                            className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-[#E2FF6F] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#E2FF6F] [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-[#E2FF6F]/30"
                          />
                          <div className="flex justify-between text-[10px] text-white/40 mt-1.5 px-0.5">
                            <span>Mild</span>
                            <span>Intense</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="font-medium text-white/80">Activities</h3>
                        <div className="flex flex-wrap gap-2">
                          {activities.map((a) => {
                            const active = selectedActivities.includes(a);
                            return (
                              <motion.button
                                key={a}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => toggleActivity(a)}
                                className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 ${
                                  active
                                    ? 'bg-[#E2FF6F] text-black border-[#E2FF6F] shadow-lg shadow-[#E2FF6F]/20'
                                    : 'border-white/[0.08] bg-white/[0.02] text-white/60 hover:text-white hover:bg-white/[0.06] hover:border-white/20'
                                }`}
                              >
                                {a}
                              </motion.button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-white/80">Notes</h3>
                          {wordCount > 0 && (
                            <span className="text-[11px] text-white/40 tabular-nums">
                              {wordCount} words
                            </span>
                          )}
                        </div>
                        <Textarea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="What's on your mind?"
                          className="min-h-[130px]"
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

              <div className="surface-card p-6 md:p-8">
                <div className="flex items-center gap-3 mb-8">
                  <Calendar className="w-5 h-5 text-[#E2FF6F]" />
                  <h3 className="text-xl font-semibold text-white">Timeline</h3>
                </div>

                {store.moodHistory.length > 0 && (
                  <div className="flex items-center gap-1.5 mb-6 justify-center">
                    {recentMoods.map((m, i) => (
                      <div
                        key={i}
                        title={m ? m.label : 'No data'}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all ${
                          m ? m.bg : 'bg-white/[0.03]'
                        }`}
                      >
                        {m ? m.emoji : '—'}
                      </div>
                    ))}
                  </div>
                )}

                {store.moodHistory.length === 0 ? (
                  <div className="h-[400px] flex flex-col items-center justify-center text-center space-y-5">
                    <div className="w-16 h-16 rounded-full bg-[#E2FF6F]/10 flex items-center justify-center">
                      <Heart className="w-7 h-7 text-[#E2FF6F]" />
                    </div>
                    <div>
                      <p className="text-white/60 text-lg font-medium mb-1">No entries yet.</p>
                      <p className="text-white/40 text-sm">
                        Start tracking your mood to see patterns over time.
                      </p>
                    </div>
                    <button
                      onClick={() => formRef.current?.scrollIntoView({ behavior: 'smooth' })}
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#E2FF6F]/10 border border-[#E2FF6F]/30 text-[#E2FF6F] font-bold text-sm hover:bg-[#E2FF6F]/20 transition-all"
                    >
                      <Heart className="w-4 h-4" /> Log Your First Mood
                    </button>
                  </div>
                ) : (
                  <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scroll"
                  >
                    {store.moodHistory
                      .slice()
                      .reverse()
                      .map((entry, i) => (
                        <motion.div
                          key={entry.id}
                          variants={item}
                          transition={{ delay: i * 0.03 }}
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
                            <p className="text-xs text-white/50">
                              {format(new Date(entry.timestamp), 'MMM d • h:mm a')}
                            </p>
                            {entry.notes && (
                              <p className="text-sm mt-2 text-white/70 leading-relaxed">
                                {entry.notes}
                              </p>
                            )}
                            {entry.activities && entry.activities.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                {entry.activities.map((a) => (
                                  <span
                                    key={a}
                                    className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/[0.04] text-white/50 border border-white/[0.06]"
                                  >
                                    {a}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
