'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { useStore } from '@/store/useStore';
import { Settings2, Play, Square, RotateCcw, BarChart3, ChevronLeft, Timer } from 'lucide-react';
import { isSameDay } from 'date-fns';

const BreathingChart = lazy(() => import('@/components/charts/BreathingChart'));

type Pattern = {
  name: string;
  inhale: number;
  hold: number;
  exhale: number;
  holdEmpty: number;
};

const presets: Pattern[] = [
  { name: 'Box Breathing', inhale: 4, hold: 4, exhale: 4, holdEmpty: 4 },
  { name: 'Relaxing (4-7-8)', inhale: 4, hold: 7, exhale: 8, holdEmpty: 0 },
  { name: 'Equal Breathing', inhale: 5, hold: 0, exhale: 5, holdEmpty: 0 },
  { name: 'Extended Exhale', inhale: 4, hold: 2, exhale: 6, holdEmpty: 0 },
];

export default function BreathingPage() {
  const store = useStore();
  const [mode, setMode] = useState<'menu' | 'session' | 'builder' | 'stats'>('menu');
  const [activePattern, setActivePattern] = useState<Pattern>(presets[0]);
  const [isRunning, setIsRunning] = useState(false);
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale' | 'holdEmpty'>('inhale');
  const [timer, setTimer] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimer((prev) => prev + 1);
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
      // Skip phases with 0 duration
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

  // Prepare stats data
  // Stats data is now computed inside BreathingChart component

  return (
    <main
      id="main-content"
      className="p-8 max-w-5xl mx-auto min-h-[80vh] flex flex-col"
      role="main"
      aria-label="Breathing exercises and analytics"
    >
      <AnimatePresence mode="wait">
        {mode === 'menu' && (
          <motion.div
            key="menu"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <header>
              <h1 className="text-4xl font-bold tracking-tight">Breathing Suite</h1>
              <p className="text-muted-foreground mt-2 text-lg">
                Regulate your nervous system with guided cycles.
              </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground pl-1">
                  Patterns
                </h3>
                <div className="grid gap-3" role="list" aria-label="Breathing patterns">
                  {presets.map((p) => (
                    <button
                      key={p.name}
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
                      className="glass-panel p-6 text-left hover:border-primary/50 transition-all flex items-center justify-between group"
                    >
                      <div>
                        <h4 className="font-bold text-lg">{p.name}</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {p.inhale}-{p.hold}-{p.exhale}-{p.holdEmpty}
                        </p>
                      </div>
                      <Play
                        className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors"
                        aria-hidden="true"
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <div className="glass-panel p-8 bg-primary/5 border-primary/20 space-y-4">
                  <Settings2 className="w-8 h-8 text-primary" />
                  <h3 className="text-xl font-bold">Custom Builder</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Design your own inhales, holds, and exhales to perfectly match your lung
                    capacity and comfort.
                  </p>
                  <Button variant="outline" className="w-full" onClick={() => setMode('builder')}>
                    Enter Builder
                  </Button>
                </div>

                <div className="glass-panel p-8 space-y-4">
                  <BarChart3 className="w-8 h-8 text-blue-500" />
                  <h3 className="text-xl font-bold">Analytics</h3>
                  <p className="text-sm text-muted-foreground">
                    Track your consistency and total mindfulness minutes.
                  </p>
                  <Button variant="outline" className="w-full" onClick={() => setMode('stats')}>
                    View Progress
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {mode === 'session' && (
          <motion.div
            key="session"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-label={`${activePattern.name} breathing session`}
            className="flex-1 flex flex-col items-center justify-center text-center space-y-12 py-12"
          >
            <div className="space-y-2">
              <h2 className="text-3xl font-bold">{activePattern.name}</h2>
              <p
                className="text-primary font-bold uppercase tracking-[0.2em]"
                aria-live="polite"
                aria-atomic="true"
              >
                {phase}
              </p>
            </div>

            <div
              className="relative flex items-center justify-center scale-150 py-12"
              role="status"
              aria-label={`Breathing phase: ${phase}, ${activePattern[phase] - timer} seconds remaining`}
            >
              <motion.div
                animate={{
                  scale:
                    phase === 'inhale'
                      ? 1.5
                      : phase === 'exhale'
                        ? 1
                        : phase === 'hold'
                          ? 1.5
                          : phase === 'holdEmpty'
                            ? 1
                            : 1,
                  opacity: phase === 'inhale' ? 1 : 0.6,
                }}
                transition={{ duration: activePattern[phase] || 1, ease: 'easeInOut' }}
                className="w-48 h-48 rounded-full bg-primary/20 border-2 border-primary/40 flex items-center justify-center relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-primary/5 animate-pulse" />
                <span className="text-4xl font-bold text-primary relative z-10" aria-hidden="true">
                  {activePattern[phase] - timer}
                </span>
              </motion.div>
            </div>

            <div className="space-y-6">
              <p className="text-muted-foreground italic">Try to relax your shoulders and belly.</p>
              <div className="flex gap-4">
                <Button
                  size="icon"
                  variant="outline"
                  className="h-14 w-14 rounded-full"
                  onClick={() => setIsRunning(!isRunning)}
                  aria-label={isRunning ? 'Pause breathing session' : 'Resume breathing session'}
                >
                  {isRunning ? (
                    <Square className="w-6 h-6" aria-hidden="true" />
                  ) : (
                    <Play className="w-6 h-6 ml-1" aria-hidden="true" />
                  )}
                </Button>
                <Button
                  size="icon"
                  variant="destructive"
                  className="h-14 w-14 rounded-full"
                  onClick={stopSession}
                  aria-label="Stop and exit breathing session"
                >
                  <RotateCcw className="w-6 h-6" aria-hidden="true" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {mode === 'builder' && (
          <motion.div
            key="builder"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8 max-w-xl mx-auto w-full"
          >
            <header className="flex items-center gap-4">
              <button
                onClick={() => setMode('menu')}
                aria-label="Back to breathing menu"
                className="p-2 hover:bg-secondary rounded-full transition-colors"
              >
                <ChevronLeft aria-hidden="true" />
              </button>
              <h2 className="text-3xl font-bold">Custom Builder</h2>
            </header>

            <div className="glass-panel p-8 space-y-8">
              {[
                { label: 'Inhale', key: 'inhale' },
                { label: 'Hold (Full)', key: 'hold' },
                { label: 'Exhale', key: 'exhale' },
                { label: 'Hold (Empty)', key: 'holdEmpty' },
              ].map((field) => (
                <div key={field.key} className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label htmlFor={`breathing-${field.key}`} className="text-sm font-medium">
                      {field.label}
                    </label>
                    <span className="text-primary font-bold">
                      {activePattern[field.key as keyof Pattern]}s
                    </span>
                  </div>
                  <input
                    id={`breathing-${field.key}`}
                    type="range"
                    min="0"
                    max="15"
                    value={activePattern[field.key as keyof Pattern]}
                    onChange={(e) =>
                      setActivePattern({
                        ...activePattern,
                        name: 'Custom',
                        [field.key]: parseInt(e.target.value),
                      })
                    }
                    aria-label={`${field.label} duration in seconds`}
                    className="w-full accent-primary h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              ))}

              <Button
                className="w-full"
                size="lg"
                onClick={() => {
                  setMode('session');
                  setIsRunning(true);
                }}
              >
                Start Custom Session
              </Button>
            </div>
          </motion.div>
        )}

        {mode === 'stats' && (
          <motion.div
            key="stats"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8 min-h-[500px]"
          >
            <header className="flex items-center gap-4">
              <button
                onClick={() => setMode('menu')}
                className="p-2 hover:bg-secondary rounded-full transition-colors"
              >
                <ChevronLeft />
              </button>
              <h2 className="text-3xl font-bold">Progress Analytics</h2>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass-panel p-6 space-y-4">
                <div className="flex items-center gap-2 text-primary">
                  <Timer className="w-5 h-5" />
                  <h4 className="font-semibold">Total Time</h4>
                </div>
                <p className="text-3xl font-bold">
                  {Math.round(
                    store.breathingHistory.reduce((acc, r) => acc + r.durationSeconds, 0) / 60
                  )}{' '}
                  <span className="text-sm font-normal text-muted-foreground">mins</span>
                </p>
              </div>

              <div className="glass-panel p-6 space-y-4">
                <div className="flex items-center gap-2 text-primary">
                  <RotateCcw className="w-5 h-5" />
                  <h4 className="font-semibold">All-Time Sessions</h4>
                </div>
                <p className="text-3xl font-bold">{store.breathingHistory.length}</p>
              </div>

              <div className="glass-panel p-6 space-y-4">
                <div className="flex items-center gap-2 text-primary">
                  <BarChart3 className="w-5 h-5" />
                  <h4 className="font-semibold">Today&apos;s Total</h4>
                </div>
                <p className="text-3xl font-bold">
                  {Math.round(
                    store.breathingHistory
                      .filter((r) => isSameDay(new Date(r.date), new Date()))
                      .reduce((acc, r) => acc + r.durationSeconds, 0) / 60
                  )}{' '}
                  <span className="text-sm font-normal text-muted-foreground">mins</span>
                </p>
              </div>
            </div>

            <div className="glass-panel p-8 h-[350px]">
              <h3 className="font-bold mb-8">Weekly Breath-Time Trends</h3>
              <Suspense
                fallback={<div className="h-[80%] animate-pulse bg-secondary/20 rounded-xl" />}
              >
                <BreathingChart history={store.breathingHistory} />
              </Suspense>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
