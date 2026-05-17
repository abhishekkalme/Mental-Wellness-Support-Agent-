export type Mood = 'excellent' | 'good' | 'okay' | 'bad' | 'terrible';

export interface MoodEntry {
  id: string;
  mood: Mood;
  intensity: number;
  notes: string;
  activities?: string[];
  timestamp: string;
}
