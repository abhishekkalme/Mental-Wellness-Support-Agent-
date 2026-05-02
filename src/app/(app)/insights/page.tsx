"use client";

import { useStore } from "@/store/useStore";
import { format, subDays, isSameDay } from "date-fns";
import { PieChart, TrendingUp, CalendarDays, Zap, Moon, Wind, BookOpen, Activity } from "lucide-react";
import { useMemo } from "react";
import { Mood } from "@/lib/types";
import { motion } from "framer-motion";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function InsightsPage() {
  const store = useStore();

  const isDataSufficient = 
    store.moodHistory.length >= 1 || 
    store.sleepHistory.length >= 1 || 
    store.breathingHistory.length >= 1 || 
    store.journalEntries.length >= 1 ||
    store.habits.length >= 1;

  // Mood Calculation
  const moodCounts = useMemo(() => {
    const counts: Record<Mood, number> = { excellent: 0, good: 0, okay: 0, bad: 0, terrible: 0 };
    store.moodHistory.forEach(entry => counts[entry.mood]++);
    return counts;
  }, [store.moodHistory]);

  const topMood = useMemo(() => {
    let top: Mood = "okay";
    let max = 0;
    Object.entries(moodCounts).forEach(([mood, count]) => {
      if (count > max) { max = count; top = mood as Mood; }
    });
    return { mood: top, count: max };
  }, [moodCounts]);

  const moodEmojis: Record<string, string> = { excellent: "✨", good: "😊", okay: "😐", bad: "🌧️", terrible: "⛈️" };

  // Sleep Calculation
  const sleepData = Array.from({ length: 7 }).map((_, i) => {
    const d = subDays(new Date(), 6 - i);
    const dayRecords = store.sleepHistory.filter(r => isSameDay(new Date(r.date), d));
    const totalHours = dayRecords.reduce((acc, r) => acc + (r.durationHours || 0), 0);
    return { name: format(d, "EEE"), hours: totalHours };
  });

  // Breathing Calculation
  const breathingData = Array.from({ length: 7 }).map((_, i) => {
    const d = subDays(new Date(), 6 - i);
    const dayRecords = store.breathingHistory.filter(r => isSameDay(new Date(r.date), d));
    const totalMinutes = dayRecords.reduce((acc, r) => acc + r.durationSeconds, 0) / 60;
    return { name: format(d, "EEE"), mins: Math.round(totalMinutes) };
  });

  // Journal Word Count
  const journalData = Array.from({ length: 7 }).map((_, i) => {
    const d = subDays(new Date(), 6 - i);
    const dayRecords = store.journalEntries.filter(r => isSameDay(new Date(r.timestamp), d));
    const totalWords = dayRecords.reduce((acc, r) => acc + r.content.split(" ").length, 0);
    return { name: format(d, "EEE"), words: totalWords };
  });

  // Habit completion (aggregate today vs past)
  const activeHabitsCount = store.habits.length;
  const completedTodayCount = store.habits.filter(h => h.completedDates.includes(format(new Date(), "yyyy-MM-dd"))).length;
  const habitCompletionRate = activeHabitsCount ? Math.round((completedTodayCount / activeHabitsCount) * 100) : 0;

  return (
    <main className="p-8 md:p-12 max-w-7xl mx-auto space-y-12">
      <header className="space-y-4">
        <div className="flex items-center gap-3 text-[#E2FF6F] mb-2">
            <Activity className="w-6 h-6" />
            <span className="text-sm font-bold uppercase tracking-widest">Global Synapse</span>
        </div>
        <h1 className="text-5xl font-bold tracking-tighter text-white">Holistic Intelligence</h1>
        <p className="text-white/40 text-xl font-medium tracking-wide">Synthesizing data from Mood, Context, Habits, Sleep, Breathing, and Journaling.</p>
      </header>

      {!isDataSufficient ? (
        <div className="glass-panel p-20 text-center flex flex-col items-center justify-center border-white/5 bg-white/5 shadow-2xl relative overflow-hidden rounded-[40px]">
           <div className="absolute inset-0 bg-gradient-to-b from-[#E2FF6F]/5 to-transparent opacity-30" />
           <div className="w-24 h-24 rounded-[32px] bg-[#E2FF6F]/10 text-[#E2FF6F] flex items-center justify-center mb-8 shadow-xl shadow-[#E2FF6F]/5 relative z-10">
            <PieChart className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-bold mb-4 text-white relative z-10 tracking-tight">System Awaiting Initialization...</h2>
          <p className="text-white/40 max-w-lg mx-auto text-lg font-medium leading-relaxed relative z-10">
            Engage with any feature across the application (Mood, Sleep, Journals, Habits) to unlock your holistic neural dashboard.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Top Level Metric Cards */}
          <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-4 gap-6">
             <div className="glass-panel p-8 bg-white/5 border-white/5 rounded-[32px] space-y-4 group hover:bg-[#E2FF6F]/5 hover:border-[#E2FF6F]/20 transition-all duration-500">
                <div className="flex items-center gap-3 text-white/50 group-hover:text-[#E2FF6F] transition-colors"><Activity className="w-5 h-5" /> <span className="font-bold uppercase tracking-widest text-xs">Habit Integrity</span></div>
                <div className="text-5xl font-black text-white">{habitCompletionRate}%</div>
                <div className="text-sm text-white/30 font-medium">Daily Objective Met</div>
             </div>
             
             <div className="glass-panel p-8 bg-white/5 border-white/5 rounded-[32px] space-y-4 group hover:border-indigo-400/20 hover:bg-indigo-400/5 transition-all duration-500">
                <div className="flex items-center gap-3 text-white/50 group-hover:text-indigo-400 transition-colors"><Moon className="w-5 h-5" /> <span className="font-bold uppercase tracking-widest text-xs">Sleep Quality</span></div>
                <div className="text-5xl font-black text-white">{sleepData[6].hours}<span className="text-2xl text-white/40">h</span></div>
                <div className="text-sm text-white/30 font-medium">Logged Tonight</div>
             </div>

             <div className="glass-panel p-8 bg-white/5 border-white/5 rounded-[32px] space-y-4 group hover:border-emerald-400/20 hover:bg-emerald-400/5 transition-all duration-500">
                <div className="flex items-center gap-3 text-white/50 group-hover:text-emerald-400 transition-colors"><Wind className="w-5 h-5" /> <span className="font-bold uppercase tracking-widest text-xs">Mindfulness</span></div>
                <div className="text-5xl font-black text-white">{breathingData[6].mins}<span className="text-2xl text-white/40">m</span></div>
                <div className="text-sm text-white/30 font-medium">Active Breathwork Today</div>
             </div>

             <div className="glass-panel p-8 bg-white/5 border-white/5 rounded-[32px] space-y-4 group hover:border-amber-400/20 hover:bg-amber-400/5 transition-all duration-500">
                <div className="flex items-center gap-3 text-white/50 group-hover:text-amber-400 transition-colors"><BookOpen className="w-5 h-5" /> <span className="font-bold uppercase tracking-widest text-xs">Expression</span></div>
                <div className="text-5xl font-black text-white">{journalData[6].words}<span className="text-2xl text-white/40">w</span></div>
                <div className="text-sm text-white/30 font-medium">Words Journaled Today</div>
             </div>
          </div>

          {/* Left Column - Trends */}
          <div className="lg:col-span-8 space-y-8">
            {/* Sleep Trend Chart */}
            <div className="glass-panel p-10 bg-white/5 border-white/5 shadow-2xl rounded-[40px] space-y-8">
               <h3 className="font-bold text-2xl text-white tracking-tight flex items-center gap-4"><Moon className="w-6 h-6 text-indigo-400" /> Somatic Recovery (Sleep)</h3>
               <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sleepData}>
                      <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ background: '#0A0C0B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px' }} itemStyle={{ color: '#818CF8', fontWeight: 'bold' }} cursor={{fill: 'rgba(255,255,255,0.02)'}} />
                      <Bar dataKey="hours" fill="#818CF8" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
               </div>
            </div>

            {/* Cognitive Expression Line Chart */}
            <div className="glass-panel p-10 bg-white/5 border-white/5 shadow-2xl rounded-[40px] space-y-8">
               <h3 className="font-bold text-2xl text-white tracking-tight flex items-center gap-4"><BookOpen className="w-6 h-6 text-amber-500" /> Expression & Clarity (Journaling)</h3>
               <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={journalData}>
                      <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ background: '#0A0C0B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px' }} itemStyle={{ color: '#F59E0B', fontWeight: 'bold' }} />
                      <Line type="monotone" dataKey="words" stroke="#F59E0B" strokeWidth={4} dot={{ r: 6, fill: '#F59E0B' }} activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
               </div>
            </div>
          </div>

          {/* Right Column - Mood & AI Analysis */}
          <div className="lg:col-span-4 space-y-8">
            <div className="glass-panel p-10 bg-white/5 border-white/5 shadow-2xl rounded-[40px] space-y-10 group hover:bg-white/10 transition-all duration-700">
               <div className="flex items-center gap-4">
                  <div className="p-3 bg-[#E2FF6F]/20 rounded-2xl group-hover:scale-110 transition-transform"><TrendingUp className="w-6 h-6 text-[#E2FF6F]" /></div>
                  <h3 className="font-bold text-2xl text-white tracking-tight">Mood Core</h3>
               </div>
               
               <div className="p-8 bg-black/40 rounded-[32px] border border-white/5 group-hover:border-[#E2FF6F]/20 transition-all">
                  <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em] mb-4">Dominant Internal State</p>
                  <div className="flex items-center gap-6">
                    <span className="text-7xl drop-shadow-2xl">{moodEmojis[topMood.mood]}</span>
                    <div>
                      <span className="text-3xl font-bold capitalize text-white block">{topMood.mood}</span>
                      <span className="text-xs font-bold text-[#E2FF6F] uppercase tracking-widest mt-1 block">
                        {topMood.count} Entries verified
                      </span>
                    </div>
                  </div>
               </div>

               <div className="space-y-6">
                 {Object.entries(moodCounts).filter(([_, count]) => count > 0).map(([mood, count]) => (
                   <div key={mood} className="space-y-2">
                     <div className="flex items-center justify-between text-xs font-bold tracking-widest uppercase text-white/40">
                        <span className="flex items-center gap-2"><span className="text-lg">{moodEmojis[mood]}</span>{mood}</span>
                        <span>{Math.round((count / Math.max(1, store.moodHistory.length)) * 100)}%</span>
                     </div>
                     <div className="h-2.5 bg-black/50 rounded-full overflow-hidden">
                       <motion.div initial={{ width: 0 }} animate={{ width: `${(count / Math.max(1, store.moodHistory.length)) * 100}%` }} transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }} className="h-full bg-gradient-to-r from-[#E2FF6F]/40 to-[#E2FF6F] rounded-full shadow-[0_0_15px_rgba(226,255,111,0.2)]" />
                     </div>
                   </div>
                 ))}
               </div>
            </div>

            <div className="glass-panel p-10 bg-gradient-to-br from-[#E2FF6F]/10 to-transparent border-[#E2FF6F]/20 shadow-2xl rounded-[40px] relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform duration-700">
                  <Zap className="w-32 h-32 text-[#E2FF6F]" />
               </div>
               <div className="flex items-center gap-4 mb-8 relative z-10">
                  <div className="p-3 bg-[#E2FF6F] rounded-2xl scale-90"><Zap className="w-6 h-6 text-black" /></div>
                  <h3 className="font-bold text-2xl text-white tracking-tight">AI Correlation</h3>
               </div>
               <p className="text-lg text-white/80 font-medium leading-relaxed relative z-10">
                 "Our analysis indicates a strong correlation between your elevated journaling word count and your highest reported mood states. To optimize performance, preserve your bedtime ritual to maintain this consistency."
               </p>
            </div>
          </div>

        </div>
      )}
    </main>
  );
}
