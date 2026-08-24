import { create } from 'zustand';
import {
  HabitCategory,
  HabitItem,
  HabitLogItem,
  GritNavigationTab,
} from '../../../types';
import { habitsRepo } from '../../../db/repositories/habitsRepo';

export interface ActiveTimerState {
  habitId: string;
  startTimestamp: number;
  accumulatedSeconds: number;
  isRunning: boolean;
}

export interface DayHeatmapItem {
  dayNumber: number;
  dateStr: string;
  completionRate: number; // 0.0 to 1.0
  completedCount: number;
  totalCount: number;
  isToday: boolean;
  isFuture: boolean;
}

interface HabitsStoreState {
  // Estado de Navegación Grit
  currentTab: GritNavigationTab;
  selectedDate: string; // 'YYYY-MM-DD', default '2026-08-24'
  searchQuery: string;
  selectedDetailHabit: HabitItem | null;
  isStatsUnlocked: boolean;

  // Datos
  categories: HabitCategory[];
  habits: HabitItem[];
  logsMap: Record<string, Record<string, HabitLogItem>>; // [habitId][date] -> log
  activeTimers: Record<string, ActiveTimerState>;
  recentDates: string[]; // ['2026-08-14' ... '2026-08-24']
  isLoading: boolean;

  // Acciones de Navegación & Filtros
  setCurrentTab: (tab: GritNavigationTab) => void;
  setSelectedDate: (date: string) => void;
  setSearchQuery: (q: string) => void;
  openDetailHabit: (habit: HabitItem | null) => void;
  closeDetailHabit: () => void;
  unlockStats: () => void;

  // Acciones de Datos
  loadHabitsData: () => Promise<void>;
  toggleCheck: (habitId: string, date?: string) => Promise<void>;
  incrementCounter: (habitId: string, amount?: number, date?: string) => Promise<void>;
  decrementCounter: (habitId: string, amount?: number, date?: string) => Promise<void>;
  startTimer: (habitId: string) => void;
  pauseTimer: (habitId: string) => void;
  setTimerElapsed: (habitId: string, seconds: number) => void;
  stopAndSaveTimer: (habitId: string, date?: string) => Promise<void>;
  skipToday: (habitId: string, date?: string) => Promise<void>;
  undoSkip: (habitId: string, date?: string) => Promise<void>;
  saveHabitNote: (habitId: string, note: string, date?: string) => Promise<void>;
  createHabit: (habit: Omit<HabitItem, 'created_at' | 'updated_at'>) => Promise<void>;
  updateHabit: (id: string, updates: Partial<HabitItem>) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  resetAllData: () => Promise<void>;

  // Selectores y Helpers
  getTimerSeconds: (habitId: string) => number;
  getActiveRunningTimer: () => { habit: HabitItem; timer: ActiveTimerState; liveSeconds: number } | null;
  getAugustHeatmap: () => DayHeatmapItem[];
  getStreaksSummary: () => {
    bestStreak: { title: string; count: number; icon: string };
    totalFocusHours: number;
    perfectDays: number;
    totalPoints: number;
  };
}

// Genera los 10 días desde el 14 al 24 de agosto de 2026
function generateGritRecentDates(): string[] {
  const dates: string[] = [];
  for (let i = 10; i >= 0; i--) {
    const d = new Date(2026, 7, 24 - i);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
}

export const useHabitsStore = create<HabitsStoreState>((set, get) => ({
  currentTab: 'today',
  selectedDate: '2026-08-24',
  searchQuery: '',
  selectedDetailHabit: null,
  isStatsUnlocked: true,

  categories: [],
  habits: [],
  logsMap: {},
  activeTimers: {},
  recentDates: generateGritRecentDates(),
  isLoading: false,

  setCurrentTab: (tab) => set({ currentTab: tab }),
  setSelectedDate: (date) => set({ selectedDate: date }),
  setSearchQuery: (q) => set({ searchQuery: q }),
  openDetailHabit: (habit) => set({ selectedDetailHabit: habit }),
  closeDetailHabit: () => set({ selectedDetailHabit: null }),
  unlockStats: () => set({ isStatsUnlocked: true }),

  loadHabitsData: async () => {
    set({ isLoading: true });
    try {
      const [cats, habs, logs] = await Promise.all([
        habitsRepo.getAllCategories(),
        habitsRepo.getAllHabits(),
        habitsRepo.getRecentLogsMap(),
      ]);
      set({
        categories: cats,
        habits: habs,
        logsMap: logs,
        recentDates: generateGritRecentDates(),
        isLoading: false,
      });
    } catch (e) {
      console.error('Error cargando hábitos de Grit:', e);
      set({ isLoading: false });
    }
  },

  toggleCheck: async (habitId: string, date?: string) => {
    const targetDate = date || get().selectedDate;
    const habit = get().habits.find((h) => h.id === habitId);
    if (!habit) return;

    const currentLog = get().logsMap[habitId]?.[targetDate];
    const isNowCompleted = currentLog?.is_completed ? 0 : 1;
    const completedVal = isNowCompleted ? habit.target_value : 0;

    const savedLog = await habitsRepo.upsertLog(
      habitId,
      targetDate,
      completedVal,
      isNowCompleted,
      0,
      currentLog?.notes
    );

    set((state) => ({
      logsMap: {
        ...state.logsMap,
        [habitId]: {
          ...(state.logsMap[habitId] || {}),
          [targetDate]: savedLog,
        },
      },
    }));
  },

  incrementCounter: async (habitId: string, amount: number = 1, date?: string) => {
    const targetDate = date || get().selectedDate;
    const habit = get().habits.find((h) => h.id === habitId);
    if (!habit) return;

    const currentLog = get().logsMap[habitId]?.[targetDate];
    const currentVal = currentLog?.completed_value || 0;
    const nextVal = Math.max(0, currentVal + amount);
    const isCompleted = nextVal >= habit.target_value ? 1 : 0;

    const savedLog = await habitsRepo.upsertLog(
      habitId,
      targetDate,
      nextVal,
      isCompleted,
      0,
      currentLog?.notes
    );

    set((state) => ({
      logsMap: {
        ...state.logsMap,
        [habitId]: {
          ...(state.logsMap[habitId] || {}),
          [targetDate]: savedLog,
        },
      },
    }));
  },

  decrementCounter: async (habitId: string, amount: number = 1, date?: string) => {
    const targetDate = date || get().selectedDate;
    const habit = get().habits.find((h) => h.id === habitId);
    if (!habit) return;

    const currentLog = get().logsMap[habitId]?.[targetDate];
    const currentVal = currentLog?.completed_value || 0;
    const nextVal = Math.max(0, currentVal - amount);
    const isCompleted = nextVal >= habit.target_value ? 1 : 0;

    const savedLog = await habitsRepo.upsertLog(
      habitId,
      targetDate,
      nextVal,
      isCompleted,
      0,
      currentLog?.notes
    );

    set((state) => ({
      logsMap: {
        ...state.logsMap,
        [habitId]: {
          ...(state.logsMap[habitId] || {}),
          [targetDate]: savedLog,
        },
      },
    }));
  },

  startTimer: (habitId: string) => {
    const now = Date.now();
    const existing = get().activeTimers[habitId];

    set((state) => ({
      activeTimers: {
        ...state.activeTimers,
        [habitId]: {
          habitId,
          startTimestamp: now,
          accumulatedSeconds: existing ? existing.accumulatedSeconds : 0,
          isRunning: true,
        },
      },
    }));
  },

  pauseTimer: (habitId: string) => {
    const timer = get().activeTimers[habitId];
    if (!timer || !timer.isRunning) return;

    const elapsedNow = Math.floor((Date.now() - timer.startTimestamp) / 1000);
    const totalAccumulated = timer.accumulatedSeconds + elapsedNow;

    set((state) => ({
      activeTimers: {
        ...state.activeTimers,
        [habitId]: {
          ...timer,
          accumulatedSeconds: totalAccumulated,
          isRunning: false,
        },
      },
    }));
  },

  setTimerElapsed: (habitId: string, seconds: number) => {
    set((state) => ({
      activeTimers: {
        ...state.activeTimers,
        [habitId]: {
          habitId,
          startTimestamp: Date.now(),
          accumulatedSeconds: Math.max(0, seconds),
          isRunning: false,
        },
      },
    }));
  },

  stopAndSaveTimer: async (habitId: string, date?: string) => {
    const targetDate = date || get().selectedDate;
    const habit = get().habits.find((h) => h.id === habitId);
    if (!habit) return;

    const timer = get().activeTimers[habitId];
    let totalSeconds = 0;
    if (timer) {
      const elapsedNow = timer.isRunning
        ? Math.floor((Date.now() - timer.startTimestamp) / 1000)
        : 0;
      totalSeconds = timer.accumulatedSeconds + elapsedNow;
    }

    const elapsedMinutes = Math.round(totalSeconds / 60);
    const currentLog = get().logsMap[habitId]?.[targetDate];
    const prevMinutes = currentLog?.completed_value || 0;
    const totalMinutes = prevMinutes + (elapsedMinutes || 1); // mínimo 1 min si corrió
    const isCompleted = totalMinutes >= habit.target_value ? 1 : 0;

    const savedLog = await habitsRepo.upsertLog(
      habitId,
      targetDate,
      totalMinutes,
      isCompleted,
      0,
      currentLog?.notes
    );

    set((state) => {
      const copy = { ...state.activeTimers };
      delete copy[habitId];
      return {
        activeTimers: copy,
        logsMap: {
          ...state.logsMap,
          [habitId]: {
            ...(state.logsMap[habitId] || {}),
            [targetDate]: savedLog,
          },
        },
      };
    });
  },

  skipToday: async (habitId: string, date?: string) => {
    const targetDate = date || get().selectedDate;
    const currentLog = get().logsMap[habitId]?.[targetDate];

    const savedLog = await habitsRepo.upsertLog(
      habitId,
      targetDate,
      currentLog?.completed_value || 0,
      0,
      1, // is_skipped = 1
      currentLog?.notes
    );

    set((state) => ({
      logsMap: {
        ...state.logsMap,
        [habitId]: {
          ...(state.logsMap[habitId] || {}),
          [targetDate]: savedLog,
        },
      },
    }));
  },

  undoSkip: async (habitId: string, date?: string) => {
    const targetDate = date || get().selectedDate;
    const currentLog = get().logsMap[habitId]?.[targetDate];

    const savedLog = await habitsRepo.upsertLog(
      habitId,
      targetDate,
      currentLog?.completed_value || 0,
      currentLog?.is_completed || 0,
      0, // is_skipped = 0
      currentLog?.notes
    );

    set((state) => ({
      logsMap: {
        ...state.logsMap,
        [habitId]: {
          ...(state.logsMap[habitId] || {}),
          [targetDate]: savedLog,
        },
      },
    }));
  },

  saveHabitNote: async (habitId: string, note: string, date?: string) => {
    const targetDate = date || get().selectedDate;
    const currentLog = get().logsMap[habitId]?.[targetDate];
    const savedLog = await habitsRepo.upsertLog(
      habitId,
      targetDate,
      currentLog?.completed_value || 0,
      currentLog?.is_completed || 0,
      currentLog?.is_skipped || 0,
      note
    );

    set((state) => ({
      logsMap: {
        ...state.logsMap,
        [habitId]: {
          ...(state.logsMap[habitId] || {}),
          [targetDate]: savedLog,
        },
      },
    }));
  },

  createHabit: async (habit) => {
    const created = await habitsRepo.createHabit(habit);
    set((state) => ({
      habits: [...state.habits, created],
    }));
  },

  updateHabit: async (id, updates) => {
    await habitsRepo.updateHabit(id, updates);
    set((state) => ({
      habits: state.habits.map((h) => (h.id === id ? { ...h, ...updates } : h)),
      selectedDetailHabit:
        state.selectedDetailHabit?.id === id
          ? { ...state.selectedDetailHabit, ...updates }
          : state.selectedDetailHabit,
    }));
  },

  deleteHabit: async (id) => {
    await habitsRepo.deleteHabit(id);
    set((state) => ({
      habits: state.habits.filter((h) => h.id !== id),
      selectedDetailHabit: state.selectedDetailHabit?.id === id ? null : state.selectedDetailHabit,
    }));
  },

  resetAllData: async () => {
    await habitsRepo.resetAllHabitsData();
    await get().loadHabitsData();
  },

  getTimerSeconds: (habitId: string) => {
    const timer = get().activeTimers[habitId];
    if (!timer) return 0;
    if (!timer.isRunning) return timer.accumulatedSeconds;
    const elapsed = Math.floor((Date.now() - timer.startTimestamp) / 1000);
    return timer.accumulatedSeconds + elapsed;
  },

  getActiveRunningTimer: () => {
    const timers = get().activeTimers;
    const habits = get().habits;
    for (const habitId in timers) {
      const t = timers[habitId];
      if (t && t.isRunning) {
        const habit = habits.find((h) => h.id === habitId);
        if (habit) {
          const liveSecs = get().getTimerSeconds(habitId);
          return { habit, timer: t, liveSeconds: liveSecs };
        }
      }
    }
    return null;
  },

  getAugustHeatmap: () => {
    const { habits, logsMap } = get();
    const daysInAugust = 31;
    const items: DayHeatmapItem[] = [];

    for (let day = 1; day <= daysInAugust; day++) {
      const dateStr = `2026-08-${day.toString().padStart(2, '0')}`;
      const isToday = day === 24;
      const isFuture = day > 24;

      let completedCount = 0;
      habits.forEach((h) => {
        if (logsMap[h.id]?.[dateStr]?.is_completed) {
          completedCount++;
        }
      });

      const totalCount = habits.length || 1;
      const rate = isFuture ? 0 : completedCount / totalCount;

      items.push({
        dayNumber: day,
        dateStr,
        completionRate: rate,
        completedCount,
        totalCount: habits.length,
        isToday,
        isFuture,
      });
    }

    return items;
  },

  getStreaksSummary: () => {
    const { habits, logsMap } = get();

    // Mejor racha
    let best = { title: 'Estudio enfocado', count: 14, icon: '🎯' };
    let totalFocusMins = 0;
    let perfectDays = 0;
    let totalPoints = 0;

    habits.forEach((h) => {
      if ((h.streak_count || 0) > best.count) {
        best = { title: h.title, count: h.streak_count || 0, icon: h.icon };
      }
      if (h.type === 'timer') {
        const logs = logsMap[h.id] || {};
        for (const date in logs) {
          totalFocusMins += logs[date]?.completed_value || 0;
        }
      }
    });

    // Calcular días perfectos en agosto
    for (let d = 1; d <= 24; d++) {
      const dateStr = `2026-08-${d.toString().padStart(2, '0')}`;
      const completedOnDay = habits.filter((h) => logsMap[h.id]?.[dateStr]?.is_completed).length;
      if (completedOnDay >= 4) {
        perfectDays++;
        totalPoints += completedOnDay * 20;
      }
    }

    return {
      bestStreak: best,
      totalFocusHours: Math.round(totalFocusMins / 60) || 18,
      perfectDays: perfectDays || 12,
      totalPoints: totalPoints || 1480,
    };
  },
}));
