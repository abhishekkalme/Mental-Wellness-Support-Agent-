"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
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
  ChevronRight,
  Database,
  Loader2,
  Plus,
  Calendar,
  Zap,
  Activity,
  Award
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  LineChart,
  Line,
  PieChart,
  Pie
} from "recharts";

// Mock data for charts
const sleepTrendData = [
  { day: "Mon", hours: 5.2 },
  { day: "Tue", hours: 8.1 },
  { day: "Wed", hours: 9.8, active: true },
  { day: "Thu", hours: 6.4 },
  { day: "Fri", hours: 7.8 },
  { day: "Sat", hours: 8.9 },
  { day: "Sun", hours: 4.8 },
];

const sleepAtTimeData = [
  { time: "22:00", value: 40 },
  { time: "00:00", value: 45 },
  { time: "02:00", value: 38 },
  { time: "04:00", value: 52 },
  { time: "06:00", value: 35 },
  { time: "08:00", value: 38 },
  { time: "10:00", value: 42 },
];

const wellbeingScoreData = [
  { name: "Physical", value: 10, color: "#10b981" },
  { name: "Emotional", value: 10, color: "#f43f5e" },
  { name: "Mental", value: 10, color: "#8b5cf6" },
  { name: "Sleep", value: 20, color: "#3b82f6" },
  { name: "Spiritual", value: 10, color: "#f59e0b" },
  { name: "Social", value: 10, color: "#10b981" },
];

interface Story {
  _id?: string;
  title: string;
  duration: string;
  narrator: string;
  category: string;
  img: string;
}

interface SleepMusicTrack {
  _id?: string;
  title: string;
  category: string;
  bpm: string;
}

interface WellbeingItem {
  _id?: string;
  title: string;
  description: string;
  category: string;
  iconName?: string;
}

const seedStories = [
  { title: "The Whispering Pines", duration: "25 min", narrator: "Elena S.", category: "Nature Story", img: "🌲" },
  { title: "Midnight Train to Nowhere", duration: "32 min", narrator: "Marcus K.", category: "Rhythm Story", img: "🚂" },
  { title: "Underwater Sanctuary", duration: "18 min", narrator: "Sarah J.", category: "Guided Sleep", img: "🌊" },
  { title: "Cabin in the Snow", duration: "45 min", narrator: "Arthur B.", category: "Cozy Story", img: "❄️" },
  { title: "Journey Through the Cosmos", duration: "60 min", narrator: "Elena S.", category: "Space Journey", img: "🌌" },
];

const seedMusic = [
  { title: "Deep Delta Theta", category: "Binaural Beats", bpm: "60" },
  { title: "Soft Piano & Rain", category: "Lofi Ambient", bpm: "55" },
  { title: "Himalayan Singing Bowls", category: "Sound Bath", bpm: "50" },
  { title: "Forest Night Serenade", category: "Nature Sounds", bpm: "65" },
  { title: "Celestial Harmonics", category: "Ethereal Drone", bpm: "40" },
  { title: "Ocean Waves & Flute", category: "Relaxation", bpm: "58" },
];

const seedWellbeing = [
  { title: "Wind Down Routine", description: "Schedule your device to automatically switch to grayscale and turn on 'Do Not Disturb' 1 hour before bed.", category: "Routine", iconName: "Moon" },
  { title: "Blue Light Filter", description: "Activate Night Shift or Eye Comfort Shield on your devices from sunset to sunrise to protect melatonin production.", category: "Filter", iconName: "Eye" },
];

export default function SleepPage() {
  const [activeTab, setActiveTab] = useState<"stories" | "music" | "tracking" | "wellbeing">("stories");
  const [stories, setStories] = useState<Story[]>([]);
  const [music, setMusic] = useState<SleepMusicTrack[]>([]);
  const [wellbeing, setWellbeing] = useState<WellbeingItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [sleepLogged, setSleepLogged] = useState(false);
  const store = useStore();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [storiesRes, musicRes, wellbeingRes] = await Promise.all([
        fetch('/api/sleep/stories'),
        fetch('/api/sleep/music'),
        fetch('/api/sleep/wellbeing')
      ]);
      const storiesData = await storiesRes.json();
      const musicData = await musicRes.json();
      const wellbeingData = await wellbeingRes.json();
      setStories(storiesData);
      setMusic(musicData);
      setWellbeing(wellbeingData);
    } catch (error) {
      console.error("Failed to fetch sleep data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetch('/api/sleep/stories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(seedStories)
        }),
        fetch('/api/sleep/music', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(seedMusic)
        }),
        fetch('/api/sleep/wellbeing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(seedWellbeing)
        })
      ]);
      await fetchData();
    } catch (error) {
      console.error("Failed to seed sleep data", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
        <p className="text-muted-foreground animate-pulse font-medium">Preparing your sanctuary...</p>
      </div>
    );
  }

  if (stories.length === 0 && music.length === 0 && wellbeing.length === 0) {
    return (
      <main className="p-8 max-w-6xl mx-auto min-h-[70vh] flex items-center justify-center">
        <div className="glass-panel p-12 text-center flex flex-col items-center gap-6 max-w-md bg-secondary/10 border-indigo-400/20">
          <div className="w-20 h-20 rounded-full bg-indigo-400/10 flex items-center justify-center">
            <Database className="w-10 h-10 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-3xl font-bold mb-3">Sleep Library Not Found</h2>
            <p className="text-muted-foreground">The sleep library is currently empty in our database. Click "Create" to initialize stories, music, and wellbeing guides.</p>
          </div>
          <Button onClick={handleCreateInitialData} size="lg" className="rounded-xl px-12 h-14 text-lg font-bold shadow-lg shadow-indigo-400/20 bg-indigo-500 hover:bg-sky-600">
            <Plus className="w-5 h-5 mr-2" /> Create Sleep Library
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="p-8 max-w-6xl mx-auto space-y-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-indigo-400 mb-2">
            <Moon className="w-6 h-6" />
            <span className="text-sm font-bold uppercase tracking-widest">Sleep Wellness</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Rest & Recovery</h1>
          <p className="text-muted-foreground text-lg">Improve your sleep quality with curated audio and habit tracking.</p>
        </div>
        
        <div className="flex gap-2 p-1 bg-secondary/50 rounded-2xl w-fit">
          {["stories", "music", "tracking", "wellbeing"].map(tab => (
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
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
           {activeTab === "stories" && (
             <div className="space-y-4">
                <h3 className="font-bold text-xl flex items-center gap-2">
                  <Headphones className="w-5 h-5 text-indigo-400" /> Bedtime Stories
                </h3>
                <div className="grid gap-4">
                  {stories.map(s => (
                    <div key={s._id} className="glass-panel p-6 flex items-center justify-between group hover:border-indigo-400/50 transition-all cursor-pointer">
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
                           onClick={() => setPlayingId(playingId === s._id ? null : s._id!)}
                           className={`rounded-full transition-all ${playingId === s._id ? "bg-indigo-400 text-white" : "group-hover:bg-indigo-400 group-hover:text-white"}`}
                         >
                           {playingId === s._id ? <Moon className="w-4 h-4 animate-pulse" /> : <Play className="w-4 h-4 ml-0.5" />}
                         </Button>
                      </div>
                    </div>
                  ))}
                  {stories.length === 0 && <p className="text-muted-foreground text-center py-8">No stories found in the library.</p>}
                </div>
             </div>
           )}

           {activeTab === "music" && (
             <div className="space-y-4">
                <h3 className="font-bold text-xl flex items-center gap-2">
                  <Music className="w-5 h-5 text-indigo-400" /> Focus & sleep Music
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {music.map(m => (
                     <div key={m._id} className="glass-panel p-8 text-center space-y-4 group hover:border-indigo-400/50 transition-all cursor-pointer">
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
                          onClick={() => setPlayingId(playingId === m._id ? null : m._id!)}
                        >
                          {playingId === m._id ? "Playing..." : "Play Track"}
                        </Button>
                     </div>
                   ))}
                   {music.length === 0 && <p className="text-muted-foreground text-center col-span-2 py-8">No music tracks found in the library.</p>}
                </div>
             </div>
           )}

           {activeTab === "tracking" && (
             <div className="space-y-8">
                {/* Sleep Trends Section */}
                <div className="glass-panel p-8 space-y-8 bg-[#0b1120] text-white border-white/5">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <h3 className="text-xl font-bold tracking-tight">Sleep Trends</h3>
                      </div>
                      <div className="flex items-center gap-6 text-sm font-medium text-white/60">
                         <button className="pb-1 border-b-2 border-white text-white">Week</button>
                         <button className="hover:text-white transition-colors">Month</button>
                         <Calendar className="w-5 h-5 ml-4 cursor-pointer hover:text-white" />
                      </div>
                   </div>

                   <div className="h-[250px] w-full mt-4">
                      <ResponsiveContainer width="100%" height="100%">
                         <BarChart data={sleepTrendData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                            <XAxis 
                              dataKey="day" 
                              axisLine={false} 
                              tickLine={false} 
                              tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} 
                              dy={10}
                            />
                            <YAxis 
                              axisLine={false} 
                              tickLine={false} 
                              tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                              tickFormatter={(val) => `${val}h`}
                            />
                            <Tooltip 
                               cursor={{ fill: 'rgba(255,255,255,0.05)' }} 
                               contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '12px', fontSize: '12px' }}
                               itemStyle={{ color: '#fff' }}
                            />
                            <Bar dataKey="hours" radius={[8, 8, 8, 8]} barSize={28}>
                               {sleepTrendData.map((entry, index) => (
                                 <Cell key={`cell-${index}`} fill={entry.active ? '#9333ea' : '#3b82f6'} fillOpacity={0.8} />
                               ))}
                            </Bar>
                         </BarChart>
                      </ResponsiveContainer>
                   </div>
                   
                   <div className="space-y-4 pt-4">
                      <h4 className="text-sm font-bold text-white/60 uppercase tracking-widest">Sleep at Time</h4>
                      <div className="h-[150px] w-full">
                         <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={sleepAtTimeData}>
                               <Line 
                                 type="monotone" 
                                 dataKey="value" 
                                 stroke="#22d3ee" 
                                 strokeWidth={3} 
                                 dot={{ fill: '#22d3ee', r: 4, strokeWidth: 0 }}
                                 activeDot={{ r: 6, strokeWidth: 0 }}
                               />
                               <Tooltip 
                                 contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '12px', fontSize: '12px' }}
                                 itemStyle={{ color: '#fff' }}
                               />
                            </LineChart>
                         </ResponsiveContainer>
                      </div>
                   </div>
                </div>

                {/* Wellbeing Assessment Section */}
                <div className="glass-panel p-8 bg-white border-border shadow-2xl relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                      <Award className="w-32 h-32 text-primary rotate-12" />
                   </div>
                   
                   <div className="text-center space-y-2 mb-8 mt-4">
                      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Wellbeing Assessment</p>
                      <h3 className="text-3xl font-bold text-slate-800 tracking-tight">Great Job! Here's Your<br/>Wellbeing Score</h3>
                   </div>

                   <div className="relative h-[300px] flex items-center justify-center">
                      <div className="absolute flex flex-col items-center">
                         <span className="text-sm font-medium text-slate-400">Your Overall Score</span>
                         <span className="text-6xl font-bold text-slate-800">71%</span>
                      </div>
                      
                      <ResponsiveContainer width="100%" height="100%">
                         <PieChart>
                            <Pie
                              data={wellbeingScoreData}
                              innerRadius="75%"
                              outerRadius="90%"
                              paddingAngle={5}
                              dataKey="value"
                              startAngle={180}
                              endAngle={-180}
                              stroke="none"
                            >
                               {wellbeingScoreData.map((entry, index) => (
                                 <Cell key={`cell-${index}`} fill={entry.color} />
                               ))}
                            </Pie>
                         </PieChart>
                      </ResponsiveContainer>

                      {/* Explicit Category Labels around ring */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                         <div className="relative w-full h-full max-w-[280px]">
                            <span className="absolute -top-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold border border-emerald-200">Physical</span>
                            <span className="absolute top-1/4 -right-12 px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold border border-rose-200">Emotional</span>
                            <span className="absolute bottom-1/4 -right-10 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold border border-indigo-200">Mental</span>
                            <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-sky-100 text-sky-700 text-[10px] font-bold border border-sky-200">Sleep</span>
                            <span className="absolute bottom-1/4 -left-12 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold border border-emerald-200">Social</span>
                            <span className="absolute top-1/4 -left-12 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold border border-amber-200">Spiritual</span>
                         </div>
                      </div>
                   </div>

                   <div className="mt-12 bg-sky-50/50 p-6 rounded-3xl border border-sky-100 space-y-4">
                      <div className="flex items-center justify-between">
                         <h4 className="font-bold text-sky-900">Overall Sleep</h4>
                         <span className="text-xs font-bold text-sky-600 bg-sky-100 px-2 py-1 rounded-lg">11/20</span>
                      </div>
                      <p className="text-sm text-sky-800/70 leading-relaxed">
                        Sleep meditations can help you fall asleep easily so you can wake up fresh and energized the next day.
                      </p>
                   </div>
                </div>
             </div>
           )}

           {activeTab === "wellbeing" && (
             <div className="space-y-6">
                <h3 className="font-bold text-xl flex items-center gap-2">
                  <Eye className="w-5 h-5 text-indigo-400" /> Digital Wellbeing
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {wellbeing.map(item => (
                     <div key={item._id} className="glass-panel p-6 space-y-4">
                        <div className="w-10 h-10 rounded-full bg-indigo-400/10 flex items-center justify-center text-indigo-400 mb-2">
                           {item.iconName === 'Moon' ? <Moon className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </div>
                        <h4 className="font-bold text-lg">{item.title}</h4>
                        <p className="text-sm text-foreground/80 leading-relaxed">{item.description}</p>
                        <Button variant="outline" className="w-full text-xs">Action Required</Button>
                     </div>
                   ))}
                </div>

                <div className="glass-panel p-8 bg-indigo-400/5 mt-4 border-indigo-400/20">
                   <h4 className="font-bold text-lg mb-4">Screen Time Disconnect Strategy</h4>
                   <ul className="space-y-4 text-sm text-foreground/80">
                      <li className="flex items-center gap-3"><ChevronRight className="w-4 h-4 text-indigo-400" /> Charge your phone outside the bedroom overnight.</li>
                      <li className="flex items-center gap-3"><ChevronRight className="w-4 h-4 text-indigo-400" /> Use a traditional alarm clock instead of your phone app.</li>
                      <li className="flex items-center gap-3"><ChevronRight className="w-4 h-4 text-indigo-400" /> Replace evening scrolling with 15 minutes of light reading.</li>
                   </ul>
                </div>
             </div>
           )}
        </div>

        <div className="space-y-6">
           <div className="glass-panel p-8 bg-indigo-400/5 border-indigo-400/20 space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg">Daily Goal</h3>
                <Award className="w-5 h-5 text-indigo-400" />
              </div>
              
              <div className="space-y-6">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                       <Zap className="w-4 h-4" /> Sleep consistency
                    </div>
                    <span className="text-xs font-bold text-primary">85%</span>
                 </div>
                 <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-400 rounded-full" style={{ width: '85%' }} />
                 </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-indigo-400/10">
                <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-widest">Hygiene Tips</h3>
                {[
                  "Cool room temp (18°C)",
                  "No screens 60m pre-bed",
                  "Consistent wake times",
                  "Avoid caffeine after 2PM",
                ].map((tip, i) => (
                  <div key={i} className="flex gap-3 text-xs">
                    <div className="w-5 h-5 rounded-full bg-indigo-400/10 text-indigo-400 flex items-center justify-center text-[10px] font-bold shrink-0">{i+1}</div>
                    <p className="text-foreground/80">{tip}</p>
                  </div>
                ))}
              </div>
           </div>

           <div className="glass-panel p-8 space-y-4">
              <div className="flex items-center gap-3 text-sm font-bold text-muted-foreground uppercase tracking-widest">
                 <Activity className="w-4 h-4" /> Insights
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                You've been getting <span className="text-primary font-bold">1.2 hours</span> more sleep this week than last. Your mood correlates significantly with your sleep quality.
              </p>
           </div>
        </div>
      </div>
    </main>
  );
}
