export type Mood = 'excellent' | 'good' | 'okay' | 'bad' | 'terrible';
export type ProviderId = 'gemini' | 'openrouter' | 'ollama' | 'groq';

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
  role: 'user' | 'agent';
  content: string;
  timestamp: string;
}

export interface Habit {
  id: string;
  name: string;
  frequency: 'daily' | 'weekly';
  streak: number;
  completedDates: string[];
  targetDays?: number;
  category?: 'wellness' | 'exercise' | 'mind';
  isGoal?: boolean;
}

export interface Goal {
  id: string;
  title: string;
  category: 'wellness' | 'exercise' | 'meditation';
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

export interface Meditation {
  id: string;
  title: string;
  duration: string;
  category: string;
  img: string;
  desc: string;
}

export interface Therapist {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  reviews: number;
  availability: string;
  img: string;
  price: string;
  tags: string[];
}

export interface AcademicEvent {
  id: string;
  title: string;
  date: string;
  type: 'exam' | 'deadline' | 'lecture' | 'holiday';
  course?: string;
  location?: string;
}

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
  biggestChallenge?: 'overthinking' | 'sleep' | 'procrastination' | 'burnout' | 'self-doubt' | 'motivation';
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
