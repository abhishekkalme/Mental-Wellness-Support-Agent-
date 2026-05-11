'use client';

import { useState, useEffect, lazy, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { useStore } from '@/store/useStore';
import {
  Moon,
  Music,
  Eye,
  ChevronRight,
  Loader2,
  Plus,
  Calendar,
  Zap,
  Activity,
  Award,
} from 'lucide-react';

const SleepTrendChart = lazy(() => import('@/components/charts/SleepTrendChart'));
const SleepAtTimeChart = lazy(() => import('@/components/charts/SleepAtTimeChart'));
const WellbeingPieChart = lazy(() => import('@/components/charts/WellbeingPieChart'));
// Recharts is dynamically imported at chart component level to reduce bundle size

const seedMusic = [
  {
    title: 'Deep Forest',
    category: 'Binaural Beats',
    bpm: '60',
    audioUrl: '/assets/Birds Singing In A Forest.mp3',
  },
  {
    title: 'ocean',
    category: 'Lofi Ambient',
    bpm: '55',
    audioUrl: '/assets/heart of the ocean.mp3',
  },
  {
    title: 'Rain Sound And Rainforest',
    category: 'Sound Bath',
    bpm: '50',
    audioUrl: '/assets/Rain Sound And Rainforest.mp3',
  },
  { title: 'nature', category: 'Nature Sounds', bpm: '65', audioUrl: '/assets/nature.mp3' },
  { title: 'ocean', category: 'Ethereal Drone', bpm: '40', audioUrl: '/assets/ocean.mp3' },
  { title: 'stormy sea', category: 'Relaxation', bpm: '58', audioUrl: '/assets/stormy sea.mp3' },
];

interface WellbeingItem {
  _id?: string;
  title: string;
  description: string;
  category: string;
  iconName?: string;
}

interface SleepMusicTrack {
  _id?: string;
  title: string;
  category: string;
  bpm: string;
  audioUrl: string;
}

export default function SleepPage() {
  const [activeTab, setActiveTab] = useState<'music' | 'tracking' | 'wellbeing'>('tracking');
  const [music, setMusic] = useState<SleepMusicTrack[]>([]);
  const [wellbeing, setWellbeing] = useState<WellbeingItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const store = useStore();

  const currentTrack = music.find((m) => m._id === playingTrackId);
  const overallScore = store.wellnessMetrics
    ? Math.round(
        (store.wellnessMetrics.physical +
          store.wellnessMetrics.emotional +
          store.wellnessMetrics.mental +
          store.wellnessMetrics.sleep +
          store.wellnessMetrics.spiritual +
          store.wellnessMetrics.social) /
          6
      )
    : 71;

  const fetchData = async () => {
    setLoading(true);
    try {
      const [musicRes, wellbeingRes] = await Promise.all([
        fetch('/api/sleep/music'),
        fetch('/api/sleep/wellbeing'),
      ]);
      const musicData = await musicRes.json();
      const wellbeingData = await wellbeingRes.json();
      setMusic(musicData);
      setWellbeing(wellbeingData);
    } catch (err: unknown) {
      console.error('Failed to fetch sleep data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
        <p className="text-muted-foreground animate-pulse font-medium">
          Preparing your sanctuary...
        </p>
      </div>
    );
  }

  if (music.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-20">
        <Music className="w-16 h-16 text-indigo-400" />
        <h3 className="text-xl font-bold">No music tracks found</h3>
        <Button
          onClick={async () => {
            await fetch('/api/sleep/music', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(seedMusic),
            });
            fetchData();
          }}
          className="bg-indigo-500 hover:bg-indigo-600"
        >
          <Plus className="w-4 h-4 mr-2" /> Load Music Tracks
        </Button>
      </div>
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
          <p className="text-muted-foreground text-lg">
            Improve your sleep quality with curated audio and habit tracking.
          </p>
        </div>

        <div className="flex gap-2 p-1 bg-secondary/50 rounded-2xl w-fit">
          {['music', 'tracking', 'wellbeing'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as 'music' | 'tracking' | 'wellbeing')}
              className={`px-6 py-2 rounded-xl text-sm font-bold capitalize transition-all ${
                activeTab === tab
                  ? 'bg-background text-primary shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {activeTab === 'music' && (
            <div className="space-y-4">
              <h3 className="font-bold text-xl flex items-center gap-2">
                <Music className="w-5 h-5 text-indigo-400" /> Focus & sleep Music
              </h3>
              {currentTrack?.audioUrl && (
                <div className="glass-panel p-4 bg-indigo-400/10 border-indigo-400/30 flex items-center gap-4">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => setPlayingTrackId(null)}
                    className="rounded-full shrink-0"
                  >
                    <Moon className="w-4 h-4" />
                  </Button>
                  <audio controls autoPlay className="flex-1 h-8">
                    <source src={currentTrack.audioUrl} type="audio/mpeg" />
                    Your browser does not support audio.
                  </audio>
                  <span className="text-sm font-medium shrink-0">{currentTrack.title}</span>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {music.map((m) => (
                  <div
                    key={m._id}
                    className="glass-panel p-8 text-center space-y-4 group hover:border-indigo-400/50 transition-all cursor-pointer"
                  >
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
                      onClick={() => setPlayingTrackId(playingTrackId === m._id ? null : m._id!)}
                    >
                      {playingTrackId === m._id ? 'Stop' : 'Play Track'}
                    </Button>
                  </div>
                ))}
                {music.length === 0 && (
                  <p className="text-muted-foreground text-center col-span-2 py-8">
                    No music tracks found in the library.
                  </p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'tracking' && (
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
                  <Suspense
                    fallback={
                      <div className="h-full flex items-center justify-center text-white/40">
                        Loading...
                      </div>
                    }
                  >
                    <SleepTrendChart sleepHistory={store.sleepHistory} />
                  </Suspense>
                </div>

                <div className="space-y-4 pt-4">
                  <h4 className="text-sm font-bold text-white/60 uppercase tracking-widest">
                    Sleep at Time
                  </h4>
                  <div className="h-[150px] w-full">
                    <Suspense fallback={<div className="h-full" />}>
                      <SleepAtTimeChart />
                    </Suspense>
                  </div>
                </div>
              </div>

              {/* Wellbeing Assessment Section */}
              <div className="glass-panel p-8 bg-white border-border shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Award className="w-32 h-32 text-primary rotate-12" />
                </div>

                <div className="text-center space-y-2 mb-8 mt-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Wellbeing Assessment
                  </p>
                  <h3 className="text-3xl font-bold text-slate-800 tracking-tight">
                    Great Job! Here&apos;s Your
                    <br />
                    Wellbeing Score
                  </h3>
                </div>

                <div className="relative h-[300px] flex items-center justify-center">
                  <div className="absolute flex flex-col items-center">
                    <span className="text-sm font-medium text-slate-400">Your Overall Score</span>
                    <span className="text-6xl font-bold text-slate-800">{overallScore}%</span>
                  </div>

                  <Suspense fallback={null}>
                    <WellbeingPieChart metrics={store.wellnessMetrics} />
                  </Suspense>

                  {/* Explicit Category Labels around ring */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="relative w-full h-full max-w-[280px]">
                      <span className="absolute -top-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                        Physical
                      </span>
                      <span className="absolute top-1/4 -right-12 px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold border border-rose-200">
                        Emotional
                      </span>
                      <span className="absolute bottom-1/4 -right-10 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold border border-indigo-200">
                        Mental
                      </span>
                      <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-sky-100 text-sky-700 text-[10px] font-bold border border-sky-200">
                        Sleep
                      </span>
                      <span className="absolute bottom-1/4 -left-12 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                        Social
                      </span>
                      <span className="absolute top-1/4 -left-12 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold border border-amber-200">
                        Spiritual
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-12 bg-sky-50/50 p-6 rounded-3xl border border-sky-100 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sky-900">Overall Sleep</h4>
                    <span className="text-xs font-bold text-sky-600 bg-sky-100 px-2 py-1 rounded-lg">
                      11/20
                    </span>
                  </div>
                  <p className="text-sm text-sky-800/70 leading-relaxed">
                    Sleep meditations can help you fall asleep easily so you can wake up fresh and
                    energized the next day.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'wellbeing' && (
            <div className="space-y-6">
              <h3 className="font-bold text-xl flex items-center gap-2">
                <Eye className="w-5 h-5 text-indigo-400" /> Digital Wellbeing
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {wellbeing.map((item) => (
                  <div key={item._id} className="glass-panel p-6 space-y-4">
                    <div className="w-10 h-10 rounded-full bg-indigo-400/10 flex items-center justify-center text-indigo-400 mb-2">
                      {item.iconName === 'Moon' ? (
                        <Moon className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </div>
                    <h4 className="font-bold text-lg">{item.title}</h4>
                    <p className="text-sm text-foreground/80 leading-relaxed">{item.description}</p>
                    <Button variant="outline" className="w-full text-xs">
                      Action Required
                    </Button>
                  </div>
                ))}
              </div>

              <div className="glass-panel p-8 bg-indigo-400/5 mt-4 border-indigo-400/20">
                <h4 className="font-bold text-lg mb-4">Screen Time Disconnect Strategy</h4>
                <ul className="space-y-4 text-sm text-foreground/80">
                  <li className="flex items-center gap-3">
                    <ChevronRight className="w-4 h-4 text-indigo-400" /> Charge your phone outside
                    the bedroom overnight.
                  </li>
                  <li className="flex items-center gap-3">
                    <ChevronRight className="w-4 h-4 text-indigo-400" /> Use a traditional alarm
                    clock instead of your phone app.
                  </li>
                  <li className="flex items-center gap-3">
                    <ChevronRight className="w-4 h-4 text-indigo-400" /> Replace evening scrolling
                    with 15 minutes of light reading.
                  </li>
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
              <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-widest">
                Hygiene Tips
              </h3>
              {[
                'Cool room temp (18°C)',
                'No screens 60m pre-bed',
                'Consistent wake times',
                'Avoid caffeine after 2PM',
              ].map((tip, i) => (
                <div key={i} className="flex gap-3 text-xs">
                  <div className="w-5 h-5 rounded-full bg-indigo-400/10 text-indigo-400 flex items-center justify-center text-[10px] font-bold shrink-0">
                    {i + 1}
                  </div>
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
              You&apos;ve been getting <span className="text-primary font-bold">1.2 hours</span>{' '}
              more sleep this week than last. Your mood correlates significantly with your sleep
              quality.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
