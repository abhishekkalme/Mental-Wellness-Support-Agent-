'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Moon,
  Music,
  Eye,
  ChevronRight,
  Plus,
  Target,
  Clock,
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
  Sparkles,
  CheckCircle2,
  Lightbulb,
  AlertTriangle,
  BarChart3,
  Star,
  Zap,
  ListChecks,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  ReferenceLine,
} from 'recharts';
import { format, subDays, isSameDay } from 'date-fns';
import { Button } from '@/components/ui/button';
import { useStore } from '@/store/useStore';
import { SleepEntry } from '@/lib/types';
import toast from 'react-hot-toast';
import { useSoundMixer, useSleepMetrics, type SoundId } from './hooks';

type SleepMusicTrack = {
  _id?: string;
  title: string;
  category: string;
  bpm: string;
  audioUrl: string;
};

type WellbeingItem = {
  _id?: string;
  title: string;
  description: string;
  category: string;
  iconName?: string;
};

const soundAssets = [
  {
    id: 'rain' as SoundId,
    name: 'Rainfall',
    icon: CloudRain,
    color: 'text-blue-400',
    gradient: 'from-blue-500/20 to-cyan-500/10',
    benefit: 'improved sleep quality and reduced anxiety',
  },
  {
    id: 'forest' as SoundId,
    name: 'Forest Birds',
    icon: Trees,
    color: 'text-emerald-400',
    gradient: 'from-emerald-500/20 to-teal-500/10',
    benefit: 'enhanced focus and cognitive restoration',
  },
  {
    id: 'ocean' as SoundId,
    name: 'Ocean Waves',
    icon: Waves,
    color: 'text-sky-400',
    gradient: 'from-sky-500/20 to-blue-500/10',
    benefit: 'deep relaxation and stress relief',
  },
  {
    id: 'wind' as SoundId,
    name: 'Soft Wind',
    icon: Wind,
    color: 'text-slate-400',
    gradient: 'from-slate-400/20 to-slate-200/10',
    benefit: 'mental clarity and gentle background ambiance',
  },
  {
    id: 'fire' as SoundId,
    name: 'Crackling Fire',
    icon: Flame,
    color: 'text-orange-400',
    gradient: 'from-orange-500/20 to-red-500/10',
    benefit: 'cozy comfort and emotional warmth',
  },
];

const tabs = [
  { id: 'tracking' as const, label: 'Tracking', icon: BarChart3 },
  { id: 'music' as const, label: 'Music', icon: Music },
  { id: 'mixer' as const, label: 'Mixer', icon: Volume2 },
  { id: 'wellbeing' as const, label: 'Wellbeing', icon: Eye },
];

const sleepTips = [
  { text: 'Cool room (18&deg;C/65&deg;F) improves deep sleep', icon: '🌡️' },
  { text: 'No screens 60 minutes before bed', icon: '📱' },
  { text: 'Consistent wake times (even weekends)', icon: '⏰' },
  { text: 'No caffeine after 2 PM', icon: '☕' },
  { text: '15 min reading replaces scrolling', icon: '📖' },
];

type InsightType = 'positive' | 'warning' | 'tip';

function InsightIcon({ type }: { type: InsightType }) {
  if (type === 'positive') return <CheckCircle2 className="w-4 h-4 text-[#4ade80]" />;
  if (type === 'warning') return <AlertTriangle className="w-4 h-4 text-[#fbbf24]" />;
  return <Lightbulb className="w-4 h-4 text-[#C8B6FF]" />;
}

function InsightBg({ type }: { type: InsightType }) {
  if (type === 'positive') return 'bg-[#4ade80]/10 border-[#4ade80]/20';
  if (type === 'warning') return 'bg-[#fbbf24]/10 border-[#fbbf24]/20';
  return 'bg-[#C8B6FF]/10 border-[#C8B6FF]/20';
}

const tabVariants = {
  enter: { opacity: 0, y: 12 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

const qualityLabels: Record<number, { label: string; color: string }> = {
  1: { label: 'Poor', color: 'bg-red-500' },
  2: { label: 'Fair', color: 'bg-orange-400' },
  3: { label: 'Good', color: 'bg-yellow-400' },
  4: { label: 'Great', color: 'bg-lime-400' },
  5: { label: 'Excellent', color: 'bg-[#4ade80]' },
};

function QualityDots({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <div className="flex gap-1.5" role="img" aria-label={`Quality ${value} out of ${max}`}>
      {Array.from({ length: max }, (_, i) => (
        <div
          key={i}
          className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
            i < value
              ? qualityLabels[value as keyof typeof qualityLabels]?.color || 'bg-[#E2FF6F]'
              : 'bg-white/10'
          }`}
        />
      ))}
    </div>
  );
}

function SleepLogForm({
  logDate,
  logDuration,
  logQuality,
  saving,
  saved,
  onDateChange,
  onDurationChange,
  onQualityChange,
  onSave,
  onCancel,
}: {
  logDate: string;
  logDuration: number;
  logQuality: 1 | 2 | 3 | 4 | 5;
  saving: boolean;
  saved: boolean;
  onDateChange: (d: string) => void;
  onDurationChange: (d: number) => void;
  onQualityChange: (q: 1 | 2 | 3 | 4 | 5) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className="surface-card p-6 space-y-5"
    >
      <div className="flex items-center justify-between">
        <h4 className="font-bold text-white text-lg">Log Sleep</h4>
        <button
          onClick={onCancel}
          className="text-sm text-white/40 hover:text-white transition-colors font-medium"
        >
          Cancel
        </button>
      </div>
      <div>
        <label className="text-xs text-white/50 font-medium mb-2 block">Date</label>
        <input
          type="date"
          value={logDate}
          onChange={(e) => onDateChange(e.target.value)}
          className="w-full h-11 px-4 rounded-xl bg-black/30 border border-white/[0.08] text-white text-sm focus:border-[#E2FF6F]/50 focus:outline-none transition-all"
        />
      </div>
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs text-white/50 font-medium">Duration</label>
          <span className="text-sm font-bold text-[#E2FF6F] tabular-nums">{logDuration}h</span>
        </div>
        <input
          type="range"
          min={1}
          max={14}
          value={logDuration}
          onChange={(e) => onDurationChange(Number(e.target.value))}
          aria-label="Sleep duration in hours"
          aria-valuenow={logDuration}
          aria-valuemin={1}
          aria-valuemax={14}
          className="slider-accent w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#E2FF6F] [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-[#E2FF6F]/30 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#E2FF6F] [&::-moz-range-thumb]:border-0"
        />
        <div className="flex justify-between text-[10px] text-white/30 mt-1.5">
          <span>1h</span>
          <span>7h</span>
          <span>14h</span>
        </div>
      </div>
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs text-white/50 font-medium">Quality</label>
          <span className="text-sm font-bold text-[#C8B6FF] tabular-nums">{logQuality}/5</span>
        </div>
        <div className="flex gap-2" role="radiogroup" aria-label="Sleep quality rating">
          {([1, 2, 3, 4, 5] as const).map((q) => (
            <button
              key={q}
              onClick={() => onQualityChange(q)}
              role="radio"
              aria-checked={logQuality === q}
              aria-label={`Quality ${q}`}
              className={`flex-1 h-10 rounded-xl text-xs font-bold transition-all ${
                logQuality === q
                  ? 'bg-[#E2FF6F] text-black shadow-lg shadow-[#E2FF6F]/20'
                  : 'bg-white/[0.04] text-white/40 hover:bg-white/10 hover:text-white/70'
              }`}
            >
              {q}
            </button>
          ))}
        </div>
      </div>
      <AnimatePresence>
        {saved && (
          <motion.p
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="text-xs text-[#4ade80] text-center font-medium flex items-center justify-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> Saved!
          </motion.p>
        )}
      </AnimatePresence>
      <Button
        onClick={onSave}
        disabled={saving}
        className="w-full bg-[#E2FF6F] hover:bg-[#d4f056] text-black font-bold rounded-xl h-11 shadow-lg shadow-[#E2FF6F]/20"
      >
        {saving ? 'Saving...' : 'Save Entry'}
      </Button>
    </motion.div>
  );
}

function EmptySleepState({ onLogSleep }: { onLogSleep: () => void }) {
  return (
    <motion.div
      variants={itemVariants}
      className="flex flex-col items-center justify-center text-center py-16 px-6"
    >
      <div className="w-20 h-20 rounded-full bg-[#E2FF6F]/10 flex items-center justify-center mb-6">
        <Moon className="w-9 h-9 text-[#E2FF6F]" />
      </div>
      <h3 className="text-xl font-bold text-white mb-2">No Sleep Data Yet</h3>
      <p className="text-white/50 text-sm max-w-xs mb-8 leading-relaxed">
        Start tracking your sleep to unlock personalized insights, trends, and recommendations.
      </p>
      <Button
        onClick={onLogSleep}
        className="bg-[#E2FF6F] hover:bg-[#d4f056] text-black font-bold rounded-xl h-11 px-6 shadow-lg shadow-[#E2FF6F]/20"
      >
        <Plus className="w-4 h-4 mr-2" /> Log Your First Night
      </Button>
    </motion.div>
  );
}

function SleepHistoryList() {
  const sleepHistory = useStore((s) => s.sleepHistory);

  const sorted = useMemo(
    () => [...sleepHistory].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [sleepHistory]
  );

  if (sorted.length === 0) return null;

  return (
    <motion.div variants={itemVariants} className="surface-card p-6 md:p-8 space-y-5">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#C8B6FF]/20 to-[#E2FF6F]/20 flex items-center justify-center">
          <ListChecks className="w-4 h-4 text-[#E2FF6F]" />
        </div>
        <h3 className="font-bold text-white text-lg">Past Sleep Entries</h3>
        <span className="text-xs text-white/30 ml-auto">{sorted.length} total</span>
      </div>
      <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
        {sorted.map((entry) => {
          const qLabel = qualityLabels[entry.quality as keyof typeof qualityLabels];
          return (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#E2FF6F]/10 flex items-center justify-center">
                  <Moon className="w-5 h-5 text-[#E2FF6F]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">
                    {format(new Date(entry.date), 'MMM d, yyyy')}
                  </p>
                  <p className="text-xs text-white/40">
                    {entry.durationHours}h · {qLabel?.label || 'Unknown'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <QualityDots value={entry.quality} />
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

function SleepStatsGrid({
  displayHours,
  displayMinutes,
  score,
  sleepTarget,
}: {
  displayHours: number;
  displayMinutes: number;
  score: number;
  sleepTarget: number;
}) {
  const stats = [
    {
      icon: Clock,
      label: 'Slept',
      value: `${displayHours}h ${displayMinutes}m`,
      color: 'text-white',
    },
    { icon: Target, label: 'Goal', value: `${sleepTarget}h`, color: 'text-white' },
    { icon: Star, label: 'Score', value: `${score}%`, color: 'text-[#E2FF6F]' },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map((stat) => (
        <motion.div
          key={stat.label}
          variants={itemVariants}
          className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]"
        >
          <stat.icon className="w-4 h-4 text-white/30" />
          <span className="text-[11px] text-white/40 font-medium uppercase tracking-wider">
            {stat.label}
          </span>
          <span className={`text-lg font-bold tabular-nums ${stat.color}`}>{stat.value}</span>
        </motion.div>
      ))}
    </div>
  );
}

function SleepProgressBar({ percent }: { percent: number }) {
  return (
    <div className="relative h-10 bg-white/[0.06] rounded-2xl overflow-hidden">
      <motion.div
        className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#C8B6FF] to-[#E2FF6F] rounded-2xl"
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(percent, 100)}%` }}
        transition={{ duration: 1, ease: 'easeOut' }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-bold text-black drop-shadow-sm">{Math.round(percent)}%</span>
      </div>
    </div>
  );
}

function WeeklyChart({
  data,
  sleepTarget,
}: {
  data: { day: string; hours: number; quality: number; color: string; hasData: boolean }[];
  sleepTarget: number;
}) {
  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <XAxis
            dataKey="day"
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 12, fontWeight: 600 }}
          />
          <YAxis
            domain={[0, 12]}
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 11 }}
            tickFormatter={(v: number) => `${v}h`}
          />
          <Tooltip
            content={({ active, payload }: any) => {
              if (!active || !payload?.length) return null;
              const d = payload[0].payload;
              if (!d.hasData) return null;
              return (
                <div className="bg-[#1a1d1b] border border-white/10 rounded-xl px-4 py-3 shadow-xl">
                  <p className="text-white font-bold text-sm mb-1">{d.day}</p>
                  <p className="text-white/70 text-xs">
                    {d.hours > 0 ? `${d.hours}h slept` : 'No data'}
                  </p>
                  {d.quality > 0 && (
                    <p className="text-white/50 text-xs mt-0.5">Quality: {d.quality}/5</p>
                  )}
                </div>
              );
            }}
          />
          <ReferenceLine
            y={sleepTarget}
            stroke="#E2FF6F"
            strokeDasharray="6 4"
            strokeWidth={1.5}
            label={{
              value: 'Goal',
              fill: '#E2FF6F',
              fontSize: 11,
              position: 'insideTopRight',
            }}
          />
          <Bar dataKey="hours" radius={[6, 6, 0, 0]} maxBarSize={36}>
            {data.map((entry, idx) => (
              <Cell key={idx} fill={entry.color} className="transition-all duration-300" />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function SleepChartCard({
  weeklyChartData,
  sleepTarget,
  sleepView,
  onViewChange,
}: {
  weeklyChartData: {
    day: string;
    hours: number;
    quality: number;
    color: string;
    hasData: boolean;
  }[];
  sleepTarget: number;
  sleepView: 'daily' | 'weekly';
  onViewChange: (v: 'daily' | 'weekly') => void;
}) {
  return (
    <div className="surface-card p-6 md:p-8 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-white text-lg">Sleep Trend</h3>
        <div
          className="flex gap-1 p-0.5 bg-white/5 rounded-xl"
          role="tablist"
          aria-label="Sleep view toggle"
        >
          {(['daily', 'weekly'] as const).map((v) => (
            <button
              key={v}
              role="tab"
              aria-selected={sleepView === v}
              onClick={() => onViewChange(v)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                sleepView === v
                  ? 'bg-[#E2FF6F] text-black shadow-sm'
                  : 'text-white/40 hover:text-white'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
      {weeklyChartData.some((d) => d.hasData) ? (
        <WeeklyChart data={weeklyChartData} sleepTarget={sleepTarget} />
      ) : (
        <div className="h-[220px] flex items-center justify-center text-white/30 text-sm">
          No data this week
        </div>
      )}
    </div>
  );
}

function SleepInsightCard({
  insights,
}: {
  insights: { type: InsightType; title: string; description: string }[];
}) {
  if (insights.length === 0) return null;

  return (
    <motion.div variants={itemVariants} className="surface-card p-6 md:p-8 space-y-5">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#C8B6FF]/20 to-[#E2FF6F]/20 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-[#E2FF6F]" />
        </div>
        <h3 className="font-bold text-white text-lg">AI Sleep Insights</h3>
      </div>
      <div className="space-y-3">
        {insights.map((insight, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`flex gap-3 p-4 rounded-2xl border ${InsightBg({ type: insight.type })}`}
          >
            <div className="mt-0.5 shrink-0">
              <InsightIcon type={insight.type} />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white">{insight.title}</h4>
              <p className="text-xs text-white/60 leading-relaxed">{insight.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function TrackingTab({
  sleepProgress,
  sleepMetrics,
  weeklyChartData,
  sleepInsights,
  sleepView,
  sleepTarget,
  onViewChange,
  onLogSleep,
}: {
  sleepProgress: {
    displayHours: number;
    displayMinutes: number;
    score: number;
    progressPercent: number;
    recordCount: number;
  };
  sleepMetrics: { consistency: number; daysLogged: number };
  weeklyChartData: {
    day: string;
    hours: number;
    quality: number;
    color: string;
    hasData: boolean;
  }[];
  sleepInsights: { type: InsightType; title: string; description: string }[];
  sleepView: 'daily' | 'weekly';
  sleepTarget: number;
  onViewChange: (v: 'daily' | 'weekly') => void;
  onLogSleep: () => void;
}) {
  return (
    <motion.div
      key="tracking"
      variants={tabVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.25 }}
      className="space-y-6"
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        <motion.div variants={itemVariants} className="surface-card p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="font-bold text-white text-lg">Sleep Progress</h3>
              <p className="text-xs text-white/40">
                {sleepView === 'daily' ? "Today's sleep" : 'Weekly average'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/30">{sleepMetrics.daysLogged}/7 days</span>
            </div>
          </div>

          <SleepProgressBar percent={sleepProgress.progressPercent} />

          <SleepStatsGrid
            displayHours={sleepProgress.displayHours}
            displayMinutes={sleepProgress.displayMinutes}
            score={sleepProgress.score}
            sleepTarget={sleepTarget}
          />

          <motion.div variants={itemVariants}>
            <Button
              onClick={onLogSleep}
              variant="outline"
              className="border-[#E2FF6F]/30 text-[#E2FF6F] hover:bg-[#E2FF6F]/10 hover:border-[#E2FF6F]/50 rounded-xl w-full sm:w-auto"
            >
              <Plus className="w-4 h-4 mr-2" /> Log Sleep
            </Button>
          </motion.div>
        </motion.div>

        <SleepChartCard
          weeklyChartData={weeklyChartData}
          sleepTarget={sleepTarget}
          sleepView={sleepView}
          onViewChange={onViewChange}
        />

        <SleepInsightCard insights={sleepInsights} />

        <SleepHistoryList />
      </motion.div>
    </motion.div>
  );
}

function MusicTab({
  music,
  playingTrackId,
  onPlayTrack,
}: {
  music: SleepMusicTrack[];
  playingTrackId: string | null;
  onPlayTrack: (id: string | null) => void;
}) {
  const currentTrack = music.find((m) => m._id === playingTrackId);

  return (
    <motion.div
      key="music"
      variants={tabVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.25 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C8B6FF]/20 to-[#E2FF6F]/10 flex items-center justify-center">
          <Music className="w-5 h-5 text-[#C8B6FF]" />
        </div>
        <div>
          <h3 className="font-bold text-white text-lg">Sleep Music Library</h3>
          <p className="text-xs text-white/40">Calming tracks for deep rest</p>
        </div>
      </div>

      {currentTrack?.audioUrl && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="surface-card p-4 flex items-center gap-4 border-[#C8B6FF]/20"
        >
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onPlayTrack(null)}
            className="rounded-full shrink-0 text-[#C8B6FF] hover:bg-[#C8B6FF]/10"
          >
            <Moon className="w-4 h-4" />
          </Button>
          <div className="flex-1 min-w-0">
            <audio controls autoPlay className="w-full h-9">
              <source src={currentTrack.audioUrl} type="audio/mpeg" />
            </audio>
          </div>
          <span className="text-sm font-medium text-white shrink-0 truncate max-w-[120px]">
            {currentTrack.title}
          </span>
        </motion.div>
      )}

      {music.length === 0 ? (
        <div className="surface-card p-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-white/[0.04] flex items-center justify-center mb-4">
            <Music className="w-7 h-7 text-white/20" />
          </div>
          <p className="text-white/40 text-sm">No music tracks available yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {music.map((m, i) => (
            <motion.div
              key={m._id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`surface-card p-5 text-center space-y-4 group hover:bg-white/[0.06] transition-all duration-300 cursor-pointer border-2 ${
                playingTrackId === m._id
                  ? 'border-[#C8B6FF]/40 bg-[#C8B6FF]/[0.04]'
                  : 'border-white/[0.06] hover:border-white/20'
              }`}
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#C8B6FF]/10 to-[#E2FF6F]/10 flex items-center justify-center mx-auto">
                <Music className="w-7 h-7 text-[#C8B6FF]" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-white text-base">{m.title}</h4>
                <p className="text-xs text-white/40 flex items-center justify-center gap-2">
                  <span>{m.category}</span>
                  <span className="w-1 h-1 rounded-full bg-white/20" />
                  <span>{m.bpm} BPM</span>
                </p>
              </div>
              <Button
                variant={playingTrackId === m._id ? 'primary' : 'outline'}
                size="sm"
                className={`w-full rounded-xl ${
                  playingTrackId === m._id
                    ? 'bg-[#C8B6FF] hover:bg-[#b8a6ff] text-black'
                    : 'border-white/[0.08] hover:bg-white/10 text-white'
                }`}
                onClick={() => onPlayTrack(playingTrackId === m._id ? null : m._id!)}
              >
                {playingTrackId === m._id ? (
                  <>
                    <Pause className="w-3.5 h-3.5 mr-1.5" /> Stop
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 mr-1.5" /> Play
                  </>
                )}
              </Button>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

function MixerTab({
  mixerVolumes,
  setVolume,
  mixerPlaying,
  togglePlay,
  stopAll,
  activeSoundIds,
}: {
  mixerVolumes: Record<SoundId, number>;
  setVolume: (id: SoundId, val: number) => void;
  mixerPlaying: boolean;
  togglePlay: () => void;
  stopAll: () => void;
  activeSoundIds: SoundId[];
}) {
  const mixerTip = useMemo(() => {
    if (activeSoundIds.length === 0)
      return 'Start mixing sounds to create your perfect sleep atmosphere.';
    const activeSounds = activeSoundIds.map((id) => soundAssets.find((s) => s.id === id)!);
    if (activeSounds.length === 1) {
      const s = activeSounds[0];
      return `${s.name} at ${mixerVolumes[s.id]}% promotes ${s.benefit}.`;
    }
    const names = activeSounds.map((s) => s.name).join(', ');
    return `Your blend of ${names} creates a ${
      activeSounds.length > 2 ? 'rich layered' : 'dual-layered'
    } soundscape for deep relaxation.`;
  }, [activeSoundIds, mixerVolumes]);

  return (
    <motion.div
      key="mixer"
      variants={tabVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.25 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400/20 to-blue-400/10 flex items-center justify-center">
            <Volume2 className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h3 className="font-bold text-white text-lg">Sound Mixer</h3>
            <p className="text-xs text-white/40">Create your perfect ambient atmosphere</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            size="icon"
            variant={mixerPlaying ? 'primary' : 'outline'}
            className={`rounded-full h-11 w-11 transition-all ${
              mixerPlaying
                ? 'bg-cyan-400 hover:bg-cyan-500 text-black shadow-lg shadow-cyan-400/30'
                : 'border-white/20 hover:bg-white/10 hover:border-cyan-400/40'
            }`}
            onClick={togglePlay}
            aria-label={mixerPlaying ? 'Pause mixer' : 'Play mixer'}
          >
            {mixerPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
          </Button>
          <Button variant="ghost" onClick={stopAll} className="text-white/40 hover:text-white">
            <VolumeX className="w-4 h-4 mr-1.5" /> Mute All
          </Button>
        </div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {soundAssets.map((sound, i) => {
          const vol = mixerVolumes[sound.id];
          const isActive = vol > 0 && mixerPlaying;
          return (
            <motion.div
              key={sound.id}
              variants={itemVariants}
              transition={{ delay: i * 0.04 }}
              className={`surface-card p-5 space-y-4 relative overflow-hidden transition-all duration-300 border-2 ${
                isActive
                  ? 'border-cyan-400/40 bg-cyan-400/[0.04]'
                  : 'border-white/[0.06] hover:border-white/20'
              }`}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${sound.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}
              />
              <div className="flex items-center justify-between relative z-10">
                <div className={`p-3 rounded-xl bg-white/[0.04] ${sound.color}`}>
                  <sound.icon className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-white/40 uppercase">
                  {vol > 0 ? (
                    <Volume2 className="w-3 h-3 text-cyan-400" />
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
                  onChange={(e) => setVolume(sound.id, parseInt(e.target.value))}
                  aria-label={`${sound.name} volume`}
                  aria-valuenow={vol}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-cyan-400 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-400 [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-cyan-400/30 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-cyan-400 [&::-moz-range-thumb]:border-0"
                />
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="surface-card p-5 flex items-center gap-4 border-cyan-500/20"
      >
        <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400 shrink-0">
          <Volume2 className="w-6 h-6" />
        </div>
        <div className="min-w-0">
          <h4 className="font-bold text-white text-sm">
            {activeSoundIds.length === 0 ? 'Getting Started' : 'Your Mix'}
          </h4>
          <p className="text-sm text-white/40 leading-relaxed">{mixerTip}</p>
        </div>
      </motion.div>
    </motion.div>
  );
}

function WellbeingTab({ wellbeing }: { wellbeing: WellbeingItem[] }) {
  return (
    <motion.div
      key="wellbeing"
      variants={tabVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.25 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E2FF6F]/20 to-[#C8B6FF]/10 flex items-center justify-center">
          <Eye className="w-5 h-5 text-[#E2FF6F]" />
        </div>
        <div>
          <h3 className="font-bold text-white text-lg">Digital Wellbeing</h3>
          <p className="text-xs text-white/40">Tips for healthier screen habits</p>
        </div>
      </div>

      {wellbeing.length === 0 ? (
        <div className="surface-card p-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-white/[0.04] flex items-center justify-center mb-4">
            <Eye className="w-7 h-7 text-white/20" />
          </div>
          <p className="text-white/40 text-sm">No wellbeing tips available yet</p>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          {wellbeing.map((item, i) => (
            <motion.div
              key={item._id}
              variants={itemVariants}
              transition={{ delay: i * 0.04 }}
              className="surface-card p-5 space-y-3 hover:border-[#E2FF6F]/30 transition-all group"
            >
              <div className="w-10 h-10 rounded-full bg-[#E2FF6F]/10 flex items-center justify-center">
                {item.iconName === 'Moon' ? (
                  <Moon className="w-5 h-5 text-[#E2FF6F]" />
                ) : (
                  <Eye className="w-5 h-5 text-[#E2FF6F]" />
                )}
              </div>
              <h4 className="font-bold text-white">{item.title}</h4>
              <p className="text-sm text-white/50 leading-relaxed">{item.description}</p>
            </motion.div>
          ))}
        </motion.div>
      )}

      <motion.div variants={itemVariants} className="surface-card p-6 border-[#E2FF6F]/15">
        <h4 className="font-bold text-white mb-4 flex items-center gap-2">
          <ListChecks className="w-4 h-4 text-[#E2FF6F]" /> Screen Time Strategy
        </h4>
        <ul className="space-y-3 text-sm text-white/50">
          <li className="flex items-center gap-3">
            <ChevronRight className="w-4 h-4 text-[#E2FF6F] shrink-0" /> Charge phone outside
            bedroom
          </li>
          <li className="flex items-center gap-3">
            <ChevronRight className="w-4 h-4 text-[#E2FF6F] shrink-0" /> Use traditional alarm clock
          </li>
          <li className="flex items-center gap-3">
            <ChevronRight className="w-4 h-4 text-[#E2FF6F] shrink-0" /> Replace scrolling with 15m
            reading
          </li>
          <li className="flex items-center gap-3">
            <ChevronRight className="w-4 h-4 text-[#E2FF6F] shrink-0" /> Enable blue light filter
            after sunset
          </li>
        </ul>
      </motion.div>
    </motion.div>
  );
}

function Sidebar({
  sleepMetrics,
  sleepInsights,
}: {
  sleepMetrics: {
    consistency: number;
    extraHours: number;
    daysLogged: number;
    thisWeekAvg: number;
    lastWeekAvg: number;
  };
  sleepInsights: { type: InsightType; title: string; description: string }[];
}) {
  return (
    <aside className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="surface-card p-6 border-[#E2FF6F]/15 space-y-5"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-white">Weekly Goal</h3>
          <Award className="w-5 h-5 text-[#E2FF6F]" />
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/50 flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-[#E2FF6F]" /> Consistency
            </span>
            <span className="text-white font-bold tabular-nums">{sleepMetrics.consistency}%</span>
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[#C8B6FF] to-[#E2FF6F] rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${sleepMetrics.consistency}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
          <p className="text-[11px] text-white/40">
            {sleepMetrics.daysLogged} of 7 days logged this week
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="surface-card p-6 space-y-4"
      >
        <h4 className="text-xs font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
          <Moon className="w-3.5 h-3.5" /> Sleep Tips
        </h4>
        <ul className="space-y-3">
          {sleepTips.map((tip, i) => (
            <li key={i} className="flex gap-3 text-xs text-white/50 group">
              <span className="text-sm shrink-0 w-5 text-center">{tip.icon}</span>
              <p className="leading-relaxed">{tip.text}</p>
            </li>
          ))}
        </ul>
      </motion.div>

      {sleepInsights.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16 }}
          className="surface-card p-6 space-y-4"
        >
          <h4 className="text-xs font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
            <Activity className="w-3.5 h-3.5" /> Quick Insights
          </h4>
          <div className="space-y-3">
            {sleepInsights.slice(0, 2).map((insight, i) => (
              <div
                key={i}
                className={`flex gap-2.5 p-3 rounded-xl border ${InsightBg({ type: insight.type })}`}
              >
                <InsightIcon type={insight.type} />
                <p className="text-xs text-white/60 leading-relaxed">{insight.description}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </aside>
  );
}

function LoadingSkeleton() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center gap-6">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
      >
        <Moon className="w-10 h-10 text-[#E2FF6F]/60" />
      </motion.div>
      <div className="text-center space-y-2">
        <p className="text-white/40 font-medium animate-pulse">Preparing your sanctuary...</p>
        <p className="text-white/20 text-xs">Loading sleep data</p>
      </div>
    </div>
  );
}

export default function SleepPage() {
  const [activeTab, setActiveTab] = useState<'tracking' | 'music' | 'mixer' | 'wellbeing'>(
    'tracking'
  );
  const [sleepView, setSleepView] = useState<'daily' | 'weekly'>('daily');
  const [sleepTarget] = useState(8);
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

  const store = useStore();
  const mixer = useSoundMixer();
  const { sleepMetrics, sleepProgress, weeklyChartData, sleepInsights } = useSleepMetrics(
    sleepView,
    sleepTarget
  );

  const fetchData = async () => {
    setLoading(true);
    try {
      const [musicRes, wellbeingRes] = await Promise.all([
        fetch('/api/sleep/music'),
        fetch('/api/sleep/wellbeing'),
      ]);
      if (musicRes.ok) setMusic(await musicRes.json());
      if (wellbeingRes.ok) setWellbeing(await wellbeingRes.json());
    } catch (err) {
      console.error('Failed to fetch sleep data', err);
      toast.error('Failed to load sleep data');
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
    toast.success('Sleep entry saved');
  };

  const handleLogSleep = () => {
    setLogDate(format(new Date(), 'yyyy-MM-dd'));
    setLogDuration(7);
    setLogQuality(3);
    setShowLogForm(true);
  };

  if (loading) return <LoadingSkeleton />;

  return (
    <main id="main-content" className="p-4 md:p-8 max-w-6xl mx-auto space-y-8 relative">
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10"
      >
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-[#E2FF6F]">
            <Moon className="w-6 h-6" />
            <span className="text-sm font-bold uppercase tracking-[0.15em]">
              Sleep &amp; Sound Wellness
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
            Rest &amp; Recovery
          </h1>
          <p className="text-white/40 text-base">
            Track sleep, mix ambient sounds, and discover calming music.
          </p>
        </div>
      </motion.header>

      <div
        className="flex gap-1 p-1 bg-white/[0.04] rounded-2xl border border-white/[0.06] overflow-x-auto no-scrollbar"
        role="tablist"
        aria-label="Sleep page sections"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 md:px-5 py-2.5 rounded-xl text-sm font-bold capitalize transition-all duration-200 whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-[#E2FF6F] text-black shadow-sm'
                : 'text-white/40 hover:text-white hover:bg-white/[0.03]'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence mode="wait">
            {showLogForm && (
              <motion.div
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
              >
                <SleepLogForm
                  logDate={logDate}
                  logDuration={logDuration}
                  logQuality={logQuality}
                  saving={saving}
                  saved={saved}
                  onDateChange={setLogDate}
                  onDurationChange={setLogDuration}
                  onQualityChange={setLogQuality}
                  onSave={handleSaveSleep}
                  onCancel={() => setShowLogForm(false)}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {activeTab === 'tracking' && sleepProgress.recordCount === 0 && !showLogForm ? (
            <EmptySleepState onLogSleep={handleLogSleep} />
          ) : (
            <>
              {activeTab === 'tracking' && (
                <TrackingTab
                  sleepProgress={sleepProgress}
                  sleepMetrics={sleepMetrics}
                  weeklyChartData={weeklyChartData}
                  sleepInsights={sleepInsights}
                  sleepView={sleepView}
                  sleepTarget={sleepTarget}
                  onViewChange={setSleepView}
                  onLogSleep={handleLogSleep}
                />
              )}
            </>
          )}

          {activeTab === 'music' && (
            <MusicTab
              music={music}
              playingTrackId={playingTrackId}
              onPlayTrack={setPlayingTrackId}
            />
          )}

          {activeTab === 'mixer' && (
            <MixerTab
              mixerVolumes={mixer.mixerVolumes}
              setVolume={mixer.setVolume}
              mixerPlaying={mixer.mixerPlaying}
              togglePlay={mixer.togglePlay}
              stopAll={mixer.stopAll}
              activeSoundIds={mixer.activeSoundIds}
            />
          )}

          {activeTab === 'wellbeing' && <WellbeingTab wellbeing={wellbeing} />}
        </div>

        <Sidebar sleepMetrics={sleepMetrics} sleepInsights={sleepInsights} />
      </div>
    </main>
  );
}
