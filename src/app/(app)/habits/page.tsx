'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { 
  Calendar, Plus, Flame, CheckCircle2, Circle, TrendingUp, Award, Target, 
  Heart, Brain, Dumbbell, ChevronRight, X, Zap, Activity
} from 'lucide-react';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';

type ItemCategory = 'wellness' | 'exercise' | 'mind';

interface UnifiedItem {
  id: string;
  name: string;
  frequency: 'daily' | 'weekly';
  streak: number;
  completedDates: string[];
  targetDays?: number;
  category?: ItemCategory;
  isGoal?: boolean;
  completed?: boolean;
}

export default function HabitsPage() {
  const store = useStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newFreq, setNewFreq] = useState<'daily' | 'weekly'>('daily');
  const [newCategory, setNewCategory] = useState<ItemCategory>('wellness');
  const [newTarget, setNewTarget] = useState<number>(30);
  const modalRef = useRef<HTMLDivElement>(null);
  const firstFocusRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showAddModal && firstFocusRef.current) {
      firstFocusRef.current.focus();
    }
  }, [showAddModal]);

  useEffect(() => {
    store.syncRemoteData();
  }, []);

  const handleAddItem = () => {
    if (!newName.trim()) return;
    store.addHabit({
      id: Date.now().toString(),
      name: newName,
      frequency: newFreq,
      streak: 0,
      completedDates: [],
      targetDays: newTarget,
      category: newCategory,
    });
    setNewName('');
    setNewTarget(30);
    setNewCategory('wellness');
    setShowAddModal(false);
  };

  const handleToggle = (itemId: string, date: string) => {
    store.toggleHabit(itemId, date);
  };

  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));
  const todayStr = format(today, 'yyyy-MM-dd');
  const weekStartStr = format(weekStart, 'yyyy-MM-dd');

  const items: UnifiedItem[] = store.habits.map(h => ({
    ...h,
    category: h.category as ItemCategory | undefined,
  }));

  const getItemStats = (item: UnifiedItem) => {
    const weekCompleted = item.completedDates.filter(d => d >= weekStartStr && d <= todayStr).length;
    const totalCompleted = item.completedDates.length;
    const target = item.targetDays || 30;
    const progress = Math.min(100, Math.round((totalCompleted / target) * 100));
    const weeklyRate = Math.round((weekCompleted / 7) * 100);
    return { weekCompleted, totalCompleted, progress, weeklyRate, target };
  };

  const getCategoryIcon = (cat?: ItemCategory) => {
    switch (cat) {
      case 'wellness': return Heart;
      case 'exercise': return Dumbbell;
      case 'mind': return Brain;
      default: return Target;
    }
  };

  const getCategoryColor = (cat?: ItemCategory) => {
    switch (cat) {
      case 'wellness': return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      case 'exercise': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'mind': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      default: return 'text-white/40 bg-white/5 border-white/10';
    }
  };

  const overallStats = useMemo(() => {
    const totalItems = items.length;
    const totalCompletions = items.reduce((sum, i) => sum + i.completedDates.length, 0);
    const activeStreaks = items.filter(i => i.streak > 0).length;
    const avgProgress = items.length > 0 
      ? Math.round(items.reduce((sum, i) => sum + getItemStats(i).progress, 0) / items.length)
      : 0;
    return { totalItems, totalCompletions, activeStreaks, avgProgress };
  }, [items]);

  const totalWeekCompleted = items.reduce((sum, item) => {
    return sum + item.completedDates.filter(d => d >= weekStartStr && d <= todayStr).length;
  }, 0);
  const totalPossible = items.length * 7;
  const weeklySuccess = totalPossible > 0 ? Math.round((totalWeekCompleted / totalPossible) * 100) : 0;

  const categoryColors: Record<string, string> = {
    wellness: 'text-rose-400',
    exercise: 'text-blue-400', 
    mind: 'text-emerald-400',
  };

  return (
    <main className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 lg:space-y-8 relative">
      {/* Ambient glow */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#E2FF6F]/5 blur-[150px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-rose-500/5 blur-[150px] rounded-full" />
      </div>

      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 relative z-10">
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-[#E2FF6F]">
            <Target className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-widest">Progress Hub</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">Habits &amp; Goals</h1>
          <p className="text-white/40 text-lg">Track your daily rituals and milestone progress.</p>
        </div>
        <Button 
          onClick={() => setShowAddModal(true)}
          className="gap-2 rounded-full h-12 px-6 bg-[#E2FF6F] hover:bg-[#d4f056] text-black font-bold shadow-lg shadow-[#E2FF6F]/20"
        >
          <Plus className="w-5 h-5" /> Add New
        </Button>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
        <div className="glass-panel p-5 bg-white/[0.03] border-white/[0.06]">
          <div className="flex items-center gap-2 text-white/40 mb-2">
            <Target className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Total</span>
          </div>
          <div className="text-3xl font-black text-white tabular-nums">{overallStats.totalItems}</div>
          <div className="text-xs text-white/40">Active Items</div>
        </div>
        <div className="glass-panel p-5 bg-white/[0.03] border-white/[0.06]">
          <div className="flex items-center gap-2 text-white/40 mb-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Weekly</span>
          </div>
          <div className="text-3xl font-black text-white tabular-nums">{weeklySuccess}%</div>
          <div className="text-xs text-white/40">Success Rate</div>
        </div>
        <div className="glass-panel p-5 bg-white/[0.03] border-white/[0.06]">
          <div className="flex items-center gap-2 text-white/40 mb-2">
            <Flame className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Streaks</span>
          </div>
          <div className="text-3xl font-black text-orange-400 tabular-nums">{overallStats.activeStreaks}</div>
          <div className="text-xs text-white/40">Active</div>
        </div>
        <div className="glass-panel p-5 bg-white/[0.03] border-white/[0.06]">
          <div className="flex items-center gap-2 text-white/40 mb-2">
            <Activity className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Progress</span>
          </div>
          <div className="text-3xl font-black text-[#E2FF6F] tabular-nums">{overallStats.avgProgress}%</div>
          <div className="text-xs text-white/40">Avg Completion</div>
        </div>
      </div>

      {items.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-12 md:p-16 text-center border-2 border-dashed border-white/[0.06] bg-white/[0.02] relative z-10"
        >
          <div className="w-20 h-20 rounded-full bg-[#E2FF6F]/10 flex items-center justify-center mx-auto mb-6">
            <Target className="w-10 h-10 text-[#E2FF6F]" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">Start Your Journey</h3>
          <p className="text-white/40 mb-8 max-w-md mx-auto">
            Create habits and set goals to track your progress toward a healthier, happier you.
          </p>
          <Button 
            onClick={() => setShowAddModal(true)}
            className="h-12 px-8 bg-[#E2FF6F] hover:bg-[#d4f056] text-black font-bold rounded-full shadow-lg shadow-[#E2FF6F]/20"
          >
            <Plus className="w-5 h-5 mr-2" /> Create Your First Habit
          </Button>
        </motion.div>
      ) : (
        <div className="space-y-3 relative z-10">
          {items.map((item) => {
            const stats = getItemStats(item);
            const CatIcon = getCategoryIcon(item.category);
            const isCompletedToday = item.completedDates.includes(todayStr);
            const isFullyComplete = stats.progress >= 100;
            
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`glass-panel p-4 md:p-5 bg-white/[0.03] border-white/[0.06] hover:border-white/20 transition-all duration-300 ${isFullyComplete ? 'ring-1 ring-[#E2FF6F]/20' : ''}`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <button
                      onClick={() => handleToggle(item.id, todayStr)}
                      className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all shrink-0 ${
                        isCompletedToday 
                          ? 'bg-[#E2FF6F] text-black shadow-lg shadow-[#E2FF6F]/20' 
                          : 'bg-white/[0.04] text-white/20 hover:text-white/40 hover:bg-white/10 border border-white/[0.06]'
                      }`}
                    >
                      {isCompletedToday ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                    </button>
                    
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {item.category && (
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${getCategoryColor(item.category)}`}>
                            {item.category}
                          </span>
                        )}
                        {item.streak > 0 && (
                          <span className="flex items-center gap-1 text-xs text-orange-400 font-semibold">
                            <Flame className="w-3 h-3" />
                            {item.streak}d
                          </span>
                        )}
                      </div>
                      <h3 className={`font-bold text-lg truncate ${isCompletedToday ? 'text-white/40 line-through' : 'text-white'}`}>
                        {item.name}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 lg:gap-6 flex-wrap">
                    <div className="text-center">
                      <div className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Target</div>
                      <div className="font-bold text-white text-sm">{stats.target} days</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Progress</div>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-white/10 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${stats.progress}%` }}
                            className={`h-full rounded-full ${isFullyComplete ? 'bg-[#E2FF6F]' : 'bg-[#E2FF6F]/60'}`}
                          />
                        </div>
                        <span className={`text-sm font-bold tabular-nums ${isFullyComplete ? 'text-[#E2FF6F]' : 'text-white'}`}>
                          {stats.progress}%
                        </span>
                      </div>
                    </div>

                    <div className="text-center hidden md:block">
                      <div className="text-[10px] text-white/40 uppercase tracking-wider mb-1">This Week</div>
                      <div className="text-sm font-bold text-white">{stats.weekCompleted}/7</div>
                    </div>

                    <div className="text-center hidden lg:block">
                      <div className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Total</div>
                      <div className="text-sm font-bold text-white tabular-nums">{stats.totalCompleted}</div>
                    </div>

                    <div className="w-28 hidden lg:block">
                      <div className="text-[10px] text-white/40 uppercase tracking-wider mb-2">Weekly</div>
                      <div className="flex items-end gap-1 h-5">
                        {weekDays.map((day, i) => {
                          const dateStr = format(day, 'yyyy-MM-dd');
                          const done = item.completedDates.includes(dateStr);
                          return (
                            <div 
                              key={i}
                              className={`flex-1 rounded-sm transition-all duration-200 ${done ? 'bg-[#E2FF6F]' : 'bg-white/10'}`}
                              style={{ height: done ? '100%' : '20%' }}
                            />
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {showAddModal && (
          <div 
            className="fixed inset-0 bg-[#0A0C0B]/90 backdrop-blur-xl z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
          >
            <motion.div
              ref={modalRef}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-panel p-6 md:p-8 w-full max-w-md space-y-6 bg-black/40 border-white/[0.08]"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-white">New Habit or Goal</h3>
                <button onClick={() => setShowAddModal(false)} className="text-white/40 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="text-[10px] font-bold text-[#E2FF6F] uppercase tracking-widest mb-2 block">
                    Name
                  </label>
                  <input
                    ref={firstFocusRef}
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Morning Meditation, Run 5K..."
                    className="w-full h-12 rounded-xl bg-white/[0.03] border border-white/[0.06] px-4 text-white font-medium placeholder:text-white/20 focus:border-[#E2FF6F]/30 focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#E2FF6F] uppercase tracking-widest mb-2 block">
                    Category
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['wellness', 'exercise', 'mind'] as const).map((cat) => {
                      const Icon = getCategoryIcon(cat);
                      return (
                        <button
                          key={cat}
                          onClick={() => setNewCategory(cat)}
                          className={`h-14 rounded-xl text-xs font-bold uppercase flex flex-col items-center justify-center gap-2 border transition-all duration-200 ${
                            newCategory === cat 
                              ? 'bg-[#E2FF6F] text-black border-[#E2FF6F] shadow-lg shadow-[#E2FF6F]/20' 
                              : 'bg-white/[0.03] text-white/40 border-white/[0.06] hover:bg-white/10 hover:border-white/20'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          {cat}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#E2FF6F] uppercase tracking-widest mb-2 block">
                    Frequency
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {(['daily', 'weekly'] as const).map((f) => (
                      <button
                        key={f}
                        onClick={() => setNewFreq(f)}
                        className={`h-12 rounded-xl text-sm font-bold uppercase border transition-all duration-200 ${
                          newFreq === f 
                            ? 'bg-[#E2FF6F] text-black border-[#E2FF6F]' 
                            : 'bg-white/[0.03] text-white/40 border-white/[0.06] hover:bg-white/10 hover:border-white/20'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#E2FF6F] uppercase tracking-widest mb-2 block">
                    Target Days: <span className="text-base">{newTarget}</span>
                  </label>
                  <input
                    type="range"
                    min="7"
                    max="100"
                    value={newTarget}
                    onChange={(e) => setNewTarget(parseInt(e.target.value))}
                    className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-[#E2FF6F] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#E2FF6F] [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-[#E2FF6F]/30"
                  />
                  <div className="flex justify-between text-[10px] text-white/30 mt-2">
                    <span>7 days</span>
                    <span>100 days</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button 
                  variant="ghost" 
                  onClick={() => setShowAddModal(false)} 
                  className="flex-1 h-12 text-white/40 hover:text-white hover:bg-white/[0.04]"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleAddItem}
                  className="flex-1 h-12 bg-[#E2FF6F] hover:bg-[#d4f056] text-black font-bold"
                >
                  Create
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}