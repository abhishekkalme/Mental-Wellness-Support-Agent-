'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useStore } from '@/store/useStore';
import {
  Play,
  Square,
  RotateCcw,
  BarChart3,
  ChevronLeft,
  Timer,
  Wind,
  Fingerprint,
  CheckCircle2,
} from 'lucide-react';
import { isSameDay, format, subDays } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';

type Pattern = { name: string; inhale: number; hold: number; exhale: number; holdEmpty: number };

const presets: Pattern[] = [
  { name: 'Box Breathing', inhale: 4, hold: 4, exhale: 4, holdEmpty: 4 },
  { name: 'Relaxing (4-7-8)', inhale: 4, hold: 7, exhale: 8, holdEmpty: 0 },
  { name: 'Equal Breathing', inhale: 5, hold: 0, exhale: 5, holdEmpty: 0 },
  { name: 'Extended Exhale', inhale: 4, hold: 2, exhale: 6, holdEmpty: 0 },
];

type View = 'menu' | 'session' | 'stats' | 'quick-exercise';

const pageVariants = {
  enter: { opacity: 0, x: 20 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

export default function BreathingPage() {
  const store = useStore();
  const [mode, setMode] = useState<View>('menu');
  const [activePattern, setActivePattern] = useState<Pattern>(presets[0]);
  const [isRunning, setIsRunning] = useState(false);
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale' | 'holdEmpty'>('inhale');
  const [timer, setTimer] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [activeQuickExercise, setActiveQuickExercise] = useState<'breathing' | 'grounding' | null>(
    null
  );
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const weeklyData = useMemo(
    () =>
      Array.from({ length: 7 }).map((_, i) => {
        const d = subDays(new Date(), 6 - i);
        const dayRecords = store.breathingHistory.filter((r) => isSameDay(new Date(r.date), d));
        const totalMins = dayRecords.reduce((acc, r) => acc + r.durationSeconds, 0) / 60;
        return { name: format(d, 'EEE'), mins: Math.round(totalMins) };
      }),
    [store.breathingHistory]
  );

  const totalMinutes = useMemo(
    () => Math.round(store.breathingHistory.reduce((acc, r) => acc + r.durationSeconds, 0) / 60),
    [store.breathingHistory]
  );

  const todayMinutes = useMemo(
    () =>
      Math.round(
        store.breathingHistory
          .filter((r) => isSameDay(new Date(r.date), new Date()))
          .reduce((acc, r) => acc + r.durationSeconds, 0) / 60
      ),
    [store.breathingHistory]
  );

  const avgSessionMinutes = useMemo(() => {
    if (!store.breathingHistory.length) return 0;
    return Math.round(
      store.breathingHistory.reduce((acc, r) => acc + r.durationSeconds, 0) /
        store.breathingHistory.length /
        60
    );
  }, [store.breathingHistory]);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimer((p) => p + 1);
        setTotalSeconds((s) => s + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  useEffect(() => {
    if (!isRunning) return;
    const currentLimit = activePattern[phase];
    if (timer >= currentLimit && currentLimit > 0) {
      setTimer(0);
      switch (phase) {
        case 'inhale':
          setPhase(activePattern.hold > 0 ? 'hold' : 'exhale');
          break;
        case 'hold':
          setPhase('exhale');
          break;
        case 'exhale':
          setPhase(activePattern.holdEmpty > 0 ? 'holdEmpty' : 'inhale');
          break;
        case 'holdEmpty':
          setPhase('inhale');
          break;
      }
    } else if (currentLimit === 0) {
      setTimer(0);
      if (phase === 'hold') setPhase('exhale');
      if (phase === 'holdEmpty') setPhase('inhale');
    }
  }, [timer, isRunning, phase, activePattern]);

  const stopSession = () => {
    setIsRunning(false);
    if (totalSeconds > 10) {
      store.addBreathingRecord({
        id: Date.now().toString(),
        date: new Date().toISOString(),
        durationSeconds: totalSeconds,
        pattern: activePattern.name,
      });
    }
    setTotalSeconds(0);
    setTimer(0);
    setPhase('inhale');
    setMode('menu');
  };

  const quickExercises = [
    {
      key: 'breathing',
      icon: Wind,
      colorClass: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      title: '4-7-8 Breathing',
      desc: 'A proven technique to reduce anxiety and help you relax or sleep.',
      completed: store.completedExercises.includes('breathing'),
    },
    {
      key: 'grounding',
      icon: Fingerprint,
      colorClass: 'bg-[#C8B6FF]/10 text-[#C8B6FF] border-[#C8B6FF]/20',
      title: '5-4-3-2-1 Grounding',
      desc: 'Engage your senses to quickly anchor yourself in the present moment.',
      completed: store.completedExercises.includes('grounding'),
    },
  ];

  return (
    <main
      id="main-content"
      className="p-4 md:p-8 max-w-5xl mx-auto min-h-[80vh] flex flex-col relative"
      role="main"
      aria-label="Breathing exercises and wellness tools"
    >
      <AnimatePresence mode="wait">
        {mode === 'menu' && (
          <motion.div
            key="menu"
            variants={pageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.2 }}
            className="space-y-8 relative z-10"
          >
            <motion.header variants={itemVariants}>
              <div className="flex items-center gap-3 text-[#E2FF6F] mb-2">
                <Wind className="w-5 h-5" />
                <span className="text-xs md:text-sm font-bold uppercase tracking-widest">
                  Mindfulness Hub
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
                Breathe &amp; Recenter
              </h1>
              <p className="text-white/70 mt-2 text-lg">
                Regulate your nervous system with guided cycles and quick wellness exercises.
              </p>
            </motion.header>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <motion.div variants={itemVariants} className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-white/60 pl-1">
                  Guided Breathing Sessions
                </h3>
                <div className="grid gap-3" role="list" aria-label="Breathing patterns">
                  {presets.map((p, i) => (
                    <motion.button
                      key={p.name}
                      variants={itemVariants}
                      transition={{ delay: i * 0.05 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setActivePattern(p);
                        setMode('session');
                        setIsRunning(true);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setActivePattern(p);
                          setMode('session');
                          setIsRunning(true);
                        }
                      }}
                      role="listitem"
                      aria-label={`${p.name} breathing pattern: ${p.inhale} inhale, ${p.hold} hold, ${p.exhale} exhale, ${p.holdEmpty} hold empty`}
                      className="surface-interactive p-6 text-left flex items-center justify-between border-white/[0.06]"
                    >
                      <div>
                        <h4 className="font-bold text-lg text-white">{p.name}</h4>
                        <p className="text-xs text-white/60 mt-1">
                          {p.inhale}-{p.hold}-{p.exhale}-{p.holdEmpty}
                        </p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-white/[0.04] group-hover:bg-[#E2FF6F]/10 flex items-center justify-center transition-all">
                        <Play
                          className="w-5 h-5 text-white/50 group-hover:text-[#E2FF6F] transition-colors ml-0.5"
                          aria-hidden="true"
                        />
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-4">
                <motion.div variants={itemVariants} className="surface-card p-6 space-y-4">
                  <BarChart3 className="w-7 h-7 text-[#E2FF6F]" />
                  <h3 className="text-lg font-bold text-white">Analytics</h3>
                  <p className="text-sm text-white/70">
                    Track your consistency and total mindfulness minutes.
                  </p>
                  <Button
                    variant="outline"
                    className="w-full border-white/[0.08] hover:bg-white/10 text-white"
                    onClick={() => setMode('stats')}
                  >
                    View Progress
                  </Button>
                </motion.div>

                <motion.div variants={itemVariants} className="surface-card p-6 space-y-4">
                  <h3 className="text-lg font-bold text-white">Quick Exercises</h3>
                  <p className="text-sm text-white/70">
                    Fast techniques for anxiety relief and grounding.
                  </p>
                  <Button
                    variant="outline"
                    className="w-full border-white/[0.08] hover:bg-white/10 text-white"
                    onClick={() => setMode('quick-exercise')}
                  >
                    Quick Exercises
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}

        {mode === 'session' && (
          <motion.div
            key="session"
            variants={pageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.2 }}
            role="dialog"
            aria-modal="true"
            aria-label={`${activePattern.name} breathing session`}
            className="flex-1 flex flex-col items-center justify-center text-center space-y-10 py-12 relative z-10"
          >
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-white">{activePattern.name}</h2>
              <motion.p
                key={phase}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[#E2FF6F] font-bold uppercase tracking-[0.2em]"
                aria-live="polite"
                aria-atomic="true"
              >
                {phase}
              </motion.p>
            </div>

            <div
              className="relative flex items-center justify-center py-12"
              role="status"
              aria-label={`Breathing phase: ${phase}, ${activePattern[phase] - timer} seconds remaining`}
            >
              <motion.div
                animate={{
                  scale: !isRunning ? 1 : phase === 'inhale' || phase === 'hold' ? 1.15 : 0.92,
                }}
                transition={{
                  duration:
                    phase === 'inhale'
                      ? Math.max(0.5, activePattern.inhale)
                      : phase === 'hold'
                        ? Math.max(0.5, activePattern.hold)
                        : phase === 'exhale'
                          ? Math.max(0.5, activePattern.exhale)
                          : Math.max(0.5, activePattern.holdEmpty),
                  ease: 'easeInOut',
                }}
                className="w-48 h-48 rounded-full bg-gradient-to-br from-[#E2FF6F]/20 to-[#E2FF6F]/5 border-2 border-[#E2FF6F]/30 flex items-center justify-center relative shadow-2xl shadow-[#E2FF6F]/10"
              >
                <span
                  className="text-4xl font-bold text-[#E2FF6F] relative z-10 tabular-nums"
                  aria-hidden="true"
                >
                  {activePattern[phase] - timer}
                </span>
              </motion.div>
            </div>

            <div className="space-y-6">
              <p className="text-white/50 italic">Try to relax your shoulders and belly.</p>
              <div className="flex gap-4 justify-center">
                <Button
                  size="icon"
                  variant="outline"
                  className="h-14 w-14 rounded-full border-white/[0.15] hover:bg-white/10 hover:border-white/30"
                  onClick={() => setIsRunning(!isRunning)}
                  aria-label={isRunning ? 'Pause breathing session' : 'Resume breathing session'}
                >
                  {isRunning ? (
                    <Square className="w-6 h-6 text-white" aria-hidden="true" />
                  ) : (
                    <Play className="w-6 h-6 ml-1 text-white" aria-hidden="true" />
                  )}
                </Button>
                <Button
                  size="icon"
                  className="h-14 w-14 rounded-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400"
                  variant="ghost"
                  onClick={stopSession}
                  aria-label="Stop and exit breathing session"
                >
                  <RotateCcw className="w-6 h-6" aria-hidden="true" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {mode === 'stats' && (
          <motion.div
            key="stats"
            variants={pageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.2 }}
            className="space-y-8 min-h-[500px] relative z-10"
          >
            <header className="flex items-center gap-4">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setMode('menu')}
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"
              >
                <ChevronLeft />
              </motion.button>
              <h2 className="text-3xl font-bold text-white">Progress Analytics</h2>
            </header>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-4 gap-4"
            >
              {[
                { icon: Timer, label: 'Total Time', value: totalMinutes, unit: 'mins' },
                {
                  icon: RotateCcw,
                  label: 'All-Time Sessions',
                  value: store.breathingHistory.length,
                  unit: '',
                },
                { icon: BarChart3, label: "Today's Total", value: todayMinutes, unit: 'mins' },
                { icon: Timer, label: 'Avg Session', value: avgSessionMinutes, unit: 'mins' },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  variants={itemVariants}
                  transition={{ delay: i * 0.05 }}
                  className="surface-card p-6 space-y-3"
                >
                  <div className="flex items-center gap-2 text-[#E2FF6F]">
                    <stat.icon className="w-5 h-5" />
                    <h4 className="font-semibold text-white/70 text-sm">{stat.label}</h4>
                  </div>
                  <p className="text-3xl font-bold text-white tabular-nums">
                    {stat.value}{' '}
                    {stat.unit && (
                      <span className="text-sm font-normal text-white/60">{stat.unit}</span>
                    )}
                  </p>
                </motion.div>
              ))}
            </motion.div>

            <motion.div variants={itemVariants} className="surface-card p-6 md:p-8 min-h-[350px]">
              <h3 className="font-bold text-white mb-6">Weekly Breath-Time Trends</h3>
              {weeklyData.every((d) => d.mins === 0) ? (
                <div className="h-[250px] flex flex-col items-center justify-center text-white/50 text-sm space-y-4">
                  <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-cyan-400" />
                  </div>
                  <p className="text-white/50 text-sm text-center max-w-xs">
                    Complete breathing sessions to see your weekly trends here
                  </p>
                  <button
                    onClick={() => setMode('menu')}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-bold text-sm hover:bg-cyan-500/20 transition-all"
                  >
                    <Play className="w-4 h-4" /> Start Breathing
                  </button>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={weeklyData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <XAxis
                      dataKey="name"
                      tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        background: '#0A0D08',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 12,
                        color: 'white',
                      }}
                      formatter={(value: any) => [`${value ?? 0} min`, 'Breathing']}
                    />
                    <Bar dataKey="mins" radius={[8, 8, 0, 0]}>
                      {weeklyData.map((_, index) => (
                        <Cell
                          key={`breath-${index}`}
                          fill={index === 6 ? '#22d3ee' : 'rgba(34,211,238,0.4)'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </motion.div>
          </motion.div>
        )}

        {mode === 'quick-exercise' && (
          <motion.div
            key="quick-exercise"
            variants={pageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.2 }}
            className="space-y-8 relative z-10"
          >
            <header className="flex items-center gap-4">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setMode('menu')}
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"
              >
                <ChevronLeft />
              </motion.button>
              <div>
                <h2 className="text-3xl font-bold text-white">Quick Exercises</h2>
                <p className="text-white/70 mt-1">
                  Fast techniques for anxiety relief and grounding.
                </p>
              </div>
            </header>

            <AnimatePresence mode="wait">
              {!activeQuickExercise && (
                <motion.div
                  key="grid"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8"
                >
                  {quickExercises.map((ex) => (
                    <motion.div
                      key={ex.key}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setActiveQuickExercise(ex.key as 'breathing' | 'grounding')}
                      className="surface-interactive p-8 rounded-2xl cursor-pointer border-white/[0.06] group relative overflow-hidden"
                    >
                      {ex.completed && (
                        <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg">
                          <CheckCircle2 className="w-4 h-4 text-black" />
                        </div>
                      )}
                      <div
                        className={`w-16 h-16 rounded-2xl ${ex.colorClass} flex items-center justify-center mb-6`}
                      >
                        <ex.icon className="w-8 h-8" />
                      </div>
                      <h3 className="text-xl font-semibold text-white">{ex.title}</h3>
                      <p className="text-white/70 mt-2 text-sm">{ex.desc}</p>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {activeQuickExercise === 'breathing' && (
                <QuickBreathingExercise
                  key="breathing"
                  onComplete={() => {
                    store.addExerciseCompletion('breathing');
                    setActiveQuickExercise(null);
                  }}
                  onBack={() => setActiveQuickExercise(null)}
                />
              )}

              {activeQuickExercise === 'grounding' && (
                <GroundingExercise
                  key="grounding"
                  onComplete={() => {
                    store.addExerciseCompletion('grounding');
                    setActiveQuickExercise(null);
                  }}
                  onBack={() => setActiveQuickExercise(null)}
                />
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

function QuickBreathingExercise({
  onComplete,
  onBack,
}: {
  onComplete: () => void;
  onBack: () => void;
}) {
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!playing) return;
    let timer: NodeJS.Timeout;
    if (phase === 'inhale') timer = setTimeout(() => setPhase('hold'), 4000);
    else if (phase === 'hold') timer = setTimeout(() => setPhase('exhale'), 7000);
    else if (phase === 'exhale') timer = setTimeout(() => setPhase('inhale'), 8000);
    return () => clearTimeout(timer);
  }, [phase, playing]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
      <div className="relative w-64 h-64 flex items-center justify-center">
        <motion.div
          className="absolute w-32 h-32 rounded-full blur-[2px] bg-cyan-400"
          animate={{
            scale: !playing ? 1 : phase === 'inhale' || phase === 'hold' ? 2 : 1,
            opacity: !playing ? 0.5 : phase === 'inhale' ? 1 : phase === 'hold' ? 0.8 : 0.5,
          }}
          transition={{
            duration: phase === 'inhale' ? 4 : phase === 'hold' ? 7 : phase === 'exhale' ? 8 : 1,
            ease: 'linear',
          }}
        />
        <div className="z-10 relative text-2xl font-semibold tracking-wide text-white font-mono surface-card px-5 py-2.5 rounded-full border border-white/10">
          {!playing ? 'Ready' : phase.toUpperCase()}
        </div>
      </div>
      <div className="mt-16 flex items-center gap-4">
        <Button
          onClick={() => setPlaying(!playing)}
          size="lg"
          className="bg-[#E2FF6F] text-black hover:bg-[#d4f056] rounded-2xl h-14 px-8 font-bold shadow-lg shadow-[#E2FF6F]/20"
        >
          {playing ? 'Pause' : 'Start Exercise'}
        </Button>
        <Button
          variant="outline"
          onClick={onBack}
          size="lg"
          className="border-white/20 hover:bg-white/10 rounded-2xl h-14 px-8"
        >
          Back
        </Button>
      </div>
    </div>
  );
}

function GroundingExercise({ onComplete, onBack }: { onComplete: () => void; onBack: () => void }) {
  const steps = [
    { num: 5, action: 'Acknowledge 5 things you can see around you.' },
    { num: 4, action: 'Acknowledge 4 things you can physically feel.' },
    { num: 3, action: 'Acknowledge 3 things you can hear.' },
    { num: 2, action: 'Acknowledge 2 things you can smell.' },
    { num: 1, action: 'Acknowledge 1 good thing about yourself.' },
  ];
  const [step, setStep] = useState(0);

  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center max-w-xl mx-auto py-12">
      <div className="surface-card p-10 md:p-14 w-full space-y-6">
        <motion.div
          key={step}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-20 h-20 rounded-full bg-[#E2FF6F]/15 text-[#E2FF6F] text-3xl font-bold flex items-center justify-center mx-auto shadow-lg shadow-[#E2FF6F]/10"
        >
          {steps[step].num}
        </motion.div>
        <motion.h2
          key={`text-${step}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xl md:text-2xl font-semibold text-white leading-snug"
        >
          {steps[step].action}
        </motion.h2>
        <p className="text-white/60 text-sm">Take your time. Take a deep breath.</p>
        <div className="pt-6 flex gap-4 justify-center flex-wrap">
          {step < 4 ? (
            <Button
              size="lg"
              onClick={() => setStep((s) => s + 1)}
              className="bg-[#E2FF6F] text-black hover:bg-[#d4f056] rounded-2xl h-14 px-8 font-bold shadow-lg shadow-[#E2FF6F]/20"
            >
              Next Step
            </Button>
          ) : (
            <Button
              size="lg"
              onClick={onComplete}
              className="bg-emerald-500 text-white hover:bg-emerald-600 rounded-2xl h-14 px-8 font-bold shadow-lg shadow-emerald-500/20"
            >
              Complete
            </Button>
          )}
          <Button
            variant="outline"
            onClick={onBack}
            size="lg"
            className="border-white/20 hover:bg-white/10 rounded-2xl h-14 px-8"
          >
            Back
          </Button>
        </div>
      </div>
    </div>
  );
}
