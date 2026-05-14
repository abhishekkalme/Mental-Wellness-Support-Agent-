'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { CoachMark } from './CoachMark';

const STEPS = [
  {
    targetId: 'ftue-hero',
    title: 'Your Wellbeing Hub',
    description:
      'Welcome! This dashboard gives you a complete view of your wellness — mood, habits, sleep, and insights. Everything you need for your mental health journey, all in one place.',
    position: 'bottom' as const,
  },
  {
    targetId: 'ftue-todays-focus',
    title: "Today's Focus",
    description:
      'Your daily habits and streak live here. Check off tasks as you complete them to build consistent routines and stay motivated.',
    position: 'bottom' as const,
  },
  {
    targetId: 'ftue-quick-actions',
    title: 'Quick Actions',
    description:
      'One-tap access to mood check-ins, journaling, breathing exercises, sleep tracking, habit management, and AI-powered chat support.',
    position: 'top' as const,
  },
  {
    targetId: 'ftue-mood',
    title: 'Mood Tracking',
    description:
      'Log your mood daily and watch your emotional trends over time. Understanding your patterns helps you take better care of yourself.',
    position: 'bottom' as const,
  },
  {
    targetId: 'ftue-sos',
    title: 'Crisis Support',
    description:
      'If you are ever in crisis, tap the SOS button for immediate access to help resources and coping strategies. You are never alone.',
    position: 'bottom' as const,
  },
];

export function FTUETour() {
  const ftueStep = useStore((s) => (s as any).ftueStep ?? 0);
  const ftueDismissed = useStore((s) => (s as any).ftueDismissed ?? false);
  const setFtueStep = useStore((s) => (s as any).setFtueStep);
  const dismissFtue = useStore((s) => (s as any).dismissFtue);
  const [ready, setReady] = useState(false);
  const [validSteps, setValidSteps] = useState<typeof STEPS>([]);

  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const existing = STEPS.filter((s) => document.getElementById(s.targetId));
    setValidSteps(existing.length > 0 ? existing : STEPS);
  }, [ready]);

  const currentStep = validSteps[ftueStep - 1] ?? null;
  const totalSteps = validSteps.length;

  useEffect(() => {
    if (!ready || ftueDismissed || ftueStep === 0 || !currentStep) return;
    if (typeof document !== 'undefined' && !document.getElementById(currentStep.targetId)) {
      if (ftueStep < STEPS.length) {
        setFtueStep(ftueStep + 1);
      } else {
        dismissFtue();
      }
    }
  }, [ftueStep, ftueDismissed, ready, currentStep, setFtueStep, dismissFtue]);

  if (ftueDismissed || ftueStep === 0 || !ready || !currentStep) return null;

  const handleNext = () => {
    const next = ftueStep + 1;
    if (next > totalSteps || next > STEPS.length) {
      dismissFtue();
    } else {
      setFtueStep(next);
    }
  };

  const handlePrev = () => {
    if (ftueStep > 1) {
      setFtueStep(ftueStep - 1);
    }
  };

  const handleDismiss = () => {
    dismissFtue();
  };

  return (
    <CoachMark
      step={ftueStep}
      total={totalSteps}
      title={currentStep.title}
      description={currentStep.description}
      targetId={currentStep.targetId}
      position={currentStep.position}
      onNext={handleNext}
      onPrev={handlePrev}
      onDismiss={handleDismiss}
    />
  );
}
