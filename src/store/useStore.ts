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
  addRescueCompletion: (moduleId: string) => void;
  addExerciseCompletion: (exerciseType: string) => void;
  setSafeMode: (status: boolean) => void;
  setPreferredLanguage: (lang: string) => void;
  setAgentGender: (gender: 'male' | 'female' | 'neutral') => void;
  clearHistory: () => void;
  clearStore: () => void;
  clearPersistedData: () => void;
  setLastSyncedUserId: (id: string) => void;
  syncRemoteData: (userId?: string) => Promise<void>;
  syncStatus: 'idle' | 'syncing' | 'success' | 'error';
  setSyncStatus: (status: 'idle' | 'syncing' | 'success' | 'error') => void;
lastSyncedAt: number;
  preferredLanguage: string;
  agentGender: 'male' | 'female' | 'neutral';
  _syncPending: Record<string, number>;
  lastSyncedUserId: string;
}

const initialValues: UserState & {
  safeMode: boolean;
  syncStatus: 'idle' | 'syncing' | 'success' | 'error';
  _syncPending: Record<string, number>;
  lastSyncedAt: number;
  preferredLanguage: string;
  agentGender: 'male' | 'female' | 'neutral';
  lastSyncedUserId: string;
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
  completedRescueModules: [],
  completedExercises: [],
  safeMode: false,
  syncStatus: 'idle',
  _syncPending: {},
  lastSyncedAt: 0,
  preferredLanguage: 'en',
  agentGender: 'neutral' as const,
  lastSyncedUserId: '',
};

function mergeByLatestTimestamp<T extends { id: string; timestamp?: string }>(
  local: T[],
  server: T[],
  _idKey: keyof T
): T[] {
  const map = new Map<string, T>();
  for (const item of local) {
    map.set(item.id, item);
  }
  for (const item of server) {
    const existing = map.get(item.id);
    if (!existing) {
      map.set(item.id, item);
    } else {
      const tsA = new Date(existing.timestamp || 0).getTime();
      const tsB = new Date(item.timestamp || 0).getTime();
      if (tsB > tsA) {
        map.set(item.id, item);
      }
    }
  }
  return Array.from(map.values());
}

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
      addMoodEntry: (entry) => {
        set((state) => ({ moodHistory: [...state.moodHistory, entry] }));
        debouncedSync(`mood:${entry.id}`, '/api/mood', entry);
      },
      addJournalEntry: (entry) => {
        set((state) => ({ journalEntries: [...state.journalEntries, entry] }));
        debouncedSync(`journal:${entry.id}`, '/api/journal', entry);
      },
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
      addRescueCompletion: (moduleId) =>
        set((state) => {
          if (state.completedRescueModules.includes(moduleId)) return {};
          return { completedRescueModules: [...state.completedRescueModules, moduleId] };
        }),
      addExerciseCompletion: (exerciseType) =>
        set((state) => {
          if (state.completedExercises.includes(exerciseType)) return {};
          return { completedExercises: [...state.completedExercises, exerciseType] };
        }),
      setSafeMode: (status) => set({ safeMode: status }),
      setPreferredLanguage: (lang) => set({ preferredLanguage: lang }),
      setAgentGender: (gender) => set({ agentGender: gender }),
      clearHistory: () => set({ ...initialValues, lastSyncedUserId: '' }),
      clearStore: () => set({ ...initialValues, lastSyncedUserId: '' }),
      clearPersistedData: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('mindcare-storage');
        }
      },
      setLastSyncedUserId: (id) => set({ lastSyncedUserId: id }),
      syncRemoteData: async (userId?: string) => {
        const now = Date.now();
        if (now - get().lastSyncedAt < 30000) return;
        const current = get().syncStatus;
        if (current === 'syncing') return;
        set({ syncStatus: 'syncing' });
        try {
          const [moodRes, journalRes, habitsRes, sleepRes, breathingRes] = await Promise.all([
            fetch('/api/mood?limit=100', { credentials: 'include' })
              .then((r) => (r.ok ? r.json().catch(() => null) : null))
              .catch(() => null),
            fetch('/api/journal?limit=50', { credentials: 'include' })
              .then((r) => (r.ok ? r.json().catch(() => null) : null))
              .catch(() => null),
            fetch('/api/habits?limit=100', { credentials: 'include' })
              .then((r) => (r.ok ? r.json().catch(() => null) : null))
              .catch(() => null),
            fetch('/api/sleep?limit=100', { credentials: 'include' })
              .then((r) => (r.ok ? r.json().catch(() => null) : null))
              .catch(() => null),
            fetch('/api/breathing?limit=50', { credentials: 'include' })
              .then((r) => (r.ok ? r.json().catch(() => null) : null))
              .catch(() => null),
          ]);

          const serverMood = moodRes?.data || [];
          const serverJournal = journalRes?.data || [];
          const serverHabits = habitsRes?.data || [];
          const serverSleep = sleepRes?.data || [];
          const serverBreathing = breathingRes?.data || [];

          const localMood = get().moodHistory;
          const localJournal = get().journalEntries;
          const localHabits = get().habits;
          const localSleep = get().sleepHistory;
          const localBreathing = get().breathingHistory;

          const mergedMood = mergeByLatestTimestamp(localMood, serverMood, 'id');
          const mergedJournal = mergeByLatestTimestamp(localJournal, serverJournal, 'id');
          const mergedHabits = mergeByLatestTimestamp(localHabits, serverHabits, 'id');
          const mergedSleep = mergeByLatestTimestamp(localSleep, serverSleep, 'id');
          const mergedBreathing = mergeByLatestTimestamp(localBreathing, serverBreathing, 'id');

          set({
            syncStatus: 'success',
            lastSyncedAt: now,
            moodHistory: mergedMood.slice(-100),
            journalEntries: mergedJournal.slice(-50),
            habits: mergedHabits,
            sleepHistory: mergedSleep.slice(-100),
            breathingHistory: mergedBreathing.slice(-50),
          });
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
          'completedRescueModules',
          'completedExercises',
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
      partialize: (state: UserState & { safeMode: boolean; lastSyncedAt: number; lastSyncedUserId: string }): any => ({
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
        completedRescueModules: state.completedRescueModules || [],
        completedExercises: state.completedExercises || [],
        safeMode: state.safeMode,
        preferredLanguage: (state as any).preferredLanguage || 'en',
        agentGender: (state as any).agentGender || 'neutral',
        lastSyncedAt: state.lastSyncedAt || 0,
        lastSyncedUserId: (state as any).lastSyncedUserId || '',
      }),
    }
  )
);
