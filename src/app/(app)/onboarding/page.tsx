'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import {
  Sparkles,
  CheckCircle2,
  Brain,
  Moon,
  Zap,
  Target,
  Heart,
  Activity,
  TrendingUp,
  Battery,
  CloudRain,
  Smile,
  BookOpen,
  Briefcase,
  HeartHandshake,
  Dumbbell,
  Sun,
  Sunrise,
  Clock,
  Sunset,
  MoonStar,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type FeelingState = 'stressed' | 'low' | 'tired' | 'anxious' | 'stable' | 'energized';
type Priority = 'sleep' | 'focus' | 'emotional' | 'anxiety' | 'habits' | 'clarity' | 'energy';
type AIStyle = 'listen' | 'practical' | 'organize' | 'motivate';
type SleepSchedule = 'early-bird' | 'night-owl' | 'regular' | 'irregular';
type Motivation = 'career' | 'relationships' | 'health' | 'learning' | 'creativity' | 'impact';
type Challenge =
  | 'overthinking'
  | 'sleep'
  | 'procrastination'
  | 'burnout'
  | 'self-doubt'
  | 'motivation';

interface OnboardingData {
  name: string;
  feeling: FeelingState | '';
  priorities: Priority[];
  sleepSchedule: SleepSchedule;
  motivation: Motivation;
  biggestChallenge: Challenge;
  aiStyle: AIStyle;
}

const sleepOptions = [
  {
    id: 'early-bird' as SleepSchedule,
    label: 'Early riser',
    description: 'I like to wake up with the sun',
    icon: Sunrise,
  },
  {
    id: 'night-owl' as SleepSchedule,
    label: 'Night owl',
    description: 'I do my best work after dark',
    icon: MoonStar,
  },
  {
    id: 'regular' as SleepSchedule,
    label: 'Consistent schedule',
    description: 'I keep a steady sleep routine',
    icon: Clock,
  },
  {
    id: 'irregular' as SleepSchedule,
    label: 'Unpredictable',
    description: 'My schedule varies a lot',
    icon: Moon,
  },
];

const motivationOptions = [
  { id: 'career' as Motivation, label: 'Career & ambition', icon: Briefcase },
  { id: 'relationships' as Motivation, label: 'Relationships', icon: HeartHandshake },
  { id: 'health' as Motivation, label: 'Health & fitness', icon: Dumbbell },
  { id: 'learning' as Motivation, label: 'Learning & growth', icon: BookOpen },
  { id: 'creativity' as Motivation, label: 'Creative pursuits', icon: Sparkles },
  { id: 'impact' as Motivation, label: 'Making an impact', icon: Heart },
];

const challengeOptions = [
  { id: 'overthinking' as Challenge, label: 'Overthinking', icon: Brain },
  { id: 'sleep' as Challenge, label: 'Sleep issues', icon: Moon },
  { id: 'procrastination' as Challenge, label: 'Procrastination', icon: Clock },
  { id: 'burnout' as Challenge, label: 'Burnout', icon: Battery },
  { id: 'self-doubt' as Challenge, label: 'Self-doubt', icon: Activity },
  { id: 'motivation' as Challenge, label: 'Staying motivated', icon: Target },
];

const feelingOptions = [
  {
    id: 'stressed' as FeelingState,
    label: 'Stressed / Overwhelmed',
    icon: Zap,
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
    description: 'Too much on your plate',
  },
  {
    id: 'low' as FeelingState,
    label: 'Low / Down',
    icon: CloudRain,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    description: 'Feeling down or sad',
  },
  {
    id: 'tired' as FeelingState,
    label: 'Tired / Exhausted',
    icon: Battery,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    description: 'Low energy, drained',
  },
  {
    id: 'anxious' as FeelingState,
    label: 'Anxious / Worried',
    icon: Activity,
    color: 'text-rose-400',
    bgColor: 'bg-rose-500/10',
    description: 'Racing thoughts, unease',
  },
  {
    id: 'stable' as FeelingState,
    label: 'Pretty Good / Stable',
    icon: Smile,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    description: 'Doing okay, nothing major',
  },
  {
    id: 'energized' as FeelingState,
    label: 'Motivated / Energized',
    icon: TrendingUp,
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
    description: 'Feeling good, ready to go',
  },
];

const priorityOptions = [
  { id: 'sleep' as Priority, label: 'Better sleep', icon: Moon },
  { id: 'focus' as Priority, label: 'More focus', icon: Brain },
  { id: 'emotional' as Priority, label: 'Emotional balance', icon: Heart },
  { id: 'anxiety' as Priority, label: 'Less anxiety', icon: Activity },
  { id: 'habits' as Priority, label: 'Build better habits', icon: Target },
  { id: 'clarity' as Priority, label: 'Mental clarity', icon: Sparkles },
  { id: 'energy' as Priority, label: 'More energy', icon: Zap },
];

const aiStyleOptions = [
  {
    id: 'listen' as AIStyle,
    label: 'Listen and ask questions',
    description: 'Empathetic and curious',
  },
  {
    id: 'practical' as AIStyle,
    label: 'Give practical suggestions',
    description: 'Action-oriented',
  },
  {
    id: 'organize' as AIStyle,
    label: 'Help me think clearly',
    description: 'Analytical and organizing',
  },
  {
    id: 'motivate' as AIStyle,
    label: 'Motivate and encourage',
    description: 'Energetic and supportive',
  },
];

const ONBOARDING_STORAGE_KEY = 'mindcare-onboarding-progress';

function getStoredProgress(): { step: number; formData: OnboardingData } | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    if (!parsed.step || !parsed.formData) return null;
    return parsed;
  } catch {
    return null;
  }
}

function saveProgress(step: number, formData: OnboardingData) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify({ step, formData }));
  } catch {}
}

function clearProgress() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ONBOARDING_STORAGE_KEY);
}

export default function OnboardingPage() {
  const router = useRouter();
  const store = useStore();
  const { data: session, update } = useSession();

  const storedProgress = getStoredProgress();
  const [currentStep, setCurrentStep] = useState(storedProgress?.step ?? 0);
  const [generationPhase, setGenerationPhase] = useState(0);
  const [formData, setFormData] = useState<OnboardingData>(
    storedProgress?.formData ?? {
      name: '',
      feeling: '',
      priorities: [],
      sleepSchedule: 'regular',
      motivation: 'health',
      biggestChallenge: 'overthinking',
      aiStyle: 'listen',
    }
  );

  useEffect(() => {
    saveProgress(currentStep, formData);
  }, [currentStep, formData]);

  const initialOnboardedRef = useRef<boolean | null>(null);

  useEffect(() => {
    if (!session?.user) return;

    if (initialOnboardedRef.current === null) {
      initialOnboardedRef.current = session.user.onboarded ?? false;
    }

    const sessionName = session.user.name || session.user.username || '';
    if (sessionName && formData.name === '') {
      setFormData((prev) => ({ ...prev, name: sessionName }));
    }

    if (session.user.onboarded) {
      clearProgress();
      if (initialOnboardedRef.current === true) {
        store.dismissFtue();
      }
      router.replace('/dashboard');
      return;
    }

    const checkOnboardingStatus = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.onboarded) {
            clearProgress();
            store.dismissFtue();
            router.replace('/dashboard');
          }
        } else if (res.status === 401) {
          router.replace('/signin?callbackUrl=/onboarding');
        }
      } catch {
        router.replace('/signin?callbackUrl=/onboarding');
      }
    };

    checkOnboardingStatus();
  }, [session, router]);

  const username = session?.user?.username || '';
  const steps = ['Intro', 'Feeling', 'Priorities', 'Sleep', 'Goal', 'AI Style', 'Setup'];

  const generateHabitsFromOnboarding = () => {
    const habits: {
      id: string;
      name: string;
      frequency: 'daily' | 'weekly';
      streak: number;
      completedDates: string[];
    }[] = [];

    if (
      formData.feeling === 'stressed' ||
      formData.feeling === 'anxious' ||
      formData.priorities.includes('anxiety')
    ) {
      habits.push({
        id: 'h_breathing',
        name: 'Box Breathing',
        frequency: 'daily',
        streak: 0,
        completedDates: [],
      });
    }

    if (formData.feeling === 'tired' || formData.priorities.includes('sleep')) {
      habits.push({
        id: 'h_winddown',
        name: 'Wind Down Routine',
        frequency: 'daily',
        streak: 0,
        completedDates: [],
      });
    }

    if (formData.feeling === 'low' || formData.priorities.includes('emotional')) {
      habits.push({
        id: 'h_journal',
        name: 'Gratitude Journal',
        frequency: 'daily',
        streak: 0,
        completedDates: [],
      });
    }

    if (formData.priorities.includes('focus')) {
      habits.push({
        id: 'h_deepwork',
        name: 'Deep Work Session',
        frequency: 'daily',
        streak: 0,
        completedDates: [],
      });
    }

    if (formData.priorities.includes('habits')) {
      habits.push({
        id: 'h_morning',
        name: 'Morning Routine',
        frequency: 'daily',
        streak: 0,
        completedDates: [],
      });
    }

    if (habits.length === 0) {
      habits.push({
        id: 'h_hydration',
        name: 'Daily Hydration',
        frequency: 'daily',
        streak: 0,
        completedDates: [],
      });
    }

    return habits;
  };

  const getWellnessMetricsFromFeeling = (): {
    mental: number;
    emotional: number;
    physical: number;
    sleep: number;
    social: number;
    spiritual: number;
  } => {
    const base = {
      mental: 70,
      emotional: 70,
      physical: 70,
      sleep: 70,
      social: 70,
      spiritual: 70,
    };

    switch (formData.feeling) {
      case 'stressed':
        return { ...base, mental: 40, emotional: 50 };
      case 'low':
        return { ...base, emotional: 35, mental: 50 };
      case 'tired':
        return { ...base, physical: 40, sleep: 45 };
      case 'anxious':
        return { ...base, mental: 45, emotional: 55 };
      case 'stable':
        return { ...base, mental: 75, emotional: 75 };
      case 'energized':
        return { ...base, mental: 85, emotional: 85, physical: 80 };
      default:
        return base;
    }
  };

  const getInitialAIContext = (): string => {
    const name = username || 'there';

    switch (formData.feeling) {
      case 'stressed':
        return `Hi ${name}, I understand things feel overwhelming right now. I'm here to help you find calm. What's been most stressful lately?`;
      case 'low':
        return `Hi ${name}, I'm here for you. It takes courage to seek support. How have you been feeling recently?`;
      case 'tired':
        return `Hi ${name}, it sounds like you're running on empty. Let's find ways to restore your energy. What's been draining you most?`;
      case 'anxious':
        return `Hi ${name}, I notice you mentioned anxiety. Let's work through it together. What kind of thoughts or feelings come up for you?`;
      case 'stable':
        return `Hi ${name}, it's great that you're feeling stable. Let's keep that momentum going. What would you like to focus on?`;
      case 'energized':
        return `Hi ${name}, I love your energy! Let's channel that into building good habits. What goals are you excited about?`;
      default:
        return `Hi ${name}, I'm here to support your wellness journey. What brings you here today?`;
    }
  };

  const completeOnboarding = async () => {
    const onboardingData = {
      name: formData.name,
      feeling: formData.feeling,
      priorities: formData.priorities,
      sleepSchedule: formData.sleepSchedule,
      motivation: formData.motivation,
      biggestChallenge: formData.biggestChallenge,
      aiStyle: formData.aiStyle,
      lastAssessmentDate: new Date().toISOString(),
    };

    store.setName(formData.name);
    store.setUsername(username || formData.name);
    store.setOnboardingData(onboardingData);

    const metrics = getWellnessMetricsFromFeeling();
    store.updateWellnessMetrics(metrics);

    const habits = generateHabitsFromOnboarding();
    habits.forEach((h) => store.addHabit(h));

    store.addChatMessage({
      id: `msg_init_${Date.now()}`,
      role: 'agent',
      content: getInitialAIContext(),
      timestamp: new Date().toISOString(),
    });

    store.setOnboarded(true);
    clearProgress();

    try {
      await fetch('/api/auth/complete-onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ onboardingData, wellnessMetrics: metrics }),
      });
      await update({ onboarded: true });
    } catch {}
  };

  const nextStep = () => {
    if (currentStep === steps.length - 1) return;
    setCurrentStep((prev) => prev + 1);
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep((prev) => prev - 1);
  };

  const completeOnboardingRef = useRef(completeOnboarding);
  useEffect(() => {
    completeOnboardingRef.current = completeOnboarding;
  });

  useEffect(() => {
    if (currentStep === steps.length - 1) {
      setGenerationPhase(0);
      const interval = setInterval(() => {
        setGenerationPhase((p) => {
          if (p >= 5) return p;
          return p + 1;
        });
      }, 600);
      return () => {
        clearInterval(interval);
        setGenerationPhase(0);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, steps.length]);

  useEffect(() => {
    if (generationPhase >= 5) {
      completeOnboardingRef.current();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [generationPhase]);

  return (
    <div className="min-h-screen bg-[#0A0D08] flex flex-col items-center justify-center p-4 md:p-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#E2FF6F]/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-40 left-0 w-[500px] h-[500px] bg-[#E2FF6F]/5 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-xl w-full space-y-8 relative z-10">
        <div className="flex justify-between items-center gap-2">
          {steps.map((s, i) => (
            <div
              key={s}
              className={cn(
                'h-2 rounded-full transition-all duration-500 flex-1',
                i <= currentStep
                  ? 'bg-[#E2FF6F] shadow-[0_0_10px_rgba(226,255,111,0.5)]'
                  : 'bg-white/10'
              )}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {currentStep === 0 && (
            <motion.div
              key="step0"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              className="glass-panel p-8 md:p-10 rounded-3xl bg-white/5 border border-white/5 shadow-2xl space-y-6"
            >
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Welcome to MindCare</h2>
                <p className="text-white/40 font-medium">
                  Let&apos;s get to know you a little better
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-white/60 font-medium mb-2 block">Your name</label>
                  <input
                    type="text"
                    placeholder="Enter your first name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full h-12 px-4 rounded-xl bg-black/30 border border-white/10 text-white placeholder:text-white/30 font-medium focus:outline-none focus:border-[#E2FF6F]/50 transition-all"
                    maxLength={30}
                  />
                </div>

                <div>
                  <label className="text-sm text-white/60 font-medium mb-3 block">
                    What&apos;s your biggest challenge right now?
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {challengeOptions.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => setFormData({ ...formData, biggestChallenge: option.id })}
                        className={cn(
                          'p-3 rounded-xl border text-left transition-all flex items-center gap-2',
                          formData.biggestChallenge === option.id
                            ? 'bg-[#E2FF6F]/10 border-[#E2FF6F]/50'
                            : 'bg-black/20 border-white/5 hover:bg-white/5'
                        )}
                      >
                        <option.icon
                          className={cn(
                            'w-4 h-4 flex-shrink-0',
                            formData.biggestChallenge === option.id
                              ? 'text-[#E2FF6F]'
                              : 'text-white/40'
                          )}
                        />
                        <span
                          className={cn(
                            'text-xs font-bold',
                            formData.biggestChallenge === option.id
                              ? 'text-[#E2FF6F]'
                              : 'text-white/70'
                          )}
                        >
                          {option.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <Button
                className="w-full h-12 bg-[#E2FF6F] text-black font-bold rounded-2xl hover:bg-[#d4f056] disabled:opacity-50"
                onClick={nextStep}
                disabled={!formData.name.trim()}
              >
                Get Started
              </Button>
            </motion.div>
          )}

          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              className="glass-panel p-8 md:p-10 rounded-3xl bg-white/5 border border-white/5 shadow-2xl space-y-6"
            >
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">How have you been feeling?</h2>
                <p className="text-white/40 font-medium">
                  This shapes your personalized experience
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {feelingOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setFormData({ ...formData, feeling: option.id })}
                    className={cn(
                      'p-4 rounded-2xl border text-left transition-all',
                      formData.feeling === option.id
                        ? 'bg-[#E2FF6F]/10 border-[#E2FF6F]/50'
                        : 'bg-black/20 border-white/5 hover:bg-white/5'
                    )}
                  >
                    <div
                      className={cn(
                        'w-10 h-10 rounded-xl flex items-center justify-center mb-3',
                        option.bgColor
                      )}
                    >
                      <option.icon className={cn('w-5 h-5', option.color)} />
                    </div>
                    <p
                      className={cn(
                        'font-bold text-sm',
                        formData.feeling === option.id ? 'text-[#E2FF6F]' : 'text-white/80'
                      )}
                    >
                      {option.label}
                    </p>
                    <p className="text-xs text-white/40 mt-1">{option.description}</p>
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  className="flex-1 h-12 text-white/40 font-bold bg-white/5 rounded-2xl hover:text-white"
                  onClick={prevStep}
                >
                  Back
                </Button>
                <Button
                  className="flex-[2] h-12 bg-[#E2FF6F] text-black font-bold rounded-2xl hover:bg-[#d4f056] disabled:opacity-50"
                  onClick={nextStep}
                  disabled={!formData.feeling}
                >
                  Continue
                </Button>
              </div>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              className="glass-panel p-8 md:p-10 rounded-3xl bg-white/5 border border-white/5 shadow-2xl space-y-6"
            >
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">What matters most to you?</h2>
                <p className="text-white/40 font-medium">Select up to 3 priorities</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {priorityOptions.map((option) => {
                  const isSelected = formData.priorities.includes(option.id);
                  const isDisabled = !isSelected && formData.priorities.length >= 3;

                  return (
                    <button
                      key={option.id}
                      onClick={() => {
                        if (isSelected) {
                          setFormData({
                            ...formData,
                            priorities: formData.priorities.filter((p) => p !== option.id),
                          });
                        } else if (formData.priorities.length < 3) {
                          setFormData({
                            ...formData,
                            priorities: [...formData.priorities, option.id],
                          });
                        }
                      }}
                      disabled={isDisabled}
                      className={cn(
                        'p-4 rounded-2xl border text-left transition-all flex items-center gap-3',
                        isSelected
                          ? 'bg-[#E2FF6F]/10 border-[#E2FF6F]/50'
                          : isDisabled
                            ? 'opacity-30 cursor-not-allowed'
                            : 'bg-black/20 border-white/5 hover:bg-white/5'
                      )}
                    >
                      <div
                        className={cn(
                          'w-8 h-8 rounded-lg flex items-center justify-center',
                          isSelected ? 'bg-[#E2FF6F]' : 'bg-white/10'
                        )}
                      >
                        {isSelected ? (
                          <CheckCircle2 className="w-4 h-4 text-black" />
                        ) : (
                          <option.icon className="w-4 h-4 text-white/40" />
                        )}
                      </div>
                      <span
                        className={cn(
                          'font-bold text-sm',
                          isSelected ? 'text-[#E2FF6F]' : 'text-white/80'
                        )}
                      >
                        {option.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  className="flex-1 h-12 text-white/40 font-bold bg-white/5 rounded-2xl hover:text-white"
                  onClick={prevStep}
                >
                  Back
                </Button>
                <Button
                  className="flex-[2] h-12 bg-[#E2FF6F] text-black font-bold rounded-2xl hover:bg-[#d4f056] disabled:opacity-50"
                  onClick={nextStep}
                  disabled={formData.priorities.length === 0}
                >
                  Continue
                </Button>
              </div>
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              className="glass-panel p-8 md:p-10 rounded-3xl bg-white/5 border border-white/5 shadow-2xl space-y-6"
            >
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  What&apos;s your sleep schedule like?
                </h2>
                <p className="text-white/40 font-medium">
                  This helps us tailor rest recommendations for you
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {sleepOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setFormData({ ...formData, sleepSchedule: option.id })}
                    className={cn(
                      'p-4 rounded-2xl border text-left transition-all flex flex-col gap-2',
                      formData.sleepSchedule === option.id
                        ? 'bg-[#E2FF6F]/10 border-[#E2FF6F]/50'
                        : 'bg-black/20 border-white/5 hover:bg-white/5'
                    )}
                  >
                    <option.icon
                      className={cn(
                        'w-6 h-6',
                        formData.sleepSchedule === option.id ? 'text-[#E2FF6F]' : 'text-white/40'
                      )}
                    />
                    <div>
                      <p
                        className={cn(
                          'font-bold text-sm',
                          formData.sleepSchedule === option.id ? 'text-[#E2FF6F]' : 'text-white/80'
                        )}
                      >
                        {option.label}
                      </p>
                      <p className="text-xs text-white/40 mt-0.5">{option.description}</p>
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  className="flex-1 h-12 text-white/40 font-bold bg-white/5 rounded-2xl hover:text-white"
                  onClick={prevStep}
                >
                  Back
                </Button>
                <Button
                  className="flex-[2] h-12 bg-[#E2FF6F] text-black font-bold rounded-2xl hover:bg-[#d4f056]"
                  onClick={nextStep}
                >
                  Continue
                </Button>
              </div>
            </motion.div>
          )}

          {currentStep === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              className="glass-panel p-8 md:p-10 rounded-3xl bg-white/5 border border-white/5 shadow-2xl space-y-6"
            >
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">What drives you?</h2>
                <p className="text-white/40 font-medium">
                  This helps us keep you motivated and engaged
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {motivationOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setFormData({ ...formData, motivation: option.id })}
                    className={cn(
                      'p-4 rounded-2xl border text-left transition-all flex flex-col gap-2',
                      formData.motivation === option.id
                        ? 'bg-[#E2FF6F]/10 border-[#E2FF6F]/50'
                        : 'bg-black/20 border-white/5 hover:bg-white/5'
                    )}
                  >
                    <option.icon
                      className={cn(
                        'w-6 h-6',
                        formData.motivation === option.id ? 'text-[#E2FF6F]' : 'text-white/40'
                      )}
                    />
                    <p
                      className={cn(
                        'font-bold text-sm',
                        formData.motivation === option.id ? 'text-[#E2FF6F]' : 'text-white/80'
                      )}
                    >
                      {option.label}
                    </p>
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  className="flex-1 h-12 text-white/40 font-bold bg-white/5 rounded-2xl hover:text-white"
                  onClick={prevStep}
                >
                  Back
                </Button>
                <Button
                  className="flex-[2] h-12 bg-[#E2FF6F] text-black font-bold rounded-2xl hover:bg-[#d4f056]"
                  onClick={nextStep}
                >
                  Continue
                </Button>
              </div>
            </motion.div>
          )}

          {currentStep === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              className="glass-panel p-8 md:p-10 rounded-3xl bg-white/5 border border-white/5 shadow-2xl space-y-6"
            >
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  How should your AI companion help?
                </h2>
                <p className="text-white/40 font-medium">
                  Optional - you can always change this later
                </p>
              </div>

              <div className="space-y-3">
                {aiStyleOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setFormData({ ...formData, aiStyle: option.id })}
                    className={cn(
                      'w-full p-4 rounded-2xl border text-left transition-all',
                      formData.aiStyle === option.id
                        ? 'bg-[#E2FF6F]/10 border-[#E2FF6F]/50'
                        : 'bg-black/20 border-white/5 hover:bg-white/5'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p
                          className={cn(
                            'font-bold',
                            formData.aiStyle === option.id ? 'text-[#E2FF6F]' : 'text-white/80'
                          )}
                        >
                          {option.label}
                        </p>
                        <p className="text-xs text-white/40 mt-1">{option.description}</p>
                      </div>
                      {formData.aiStyle === option.id && (
                        <CheckCircle2 className="w-5 h-5 text-[#E2FF6F]" />
                      )}
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  className="flex-1 h-12 text-white/40 font-bold bg-white/5 rounded-2xl hover:text-white"
                  onClick={prevStep}
                >
                  Back
                </Button>
                <Button
                  className="flex-[2] h-12 bg-[#E2FF6F] text-black font-bold rounded-2xl hover:bg-[#d4f056]"
                  onClick={nextStep}
                >
                  Finish Setup
                </Button>
              </div>
            </motion.div>
          )}

          {currentStep === 6 && (
            <motion.div
              key="step6"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-panel p-10 rounded-3xl bg-[#E2FF6F]/5 border border-[#E2FF6F]/20 shadow-2xl text-center space-y-8"
            >
              <div className="w-20 h-20 bg-[#E2FF6F]/10 rounded-full flex items-center justify-center text-[#E2FF6F] mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h2 className="text-3xl font-black text-white tracking-tight">
                  Setting up your space
                </h2>
                <p className="text-white/50 mt-2">Personalizing your wellness experience...</p>
              </div>

              <div className="space-y-3 text-left max-w-xs mx-auto">
                {[
                  { p: 1, t: `Welcome, ${formData.name || 'friend'}!` },
                  { p: 2, t: 'Creating your habits' },
                  { p: 3, t: 'Setting up wellness metrics' },
                  { p: 4, t: 'Configuring AI companion' },
                  { p: 5, t: 'Preparing dashboard' },
                ].map((item) => (
                  <div
                    key={item.p}
                    className={cn(
                      'flex items-center gap-3 transition-all duration-300',
                      generationPhase >= item.p ? 'opacity-100' : 'opacity-30'
                    )}
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#E2FF6F]" />
                    <span className="text-sm font-medium text-white/80">{item.t}</span>
                  </div>
                ))}
              </div>

              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-[#E2FF6F]"
                  initial={{ width: '0%' }}
                  animate={{ width: `${(generationPhase / 5) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
