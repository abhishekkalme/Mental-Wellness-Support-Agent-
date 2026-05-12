import { create } from 'zustand';
import { persist, StorageValue } from 'zustand/middleware';
import {
  UserState,
  MoodEntry,
  JournalEntry,
  ChatMessage,
  Habit,
  Goal,
  SleepEntry,
  WellnessMetrics,
  OnboardingData,
  BreathingRecord,
} from '@/lib/types';
import { encrypt, decrypt } from '@/lib/crypto';

interface MindCareStore extends UserState {
  setName: (name: string) => void;
  setUsername: (username: string) => void;
  setOnboarded: (status: boolean) => void;
  setOnboardingData: (data: Partial<OnboardingData>) => void;
  addMoodEntry: (entry: MoodEntry) => void;
  addJournalEntry: (entry: JournalEntry) => void;
  addChatMessage: (msg: ChatMessage) => void;
  updateLastActive: () => void;
  setWellnessGoals: (goals: string[]) => void;
  addHabit: (habit: Habit) => void;
  deleteHabit: (habitId: string) => void;
  toggleHabit: (habitId: string, date: string) => void;
  addGoal: (goal: Goal) => void;
  toggleGoal: (goalId: string) => void;
  addSleepEntry: (entry: SleepEntry) => void;
  updateWellnessMetrics: (metrics: Partial<WellnessMetrics>) => void;
  addBreathingRecord: (record: {
    id: string;
    date: string;
    durationSeconds: number;
    pattern: string;
  }) => void;
  setSafeMode: (status: boolean) => void;
  clearHistory: () => void;
  syncRemoteData: () => Promise<void>;
  syncStatus: 'idle' | 'syncing' | 'success' | 'error';
  setSyncStatus: (status: 'idle' | 'syncing' | 'success' | 'error') => void;
  _syncPending: Record<string, number>;
}

const initialValues: UserState & {
  safeMode: boolean;
  syncStatus: 'idle' | 'syncing' | 'success' | 'error';
  _syncPending: Record<string, number>;
} = {
  name: '',
  username: '',
  isOnboarded: false,
  onboardingData: { struggles: [] },
  moodHistory: [],
  journalEntries: [],
  chatHistory: [],
  lastActive: new Date().toISOString(),
  wellnessGoals: [],
  habits: [],
  goals: [],
  sleepHistory: [],
  wellnessMetrics: { mental: 0, emotional: 0, physical: 0, social: 0, sleep: 0, spiritual: 0 },
  breathingHistory: [],
  safeMode: false,
  syncStatus: 'idle',
  _syncPending: {},
};

const SYNC_DEBOUNCE_MS = 5000;
const syncTimers: Record<string, ReturnType<typeof setTimeout>> = {};

function debouncedSync(key: string, url: string, data: unknown) {
  if (syncTimers[key]) clearTimeout(syncTimers[key]);
  syncTimers[key] = setTimeout(() => {
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    }).catch(() => {});
    delete syncTimers[key];
  }, SYNC_DEBOUNCE_MS);
}

const encryptedStorage = {
  getItem: (name: string): StorageValue<MindCareStore> | null => {
    try {
      const raw = localStorage.getItem(name);
      if (!raw) return null;
      try {
        const decrypted = decrypt(raw);
        return JSON.parse(decrypted) as StorageValue<MindCareStore>;
      } catch {
        return JSON.parse(raw) as StorageValue<MindCareStore>;
      }
    } catch {
      return null;
    }
  },
  setItem: (name: string, value: StorageValue<MindCareStore>): void => {
    try {
      localStorage.setItem(name, encrypt(JSON.stringify(value)));
    } catch {}
  },
  removeItem: (name: string): void => {
    localStorage.removeItem(name);
  },
};

export const useStore = create<MindCareStore>()(
  persist<MindCareStore>(
    (set, get) => ({
      ...initialValues,
      setName: (name) => set({ name }),
      setUsername: (username) => set({ username }),
      setOnboarded: (status) => set({ isOnboarded: status }),
      setOnboardingData: (data) =>
        set((state) => ({
          onboardingData: { ...state.onboardingData, ...data } as OnboardingData,
        })),
      setSyncStatus: (status) => set({ syncStatus: status }),
      addMoodEntry: (entry) => set((state) => ({ moodHistory: [...state.moodHistory, entry] })),
      addJournalEntry: (entry) =>
        set((state) => ({ journalEntries: [...state.journalEntries, entry] })),
      addChatMessage: (msg) =>
        set((state) => {
          const newHistory = [...state.chatHistory, msg];
          return { chatHistory: newHistory.slice(-50) };
        }),
      updateLastActive: () => set({ lastActive: new Date().toISOString() }),
      setWellnessGoals: (goals) => set({ wellnessGoals: goals }),
      addHabit: (habit) => set((state) => ({ habits: [...state.habits, habit] })),
      deleteHabit: (habitId) =>
        set((state) => ({ habits: state.habits.filter((h) => h.id !== habitId) })),
      toggleHabit: (habitId, date) => {
        let updated: {
          id: string;
          name: string;
          frequency: 'daily' | 'weekly';
          streak: number;
          completedDates: string[];
        } | null = null;
        set((state) => ({
          habits: state.habits.map((h) => {
            if (h.id !== habitId) return h;
            const completed = h.completedDates.includes(date);
            const newDates = completed
              ? h.completedDates.filter((d) => d !== date)
              : [...h.completedDates, date];
            updated = { ...h, completedDates: newDates };
            return updated;
          }),
        }));
        if (updated) debouncedSync(`habit:${habitId}`, '/api/habits', updated);
      },
      addGoal: (goal) => set((state) => ({ goals: [...state.goals, goal] })),
      toggleGoal: (goalId) =>
        set((state) => ({
          goals: state.goals.map((g) => (g.id === goalId ? { ...g, completed: !g.completed } : g)),
        })),
      addSleepEntry: (entry) => set((state) => ({ sleepHistory: [...state.sleepHistory, entry] })),
      updateWellnessMetrics: (metrics) =>
        set((state) => ({ wellnessMetrics: { ...state.wellnessMetrics, ...metrics } })),
      addBreathingRecord: (record) => {
        set((state) => ({ breathingHistory: [...state.breathingHistory, record] }));
        debouncedSync('breathing', '/api/breathing', record);
      },
      setSafeMode: (status) => set({ safeMode: status }),
      clearHistory: () => set(initialValues),
      syncRemoteData: async () => {
        const current = get().syncStatus;
        if (current === 'syncing') return;
        set({ syncStatus: 'syncing' });
        try {
          const [moods, journals, habits, sleep, breathing] = await Promise.all([
            fetch('/api/mood', { credentials: 'include' })
              .then((r) => (r.ok ? (r.json() as Promise<unknown[]>) : null))
              .catch(() => null),
            fetch('/api/journal', { credentials: 'include' })
              .then((r) => (r.ok ? (r.json() as Promise<unknown[]>) : null))
              .catch(() => null),
            fetch('/api/habits', { credentials: 'include' })
              .then((r) => (r.ok ? (r.json() as Promise<unknown[]>) : null))
              .catch(() => null),
            fetch('/api/sleep', { credentials: 'include' })
              .then((r) => (r.ok ? (r.json() as Promise<unknown[]>) : null))
              .catch(() => null),
            fetch('/api/breathing', { credentials: 'include' })
              .then((r) => (r.ok ? (r.json() as Promise<unknown[]>) : null))
              .catch(() => null),
          ]);
          set((state) => ({
            syncStatus: 'success',
            moodHistory:
              Array.isArray(moods) && moods.length ? (moods as MoodEntry[]) : state.moodHistory,
            journalEntries:
              Array.isArray(journals) && journals.length
                ? (journals as JournalEntry[])
                : state.journalEntries,
            habits: Array.isArray(habits) && habits.length ? (habits as Habit[]) : state.habits,
            sleepHistory:
              Array.isArray(sleep) && sleep.length ? (sleep as SleepEntry[]) : state.sleepHistory,
            breathingHistory:
              Array.isArray(breathing) && breathing.length
                ? (breathing as BreathingRecord[])
                : state.breathingHistory,
          }));
          setTimeout(() => set({ syncStatus: 'idle' }), 3000);
        } catch {
          set({ syncStatus: 'error' });
          setTimeout(() => set({ syncStatus: 'idle' }), 5000);
        }
      },
    }),
    {
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        // Post-hydration safety sweep: Ensure all history items are definitely arrays
        // This prevents crashes if local storage was corrupted or from an older version
        const keys: (keyof MindCareStore)[] = [
          'moodHistory',
          'journalEntries',
          'chatHistory',
          'wellnessGoals',
          'habits',
          'goals',
          'sleepHistory',
          'breathingHistory',
        ];

        keys.forEach((key) => {
          if (!Array.isArray(state[key])) {
            (state as any)[key] = [];
          }
        });

        // Ensure wellnessMetrics is also an object
        if (!state.wellnessMetrics || typeof state.wellnessMetrics !== 'object') {
          state.wellnessMetrics = initialValues.wellnessMetrics;
        }

        state.setSyncStatus('idle');
      },
      name: 'mindcare-storage',
      storage: encryptedStorage,
      partialize: (state: UserState & { safeMode: boolean }): any => ({
        name: state.name,
        username: state.username,
        isOnboarded: state.isOnboarded,
        onboardingData: state.onboardingData,
        moodHistory: (state.moodHistory || []).slice(-100),
        journalEntries: (state.journalEntries || []).slice(-50),
        chatHistory: (state.chatHistory || []).slice(-50),
        lastActive: state.lastActive,
        wellnessGoals: state.wellnessGoals || [],
        habits: state.habits || [],
        goals: state.goals || [],
        sleepHistory: (state.sleepHistory || []).slice(-100),
        wellnessMetrics: state.wellnessMetrics,
        breathingHistory: (state.breathingHistory || []).slice(-50),
        safeMode: state.safeMode,
      }),
    }
  )
);
