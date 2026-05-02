"use client";

import { motion } from "framer-motion";
import { NatureHeader } from "@/components/NatureHeader";
import { MoodCheckIn } from "@/components/MoodCheckIn";
import { RecommendedActivities } from "@/components/RecommendedActivities";
import { AIChatBar } from "@/components/AIChatBar";
import { BreathingWidget } from "@/components/BreathingWidget";
import { QuoteCard } from "@/components/QuoteCard";
import { useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";
import { ShieldAlert, Bell, User, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/store/useStore";
import Link from "next/link";

export default function DashboardPage() {
  const store = useStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const scrollProgress = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <div className="flex h-screen bg-transparent">
      {/* Scroll Progress Bar */}
      <motion.div 
        className="fixed top-0 left-72 right-0 h-1 bg-[#E2FF6F] z-50 origin-left shadow-[0_0_15px_rgba(226,255,111,0.5)]"
        style={{ width: scrollProgress }}
      />

      {/* Main Layout Grid */}
      <div className="flex-1 flex overflow-hidden">
        {/* Center Main Content */}
        <main 
          ref={containerRef}
          className="flex-1 overflow-y-auto no-scrollbar pt-28 pb-32 px-4 md:px-16 relative"
        >
          {/* Top Header Bar */}
          <div className="fixed top-0 left-72 right-0 h-24 flex items-center justify-end px-16 gap-8 z-30 bg-[#0A0C0B]/60 backdrop-blur-xl border-b border-white/5">
            <div className="flex items-center gap-6">
              <Link href="/crisis">
                <Button variant="outline" className="bg-[#E2FF6F]/10 border-[#E2FF6F]/20 text-[#E2FF6F] hover:bg-[#E2FF6F]/20 gap-3 rounded-full h-14 px-8 font-bold tracking-tight transition-all active:scale-95 text-sm uppercase cursor-pointer">
                  <ShieldAlert className="w-5 h-5" />
                  SOS Support
                </Button>
              </Link>
              <div className="relative">
                <button onClick={() => setShowNotifications(!showNotifications)} className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-white/40 hover:text-[#E2FF6F] border border-white/10 hover:border-[#E2FF6F]/30 transition-all shadow-xl cursor-pointer">
                  <Bell className="w-6 h-6" />
                </button>
                {showNotifications && (
                  <div className="absolute top-16 right-0 w-80 bg-[#141716] border border-white/10 rounded-2xl p-4 shadow-2xl z-50">
                    <h3 className="font-bold text-white mb-2">Notifications</h3>
                    <div className="text-white/40 text-sm py-4 text-center">No new notifications</div>
                  </div>
                )}
              </div>
              <Link href="/admin">
                <div className="w-14 h-14 rounded-2xl bg-white/5 overflow-hidden border border-white/10 p-1 cursor-pointer hover:border-[#E2FF6F]/30 transition-all">
                  <div className="w-full h-full bg-[#E2FF6F]/10 rounded-xl flex items-center justify-center text-[#E2FF6F]">
                    <User className="w-7 h-7" />
                  </div>
                </div>
              </Link>
            </div>
          </div>

          <div className="max-w-6xl mx-auto space-y-20">
            <NatureHeader name={store.name || "Alex"} />
            
            {/* Added personalized dashboard message */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="glass-panel p-8 md:p-14 text-center rounded-[40px] bg-gradient-to-br from-[#E2FF6F]/10 to-transparent border border-[#E2FF6F]/20 relative overflow-hidden group shadow-2xl shadow-[#E2FF6F]/5"
            >
               <div className="absolute top-0 right-0 p-8 opacity-5">
                   <Sparkles className="w-40 h-40 text-[#E2FF6F] animate-[spin_10s_linear_infinite]" />
               </div>
               <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-6 relative z-10">
                 Your journey is actively evolving.
               </h2>
               <p className="text-lg md:text-xl text-white/60 font-medium max-w-2xl mx-auto mb-10 leading-relaxed relative z-10">
                 We've successfully unified your entire wellness system. Your rituals, sleep cycles, and internal reflections are securely protected and analyzing in real-time.
               </p>
               <div className="flex justify-center relative z-10">
                 <Link href="/insights">
                    <Button className="bg-[#E2FF6F] hover:bg-[#d4f056] text-black rounded-full h-14 px-8 font-bold text-sm tracking-widest uppercase shadow-xl shadow-[#E2FF6F]/20 transition-all hover:scale-105 gap-3">
                      Explore Deep Insights <ArrowRight className="w-5 h-5" />
                    </Button>
                 </Link>
               </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              <MoodCheckIn />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              <RecommendedActivities />
            </motion.div>

            <AIChatBar />
          </div>
        </main>

        {/* Right Sidebar - Wellness Widgets */}
        <aside className="hidden xl:flex w-[480px] flex-col gap-10 p-10 overflow-y-auto no-scrollbar border-l border-white/5 bg-black/20 backdrop-blur-3xl">
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8, duration: 1 }}
          >
            <BreathingWidget />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1, duration: 1 }}
          >
            <QuoteCard />
          </motion.div>

          {/* Social / Progress Mini View */}
          <div className="glass-panel p-10 bg-white/5 border-white/10 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                 <div className="w-20 h-20 rounded-full border-2 border-[#E2FF6F] animate-ping opacity-20" />
            </div>
            <h4 className="font-bold text-white text-xl mb-8 tracking-tight">Your Resilience Level</h4>
            <div className="h-40 w-full bg-white/5 rounded-[32px] flex items-end justify-between p-8 gap-3 border border-white/5 group-hover:border-[#E2FF6F]/20 transition-all duration-700">
              {[
                // Mental: Mood based
                (store.moodHistory.slice(-5).reduce((acc, m) => acc + (m.mood === 'excellent' ? 100 : m.mood === 'good' ? 80 : 60), 0) / 5) || 20,
                // Emotional: Journaling based
                Math.min(100, store.journalEntries.length * 20) || 20,
                // Physical: Sleep based
                (store.sleepHistory.slice(-1)[0]?.durationHours ? (store.sleepHistory.slice(-1)[0].durationHours / 8) * 100 : 20),
                // Social: Placeholder (could be chat)
                40,
                // Focus: Habits based
                (store.habits.filter(h => h.completedDates.includes(new Date().toISOString().split('T')[0])).length / (store.habits.length || 1)) * 100 || 20,
                // Breath: Breathing based
                Math.min(100, (store.breathingHistory.slice(-1)[0]?.durationSeconds || 0) / 6),
                // Overall
                75
              ].map((h, i) => (
                <motion.div 
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(10, Math.min(100, h))}%` }}
                  transition={{ delay: 1.2 + i * 0.1, duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                  className="w-full bg-gradient-to-t from-[#E2FF6F]/40 to-[#E2FF6F] rounded-t-xl shadow-[0_0_20px_rgba(226,255,111,0.1)] group-hover:shadow-[0_0_30px_rgba(226,255,111,0.3)] transition-all"
                />
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
