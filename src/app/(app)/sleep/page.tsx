"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/store/useStore";
import { 
  Moon, 
  Music, 
  Play, 
  Headphones, 
  Eye, 
  Star,
  Clock,
  ExternalLink,
  ChevronRight
} from "lucide-react";

const stories = [
  { id: "s1", title: "The Whispering Pines", duration: "25 min", narrator: "Elena S.", category: "Nature Story", img: "🌲" },
  { id: "s2", title: "Midnight Train to Nowhere", duration: "32 min", narrator: "Marcus K.", category: "Rhythm Story", img: "🚂" },
  { id: "s3", title: "Underwater Sanctuary", duration: "18 min", narrator: "Sarah J.", category: "Guided Sleep", img: "🌊" },
];

const sleepMusic = [
  { id: "m1", title: "Deep Delta Theta", category: "Binaural Beats", bpm: "60" },
  { id: "m2", title: "Soft Piano & Rain", category: "Lofi Ambient", bpm: "55" },
];

export default function SleepPage() {
  const [activeTab, setActiveTab] = useState<"stories" | "music" | "tracking">("stories");
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [sleepLogged, setSleepLogged] = useState(false);
  const store = useStore();

  return (
    <main className="p-8 max-w-6xl mx-auto space-y-10">
      <header className="space-y-3">
        <div className="flex items-center gap-3 text-indigo-400 mb-2">
          <Moon className="w-6 h-6" />
          <span className="text-sm font-bold uppercase tracking-widest">Sleep Wellness</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight">Rest & Recovery</h1>
        <p className="text-muted-foreground text-lg">Improve your sleep quality with curated audio and habit tracking.</p>
      </header>

      <div className="flex gap-2 p-1 bg-secondary/50 rounded-2xl w-fit">
        {["stories", "music", "tracking"].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-6 py-2 rounded-xl text-sm font-bold capitalize transition-all ${
              activeTab === tab ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
           {activeTab === "stories" && (
             <div className="space-y-4">
                <h3 className="font-bold text-xl flex items-center gap-2">
                  <Headphones className="w-5 h-5 text-indigo-400" /> Bedtime Stories
                </h3>
                <div className="grid gap-4">
                  {stories.map(s => (
                    <div key={s.id} className="glass-panel p-6 flex items-center justify-between group hover:border-indigo-400/50 transition-all cursor-pointer">
                      <div className="flex items-center gap-6">
                        <div className="text-4xl w-16 h-16 glass-panel flex items-center justify-center bg-indigo-400/5">{s.img}</div>
                        <div>
                          <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">{s.category}</p>
                          <h4 className="font-bold text-lg">{s.title}</h4>
                          <p className="text-xs text-muted-foreground">Narrated by {s.narrator}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                         <span className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                           <Clock className="w-3 h-3" /> {s.duration}
                         </span>
                         <Button 
                           size="icon" 
                           variant="outline" 
                           onClick={() => setPlayingId(playingId === s.id ? null : s.id)}
                           className={`rounded-full transition-all ${playingId === s.id ? "bg-indigo-400 text-white" : "group-hover:bg-indigo-400 group-hover:text-white"}`}
                         >
                           {playingId === s.id ? <Moon className="w-4 h-4 animate-pulse" /> : <Play className="w-4 h-4 ml-0.5" />}
                         </Button>
                      </div>
                    </div>
                  ))}
                </div>
             </div>
           )}

           {activeTab === "music" && (
             <div className="space-y-4">
                <h3 className="font-bold text-xl flex items-center gap-2">
                  <Music className="w-5 h-5 text-indigo-400" /> Focus & sleep Music
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {sleepMusic.map(m => (
                     <div key={m.id} className="glass-panel p-8 text-center space-y-4 group hover:border-indigo-400/50 transition-all cursor-pointer">
                        <div className="w-16 h-16 rounded-full bg-indigo-400/10 flex items-center justify-center text-indigo-400 mx-auto group-hover:scale-110 transition-transform">
                          <Music className="w-8 h-8" />
                        </div>
                        <div>
                          <h4 className="font-bold text-lg">{m.title}</h4>
                          <p className="text-xs text-muted-foreground">{m.category}</p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                          onClick={() => setPlayingId(playingId === m.id ? null : m.id)}
                        >
                          {playingId === m.id ? "Playing..." : "Play Track"}
                        </Button>
                     </div>
                   ))}
                </div>
             </div>
           )}

           {activeTab === "tracking" && (
             <div className="glass-panel p-12 text-center space-y-6">
                <div className="w-20 h-20 rounded-full bg-indigo-400/10 flex items-center justify-center text-indigo-400 mx-auto">
                  <Star className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold">Sleep Quality Tracking</h3>
                <p className="text-muted-foreground max-w-sm mx-auto">Track your sleep cycles and wake up feeling refreshed. Connect your smart device or log manually.</p>
                <div className="flex justify-center gap-4">
                  <Button 
                    onClick={() => {
                      store.addSleepEntry({
                        id: Date.now().toString(),
                        date: new Date().toISOString(),
                        quality: 4,
                        durationHours: 7.5
                      });
                      setSleepLogged(true);
                      setTimeout(() => setSleepLogged(false), 2000);
                    }}
                    disabled={sleepLogged}
                    className="bg-indigo-500 hover:bg-indigo-600 text-white"
                  >
                    {sleepLogged ? "Saved!" : "Log Last Night"}
                  </Button>
                  <Button variant="outline">Connect Device</Button>
                </div>
             </div>
           )}
        </div>

        <div className="space-y-6">
           <div className="glass-panel p-8 bg-indigo-400/5 border-indigo-400/20 space-y-6">
              <h3 className="font-bold text-lg">Sleep Hygiene Tips</h3>
              <div className="space-y-4">
                {[
                  "Keep your room temperature at 18°C",
                  "No screens 60 mins before bed",
                  "Consistent wake-up times",
                  "Read a physical book instead",
                ].map((tip, i) => (
                  <div key={i} className="flex gap-3 text-sm">
                    <div className="w-5 h-5 rounded-full bg-indigo-400/10 text-indigo-400 flex items-center justify-center text-[10px] font-bold shrink-0">{i+1}</div>
                    <p className="text-foreground/80">{tip}</p>
                  </div>
                ))}
              </div>
           </div>

           <div className="glass-panel p-8 space-y-4">
              <h3 className="font-bold text-lg">Bedtime Reminder</h3>
              <p className="text-xs text-muted-foreground">Get a nudge when it's time to wind down.</p>
              <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/50">
                 <span className="font-bold">10:30 PM</span>
                 <Button variant="ghost" size="sm" className="text-indigo-400 h-8">Change</Button>
              </div>
           </div>
        </div>
      </div>
    </main>
  );
}
