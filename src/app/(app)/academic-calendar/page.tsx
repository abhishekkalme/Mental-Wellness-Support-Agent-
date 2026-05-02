"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Plus, 
  Bookmark,
  Bell,
  ArrowRight,
  TrendingDown
} from "lucide-react";

type Event = {
  id: string;
  title: string;
  date: string;
  type: "exam" | "deadline" | "lecture" | "study";
  priority: "high" | "medium" | "low";
  description: string;
};

const events: Event[] = [
  { id: "e1", title: "CS301 Final Exam", date: "2026-05-15", type: "exam", priority: "high", description: "Comprehensive exam covering all modules." },
  { id: "e2", title: "Psychology Essay Draft", date: "2026-05-08", type: "deadline", priority: "medium", description: "Initial 2000-word draft for peer review." },
  { id: "e3", title: "Math Workshop", date: "2026-05-03", type: "study", priority: "low", description: "Group study session in the library." },
  { id: "e4", title: "Biology Lab Report", date: "2026-05-05", type: "deadline", priority: "high", description: "Final submission for Lab 4 results." },
];

export default function AcademicCalendarPage() {
  const [activeFilter, setActiveFilter] = useState("All");

  return (
    <main className="p-8 max-w-7xl mx-auto space-y-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-amber-500 mb-2">
            <Calendar className="w-6 h-6" />
            <span className="text-sm font-bold uppercase tracking-widest">Academic Sync</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Academic Flow</h1>
          <p className="text-muted-foreground text-lg">Stay ahead of deadlines and manage exam stress proactively.</p>
        </div>
        
        <div className="flex gap-4">
           <Button variant="outline" className="gap-2 rounded-xl">
             <Bookmark className="w-4 h-4" /> Import iCal
           </Button>
           <Button className="gap-2 rounded-xl">
             <Plus className="w-4 h-4" /> Add Event
           </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-6">
           <div className="glass-panel p-8 bg-amber-500/5 border-amber-500/20 space-y-6">
              <h3 className="font-bold text-lg flex items-center gap-2 text-amber-500">
                <Bell className="w-5 h-5" /> Stress Alerts
              </h3>
              <div className="space-y-4">
                 <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 space-y-2">
                    <div className="flex items-center gap-2 text-orange-500 font-bold text-[10px] uppercase">
                       <AlertTriangle className="w-3.5 h-3.5" /> High Load Detected
                    </div>
                    <p className="text-xs text-foreground/80 leading-relaxed">
                       You have 3 deadlines and 1 exam in the next 10 days. We've added 2 extra "Focus Meditation" slots to your routine.
                    </p>
                 </div>
                 <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 space-y-2">
                    <div className="flex items-center gap-2 text-primary font-bold text-[10px] uppercase">
                       <CheckCircle2 className="w-3.5 h-3.5" /> Balanced Weekend
                    </div>
                    <p className="text-xs text-foreground/80 leading-relaxed">
                       Your Saturday is clear! Consider a longer "Restorative Sleep" session to recover.
                    </p>
                 </div>
              </div>
           </div>

           <div className="glass-panel p-8 space-y-4">
              <h3 className="font-bold text-lg">Focus Stats</h3>
              <div className="space-y-4">
                 <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Study Hourslogged</span>
                    <span className="font-bold">24.5h</span>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Deadlinesmet</span>
                    <span className="font-bold">12/12</span>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Focus Streak</span>
                    <span className="font-bold">5 Days</span>
                 </div>
              </div>
           </div>
        </div>

        <div className="lg:col-span-3 space-y-8">
           <div className="flex gap-2 overflow-x-auto pb-2">
              {["All", "Exams", "Deadlines", "Study Sessions"].map(f => (
                <button 
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`px-6 py-2 rounded-full text-xs font-bold transition-all border whitespace-nowrap ${
                    activeFilter === f ? "bg-amber-500 text-white border-amber-500" : "glass-panel text-muted-foreground hover:border-amber-500/30"
                  }`}
                >
                  {f}
                </button>
              ))}
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {events.map(event => (
                <div key={event.id} className="glass-panel p-8 space-y-6 group hover:border-amber-500/20 transition-all">
                   <div className="flex justify-between items-start">
                      <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${
                        event.type === "exam" ? "bg-rose-500/10 text-rose-500" :
                        event.type === "deadline" ? "bg-amber-500/10 text-amber-500" :
                        "bg-blue-500/10 text-blue-500"
                      }`}>
                        {event.type}
                      </div>
                      <div className={`w-2 h-2 rounded-full ${
                        event.priority === "high" ? "bg-rose-500 animate-pulse" :
                        event.priority === "medium" ? "bg-amber-500" :
                        "bg-blue-500"
                      }`} />
                   </div>
                   
                   <div className="space-y-2">
                      <h3 className="text-xl font-bold">{event.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{event.description}</p>
                   </div>

                   <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                         <Clock className="w-4 h-4" /> {event.date}
                      </div>
                      <Button variant="ghost" size="sm" className="text-amber-500 group-hover:bg-amber-500 group-hover:text-white rounded-full">
                         View Details <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                   </div>
                </div>
              ))}
           </div>
           
           <div className="glass-panel p-12 text-center border-dashed border-2 bg-secondary/10 border-border/50 space-y-4">
              <TrendingDown className="w-12 h-12 mx-auto text-muted-foreground/30" />
              <p className="text-muted-foreground italic">No more events scheduled for this week. Great job staying on track!</p>
           </div>
        </div>
      </div>
    </main>
  );
}
