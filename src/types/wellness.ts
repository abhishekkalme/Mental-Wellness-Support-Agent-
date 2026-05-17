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
