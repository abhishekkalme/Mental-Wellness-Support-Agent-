"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useStore } from "@/store/useStore";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Plus, 
  Flame, 
  CheckCircle2, 
  Circle, 
  ChevronLeft, 
  ChevronRight,
  TrendingUp,
  Award
} from "lucide-react";
import { format, startOfWeek, addDays, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";

export default function HabitsPage() {
  const store = useStore();
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newFreq, setNewFreq] = useState<"daily" | "weekly">("daily");

  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));

  const handleAdd = () => {
    if (!newName.trim()) return;
    store.addHabit({
      id: Date.now().toString(),
      name: newName,
      frequency: newFreq,
      streak: 0,
      completedDates: []
    });
    setNewName("");
    setShowAdd(false);
  };

  return (
    <main className="p-12 max-w-7xl mx-auto space-y-16">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-10">
        <div className="space-y-4">
          <div className="flex items-center gap-4 text-[#E2FF6F] mb-2">
            <Calendar className="w-7 h-7" />
            <span className="text-xs font-bold uppercase tracking-[0.3em]">Foundation & Routine</span>
          </div>
          <h1 className="text-5xl font-bold tracking-tighter text-white">Habit Architecture</h1>
          <p className="text-white/40 text-xl font-medium italic tracking-wide">"We are what we repeatedly do. Excellence, then, is not an act, but a habit."</p>
        </div>
        
        <Button onClick={() => setShowAdd(true)} className="gap-3 rounded-[24px] h-16 px-10 bg-[#E2FF6F] hover:bg-[#d4f056] text-black font-bold text-lg shadow-xl shadow-[#E2FF6F]/10 transition-all active:scale-95">
          <Plus className="w-6 h-6" /> Create Ritual
        </Button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        <div className="lg:col-span-3 space-y-10">
          <div className="glass-panel p-10 overflow-x-auto bg-white/5 border-white/5 shadow-2xl relative">
            <div className="absolute top-0 right-0 p-8 opacity-5">
                 <div className="w-32 h-32 rounded-full border-4 border-[#E2FF6F] animate-pulse" />
            </div>
            
            <div className="flex items-center justify-between mb-12 relative z-10">
               <h3 className="font-bold text-2xl text-white tracking-tight">Active Momentum</h3>
               <div className="flex items-center gap-3 text-[10px] text-[#E2FF6F] uppercase tracking-[0.2em] font-bold bg-[#E2FF6F]/10 px-4 py-2 rounded-full border border-[#E2FF6F]/20">
                 <Calendar className="w-4 h-4" /> {format(weekStart, "MMM d")} - {format(addDays(weekStart, 6), "MMM d, yyyy")}
               </div>
            </div>

            <div className="min-w-max relative z-10">
              <div className="grid grid-cols-[240px_repeat(7,1fr)] gap-6 mb-8 border-b border-white/5 pb-8">
                 <div />
                 {weekDays.map(day => (
                   <div key={day.toString()} className="text-center space-y-3">
                      <p className="text-[10px] font-bold uppercase text-white/30 tracking-[0.2em]">{format(day, "EEE")}</p>
                      <p className={`text-sm font-bold w-12 h-12 flex items-center justify-center mx-auto rounded-2xl transition-all duration-500 ${isSameDay(day, today) ? "bg-[#E2FF6F] text-black shadow-lg shadow-[#E2FF6F]/20" : "text-white/40 bg-white/5 hover:bg-white/10"}`}>
                        {format(day, "d")}
                      </p>
                   </div>
                 ))}
              </div>

              <div className="space-y-6">
                {store.habits.length === 0 ? (
                  <div className="text-center py-20 text-white/20 italic border-2 border-dashed border-white/5 rounded-[40px] bg-white/[0.02]">
                    Your ritual space is empty. Add a habit to begin your journey.
                  </div>
                ) : (
                  store.habits.map(habit => (
                    <div key={habit.id} className="grid grid-cols-[240px_repeat(7,1fr)] gap-6 items-center group">
                      <div className="font-bold text-lg truncate pr-6 text-white/60 group-hover:text-[#E2FF6F] transition-all duration-500 flex items-center gap-3">
                         <div className="w-2 h-2 rounded-full bg-[#E2FF6F]/40 group-hover:bg-[#E2FF6F] transition-all" />
                         {habit.name}
                      </div>
                      {weekDays.map(day => {
                        const dateStr = format(day, "yyyy-MM-dd");
                        const isCompleted = habit.completedDates.includes(dateStr);
                        return (
                          <button
                            key={dateStr}
                            onClick={() => store.toggleHabit(habit.id, dateStr)}
                            className={`flex justify-center transition-all p-3 rounded-2xl relative overflow-hidden group/btn ${isCompleted ? "text-[#E2FF6F]" : "text-white/10 hover:text-white/30 hover:bg-white/5"}`}
                          >
                            {isCompleted ? (
                                <motion.div 
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="filter drop-shadow-[0_0_8px_rgba(226,255,111,0.5)]"
                                >
                                    <CheckCircle2 className="w-10 h-10" />
                                </motion.div>
                            ) : (
                                <Circle className="w-10 h-10 group-hover/btn:scale-110 transition-transform" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="glass-panel p-10 bg-[#E2FF6F]/5 border-[#E2FF6F]/10 space-y-8 relative overflow-hidden group">
               <div className="absolute inset-0 bg-gradient-to-t from-[#E2FF6F]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
               <div className="flex items-center justify-between relative z-10">
                 <h3 className="font-bold text-2xl text-white tracking-tight">Ritual Velocity</h3>
                 <TrendingUp className="w-7 h-7 text-[#E2FF6F]" />
               </div>
               <div className="space-y-4 relative z-10">
                 <div className="flex justify-between text-[10px] font-bold text-[#E2FF6F] uppercase tracking-[0.2em]">
                   <span>Success Quotient</span>
                   <span>82%</span>
                 </div>
                 <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden border border-white/5 p-[2px]">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: "82%" }}
                        transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                        className="h-full bg-gradient-to-r from-[#E2FF6F]/40 to-[#E2FF6F] rounded-full shadow-[0_0_15px_rgba(226,255,111,0.2)]" 
                    />
                 </div>
                 <p className="text-sm text-white/40 font-medium">Your consistency has increased by 18% this month. Elite performance detected.</p>
               </div>
            </div>

            <div className="glass-panel p-10 bg-white/5 border-white/5 space-y-8 shadow-2xl">
               <h3 className="font-bold text-2xl text-white tracking-tight flex items-center gap-3">
                  <Flame className="w-7 h-7 text-orange-500" /> Power Streaks
               </h3>
               <div className="space-y-6">
                  {store.habits.slice(0, 3).map(h => (
                    <div key={h.id} className="flex items-center justify-between p-4 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-orange-500/30 transition-all group">
                       <span className="text-white/60 font-medium group-hover:text-white transition-colors">{h.name}</span>
                       <div className="flex items-center gap-2 text-orange-400 font-bold text-sm bg-orange-500/10 px-4 py-1.5 rounded-full border border-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.1)]">
                          <Flame className="w-4.5 h-4.5" /> {h.streak} Days
                       </div>
                    </div>
                  ))}
                  {store.habits.length === 0 && <p className="text-sm text-white/20 italic text-center py-4">Cultivate rituals to ignite your first streak.</p>}
               </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="glass-panel p-10 bg-white/5 border-white/5 space-y-10 shadow-2xl relative overflow-hidden">
             <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-500/5 blur-3xl rounded-full" />
             <h3 className="font-bold text-2xl text-white tracking-tight flex items-center gap-4 relative z-10">
               <Award className="w-8 h-8 text-amber-500" /> Pantheon
             </h3>
             <div className="space-y-6 relative z-10">
                {[
                  { name: "Early Bird", sub: "10 rituals completed", icon: "🌅", locked: false },
                  { name: "Centurion", sub: "100 ritual logs", icon: "🏺", locked: true },
                  { name: "Fire Starter", sub: "7-day streak reached", icon: "🌋", locked: false },
                ].map((m, i) => (
                  <div key={i} className={`p-6 rounded-[32px] border flex items-center gap-5 transition-all duration-500 ${m.locked ? "opacity-30 grayscale bg-white/5 border-transparent" : "bg-white/5 border-amber-500/20 hover:bg-white/10 hover:border-amber-500/40"}`}>
                    <div className="w-16 h-16 rounded-[24px] bg-white/5 flex items-center justify-center text-3xl shadow-inner shadow-white/5">{m.icon}</div>
                    <div className="space-y-1">
                      <p className="text-lg font-bold text-white">{m.name}</p>
                      <p className="text-[10px] text-[#E2FF6F] uppercase font-bold tracking-widest opacity-60">{m.sub}</p>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showAdd && (
          <div className="fixed inset-0 bg-[#0A0C0B]/90 backdrop-blur-2xl z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass-panel p-12 w-full max-w-xl space-y-10 shadow-[0_0_100px_rgba(226,255,111,0.05)] relative overflow-hidden bg-black/40 border-white/10"
            >
              <div className="absolute top-0 right-0 p-8 opacity-5">
                   <Plus className="w-40 h-40 text-[#E2FF6F]" />
              </div>

              <div className="space-y-3 relative z-10">
                <h3 className="text-4xl font-bold tracking-tighter text-white">Initialize New Ritual</h3>
                <p className="text-white/40 font-medium italic">Define the foundation of your daily consciousness.</p>
              </div>

              <div className="space-y-8 relative z-10">
                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-[#E2FF6F] uppercase tracking-[0.3em]">Ritual Designation</label>
                  <input 
                    autoFocus
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    placeholder="e.g. Morning Meditation"
                    className="w-full h-16 rounded-[24px] bg-white/5 border border-white/5 px-8 text-xl font-bold text-white outline-none focus:ring-2 focus:ring-[#E2FF6F]/30 focus:border-[#E2FF6F]/20 transition-all placeholder:text-white/10"
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-[#E2FF6F] uppercase tracking-[0.3em]">Temporal Frequency</label>
                  <div className="grid grid-cols-2 gap-4">
                    {["daily", "weekly"].map(f => (
                      <button
                        key={f}
                        onClick={() => setNewFreq(f as any)}
                        className={`h-14 rounded-[20px] text-sm font-bold uppercase tracking-widest border transition-all duration-500 ${newFreq === f ? "bg-[#E2FF6F] text-black border-[#E2FF6F] shadow-lg shadow-[#E2FF6F]/20" : "bg-white/5 text-white/30 border-white/5 hover:bg-white/10"}`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-4 pt-6 relative z-10">
                <Button variant="ghost" className="flex-1 h-16 rounded-[24px] text-white/40 font-bold tracking-widest uppercase hover:bg-white/5 hover:text-white" onClick={() => setShowAdd(false)}>Cancel</Button>
                <Button className="flex-1 h-16 rounded-[24px] bg-[#E2FF6F] hover:bg-[#d4f056] text-black font-bold tracking-widest uppercase shadow-xl shadow-[#E2FF6F]/10 active:scale-95 transition-all" onClick={handleAdd}>Confirm Ritual</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
