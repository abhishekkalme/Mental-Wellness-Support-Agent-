'use client';

import { motion } from 'framer-motion';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { useStore } from '@/store/useStore';
import { SleepEntry } from '@/lib/types';
import {
  Moon,
  Music,
  Eye,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Plus,
  Calendar,
  Zap,
  Activity,
  Award,
  CloudRain,
  Trees,
  Waves,
  Wind,
  Flame,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Target,
  Clock,
} from 'lucide-react';
import { format, subDays, isSameDay } from 'date-fns';

const seedMusic = [
  {
    title: 'Deep Forest',
    category: 'Binaural Beats',
    bpm: '60',
    audioUrl: '/assets/Birds Singing In A Forest.mp3',
  },
  {
    title: 'Ocean Dreams',
    category: 'Lofi Ambient',
    bpm: '55',
    audioUrl: '/assets/Heart Of The Ocean.mp3',
  },
  {
    title: 'Rain Sound And Rainforest',
    category: 'Sound Bath',
    bpm: '50',
    audioUrl: '/assets/Rain Sound And Rainforest.mp3',
  },
  {
    title: 'Nature Ambience',
    category: 'Nature Sounds',
    bpm: '65',
    audioUrl: '/assets/nature.mp3',
  },
  { title: 'Ocean Waves', category: 'Ethereal Drone', bpm: '40', audioUrl: '/assets/ocean.mp3' },
  { title: 'Stormy Sea', category: 'Relaxation', bpm: '58', audioUrl: '/assets/stormy sea.mp3' },
];

type SoundAsset = {
  id: string;
  name: string;
  icon: any;
  color: string;
  gradient: string;
  benefit: string;
};

const soundAssets: SoundAsset[] = [
  {
    id: 'rain',
    name: 'Rainfall',
    icon: CloudRain,
    color: 'text-blue-400',
    gradient: 'from-blue-500/20 to-cyan-500/10',
    benefit: 'improved sleep quality and reduced anxiety',
  },
  {
    id: 'forest',
    name: 'Forest Birds',
    icon: Trees,
    color: 'text-emerald-400',
    gradient: 'from-emerald-500/20 to-teal-500/10',
    benefit: 'enhanced focus and cognitive restoration',
  },
  {
    id: 'ocean',
    name: 'Ocean Waves',
    icon: Waves,
    color: 'text-sky-400',
    gradient: 'from-sky-500/20 to-blue-500/10',
    benefit: 'deep relaxation and stress relief',
  },
  {
    id: 'wind',
    name: 'Soft Wind',
    icon: Wind,
    color: 'text-slate-400',
    gradient: 'from-slate-400/20 to-slate-200/10',
    benefit: 'mental clarity and gentle background ambiance',
  },
  {
    id: 'fire',
    name: 'Crackling Fire',
    icon: Flame,
    color: 'text-orange-400',
    gradient: 'from-orange-500/20 to-red-500/10',
    benefit: 'cozy comfort and emotional warmth',
  },
];

interface SleepMusicTrack {
  _id?: string;
  title: string;
  category: string;
  bpm: string;
  audioUrl: string;
}
interface WellbeingItem {
  _id?: string;
  title: string;
  description: string;
  category: string;
  iconName?: string;
}

type SoundNode = {
  source: AudioBufferSourceNode | null;
  gainNode: GainNode | null;
  buffer: AudioBuffer | null;
  isPlaying: boolean;
};

function createPinkNoise(bufferSize: number): Float32Array {
  const buffer = new Float32Array(bufferSize);
  let b0 = 0,
    b1 = 0,
    b2 = 0,
    b3 = 0,
    b4 = 0,
    b5 = 0,
    b6 = 0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + white * 0.0555179;
    b1 = 0.99332 * b1 + white * 0.0750759;
    b2 = 0.969 * b2 + white * 0.153852;
    b3 = 0.8665 * b3 + white * 0.3104856;
    b4 = 0.55 * b4 + white * 0.5329522;
    b5 = -0.7616 * b5 - white * 0.016898;
    buffer[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
    b6 = white * 0.115926;
  }
  return buffer;
}

function createBrownNoise(bufferSize: number): Float32Array {
  const buffer = new Float32Array(bufferSize);
  let lastOut = 0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    buffer[i] = (lastOut + 0.02 * white) / 1.02;
    lastOut = buffer[i];
    buffer[i] *= 3.5;
  }
  return buffer;
}

function createWhiteNoise(bufferSize: number): Float32Array {
  const buffer = new Float32Array(bufferSize);
  for (let i = 0; i < bufferSize; i++) buffer[i] = Math.random() * 2 - 1;
  return buffer;
}

function createCracklingNoise(bufferSize: number): Float32Array {
  const buffer = new Float32Array(bufferSize);
  let lastCrackle = 0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random();
    if (white > 0.997) lastCrackle = (Math.random() * 2 - 1) * 0.8;
    else if (white > 0.99) lastCrackle = (Math.random() * 2 - 1) * 0.4;
    else lastCrackle *= 0.995;
    buffer[i] = lastCrackle + (Math.random() * 2 - 1) * 0.05;
  }
  return buffer;
}

export default function SleepPage() {
  const [activeTab, setActiveTab] = useState<'tracking' | 'music' | 'mixer' | 'wellbeing'>(
    'tracking'
  );
  const [sleepView, setSleepView] = useState<'daily' | 'weekly'>('daily');
  const [sleepTarget, setSleepTarget] = useState(8);
  const [music, setMusic] = useState<SleepMusicTrack[]>([]);
  const [wellbeing, setWellbeing] = useState<WellbeingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLogForm, setShowLogForm] = useState(false);
  const [logDate, setLogDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [logDuration, setLogDuration] = useState(7);
  const [logQuality, setLogQuality] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);

  const [mixerVolumes, setMixerVolumes] = useState<Record<string, number>>({
    rain: 0,
    forest: 0,
    ocean: 0,
    wind: 0,
    fire: 0,
  });
  const [mixerPlaying, setMixerPlaying] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const soundNodesRef = useRef<Record<string, SoundNode>>({});
  const masterGainRef = useRef<GainNode | null>(null);
  const lfoOscillatorsRef = useRef<Record<string, OscillatorNode>>({});
  const lfoGainsRef = useRef<Record<string, GainNode>>({});
  const isInitializedRef = useRef(false);

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

  const sleepMetrics = useMemo(() => {
    const today = new Date();
    const thisWeekRecords = store.sleepHistory.filter((r) => {
      const d = new Date(r.date);
      return d >= subDays(today, 6) && d <= today;
    });
    const lastWeekRecords = store.sleepHistory.filter((r) => {
      const d = new Date(r.date);
      return d >= subDays(today, 13) && d <= subDays(today, 7);
    });
    const thisWeekAvg =
      thisWeekRecords.length > 0
        ? thisWeekRecords.reduce((sum: number, r: SleepEntry) => sum + (r.durationHours || 0), 0) /
          thisWeekRecords.length
        : 0;
    const lastWeekAvg =
      lastWeekRecords.length > 0
        ? lastWeekRecords.reduce((sum: number, r: SleepEntry) => sum + (r.durationHours || 0), 0) /
          lastWeekRecords.length
        : 0;
    const extraHours = Math.max(0, thisWeekAvg - lastWeekAvg);
    const daysLogged = thisWeekRecords.length;
    const consistency = 7 > 0 ? Math.round((daysLogged / 7) * 100) : 0;
    return { extraHours: Math.round(extraHours * 10) / 10, consistency };
  }, [store.sleepHistory]);

  const sleepProgress = useMemo(() => {
    const today = new Date();
    let records: SleepEntry[] = [];
    if (sleepView === 'daily') {
      records = store.sleepHistory.filter((r) => isSameDay(new Date(r.date), today));
    } else {
      records = store.sleepHistory.filter((r) => {
        const d = new Date(r.date);
        return d >= subDays(today, 6) && d <= today;
      });
    }
    const totalHours = records.reduce((sum, r) => sum + (r.durationHours || 0), 0);
    const avgHours = records.length > 0 ? totalHours / records.length : 0;
    const displayHours = sleepView === 'daily' ? records[0]?.durationHours || 0 : avgHours;
    const displayMinutes = Math.round((displayHours % 1) * 60);
    const score =
      sleepTarget > 0 ? Math.min(100, Math.round((displayHours / sleepTarget) * 100)) : 0;
    const progressPercent = Math.min(100, (displayHours / sleepTarget) * 100);
    return {
      displayHours: Math.floor(displayHours),
      displayMinutes,
      score,
      progressPercent,
      recordCount: records.length,
    };
  }, [store.sleepHistory, sleepView, sleepTarget]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [musicRes, wellbeingRes] = await Promise.all([
        fetch('/api/sleep/music'),
        fetch('/api/sleep/wellbeing'),
      ]);
      setMusic(await musicRes.json());
      setWellbeing(await wellbeingRes.json());
    } catch (err) {
      console.error('Failed to fetch sleep data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveSleep = async () => {
    setSaving(true);
    const entry: SleepEntry = {
      id: `sleep_${Date.now()}`,
      date: logDate,
      quality: logQuality,
      durationHours: logDuration,
    };
    store.addSleepEntry(entry);
    setSaved(true);
    setShowLogForm(false);
    setSaving(false);
    setTimeout(() => setSaved(false), 3000);
  };

  const initializeMixerAudio = useCallback(() => {
    if (isInitializedRef.current) return;
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    audioContextRef.current = ctx;
    const masterGain = ctx.createGain();
    masterGain.connect(ctx.destination);
    masterGainRef.current = masterGain;
    const sampleRate = ctx.sampleRate;
    const bufferDuration = 4;
    const bufferSize = sampleRate * bufferDuration;
    const rainBuffer = ctx.createBuffer(1, bufferSize, sampleRate);
    rainBuffer.getChannelData(0).set(createPinkNoise(bufferSize));
    const forestBuffer = ctx.createBuffer(1, bufferSize, sampleRate);
    const brownForest = createBrownNoise(bufferSize);
    const forestData = forestBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      const chirp = Math.sin((i / sampleRate) * 800 + Math.sin((i / sampleRate) * 3) * 10) * 0.15;
      const birdLike =
        Math.sin((i / sampleRate) * 1200 + Math.sin((i / sampleRate) * 7) * 15) * 0.1;
      forestData[i] =
        brownForest[i] +
        chirp * (Math.random() > 0.995 ? 1 : 0) +
        birdLike * (Math.random() > 0.997 ? 1 : 0);
    }
    const oceanBuffer = ctx.createBuffer(1, bufferSize, sampleRate);
    oceanBuffer.getChannelData(0).set(createBrownNoise(bufferSize));
    const windBuffer = ctx.createBuffer(1, bufferSize, sampleRate);
    windBuffer.getChannelData(0).set(createWhiteNoise(bufferSize));
    const fireBuffer = ctx.createBuffer(1, bufferSize, sampleRate);
    fireBuffer.getChannelData(0).set(createCracklingNoise(bufferSize));
    soundNodesRef.current = {
      rain: { source: null, gainNode: null, buffer: rainBuffer, isPlaying: false },
      forest: { source: null, gainNode: null, buffer: forestBuffer, isPlaying: false },
      ocean: { source: null, gainNode: null, buffer: oceanBuffer, isPlaying: false },
      wind: { source: null, gainNode: null, buffer: windBuffer, isPlaying: false },
      fire: { source: null, gainNode: null, buffer: fireBuffer, isPlaying: false },
    };
    isInitializedRef.current = true;
  }, []);

  const startSound = useCallback((soundId: string, volume: number) => {
    const ctx = audioContextRef.current;
    const masterGain = masterGainRef.current;
    const soundNode = soundNodesRef.current[soundId];
    if (!ctx || !masterGain || !soundNode.buffer) return;
    if (soundNode.source) {
      try {
        soundNode.source.stop();
        soundNode.source.disconnect();
      } catch (e) {}
    }
    if (soundNode.gainNode) soundNode.gainNode.disconnect();
    const source = ctx.createBufferSource();
    source.buffer = soundNode.buffer;
    source.loop = true;
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    source.connect(gainNode);
    gainNode.connect(masterGain);
    if (soundId === 'ocean') {
      if (lfoOscillatorsRef.current[soundId]) {
        lfoOscillatorsRef.current[soundId].stop();
        lfoOscillatorsRef.current[soundId].disconnect();
      }
      if (lfoGainsRef.current[soundId]) lfoGainsRef.current[soundId].disconnect();
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(0.1, ctx.currentTime);
      lfoGain.gain.setValueAtTime(0.4, ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(gainNode.gain);
      lfo.start();
      lfoOscillatorsRef.current[soundId] = lfo;
      lfoGainsRef.current[soundId] = lfoGain;
    }
    if (soundId === 'wind') {
      const lowpass = ctx.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.frequency.setValueAtTime(400, ctx.currentTime);
      lowpass.Q.setValueAtTime(1, ctx.currentTime);
      gainNode.disconnect();
      source.disconnect();
      source.connect(lowpass);
      lowpass.connect(gainNode);
      gainNode.connect(masterGain);
    }
    if (soundId === 'rain') {
      const lowpass = ctx.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.frequency.setValueAtTime(2000, ctx.currentTime);
      source.disconnect();
      source.connect(lowpass);
      lowpass.connect(gainNode);
      gainNode.connect(masterGain);
    }
    source.start();
    soundNode.source = source;
    soundNode.gainNode = gainNode;
    soundNode.isPlaying = true;
    gainNode.gain.exponentialRampToValueAtTime(volume, ctx.currentTime + 0.1);
  }, []);

  const stopSound = useCallback((soundId: string) => {
    const ctx = audioContextRef.current;
    const soundNode = soundNodesRef.current[soundId];
    if (!ctx || !soundNode.gainNode || !soundNode.source) return;
    const currentTime = ctx.currentTime;
    soundNode.gainNode.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.5);
    setTimeout(() => {
      try {
        soundNode.source?.stop();
        soundNode.source?.disconnect();
        soundNode.gainNode?.disconnect();
      } catch (e) {}
      if (lfoOscillatorsRef.current[soundId]) {
        lfoOscillatorsRef.current[soundId].stop();
        lfoOscillatorsRef.current[soundId].disconnect();
        delete lfoOscillatorsRef.current[soundId];
      }
      if (lfoGainsRef.current[soundId]) {
        lfoGainsRef.current[soundId].disconnect();
        delete lfoGainsRef.current[soundId];
      }
      soundNode.source = null;
      soundNode.gainNode = null;
      soundNode.isPlaying = false;
    }, 550);
  }, []);

  useEffect(() => {
    initializeMixerAudio();
  }, [initializeMixerAudio]);

  useEffect(() => {
    if (!isInitializedRef.current) return;
    soundAssets.forEach((sound) => {
      const vol = mixerVolumes[sound.id];
      if (mixerPlaying && vol > 0) startSound(sound.id, vol);
      else if (!mixerPlaying || vol === 0)
        if (soundNodesRef.current[sound.id].isPlaying) stopSound(sound.id);
    });
  }, [mixerVolumes, mixerPlaying, startSound, stopSound]);

  const activeSounds = useMemo(
    () =>
      soundAssets
        .filter((s) => mixerVolumes[s.id] > 0)
        .sort((a, b) => mixerVolumes[b.id] - mixerVolumes[a.id]),
    [mixerVolumes]
  );
  const mixerTipText = useMemo(() => {
    if (activeSounds.length === 0)
      return 'Start mixing sounds to create your perfect sleep atmosphere.';
    if (activeSounds.length === 1)
      return `${activeSounds[0].name} at ${mixerVolumes[activeSounds[0].id]}% promotes ${activeSounds[0].benefit}.`;
    const names = activeSounds.map((s) => s.name).join(', ');
    return `Your blend of ${names} creates a ${activeSounds.length > 2 ? 'rich layered' : 'dual-layered'} soundscape.`;
  }, [activeSounds, mixerVolumes]);

  const handleMixerVolumeChange = (id: string, val: number) => {
    setMixerVolumes((prev) => ({ ...prev, [id]: val }));
    if (val > 0 && !mixerPlaying) setMixerPlaying(true);
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
        <p className="text-white/40 animate-pulse font-medium">Preparing your sanctuary...</p>
      </div>
    );
  }

  if (music.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-20">
        <Music className="w-16 h-16 text-indigo-400" />
        <h3 className="text-xl font-bold text-white">No music tracks found</h3>
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
    <main className="p-4 md:p-8 max-w-6xl mx-auto space-y-8 relative">
      {/* Ambient glow */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/5 blur-[150px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#E2FF6F]/5 blur-[150px] rounded-full" />
      </div>

      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-[#E2FF6F]">
            <Moon className="w-6 h-6" />
            <span className="text-sm font-bold uppercase tracking-widest">
              Sleep &amp; Sound Wellness
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
            Rest &amp; Recovery
          </h1>
          <p className="text-white/40 text-lg">
            Track sleep, mix ambient sounds, and discover calming music.
          </p>
        </div>
        <div className="flex gap-1 p-1 bg-white/[0.04] rounded-2xl border border-white/[0.06]">
          {(['tracking', 'music', 'mixer', 'wellbeing'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 md:px-5 py-2 rounded-xl text-sm font-bold capitalize transition-all duration-200 ${activeTab === tab ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
        <div className="lg:col-span-2 space-y-8">
          {activeTab === 'tracking' && (
            <div className="space-y-8">
              <div className="glass-panel p-6 md:p-8 space-y-6 bg-white/[0.03] border-white/[0.06]">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white tracking-tight">Sleep Progress</h3>
                  <div className="flex items-center gap-2 p-0.5 bg-white/5 rounded-xl">
                    <button
                      onClick={() => setSleepView('daily')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${sleepView === 'daily' ? 'bg-indigo-500 text-white shadow-sm' : 'text-white/40 hover:text-white'}`}
                    >
                      Day
                    </button>
                    <button
                      onClick={() => setSleepView('weekly')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${sleepView === 'weekly' ? 'bg-indigo-500 text-white shadow-sm' : 'text-white/40 hover:text-white'}`}
                    >
                      Week
                    </button>
                  </div>
                </div>
                <div className="space-y-6">
                  {sleepProgress.recordCount === 0 ? (
                    <div className="min-h-[200px] flex flex-col items-center justify-center text-center space-y-4">
                      {showLogForm ? (
                        <div className="glass-panel p-6 rounded-2xl bg-black/40 border border-white/[0.08] space-y-4 w-full max-w-sm">
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-white">Log Sleep</h4>
                            <button
                              onClick={() => setShowLogForm(false)}
                              className="text-white/30 hover:text-white text-sm transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                          <div>
                            <label className="text-xs text-white/50 font-medium mb-1.5 block">
                              Date
                            </label>
                            <input
                              type="date"
                              value={logDate}
                              onChange={(e) => setLogDate(e.target.value)}
                              className="w-full h-10 px-3 rounded-xl bg-black/30 border border-white/[0.08] text-white text-sm focus:border-indigo-400/50 focus:outline-none transition-all"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-white/50 font-medium mb-1.5 block">
                              Hours:{' '}
                              <span className="text-indigo-400 font-bold">{logDuration}h</span>
                            </label>
                            <input
                              type="range"
                              min={1}
                              max={14}
                              value={logDuration}
                              onChange={(e) => setLogDuration(Number(e.target.value))}
                              className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-indigo-400 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-indigo-400 [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-indigo-400/30"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-white/50 font-medium mb-1.5 block">
                              Quality:{' '}
                              <span className="text-indigo-400 font-bold">{logQuality}/5</span>
                            </label>
                            <div className="flex gap-2">
                              {([1, 2, 3, 4, 5] as const).map((q) => (
                                <button
                                  key={q}
                                  onClick={() => setLogQuality(q)}
                                  className={`flex-1 h-9 rounded-lg text-xs font-bold transition-all ${logQuality === q ? 'bg-indigo-400 text-black shadow-sm' : 'bg-white/[0.04] text-white/40 hover:bg-white/10'}`}
                                >
                                  {q}
                                </button>
                              ))}
                            </div>
                          </div>
                          {saved && (
                            <p className="text-xs text-[#E2FF6F] text-center font-medium">Saved!</p>
                          )}
                          <Button
                            onClick={handleSaveSleep}
                            disabled={saving}
                            className="w-full bg-indigo-500 hover:bg-indigo-600 rounded-xl h-11 font-bold"
                          >
                            {saving ? 'Saving...' : 'Save Entry'}
                          </Button>
                        </div>
                      ) : (
                        <>
                          <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center">
                            <Moon className="w-7 h-7 text-indigo-400" />
                          </div>
                          <div>
                            <p className="text-white/40 text-sm">Log your first sleep entry</p>
                          </div>
                          <button
                            onClick={() => setShowLogForm(true)}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-bold text-sm hover:bg-indigo-500/20 transition-all"
                          >
                            <Plus className="w-4 h-4" /> Log Sleep
                          </button>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="relative h-8 bg-white/[0.06] rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${sleepProgress.progressPercent}%` }}
                          transition={{ duration: 1, ease: 'easeOut' }}
                          className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xs font-bold text-white drop-shadow-lg">
                            {Math.round(sleepProgress.progressPercent)}%
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="flex flex-col items-center p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                          <Clock className="w-4 h-4 text-white/40 mb-1" />
                          <span className="text-xs text-white/40">Slept</span>
                          <span className="text-white font-bold">
                            {sleepProgress.displayHours}h {sleepProgress.displayMinutes}m
                          </span>
                        </div>
                        <div className="flex flex-col items-center p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                          <Target className="w-4 h-4 text-white/40 mb-1" />
                          <span className="text-xs text-white/40">Goal</span>
                          <span className="text-white font-bold">{sleepTarget}h</span>
                        </div>
                        <div className="flex flex-col items-center p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                          <Moon className="w-4 h-4 text-indigo-400 mb-1" />
                          <span className="text-xs text-white/40">Score</span>
                          <span className="text-[#E2FF6F] font-bold">{sleepProgress.score}%</span>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <Button
                          onClick={() => setShowLogForm(true)}
                          size="sm"
                          className="bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 rounded-xl"
                        >
                          <Plus className="w-4 h-4 mr-2" /> Add Entry
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="glass-panel p-6 md:p-8 bg-white/[0.03] border-white/[0.06] space-y-6">
                <p className="text-xs font-bold uppercase tracking-widest text-white/30">
                  Wellbeing Score
                </p>
                <div className="relative h-[200px] flex items-center justify-center">
                  <div className="absolute flex flex-col items-center">
                    <span className="text-sm font-medium text-white/40">Overall</span>
                    <span className="text-6xl font-bold text-white tabular-nums">
                      {overallScore}%
                    </span>
                  </div>
                </div>
                <div className="bg-indigo-500/10 p-4 rounded-2xl border border-indigo-500/15">
                  <p className="text-sm text-white/60">
                    Sleep meditations can help you fall asleep easily so you can wake up fresh and
                    energized.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'music' && (
            <div className="space-y-6">
              <h3 className="font-bold text-xl flex items-center gap-2 text-white">
                <Music className="w-5 h-5 text-indigo-400" /> Sleep Music Library
              </h3>
              {currentTrack?.audioUrl && (
                <div className="glass-panel p-4 bg-indigo-400/10 border-indigo-400/20 flex items-center gap-4 rounded-2xl">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setPlayingTrackId(null)}
                    className="rounded-full shrink-0 text-indigo-400 hover:bg-indigo-400/10"
                  >
                    <Moon className="w-4 h-4" />
                  </Button>
                  <audio controls autoPlay className="flex-1 h-8">
                    <source src={currentTrack.audioUrl} type="audio/mpeg" />
                  </audio>
                  <span className="text-sm font-medium shrink-0 text-white">
                    {currentTrack.title}
                  </span>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {music.map((m) => (
                  <div
                    key={m._id}
                    className="glass-panel p-6 text-center space-y-4 group hover:border-indigo-400/40 hover:bg-white/[0.06] transition-all duration-300 cursor-pointer border-white/[0.06] bg-white/[0.03]"
                  >
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-400/10 to-purple-400/10 flex items-center justify-center text-indigo-400 mx-auto group-hover:scale-110 transition-transform">
                      <Music className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-white">{m.title}</h4>
                      <p className="text-xs text-white/40 mt-1">{m.category}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-white/[0.08] hover:bg-white/10 text-white rounded-xl"
                      onClick={() => setPlayingTrackId(playingTrackId === m._id ? null : m._id!)}
                    >
                      {playingTrackId === m._id ? 'Stop' : 'Play'}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'mixer' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <h3 className="font-bold text-xl flex items-center gap-2 text-white">
                    <Volume2 className="w-5 h-5 text-cyan-400" /> Sound Mixer
                  </h3>
                  <p className="text-white/40 text-sm mt-1">
                    Create your perfect ambient sleep atmosphere
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="icon"
                    variant="outline"
                    className="rounded-full h-12 w-12 border-white/20 hover:bg-white/10 hover:border-cyan-400/40 transition-all"
                    onClick={() => setMixerPlaying(!mixerPlaying)}
                  >
                    {mixerPlaying ? (
                      <Pause className="w-5 h-5 text-white" />
                    ) : (
                      <Play className="w-5 h-5 text-white ml-1" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setMixerVolumes({ rain: 0, forest: 0, ocean: 0, wind: 0, fire: 0 });
                      setMixerPlaying(false);
                    }}
                    className="text-white/40 hover:text-white"
                  >
                    Mute All
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {soundAssets.map((sound) => {
                  const vol = mixerVolumes[sound.id];
                  const isActive = vol > 0 && mixerPlaying;
                  return (
                    <motion.div
                      key={sound.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`glass-panel p-6 space-y-4 relative overflow-hidden group transition-all duration-300 border-2 ${isActive ? 'border-cyan-400/40 bg-cyan-400/[0.06]' : 'border-white/[0.06] hover:border-white/20'}`}
                    >
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${sound.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                      />
                      <div className="flex items-center justify-between relative z-10">
                        <div className={`p-3 rounded-xl bg-white/[0.04] ${sound.color}`}>
                          <sound.icon className="w-5 h-5" />
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-white/40 uppercase">
                          {vol > 0 ? (
                            <Volume2 className="w-3 h-3" />
                          ) : (
                            <VolumeX className="w-3 h-3" />
                          )}
                          {vol}%
                        </div>
                      </div>
                      <div className="space-y-3 relative z-10">
                        <h4 className="font-bold text-white">{sound.name}</h4>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={vol}
                          onChange={(e) =>
                            handleMixerVolumeChange(sound.id, parseInt(e.target.value))
                          }
                          className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-cyan-400 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-400 [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-cyan-400/30"
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
              <div className="glass-panel p-6 bg-cyan-500/[0.06] border-cyan-500/20 rounded-2xl flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400 shrink-0">
                  <Volume2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-white">
                    {activeSounds.length === 0 ? 'Getting Started' : 'Your Mix'}
                  </h4>
                  <p className="text-sm text-white/40">{mixerTipText}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'wellbeing' && (
            <div className="space-y-6">
              <h3 className="font-bold text-xl flex items-center gap-2 text-white">
                <Eye className="w-5 h-5 text-indigo-400" /> Digital Wellbeing
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {wellbeing.map((item) => (
                  <div
                    key={item._id}
                    className="glass-panel p-5 space-y-3 border-white/[0.06] bg-white/[0.03] hover:border-indigo-400/30 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-full bg-indigo-400/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                      {item.iconName === 'Moon' ? (
                        <Moon className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </div>
                    <h4 className="font-bold text-white">{item.title}</h4>
                    <p className="text-sm text-white/50 leading-relaxed">{item.description}</p>
                  </div>
                ))}
              </div>
              <div className="glass-panel p-6 bg-indigo-400/[0.04] border-indigo-400/15">
                <h4 className="font-bold text-white mb-4">Screen Time Strategy</h4>
                <ul className="space-y-3 text-sm text-white/50">
                  <li className="flex items-center gap-3">
                    <ChevronRight className="w-4 h-4 text-indigo-400 shrink-0" /> Charge phone
                    outside bedroom
                  </li>
                  <li className="flex items-center gap-3">
                    <ChevronRight className="w-4 h-4 text-indigo-400 shrink-0" /> Use traditional
                    alarm clock
                  </li>
                  <li className="flex items-center gap-3">
                    <ChevronRight className="w-4 h-4 text-indigo-400 shrink-0" /> Replace scrolling
                    with 15m reading
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="glass-panel p-6 bg-indigo-500/[0.04] border-indigo-500/15 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white">Daily Goal</h3>
              <Award className="w-5 h-5 text-indigo-400" />
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <Zap className="w-4 h-4 text-white/40" />{' '}
                <span className="text-white/40">Sleep consistency</span>
                <span className="text-white font-bold">{sleepMetrics.consistency}%</span>
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-400 rounded-full transition-all"
                  style={{ width: `${sleepMetrics.consistency}%` }}
                />
              </div>
            </div>
            <div className="space-y-3 pt-4 border-t border-indigo-400/10">
              <h4 className="text-xs font-bold text-white/40 uppercase tracking-widest">
                Sleep Tips
              </h4>
              {[
                'Cool room (18°C)',
                'No screens 60m before bed',
                'Consistent wake times',
                'No caffeine after 2PM',
              ].map((tip, i) => (
                <div key={i} className="flex gap-3 text-xs text-white/50">
                  <div className="w-5 h-5 rounded-full bg-indigo-400/10 text-indigo-400 flex items-center justify-center text-[10px] font-bold shrink-0">
                    {i + 1}
                  </div>
                  <p>{tip}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="glass-panel p-6 space-y-3">
            <div className="flex items-center gap-3 text-xs font-bold text-white/40 uppercase tracking-widest">
              <Activity className="w-4 h-4" /> Insights
            </div>
            <p className="text-xs text-white/50 leading-relaxed">
              {store.sleepHistory.length === 0 ? (
                'Log sleep to see patterns.'
              ) : sleepMetrics.extraHours > 0 ? (
                <>
                  You got <span className="text-white font-bold">{sleepMetrics.extraHours}h</span>{' '}
                  more sleep this week.
                </>
              ) : (
                'Keep logging to build insights.'
              )}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
