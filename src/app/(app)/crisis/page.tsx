"use client";

import { motion } from "framer-motion";
import { 
  ShieldAlert, 
  PhoneCall, 
  Wind, 
  Brain, 
  Headphones, 
  ChevronRight,
  ArrowLeft,
  Heart
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function CrisisPage() {
  const [playingId, setPlayingId] = useState<number | null>(null);
  const helplines = [
    { country: "Global", name: "Befrienders Worldwide", link: "https://www.befrienders.org/" },
    { country: "USA", name: "988 Suicide & Crisis Lifeline", phone: "988" },
    { country: "UK", name: "Samaritans", phone: "116 123" },
    { country: "India", name: "Vandrevala Foundation", phone: "9999 666 555" },
  ];

  return (
    <main className="p-8 max-w-5xl mx-auto space-y-12">
      <header className="flex items-center gap-6">
        <Link href="/dashboard">
          <Button variant="outline" size="icon" className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
           <div className="flex items-center gap-2 text-rose-500 mb-2">
              <ShieldAlert className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-widest">Emergency Resources</span>
           </div>
           <h1 className="text-4xl font-bold tracking-tight">You are not alone.</h1>
           <p className="text-muted-foreground mt-1 text-lg">Immediate support for when things feel heavy.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
           <section className="glass-panel p-8 bg-rose-500/5 border-rose-500/20 space-y-6">
              <div className="flex items-center gap-3 text-rose-600">
                 <PhoneCall className="w-6 h-6" />
                 <h2 className="text-2xl font-bold">Crisis Helplines</h2>
              </div>
              <div className="space-y-4">
                 {helplines.map((h, i) => (
                   <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white border border-rose-100 shadow-sm">
                      <div>
                        <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest">{h.country}</p>
                        <h4 className="font-bold">{h.name}</h4>
                      </div>
                      {h.phone ? (
                        <a href={`tel:${h.phone}`} className="h-10 px-4 flex items-center bg-rose-500 text-white rounded-xl font-bold text-sm hover:bg-rose-600 transition-colors">
                          Call {h.phone}
                        </a>
                      ) : (
                        <a href={h.link} target="_blank" className="h-10 px-4 flex items-center border border-rose-500 text-rose-500 rounded-xl font-bold text-sm hover:bg-rose-50 transition-colors">
                          Visit Site
                        </a>
                      )}
                   </div>
                 ))}
              </div>
              <p className="text-xs text-muted-foreground text-center">
                 If you are in immediate physical danger, please call your local emergency services (e.g., 911, 999).
              </p>
           </section>

           <section className="glass-panel p-8 space-y-6">
              <div className="flex items-center gap-3 text-emerald-600">
                 <Wind className="w-6 h-6" />
                 <h2 className="text-2xl font-bold">Quick Grounding</h2>
              </div>
              <p className="text-muted-foreground italic">"I am breathing in, I am breathing out. I am safe in this moment."</p>
              <div className="space-y-4">
                 {[
                   { name: "5-4-3-2-1 Rule", sub: "Name 5 things you see, 4 you can touch..." },
                   { name: "The Butterfly Hug", sub: "Cross your arms and tap your shoulders rhythmically." },
                   { name: "Cold Water", sub: "Splash your face or hold an ice cube." },
                 ].map((t, i) => (
                   <div key={i} className="flex gap-4 p-4 rounded-xl hover:bg-secondary/50 transition-colors border border-transparent hover:border-border">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 font-bold">{i+1}</div>
                      <div>
                        <h4 className="font-bold text-sm">{t.name}</h4>
                        <p className="text-xs text-muted-foreground">{t.sub}</p>
                      </div>
                   </div>
                 ))}
              </div>
           </section>
        </div>

        <div className="space-y-8">
           <div className="glass-panel p-8 space-y-8 bg-primary/5 border-primary/20">
              <div className="flex items-center gap-3 text-primary">
                 <Brain className="w-6 h-6" />
                 <h2 className="text-2xl font-bold">Emotional Anchor</h2>
              </div>
              <div className="space-y-6">
                 <p className="text-sm text-muted-foreground leading-relaxed">
                   Imagine a place where you feel completely safe. It can be a forest, a beach, or a room. Visualize the colors, the smells, and the temperature.
                 </p>
                 <div className="aspect-video glass-panel bg-primary/10 flex items-center justify-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent animate-pulse" />
                    <Heart className="w-16 h-16 text-primary group-hover:scale-110 transition-transform" />
                 </div>
              </div>
           </div>

           <div className="glass-panel p-8 space-y-6">
              <div className="flex items-center gap-3 text-indigo-600">
                 <Headphones className="w-6 h-6" />
                 <h2 className="text-2xl font-bold">Calming Tones</h2>
              </div>
              <div className="grid gap-3">
                 {[
                   "White Noise Stream",
                   "Soft Rain Backdrop",
                   "Guided Reassurance"
                 ].map((track, i) => (
                   <button 
                     key={i} 
                     onClick={() => setPlayingId(playingId === i ? null : i)}
                     className={`w-full p-4 flex items-center justify-between rounded-2xl border transition-all text-left ${playingId === i ? "bg-indigo-100 border-indigo-200 text-indigo-900" : "bg-secondary/20 hover:bg-indigo-50 border-transparent hover:border-indigo-100"}`}
                   >
                      <span className="font-medium text-sm">{playingId === i ? `Playing ${track}...` : track}</span>
                      {playingId === i ? <Headphones className="w-4 h-4 text-indigo-600 animate-pulse" /> : <ChevronRight className="w-4 h-4 text-indigo-400" />}
                   </button>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </main>
  );
}
