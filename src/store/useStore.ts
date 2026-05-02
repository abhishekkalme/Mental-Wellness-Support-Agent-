import { create } from "zustand";
import { persist } from "zustand/middleware";
import { UserState, MoodEntry, JournalEntry, ChatMessage, Habit, Goal, SleepEntry, WellnessMetrics, OnboardingData } from "@/lib/types";

interface MindCareStore extends UserState {
  setName: (name: string) => void;
  setOnboarded: (status: boolean) => void;
  setOnboardingData: (data: Partial<OnboardingData>) => void;
  addMoodEntry: (entry: MoodEntry) => void;
  addJournalEntry: (entry: JournalEntry) => void;
  addChatMessage: (msg: ChatMessage) => void;
  updateLastActive: () => void;
  setWellnessGoals: (goals: string[]) => void;
  addHabit: (habit: Habit) => void;
  toggleHabit: (habitId: string, date: string) => void;
  addGoal: (goal: Goal) => void;
  toggleGoal: (goalId: string) => void;
  addSleepEntry: (entry: SleepEntry) => void;
  updateWellnessMetrics: (metrics: Partial<WellnessMetrics>) => void;
  addBreathingRecord: (record: { id: string; date: string; durationSeconds: number; pattern: string }) => void;
  safeMode: boolean;
  setSafeMode: (status: boolean) => void;
  clearHistory: () => void;
  syncRemoteData: () => Promise<void>;
}

const initialValues: UserState & { safeMode: boolean } = {
  name: "",
  isOnboarded: false,
  onboardingData: {
    struggles: [],
  },
  moodHistory: [],
  journalEntries: [],
  chatHistory: [],
  lastActive: new Date().toISOString(),
  wellnessGoals: [],
  habits: [],
  goals: [],
  sleepHistory: [],
  wellnessMetrics: {
    mental: 0,
    emotional: 0,
    physical: 0,
    social: 0,
    sleep: 0,
    spiritual: 0
  },
  breathingHistory: [],
  safeMode: false
};

export const useStore = create<MindCareStore>()(
  persist(
    (set) => ({
      ...initialValues,
      setName: (name) => set({ name }),
      setOnboarded: (status) => set({ isOnboarded: status }),
      setOnboardingData: (data) => set((state) => ({ 
        onboardingData: { ...state.onboardingData, ...data } as OnboardingData 
      })),
      addMoodEntry: (entry) => {
        set((state) => ({ moodHistory: [...state.moodHistory, entry] }));
        fetch('/api/mood', { method: 'POST', body: JSON.stringify(entry) }).catch(console.error);
      },
      addJournalEntry: (entry) => {
        set((state) => ({ journalEntries: [...state.journalEntries, entry] }));
        fetch('/api/journal', { method: 'POST', body: JSON.stringify(entry) }).catch(console.error);
      },
      addChatMessage: (msg) =>
        set((state) => ({ chatHistory: [...state.chatHistory, msg] })),
      updateLastActive: () =>
        set({ lastActive: new Date().toISOString() }),
      setWellnessGoals: (goals) => set({ wellnessGoals: goals }),
      addHabit: (habit) => {
        set((state) => ({ habits: [...state.habits, habit] }));
        fetch('/api/habits', { method: 'POST', body: JSON.stringify(habit) }).catch(console.error);
      },
      toggleHabit: (habitId, date) => {
        let updatedHabit: any = null;
        set((state) => ({
          habits: state.habits.map(h => {
            if (h.id !== habitId) return h;
            const completed = h.completedDates.includes(date);
            const newDates = completed ? h.completedDates.filter(d => d !== date) : [...h.completedDates, date];
            updatedHabit = { ...h, completedDates: newDates };
            return updatedHabit;
          })
        }));
        if (updatedHabit) {
          fetch('/api/habits', { method: 'POST', body: JSON.stringify(updatedHabit) }).catch(console.error);
        }
      },
      addGoal: (goal) => set((state) => ({ goals: [...state.goals, goal] })),
      toggleGoal: (goalId) => set((state) => ({
        goals: state.goals.map(g => g.id === goalId ? { ...g, completed: !g.completed } : g)
      })),
      addSleepEntry: (entry) => {
        set((state) => ({ sleepHistory: [...state.sleepHistory, entry] }));
        fetch('/api/sleep', { method: 'POST', body: JSON.stringify(entry) }).catch(console.error);
      },
      updateWellnessMetrics: (metrics) => set((state) => ({
        wellnessMetrics: { ...state.wellnessMetrics, ...metrics }
      })),
      addBreathingRecord: (record) => {
        set((state) => ({
          breathingHistory: [...state.breathingHistory, record]
        }));
        fetch('/api/breathing', { method: 'POST', body: JSON.stringify(record) }).catch(console.error);
      },
      setSafeMode: (status) => set({ safeMode: status }),
      clearHistory: () => set(initialValues),
      syncRemoteData: async () => {
        try {
          const [moods, journals, habits, sleep, breathing] = await Promise.all([
            fetch('/api/mood').then(r => r.ok ? r.json() : []),
            fetch('/api/journal').then(r => r.ok ? r.json() : []),
            fetch('/api/habits').then(r => r.ok ? r.json() : []),
            fetch('/api/sleep').then(r => r.ok ? r.json() : []),
            fetch('/api/breathing').then(r => r.ok ? r.json() : [])
          ]);
          set((state) => ({
            ...state,
            moodHistory: moods.length ? moods : state.moodHistory,
            journalEntries: journals.length ? journals : state.journalEntries,
            habits: habits.length ? habits : state.habits,
            sleepHistory: sleep.length ? sleep : state.sleepHistory,
            breathingHistory: breathing.length ? breathing : state.breathingHistory,
          }));
        } catch (error) {
          console.error("Failed to sync remote generic metrics", error);
        }
      },
    }),
    {
      name: "mindcare-storage",
    }
  )
);
