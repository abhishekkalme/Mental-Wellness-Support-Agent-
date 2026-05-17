'use client';

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { SleepEntry } from '@/lib/types';
import { subDays, isSameDay, format } from 'date-fns';

export type SoundId = 'rain' | 'forest' | 'ocean' | 'wind' | 'fire';

export interface SoundNode {
  source: AudioBufferSourceNode | null;
  gainNode: GainNode | null;
  buffer: AudioBuffer | null;
  isPlaying: boolean;
}

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

type Insight = {
  type: 'positive' | 'warning' | 'tip';
  title: string;
  description: string;
};

export function useSleepMetrics(sleepView: 'daily' | 'weekly', sleepTarget: number) {
  const sleepHistory = useStore((s) => s.sleepHistory);

  const sleepMetrics = useMemo(() => {
    const today = new Date();
    const thisWeekRecords = sleepHistory.filter((r) => {
      const d = new Date(r.date);
      return d >= subDays(today, 6) && d <= today;
    });
    const lastWeekRecords = sleepHistory.filter((r) => {
      const d = new Date(r.date);
      return d >= subDays(today, 13) && d <= subDays(today, 7);
    });
    const thisWeekAvg =
      thisWeekRecords.length > 0
        ? thisWeekRecords.reduce((sum, r) => sum + (r.durationHours || 0), 0) /
          thisWeekRecords.length
        : 0;
    const lastWeekAvg =
      lastWeekRecords.length > 0
        ? lastWeekRecords.reduce((sum, r) => sum + (r.durationHours || 0), 0) /
          lastWeekRecords.length
        : 0;
    return {
      extraHours: Math.round(Math.max(0, thisWeekAvg - lastWeekAvg) * 10) / 10,
      consistency: Math.round((thisWeekRecords.length / 7) * 100),
      daysLogged: thisWeekRecords.length,
      thisWeekAvg: Math.round(thisWeekAvg * 10) / 10,
      lastWeekAvg: Math.round(lastWeekAvg * 10) / 10,
    };
  }, [sleepHistory]);

  const sleepProgress = useMemo(() => {
    const today = new Date();
    let records: SleepEntry[] = [];
    if (sleepView === 'daily') {
      records = sleepHistory.filter((r) => isSameDay(new Date(r.date), today));
    } else {
      records = sleepHistory.filter((r) => {
        const d = new Date(r.date);
        return d >= subDays(today, 6) && d <= today;
      });
    }
    const totalHours = records.reduce((sum, r) => sum + (r.durationHours || 0), 0);
    const avgHours = records.length > 0 ? totalHours / records.length : 0;
    const displayHours = sleepView === 'daily' ? records[0]?.durationHours || 0 : avgHours;
    return {
      displayHours: Math.floor(displayHours),
      displayMinutes: Math.round((displayHours % 1) * 60),
      score: sleepTarget > 0 ? Math.min(100, Math.round((displayHours / sleepTarget) * 100)) : 0,
      progressPercent: Math.min(100, (displayHours / sleepTarget) * 100),
      recordCount: records.length,
    };
  }, [sleepHistory, sleepView, sleepTarget]);

  const weeklyChartData = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = subDays(new Date(), 6 - i);
      const entry = sleepHistory.find((r) => isSameDay(new Date(r.date), d));
      const q = entry?.quality || 0;
      let color = 'rgba(255,255,255,0.06)';
      if (entry) {
        if (q >= 4) color = '#4ade80';
        else if (q >= 3) color = '#fbbf24';
        else color = '#f87171';
      }
      return {
        day: format(d, 'EEE'),
        date: d.toISOString(),
        hours: entry?.durationHours || 0,
        quality: q,
        color,
        hasData: !!entry,
      };
    });
  }, [sleepHistory]);

  const sleepInsights = useMemo((): Insight[] => {
    const insights: Insight[] = [];
    const today = new Date();
    const thisWeek = sleepHistory.filter((r) => {
      const d = new Date(r.date);
      return d >= subDays(today, 6) && d <= today;
    });
    if (thisWeek.length === 0) return insights;

    const sorted = [...thisWeek].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    const avg = sorted.reduce((s, r) => s + r.durationHours, 0) / sorted.length;
    const avgQuality = sorted.reduce((s, r) => s + r.quality, 0) / sorted.length;
    const daysLogged = sorted.length;

    if (avg < 7) {
      insights.push({
        type: 'warning',
        title: 'Sleep Debt Accumulating',
        description: `You're averaging ${avg.toFixed(1)}h — below the 7-9h range. Try shifting bedtime 15min earlier each night.`,
      });
    } else if (avg >= 7) {
      insights.push({
        type: 'positive',
        title: 'On Track with Duration',
        description: `Averaging ${avg.toFixed(1)}h meets healthy sleep guidelines. Focus on consistency now.`,
      });
    }

    if (sorted.length >= 3) {
      const variance =
        sorted.reduce((s, r, i) => {
          if (i === 0) return s;
          return s + Math.abs(r.durationHours - sorted[i - 1].durationHours);
        }, 0) /
        (sorted.length - 1);

      if (variance > 1.5) {
        insights.push({
          type: 'tip',
          title: 'Inconsistent Schedule',
          description: `Your bedtime varies by ${variance.toFixed(1)}h+ night-to-night. A consistent schedule improves recovery.`,
        });
      } else if (daysLogged >= 5 && variance < 0.8) {
        insights.push({
          type: 'positive',
          title: 'Excellent Consistency',
          description: `Your sleep schedule is remarkably stable. This is key for deep restorative sleep.`,
        });
      }
    }

    if (sorted.length >= 4) {
      const mid = Math.floor(sorted.length / 2);
      const firstHalf = sorted.slice(0, mid);
      const secondHalf = sorted.slice(mid);
      const firstQ = firstHalf.reduce((s, r) => s + r.quality, 0) / firstHalf.length;
      const secondQ = secondHalf.reduce((s, r) => s + r.quality, 0) / secondHalf.length;

      if (secondQ > firstQ + 0.7) {
        insights.push({
          type: 'positive',
          title: 'Quality Improving',
          description:
            "Your sleep quality has been trending upward. Keep up whatever you're doing!",
        });
      } else if (firstQ > secondQ + 0.7) {
        insights.push({
          type: 'warning',
          title: 'Quality Declining',
          description:
            'Your sleep quality has dipped recently. Consider a pre-bed wind-down routine.',
        });
      }
    }

    if (daysLogged < 4) {
      insights.push({
        type: 'tip',
        title: 'Build the Habit',
        description: `Log ${4 - daysLogged} more nights this week to unlock personalized sleep pattern analysis.`,
      });
    }

    if (avgQuality >= 4 && avg < 7) {
      insights.push({
        type: 'tip',
        title: 'Quality over Quantity?',
        description:
          'Great quality despite shorter duration. Prioritize extending sleep time to match quality.',
      });
    }

    if (insights.length > 4) insights.splice(4);
    return insights;
  }, [sleepHistory, sleepTarget]);

  return { sleepMetrics, sleepProgress, weeklyChartData, sleepInsights };
}

export function useSoundMixer() {
  const [mixerVolumes, setMixerVolumes] = useState<Record<SoundId, number>>({
    rain: 0,
    forest: 0,
    ocean: 0,
    wind: 0,
    fire: 0,
  });
  const [mixerPlaying, setMixerPlaying] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const soundNodesRef = useRef<Record<SoundId, SoundNode>>({} as Record<SoundId, SoundNode>);
  const masterGainRef = useRef<GainNode | null>(null);
  const lfoOscillatorsRef = useRef<Record<string, OscillatorNode>>({});
  const lfoGainsRef = useRef<Record<string, GainNode>>({});
  const isInitializedRef = useRef(false);

  const initializeMixer = useCallback(() => {
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

  const startSound = useCallback((soundId: SoundId, volume: number) => {
    const ctx = audioContextRef.current;
    const masterGain = masterGainRef.current;
    const soundNode = soundNodesRef.current[soundId];
    if (!ctx || !masterGain || !soundNode?.buffer) return;

    if (soundNode.source) {
      try {
        soundNode.source.stop();
        soundNode.source.disconnect();
      } catch {}
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

  const stopSound = useCallback((soundId: SoundId) => {
    const ctx = audioContextRef.current;
    const soundNode = soundNodesRef.current[soundId];
    if (!ctx || !soundNode?.gainNode || !soundNode?.source) return;
    const currentTime = ctx.currentTime;
    soundNode.gainNode.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.5);
    setTimeout(() => {
      try {
        soundNode.source?.stop();
        soundNode.source?.disconnect();
        soundNode.gainNode?.disconnect();
      } catch {}
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
    initializeMixer();
  }, [initializeMixer]);

  useEffect(() => {
    if (!isInitializedRef.current) return;
    const ids: SoundId[] = ['rain', 'forest', 'ocean', 'wind', 'fire'];
    ids.forEach((id) => {
      const vol = mixerVolumes[id];
      const node = soundNodesRef.current[id];
      if (mixerPlaying && vol > 0) {
        startSound(id, vol);
      } else if (node?.isPlaying) {
        stopSound(id);
      }
    });
  }, [mixerVolumes, mixerPlaying, startSound, stopSound]);

  const setVolume = useCallback(
    (id: SoundId, val: number) => {
      setMixerVolumes((prev) => ({ ...prev, [id]: val }));
      if (val > 0 && !mixerPlaying) setMixerPlaying(true);
    },
    [mixerPlaying]
  );

  const togglePlay = useCallback(() => setMixerPlaying((p) => !p), []);
  const stopAll = useCallback(() => {
    setMixerVolumes({ rain: 0, forest: 0, ocean: 0, wind: 0, fire: 0 });
    setMixerPlaying(false);
  }, []);

  const activeSoundIds = useMemo(
    () =>
      (Object.entries(mixerVolumes) as [SoundId, number][])
        .filter(([, v]) => v > 0)
        .sort(([, a], [, b]) => b - a)
        .map(([id]) => id),
    [mixerVolumes]
  );

  return {
    mixerVolumes,
    setVolume,
    mixerPlaying,
    togglePlay,
    stopAll,
    activeSoundIds,
  };
}
