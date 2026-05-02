"use client";

import { motion } from "framer-motion";
import { BookText, Flower2, Leaf, Sun, ArrowRight, BookOpen, Wind, Coffee, Moon } from "lucide-react";
import { useStore } from "@/store/useStore";

const ActivityCard = ({ title, desc, duration, icon: Icon, color, delay }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
    whileHover={{ y: -2, scale: 1.01 }}
    className="p-8 rounded-[40px] bg-white/5 border border-white/10 shadow-2xl flex flex-col gap-6 cursor-pointer group hover:bg-white/10 transition-all duration-500 overflow-hidden relative"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-[#E2FF6F]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    
    <div className="flex justify-between items-start relative z-10">
      <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-700 shadow-lg`}>
        <Icon className="w-7 h-7 text-[#E2FF6F]" />
      </div>
      <div className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] flex items-center gap-1.5">
        <Wind className="w-3.5 h-3.5" /> {duration}
      </div>
    </div>
    
    <div className="space-y-2 relative z-10">
      <h4 className="font-bold text-white text-xl tracking-tight">{title}</h4>
      <p className="text-sm text-white/40 font-medium leading-relaxed">{desc}</p>
    </div>

    <div className="mt-2 flex items-center gap-2 text-[#E2FF6F] text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-[-10px] group-hover:translate-x-0 relative z-10">
        Start Now <ArrowRight className="w-3.5 h-3.5" />
    </div>
  </motion.div>
);

export function RecommendedActivities() {
  const store = useStore();
  const struggles = store.onboardingData?.struggles || [];

  const allActivities = [
    {
      title: "Daily Journal",
      desc: "Reflect on your thoughts and emotions 🌿",
      duration: "5 min",
      icon: BookText,
      color: "bg-white/10",
      delay: 0.1,
      tags: ["Anxiety", "Overthinking"]
    },
    {
      title: "Calm Mind",
      desc: "A 3-min meditation to center yourself",
      duration: "3 min",
      icon: Flower2,
      color: "bg-white/10",
      delay: 0.2,
      tags: ["Anxiety", "Focus", "Overthinking"]
    },
    {
      title: "Box Breathing",
      desc: "Relieve stress with a rhythmic breathing pattern",
      duration: "2 min",
      icon: Wind,
      color: "bg-white/10",
      delay: 0.3,
      tags: ["Anxiety", "Sleep"]
    },
    {
      title: "Focus Flow",
      desc: "Gentle background sounds to help you concentrate",
      duration: "10 min",
      icon: Coffee,
      color: "bg-white/10",
      delay: 0.4,
      tags: ["Focus", "Motivation"]
    },
    {
      title: "Evening Wind Down",
      desc: "Relax your body and prepare for sleep",
      duration: "6 min",
      icon: Moon,
      color: "bg-white/10",
      delay: 0.5,
      tags: ["Sleep"]
    },
    {
      title: "Gratitude Practice",
      desc: "Shift your focus to the positive",
      duration: "4 min",
      icon: Leaf,
      color: "bg-white/10",
      delay: 0.6,
      tags: ["Loneliness", "Motivation"]
    }
  ];

  // Filter activities based on user struggles, or show general ones if no struggles/skipped
  const filteredActivities = struggles.length > 0 
    ? allActivities.filter(a => a.tags.some(t => struggles.includes(t))).slice(0, 4)
    : allActivities.slice(0, 4);

  return (
    <div className="space-y-6 md:space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1 md:space-y-2">
          <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-white">Recommended for you</h3>
          <p className="text-white/40 font-medium tracking-wide">
            {struggles.length > 0 
              ? `Personalized for: ${struggles.join(", ")}` 
              : "General suggestions for your wellbeing"}
          </p>
        </div>
        <button className="h-10 md:h-12 px-4 md:px-6 rounded-full border border-white/10 text-white font-bold text-xs md:text-sm tracking-widest uppercase hover:bg-white/10 hover:border-[#E2FF6F]/30 transition-all flex items-center justify-center gap-2 md:gap-3 active:scale-95 w-fit">
          View all <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {filteredActivities.map((activity, i) => (
          <ActivityCard key={i} {...activity} />
        ))}
      </div>
    </div>
  );
}
