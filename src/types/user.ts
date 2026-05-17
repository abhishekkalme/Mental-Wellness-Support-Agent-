import type { MoodEntry } from './mood';
import type {
  JournalEntry,
  ChatMessage,
  Habit,
  Goal,
  SleepEntry,
  WellnessMetrics,
  BreathingRecord,
} from './wellness';

export type ProviderId = 'gemini' | 'openrouter' | 'ollama' | 'groq';

export interface OnboardingData {
  stage?: string;
  name?: string;
  feeling?: string;
  priorities?: string[];
  aiStyle?: string;
  stressLevel?: number;
  energyLevel?: number;
  sleepQuality?: number;
  focusLevel?: number;
  overthinkingFrequency?: string;
  sleepSchedule?: 'early-bird' | 'night-owl' | 'regular' | 'irregular';
  motivation?: 'career' | 'relationships' | 'health' | 'learning' | 'creativity' | 'impact';
  biggestChallenge?:
    | 'overthinking'
    | 'sleep'
    | 'procrastination'
    | 'burnout'
    | 'self-doubt'
    | 'motivation';
  struggles: string[];
  agentBehavior?: string;
  checkInFrequency?: string;
  lastAssessmentDate?: string;
}

export interface UserState {
  name: string;
  username: string;
  isOnboarded: boolean;
  onboardingData?: OnboardingData;
  moodHistory: MoodEntry[];
  journalEntries: JournalEntry[];
  chatHistory: ChatMessage[];
  lastActive: string;
  wellnessGoals: string[];
  habits: Habit[];
  goals: Goal[];
  sleepHistory: SleepEntry[];
  wellnessMetrics: WellnessMetrics;
  breathingHistory: BreathingRecord[];
  completedRescueModules: string[];
  completedExercises: string[];
  safeMode: boolean;
}
