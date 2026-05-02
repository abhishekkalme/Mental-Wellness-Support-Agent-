"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Brain, 
  Search, 
  Plus, 
  Play, 
  Clock, 
  Sparkles,
  Heart,
  Eye,
  Circle
} from "lucide-react";

const meditations = [
  { id: "m1", title: "Body Scan Meditation", duration: "10 min", category: "Mindfulness", img: "🧘", desc: "A guided journey through your physical sensations." },
  { id: "m2", title: "Loving Kindness", duration: "15 min", category: "Emotional", img: "❤️", desc: "Generating compassion for yourself and others." },
  { id: "m3", title: "Morning Clarity", duration: "5 min", category: "Focus", img: "☀️", desc: "Set your intentions for the day ahead." },
  { id: "m4", title: "Stress Release", duration: "12 min", category: "Anxiety", img: "☁️", desc: "Release the tension accumulated in your mind." },
  { id: "m5", title: "Inner Vision", duration: "20 min", category: "Visualization", img: "👁️", desc: "Step into your mental sanctuary." },
  { id: "m6", title: "Mindful Walking", duration: "10 min", category: "Mindfulness", img: "🚶", desc: "Awareness in motion for your daily commute." },
];

export default function MeditationPage() {
  const [filter, setFilter] = useState("All");
  const [playingId, setPlayingId] = useState<string | null>(null);

  const categories = ["All", "Mindfulness", "Anxiety", "Focus", "Emotional", "Visualization"];
  
  const filteredMeditations = filter === "All" 
    ? meditations 
    : meditations.filter(m => m.category === filter);

  return (
    <main className="p-8 max-w-7xl mx-auto space-y-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-emerald-400 mb-2">
            <Brain className="w-6 h-6" />
            <span className="text-sm font-bold uppercase tracking-widest">Meditation Library</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Mindfulness Sessions</h1>
          <p className="text-muted-foreground text-lg">Expert-guided sessions for every mental state.</p>
        </div>
        
        <div className="relative w-full md:w-64">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
           <input 
             placeholder="Search meditations..." 
             className="w-full pl-10 pr-4 h-11 rounded-xl glass-panel bg-background/50 border-border focus:ring-2 focus:ring-emerald-400 outline-none text-sm transition-all"
           />
        </div>
      </header>

      <div className="flex flex-wrap gap-2 overflow-x-auto pb-2">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-5 py-2 rounded-full text-xs font-bold transition-all border whitespace-nowrap ${
              filter === cat 
                ? "bg-emerald-400 text-white border-emerald-400 shadow-sm shadow-emerald-400/20" 
                : "glass-panel text-muted-foreground hover:border-emerald-400/40"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMeditations.map((m) => (
          <motion.div
            key={m.id}
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel p-1 border-emerald-400/10 hover:border-emerald-400/30 transition-all group overflow-hidden"
          >
            <div className="aspect-video w-full glass-panel flex items-center justify-center text-6xl relative group-hover:scale-105 transition-transform duration-500">
               <div className="absolute inset-0 bg-emerald-400/5 opacity-0 group-hover:opacity-100 transition-opacity" />
               <span className="relative z-10">{m.img}</span>
               <div className="absolute top-4 left-4">
                  <span className="px-2 py-1 bg-background/80 backdrop-blur-sm rounded-md text-[10px] font-bold uppercase tracking-widest text-emerald-500 border border-emerald-500/20">
                    {m.category}
                  </span>
               </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <h4 className="text-xl font-bold">{m.title}</h4>
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2 leading-relaxed">{m.desc}</p>
              </div>
              
              <div className="flex items-center justify-between pt-2">
                 <span className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                   <Clock className="w-3.5 h-3.5" /> {m.duration}
                 </span>
                 <Button 
                   variant="ghost" 
                   size="sm" 
                   onClick={() => {
                     if (playingId === m.id) {
                       setPlayingId(null);
                     } else {
                       setPlayingId(m.id);
                       setTimeout(() => setPlayingId(null), 10000); // Simulate completion
                     }
                   }}
                   className={`rounded-full gap-2 transition-all duration-500 ${playingId === m.id ? "bg-emerald-500 text-white shadow-xl shadow-emerald-500/20" : "text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white"}`}
                 >
                    {playingId === m.id ? "Playing..." : "Start"} <Play className={`w-3 h-3 fill-current ${playingId === m.id ? "animate-pulse" : ""}`} />
                 </Button>
              </div>
            </div>
          </motion.div>
        ))}
        
        <button className="glass-panel p-8 flex flex-col items-center justify-center text-center gap-4 group border-dashed border-2 border-border/50 hover:border-primary/50 transition-all aspect-video lg:aspect-auto">
          <div className="p-4 rounded-full bg-primary/5 text-primary group-hover:scale-110 transition-transform">
            <Plus className="w-8 h-8" />
          </div>
          <div>
            <h4 className="font-bold">Pro Member?</h4>
            <p className="text-xs text-muted-foreground">Unlock 500+ guided sessions</p>
          </div>
        </button>
      </div>
    </main>
  );
}
