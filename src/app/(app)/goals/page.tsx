'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import {
  Trophy,
  Plus,
  Target,
  Heart,
  Brain,
  Dumbbell,
  CheckCircle2,
  Trash2,
  ShieldCheck,
} from 'lucide-react';

export default function GoalsPage() {
  const store = useStore();
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCat, setNewCat] = useState<'wellness' | 'exercise' | 'meditation'>('wellness');
  const modalRef = useRef<HTMLDivElement>(null);
  const firstFocusRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showAdd && firstFocusRef.current) {
      firstFocusRef.current.focus();
    }
  }, [showAdd]);

  useEffect(() => {
    if (!showAdd) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowAdd(false);
      }
      if (e.key === 'Tab') {
        const focusable = modalRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable || focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showAdd]);

  const categories = [
    { id: 'wellness', icon: Heart, color: 'text-rose-500', label: 'Wellness' },
    { id: 'exercise', icon: Dumbbell, color: 'text-blue-500', label: 'Exercise' },
    { id: 'meditation', icon: Brain, color: 'text-emerald-500', label: 'Mind' },
  ];

  const handleAdd = () => {
    if (!newTitle.trim()) return;
    store.addGoal({
      id: Date.now().toString(),
      title: newTitle,
      category: newCat,
      completed: false,
    });
    setNewTitle('');
    setShowAdd(false);
  };

  const progress =
    store.goals.length === 0
      ? 0
      : Math.round((store.goals.filter((g) => g.completed).length / store.goals.length) * 100);

  return (
    <main className="p-12 max-w-7xl mx-auto space-y-16">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-10">
        <div className="space-y-4">
          <div className="flex items-center gap-4 text-[#E2FF6F] mb-2">
            <Trophy className="w-7 h-7" />
            <span className="text-xs font-bold uppercase tracking-[0.3em]">Ambition & Growth</span>
          </div>
          <h1 className="text-5xl font-bold tracking-tighter text-white">Focus & Milestones</h1>
          <p className="text-white/40 text-xl font-medium tracking-wide">
            Define your path to deep structural well-being.
          </p>
        </div>

        <Button
          onClick={() => setShowAdd(true)}
          aria-label="Create new goal objective"
          className="gap-3 rounded-[24px] h-16 px-10 bg-[#E2FF6F] hover:bg-[#d4f056] text-black font-bold text-lg shadow-xl shadow-[#E2FF6F]/10 transition-all active:scale-95"
        >
          <Plus className="w-6 h-6" /> Define Objective
        </Button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        <div className="lg:col-span-3 space-y-10">
          <div className="glass-panel p-10 flex flex-col md:flex-row items-center gap-12 bg-white/5 border-white/5 shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-[#E2FF6F]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

            <div className="relative w-40 h-40 flex items-center justify-center relative z-10">
              <svg className="w-full h-full -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="74"
                  stroke="white"
                  strokeOpacity="0.05"
                  strokeWidth="8"
                  fill="transparent"
                />
                <motion.circle
                  cx="80"
                  cy="80"
                  r="74"
                  stroke="#E2FF6F"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={464}
                  strokeDashoffset={464 - (464 * progress) / 100}
                  className="filter drop-shadow-[0_0_12px_rgba(226,255,111,0.4)] transition-all duration-1000"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-white tracking-tighter">{progress}%</span>
                <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mt-1">
                  Velocity
                </span>
              </div>
            </div>

            <div className="space-y-4 text-center md:text-left relative z-10">
              <h2 className="text-3xl font-bold text-white tracking-tight">Growth Trajectory</h2>
              <p className="text-white/40 text-lg font-medium max-w-md leading-relaxed">
                You have successfully operationalized{' '}
                {store.goals.filter((g) => g.completed).length} out of {store.goals.length}{' '}
                strategic wellness objectives.
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-4">
                {categories.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center gap-2.5 px-5 py-2.5 rounded-2xl bg-white/5 border border-white/5 text-[10px] font-bold uppercase tracking-[0.2em] text-white/60 hover:text-[#E2FF6F] hover:border-[#E2FF6F]/30 transition-all"
                  >
                    <c.icon className={`w-3.5 h-3.5 ${c.color}`} /> {c.label}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-6">
            {store.goals.length === 0 ? (
              <div className="p-24 text-center glass-panel border-white/5 border-dashed border-2 bg-white/[0.02] text-white/20 space-y-6 rounded-[48px]">
                <Target className="w-16 h-16 mx-auto opacity-10" />
                <p className="text-xl font-medium">
                  Your landscape is silent. What is your next mountaintop?
                </p>
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-full border-white/10 text-white/40 hover:text-white"
                  onClick={() => setShowAdd(true)}
                >
                  Define Initial Goal
                </Button>
              </div>
            ) : (
              store.goals.map((goal) => {
                const cat = categories.find((c) => c.id === goal.category)!;
                return (
                  <motion.div
                    key={goal.id}
                    layout
                    className={`glass-panel p-8 flex items-center justify-between group hover:border-[#E2FF6F]/20 transition-all duration-500 bg-white/5 border-white/5 shadow-2xl relative overflow-hidden ${goal.completed ? 'opacity-40 grayscale-[0.5]' : ''}`}
                  >
                    <div className="flex items-center gap-8 relative z-10">
                      <button
                        onClick={() => store.toggleGoal(goal.id)}
                        className={`w-10 h-10 rounded-2xl border-2 flex items-center justify-center transition-all duration-500 ${goal.completed ? 'bg-[#E2FF6F] border-[#E2FF6F] text-black shadow-[0_0_20px_rgba(226,255,111,0.3)]' : 'border-white/10 hover:border-[#E2FF6F]/50 group-hover:scale-110'}`}
                      >
                        {goal.completed && <CheckCircle2 className="w-6 h-6" />}
                      </button>
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <cat.icon className={`w-4 h-4 ${cat.color}`} />
                          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#E2FF6F]/40">
                            {cat.label}
                          </span>
                        </div>
                        <h4
                          className={`font-bold text-2xl tracking-tight transition-all duration-500 ${goal.completed ? 'line-through text-white/30' : 'text-white group-hover:translate-x-1'}`}
                        >
                          {goal.title}
                        </h4>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-10 group-hover:translate-x-0 relative z-10">
                      <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] whitespace-nowrap">
                        FEB 1 – FEB 7
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-12 w-12 rounded-2xl bg-white/5 text-white/20 hover:text-rose-500 hover:bg-rose-500/10 transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>

        <div className="space-y-10">
          <div className="glass-panel p-10 space-y-10 bg-white/5 border-white/5 shadow-2xl">
            <h3 className="font-bold text-2xl text-white tracking-tight flex items-center gap-4">
              <ShieldCheck className="w-7 h-7 text-[#E2FF6F]" /> Achievements
            </h3>
            <div className="grid grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="aspect-square rounded-3xl bg-white/5 border border-white/5 flex items-center justify-center text-4xl hover:bg-[#E2FF6F]/10 hover:border-[#E2FF6F]/20 transition-all cursor-help relative group overflow-hidden"
                >
                  <span className={i < 3 ? 'opacity-100' : 'opacity-10 grayscale'}>
                    {i < 3 ? '🏆' : '🔒'}
                  </span>
                  <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 bg-[#0A0C0B]/90 backdrop-blur-md transition-all duration-500 p-4 text-center pointer-events-none border border-[#E2FF6F]/20">
                    <p className="text-[10px] font-bold uppercase text-[#E2FF6F] tracking-widest">
                      Insignia {i}
                    </p>
                    <p className="text-[9px] font-medium leading-relaxed mt-2 text-white/60">
                      {i < 3 ? 'Structural Mind' : 'Defy 50% threshold'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel p-10 bg-[#E2FF6F]/5 border-[#E2FF6F]/10 space-y-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-125 transition-transform duration-1000">
              <Brain className="w-20 h-20 text-[#E2FF6F]" />
            </div>
            <h4 className="font-bold text-[#E2FF6F] text-lg tracking-[0.1em] uppercase">
              Growth Core
            </h4>
            <p className="text-sm leading-relaxed text-white/50 font-medium relative z-10">
              &quot;Your neural patterns indicate a 22% increase in focus persistence during
              meditation-heavy cycles. Elite adaptation in progress.&quot;
            </p>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showAdd && (
          <div
            className="fixed inset-0 bg-[#0A0C0B]/95 backdrop-blur-2xl z-50 flex items-center justify-center p-6"
            role="dialog"
            aria-modal="true"
            aria-label="Create new goal"
            aria-describedby="goal-modal-desc"
          >
            <div ref={modalRef}>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="glass-panel p-12 w-full max-w-xl space-y-12 shadow-[0_0_100px_rgba(226,255,111,0.05)] relative bg-black/40 border-white/10 overflow-hidden"
              >
                <p id="goal-modal-desc" className="sr-only">
                  Define your objective by entering a title and selecting a focus domain.
                </p>
                <div className="absolute top-0 right-0 p-10 opacity-5">
                  <Target className="w-48 h-48 text-[#E2FF6F]" />
                </div>

                <div className="space-y-4 relative z-10">
                  <h3 className="text-4xl font-bold tracking-tighter text-white">
                    Define Objective
                  </h3>
                  <p className="text-white/40 font-medium italic">
                    What structural change shall we manifest today?
                  </p>
                </div>

                <div className="space-y-10 relative z-10">
                  <div className="space-y-4">
                    <label
                      htmlFor="goal-title"
                      className="text-[10px] font-bold text-[#E2FF6F] uppercase tracking-[0.3em]"
                    >
                      Objective Title
                    </label>
                    <input
                      ref={firstFocusRef}
                      id="goal-title"
                      autoFocus
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="e.g. 5K Run, 20min Focus..."
                      aria-label="Goal objective title"
                      className="w-full h-16 rounded-[24px] bg-white/5 border border-white/5 px-8 text-xl font-bold text-white outline-none focus:ring-2 focus:ring-[#E2FF6F]/30 focus:border-[#E2FF6F]/20 transition-all placeholder:text-white/10"
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-bold text-[#E2FF6F] uppercase tracking-[0.3em]">
                      Focus Domain
                    </label>
                    <div
                      className="grid grid-cols-3 gap-4"
                      role="group"
                      aria-label="Select focus domain"
                    >
                      {categories.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => setNewCat(c.id as 'wellness' | 'exercise' | 'meditation')}
                          aria-pressed={newCat === c.id}
                          className={`h-20 rounded-[28px] text-[10px] font-bold uppercase tracking-widest flex flex-col items-center justify-center gap-3 border transition-all duration-500 ${newCat === c.id ? 'bg-[#E2FF6F] text-black border-[#E2FF6F] shadow-lg shadow-[#E2FF6F]/20' : 'bg-white/5 text-white/30 border-white/5 hover:bg-white/10'}`}
                        >
                          <c.icon className="w-5 h-5" aria-hidden="true" /> {c.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex gap-4 pt-8 relative z-10">
                  <Button
                    aria-label="Cancel and close modal"
                    variant="ghost"
                    className="flex-1 h-16 rounded-[24px] text-white/40 font-bold tracking-widest uppercase hover:bg-white/5 hover:text-white"
                    onClick={() => setShowAdd(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    aria-label="Confirm and create goal"
                    className="flex-1 h-16 rounded-[24px] bg-[#E2FF6F] hover:bg-[#d4f056] text-black font-bold tracking-widest uppercase shadow-xl shadow-[#E2FF6F]/10 active:scale-95 transition-all"
                    onClick={handleAdd}
                  >
                    Confirm Objective
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
