"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useStore } from "@/store/useStore";
import { Button } from "@/components/ui/button";
import { Mood } from "@/lib/types";
import { format } from "date-fns";
import {
  Check,
  Calendar,
  Activity,
  Sparkles
} from "lucide-react";

const activities = [
  "Work",
  "Exercise",
  "Study",
  "Family",
  "Friends",
  "Gaming",
  "Reading",
  "Sleep",
  "Chores",
];

export default function MoodPage() {
  const store = useStore();

  const [selectedMood, setSelectedMood] =
    useState<Mood | null>(null);

  const [intensity, setIntensity] = useState(5);

  const [notes, setNotes] = useState("");

  const [selectedActivities, setSelectedActivities] =
    useState<string[]>([]);

  const [submitted, setSubmitted] = useState(false);

  const moods = [
    {
      type: "excellent",
      emoji: "✨",
      label: "Excellent",
      color: "text-emerald-400 border-emerald-400/40",
    },
    {
      type: "good",
      emoji: "😊",
      label: "Good",
      color: "text-blue-400 border-blue-400/40",
    },
    {
      type: "okay",
      emoji: "😐",
      label: "Okay",
      color: "text-yellow-400 border-yellow-400/40",
    },
    {
      type: "bad",
      emoji: "🌧️",
      label: "Bad",
      color: "text-orange-400 border-orange-400/40",
    },
    {
      type: "terrible",
      emoji: "⛈️",
      label: "Terrible",
      color: "text-red-400 border-red-400/40",
    },
  ] as const;

  const toggleActivity = (activity: string) => {
    setSelectedActivities((prev) =>
      prev.includes(activity)
        ? prev.filter((x) => x !== activity)
        : [...prev, activity]
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
      setNotes("");
      setSelectedActivities([]);
    }, 2500);
  };

  return (
    <main className="max-w-7xl mx-auto p-10 space-y-10">

      {/* Header */}
      <div>
        <h1 className="text-5xl font-bold tracking-tight">
          Daily Check-in
        </h1>

        <p className="text-white/40 text-xl mt-3">
          How are you feeling right now?
        </p>
      </div>

      {submitted ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel p-16 flex flex-col items-center text-center gap-6"
        >
          <div className="w-20 h-20 rounded-full bg-[#E2FF6F]/20 flex items-center justify-center">
            <Check className="w-10 h-10 text-[#E2FF6F]" />
          </div>

          <h2 className="text-3xl font-bold">
            Check-in Complete
          </h2>

          <p className="text-white/40 max-w-md">
            Your emotional state has been saved.
          </p>
        </motion.div>
      ) : (
        <div className="grid lg:grid-cols-[1.3fr_0.9fr] gap-8">

          {/* Left */}
          <div className="glass-panel p-8 space-y-10">

            {/* Mood */}
            <div className="space-y-5">
              <h3 className="text-lg font-semibold">
                1. Select your mood
              </h3>

              <div className="grid grid-cols-5 gap-4">
                {moods.map((mood) => {
                  const active =
                    selectedMood === mood.type;

                  return (
                    <motion.button
                      whileHover={{
                        y: -4,
                        scale: 1.03,
                      }}
                      whileTap={{
                        scale: 0.98,
                      }}
                      key={mood.type}
                      onClick={() =>
                        setSelectedMood(
                          mood.type as Mood
                        )
                      }
                      className={`
                        h-28 rounded-2xl border
                        flex flex-col items-center justify-center gap-2
                        transition-all
                        ${
                          active
                            ? `${mood.color} bg-white/5 shadow-lg`
                            : "border-white/10 bg-white/[0.02]"
                        }
                      `}
                    >
                      <span className="text-3xl">
                        {mood.emoji}
                      </span>

                      <span className="text-xs font-medium">
                        {mood.label}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Form */}
            <AnimatePresence>
              {selectedMood && (
                <motion.div
                  initial={{
                    opacity: 0,
                    y: 20,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  className="space-y-8"
                >

                  {/* Intensity */}
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="font-medium">
                        Intensity
                      </span>

                      <span className="text-[#E2FF6F]">
                        {intensity}/10
                      </span>
                    </div>

                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={intensity}
                      onChange={(e) =>
                        setIntensity(
                          Number(
                            e.target.value
                          )
                        )
                      }
                      className="w-full"
                    />
                  </div>

                  {/* Activities */}
                  <div className="space-y-4">
                    <h3 className="font-medium">
                      Activities
                    </h3>

                    <div className="flex flex-wrap gap-3">
                      {activities.map(
                        (activity) => (
                          <button
                            key={activity}
                            onClick={() =>
                              toggleActivity(
                                activity
                              )
                            }
                            className={`
                              px-4 py-2 rounded-full text-sm border
                              transition-all
                              ${
                                selectedActivities.includes(
                                  activity
                                )
                                  ? "bg-[#E2FF6F] text-black border-[#E2FF6F]"
                                  : "border-white/10"
                              }
                            `}
                          >
                            {activity}
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="space-y-4">
                    <h3 className="font-medium">
                      Notes
                    </h3>

                    <textarea
                      value={notes}
                      onChange={(e) =>
                        setNotes(
                          e.target.value
                        )
                      }
                      placeholder="What's on your mind?"
                      className="w-full h-32 rounded-2xl bg-white/[0.03] border border-white/10 p-4 resize-none"
                    />
                  </div>

                  <Button
                    onClick={saveMood}
                    className="w-full h-14 bg-[#E2FF6F] text-black font-bold"
                  >
                    Save Check-in
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Timeline */}
          <div className="glass-panel p-8">

            <div className="flex items-center gap-3 mb-8">
              <Calendar className="w-5 h-5 text-[#E2FF6F]" />

              <h3 className="text-xl font-semibold">
                Timeline
              </h3>
            </div>

            {store.moodHistory.length === 0 ? (
              <div className="h-[400px] flex items-center justify-center text-white/30 text-center">
                No entries yet.
              </div>
            ) : (
              <div className="space-y-5 max-h-[600px] overflow-y-auto">
                {store.moodHistory
                  .slice()
                  .reverse()
                  .map((entry) => (
                    <div
                      key={entry.id}
                      className="border-l border-white/10 pl-5"
                    >
                      <p className="font-medium capitalize">
                        {entry.mood}
                      </p>

                      <p className="text-sm text-white/40 mt-1">
                        {format(
                          new Date(
                            entry.timestamp
                          ),
                          "MMM d • h:mm a"
                        )}
                      </p>

                      {entry.notes && (
                        <p className="text-sm mt-3 text-white/70">
                          {entry.notes}
                        </p>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}