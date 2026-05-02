"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Bell, X, Info, AlertCircle, CheckCircle2, Sparkles } from "lucide-react";

export type Notification = {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "alert";
  timestamp: Date;
};

export function NotificationBanner() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Simulate smart notifications logic
  useEffect(() => {
    const demos: Notification[] = [
      { id: "1", title: "Daily Habit", message: "Time for your morning meditation streak!", type: "info", timestamp: new Date() },
      { id: "2", title: "Mood Check-in", message: "You haven't logged your mood in 3 hours. How are you feeling?", type: "warning", timestamp: new Date() },
      { id: "3", title: "Achievement Unlocked", message: "Congrats! You've reached a 3-day breathing streak.", type: "success", timestamp: new Date() },
    ];

    let i = 0;
    const interval = setInterval(() => {
      if (i < demos.length) {
        setNotifications(prev => [demos[i], ...prev].slice(0, 3));
        i++;
      }
    }, 15000); // Send notification every 15 seconds for demo

    return () => clearInterval(interval);
  }, []);

  const removeNote = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-8 right-8 z-[100] w-full max-w-sm flex flex-col gap-3 pointer-events-none">
       <AnimatePresence>
          {notifications.map(note => (
            <motion.div
              key={note.id}
              layout
              initial={{ opacity: 0, x: 20, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, x: 20 }}
              className="pointer-events-auto"
            >
               <div className="glass-panel p-5 bg-background shadow-2xl relative border-primary/20 group">
                  <button 
                    onClick={() => removeNote(note.id)}
                    className="absolute top-2 right-2 p-1 text-muted-foreground/30 hover:text-muted-foreground transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  
                  <div className="flex gap-4">
                    <div className={`p-3 rounded-full h-fit flex items-center justify-center ${
                      note.type === "success" ? "bg-emerald-500/10 text-emerald-500" :
                      note.type === "warning" ? "bg-amber-500/10 text-amber-500" :
                      note.type === "alert" ? "bg-rose-500/10 text-rose-500" :
                      "bg-blue-500/10 text-blue-500"
                    }`}>
                      {note.type === "success" ? <CheckCircle2 className="w-5 h-5" /> :
                       note.type === "warning" ? <AlertCircle className="w-5 h-5" /> :
                       note.type === "alert" ? <Sparkles className="w-5 h-5" /> :
                       <Bell className="w-5 h-5" />}
                    </div>
                    
                    <div className="space-y-1">
                       <h4 className="font-bold text-sm">{note.title}</h4>
                       <p className="text-xs text-muted-foreground leading-relaxed">{note.message}</p>
                    </div>
                  </div>
               </div>
            </motion.div>
          ))}
       </AnimatePresence>
    </div>
  );
}
