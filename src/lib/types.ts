export type Mood = "excellent" | "good" | "okay" | "bad" | "terrible";
export type ProviderId = "gemini" | "openrouter" | "ollama";

export interface MoodEntry {
  id: string;
  mood: Mood;
  intensity: number; // 1 to 10
  notes: string;
  activities?: string[];
  timestamp: string;
}

export interface JournalEntry {
  id: string;
  prompt: string;
  content: string;
  emotionTags: string[];
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "agent";
  content: string;
  timestamp: string;
}

export interface Habit {
  id: string;
  name: string;
  frequency: "daily" | "weekly";
  streak: number;
  completedDates: string[];
}

export interface Goal {
  id: string;
  title: string;
  category: "wellness" | "exercise" | "meditation";
  completed: boolean;
}

export interface SleepEntry {
  id: string;
  date: string;
  quality: 1 | 2 | 3 | 4 | 5;
  durationHours: number;
}

export interface WellnessMetrics {
  mental: number;
  emotional: number;
  physical: number;
  social: number;
  sleep: number;
  spiritual: number;
}

export interface BreathingRecord {
  id: string;
  date: string;
  durationSeconds: number;
  pattern: string;
}

export interface OnboardingData {
  stage?: string;
  stressLevel?: number;
  energyLevel?: number;
  sleepQuality?: number;
  focusLevel?: number;
  overthinkingFrequency?: string;
  struggles: string[];
  agentBehavior?: string;
  checkInFrequency?: string;
  lastAssessmentDate?: string;
}

export interface UserState {
  name: string;
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
}
