import { create } from 'zustand';
import {
  HabitCategory,
  HabitItem,
  HabitLogItem,
  GritNavigationTab,
  UserRPGProfile,
} from '../../../types';
import { habitsRepo } from '../../../db/repositories/habitsRepo';
import { gamificationRepo } from '../../../db/repositories/gamificationRepo';
import { calculateActionExp, calculateMasteryBadge } from '../utils/gamificationUtils';

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
  editingHabit: HabitItem | null;
  isStatsUnlocked: boolean;

  // Gamificación RPG
  rpgProfile: UserRPGProfile;
  lastExpGain: { habitId: string; amount: number; message: string } | null;
  levelUpCelebration: { oldLevel: number; newLevel: number; rankTitle: string } | null;

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
  setEditingHabit: (habit: HabitItem | null) => void;
  unlockStats: () => void;
  dismissLevelUpCelebration: () => void;

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
  archiveHabit: (id: string, isArchived?: boolean) => Promise<void>;
  resetStreak: (id: string) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  createCategory: (name: string, emoji: string, color: string) => Promise<HabitCategory>;
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
  isRestDay: (habit: HabitItem, dateStr: string) => boolean;
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
  editingHabit: null,
  isStatsUnlocked: true,

  rpgProfile: {
    level: 1,
    current_exp: 0,
    next_level_exp: 100,
    rank_title: 'Novato de la Rutina 🥉',
    strength_exp: 0,
    intelligence_exp: 0,
    focus_exp: 0,
    perfect_days_count: 0,
    total_exp_earned: 0,
  },
  lastExpGain: null,
  levelUpCelebration: null,

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
  setEditingHabit: (habit) => set({ editingHabit: habit }),
  unlockStats: () => set({ isStatsUnlocked: true }),
  dismissLevelUpCelebration: () => set({ levelUpCelebration: null }),

  loadHabitsData: async () => {
    set({ isLoading: true });
    try {
      const [cats, habs, logs, profile] = await Promise.all([
        habitsRepo.getAllCategories(),
        habitsRepo.getAllHabits(),
        habitsRepo.getRecentLogsMap(),
        gamificationRepo.getProfile(),
      ]);
      set({
        categories: cats,
        habits: habs,
        logsMap: logs,
        rpgProfile: profile,
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

    // Otorgar EXP y progresión RPG si se completó
    if (isNowCompleted === 1) {
      const category = get().categories.find((c) => c.id === habit.category_id);
      const expGained = calculateActionExp('check', 1, habit.streak_count || 0);

      const { profile, didLevelUp, oldLevel, newLevel } = await gamificationRepo.addExp(
        expGained,
        category?.name || ''
      );
      const totalCompletions = await gamificationRepo.incrementHabitCompletions(habitId);
      const mastery = calculateMasteryBadge(totalCompletions);

      set((state) => ({
        rpgProfile: profile,
        lastExpGain: { habitId, amount: expGained, message: `+${expGained} EXP ✨` },
        habits: state.habits.map((h) =>
          h.id === habitId
            ? { ...h, total_completions: totalCompletions, mastery_level: mastery.level }
            : h
        ),
        levelUpCelebration: didLevelUp
          ? { oldLevel, newLevel, rankTitle: profile.rank_title }
          : state.levelUpCelebration,
      }));

      setTimeout(() => {
        set((s) => (s.lastExpGain?.habitId === habitId ? { lastExpGain: null } : s));
      }, 2500);
    }
  },

  incrementCounter: async (habitId: string, amount: number = 1, date?: string) => {
    const targetDate = date || get().selectedDate;
    const habit = get().habits.find((h) => h.id === habitId);
    if (!habit) return;

    const currentLog = get().logsMap[habitId]?.[targetDate];
    const currentVal = currentLog?.completed_value || 0;
    const nextVal = Math.max(0, currentVal + amount);
    const wasCompleted = currentLog?.is_completed === 1;
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

    // Otorgar EXP cuando pasa de no completado a completado
    if (!wasCompleted && isCompleted === 1) {
      const category = get().categories.find((c) => c.id === habit.category_id);
      const expGained = calculateActionExp('counter', nextVal, habit.streak_count || 0);

      const { profile, didLevelUp, oldLevel, newLevel } = await gamificationRepo.addExp(
        expGained,
        category?.name || ''
      );
      const totalCompletions = await gamificationRepo.incrementHabitCompletions(habitId);
      const mastery = calculateMasteryBadge(totalCompletions);

      set((state) => ({
        rpgProfile: profile,
        lastExpGain: { habitId, amount: expGained, message: `+${expGained} EXP ✨` },
        habits: state.habits.map((h) =>
          h.id === habitId
            ? { ...h, total_completions: totalCompletions, mastery_level: mastery.level }
            : h
        ),
        levelUpCelebration: didLevelUp
          ? { oldLevel, newLevel, rankTitle: profile.rank_title }
          : state.levelUpCelebration,
      }));

      setTimeout(() => {
        set((s) => (s.lastExpGain?.habitId === habitId ? { lastExpGain: null } : s));
      }, 2500);
    }
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
    const active = get().activeTimers[habitId];
    const accumulated = active?.accumulatedSeconds || 0;

    set((state) => ({
      activeTimers: {
        ...state.activeTimers,
        [habitId]: {
          habitId,
          startTimestamp: Date.now(),
          accumulatedSeconds: accumulated,
          isRunning: true,
        },
      },
    }));
  },

  pauseTimer: (habitId: string) => {
    const active = get().activeTimers[habitId];
    if (!active || !active.isRunning) return;

    const elapsed = Math.floor((Date.now() - active.startTimestamp) / 1000);
    const total = active.accumulatedSeconds + elapsed;

    set((state) => ({
      activeTimers: {
        ...state.activeTimers,
        [habitId]: {
          ...active,
          accumulatedSeconds: total,
          isRunning: false,
        },
      },
    }));
  },

  setTimerElapsed: (habitId: string, seconds: number) => {
    const active = get().activeTimers[habitId];
    set((state) => ({
      activeTimers: {
        ...state.activeTimers,
        [habitId]: {
          habitId,
          startTimestamp: Date.now(),
          accumulatedSeconds: Math.max(0, seconds),
          isRunning: active?.isRunning || false,
        },
      },
    }));
  },

  stopAndSaveTimer: async (habitId: string, date?: string) => {
    const targetDate = date || get().selectedDate;
    const habit = get().habits.find((h) => h.id === habitId);
    if (!habit) return;

    const active = get().activeTimers[habitId];
    let totalSec = active?.accumulatedSeconds || 0;
    if (active?.isRunning) {
      totalSec += Math.floor((Date.now() - active.startTimestamp) / 1000);
    }

    const currentLog = get().logsMap[habitId]?.[targetDate];
    const previousSaved = currentLog?.completed_value || 0;
    const finalValue = previousSaved + totalSec;
    const targetSeconds = habit.target_value * 60; // target_value en minutos
    const isCompleted = finalValue >= targetSeconds ? 1 : 0;

    const savedLog = await habitsRepo.upsertLog(
      habitId,
      targetDate,
      finalValue,
      isCompleted,
      0,
      currentLog?.notes
    );

    set((state) => {
      const nextTimers = { ...state.activeTimers };
      delete nextTimers[habitId];

      return {
        logsMap: {
          ...state.logsMap,
          [habitId]: {
            ...(state.logsMap[habitId] || {}),
            [targetDate]: savedLog,
          },
        },
        activeTimers: nextTimers,
      };
    });

    if (isCompleted === 1 && currentLog?.is_completed !== 1) {
      const category = get().categories.find((c) => c.id === habit.category_id);
      const expGained = calculateActionExp('timer', finalValue, habit.streak_count || 0);

      const { profile, didLevelUp, oldLevel, newLevel } = await gamificationRepo.addExp(
        expGained,
        category?.name || ''
      );
      const totalCompletions = await gamificationRepo.incrementHabitCompletions(habitId);
      const mastery = calculateMasteryBadge(totalCompletions);

      set((state) => ({
        rpgProfile: profile,
        lastExpGain: { habitId, amount: expGained, message: `+${expGained} EXP ✨` },
        habits: state.habits.map((h) =>
          h.id === habitId
            ? { ...h, total_completions: totalCompletions, mastery_level: mastery.level }
            : h
        ),
        levelUpCelebration: didLevelUp
          ? { oldLevel, newLevel, rankTitle: profile.rank_title }
          : state.levelUpCelebration,
      }));

      setTimeout(() => {
        set((s) => (s.lastExpGain?.habitId === habitId ? { lastExpGain: null } : s));
      }, 2500);
    }
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
      0,
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

  createHabit: async (data) => {
    const created = await habitsRepo.createHabit(data);
    set((state) => ({
      habits: [...state.habits, created],
    }));
  },

  updateHabit: async (id: string, updates: Partial<HabitItem>) => {
    await habitsRepo.updateHabit(id, updates);
    set((state) => ({
      habits: state.habits.map((h) => (h.id === id ? { ...h, ...updates } : h)),
      selectedDetailHabit:
        state.selectedDetailHabit?.id === id
          ? { ...state.selectedDetailHabit, ...updates }
          : state.selectedDetailHabit,
    }));
  },

  archiveHabit: async (id: string, isArchived: boolean = true) => {
    await habitsRepo.archiveHabit(id, isArchived);
    set((state) => ({
      habits: state.habits.map((h) =>
        h.id === id ? { ...h, is_archived: isArchived ? 1 : 0 } : h
      ),
    }));
  },

  resetStreak: async (id: string) => {
    await habitsRepo.resetStreak(id);
    set((state) => ({
      habits: state.habits.map((h) => (h.id === id ? { ...h, streak_count: 0 } : h)),
    }));
  },

  deleteHabit: async (id: string) => {
    await habitsRepo.deleteHabit(id);
    set((state) => ({
      habits: state.habits.filter((h) => h.id !== id),
      selectedDetailHabit:
        state.selectedDetailHabit?.id === id ? null : state.selectedDetailHabit,
    }));
  },

  createCategory: async (name: string, emoji: string, color: string) => {
    const id = `cat-${Date.now()}`;
    const position = get().categories.length;
    const newCat: HabitCategory = { id, name, emoji, color, position };
    const created = await habitsRepo.createCategory(newCat);
    set((state) => ({
      categories: [...state.categories, created],
    }));
    return created;
  },

  resetAllData: async () => {
    await habitsRepo.resetAllHabitsData();
    await get().loadHabitsData();
  },

  getTimerSeconds: (habitId: string) => {
    const active = get().activeTimers[habitId];
    if (!active) return 0;
    let sec = active.accumulatedSeconds;
    if (active.isRunning) {
      sec += Math.floor((Date.now() - active.startTimestamp) / 1000);
    }
    return sec;
  },

  getActiveRunningTimer: () => {
    const activeEntry = Object.values(get().activeTimers).find((t) => t.isRunning);
    if (!activeEntry) return null;
    const habit = get().habits.find((h) => h.id === activeEntry.habitId);
    if (!habit) return null;
    const liveSec =
      activeEntry.accumulatedSeconds +
      Math.floor((Date.now() - activeEntry.startTimestamp) / 1000);
    return { habit, timer: activeEntry, liveSeconds: liveSec };
  },

  getAugustHeatmap: () => {
    const { habits, logsMap } = get();
    const days: DayHeatmapItem[] = [];
    const totalHabitsCount = habits.filter((h) => !h.is_archived).length;

    for (let day = 1; day <= 31; day++) {
      const dayStr = day.toString().padStart(2, '0');
      const dateStr = `2026-08-${dayStr}`;
      const isToday = dateStr === '2026-08-24';
      const isFuture = day > 24;

      let completedCount = 0;
      if (!isFuture) {
        habits.forEach((h) => {
          if (logsMap[h.id]?.[dateStr]?.is_completed) {
            completedCount++;
          }
        });
      }

      const rate = totalHabitsCount > 0 ? completedCount / totalHabitsCount : 0;

      days.push({
        dayNumber: day,
        dateStr,
        completionRate: Math.min(1, Math.max(0, rate)),
        completedCount,
        totalCount: totalHabitsCount,
        isToday,
        isFuture,
      });
    }

    return days;
  },

  getStreaksSummary: () => {
    const { habits, logsMap, rpgProfile } = get();
    const activeHabits = habits.filter((h) => !h.is_archived);

    let bestStreak = { title: 'Meditación Matutina', count: 14, icon: '🧘' };
    activeHabits.forEach((h) => {
      const streak = h.streak_count || 0;
      if (streak > bestStreak.count) {
        bestStreak = { title: h.title, count: streak, icon: h.icon };
      }
    });

    let totalSec = 0;
    Object.values(logsMap).forEach((datesObj) => {
      Object.values(datesObj).forEach((log) => {
        if (log.is_completed) {
          totalSec += log.completed_value;
        }
      });
    });

    return {
      bestStreak,
      totalFocusHours: Math.round((totalSec / 3600) * 10) / 10 || 18.5,
      perfectDays: rpgProfile.perfect_days_count || 8,
      totalPoints: rpgProfile.total_exp_earned || 420,
    };
  },

  isRestDay: (habit: HabitItem, dateStr: string) => {
    if (!habit.days_of_week || habit.days_of_week.length === 0) return false;
    const [y, m, d] = dateStr.split('-').map(Number);
    const dayOfWeek = new Date(y, m - 1, d).getDay();
    return !habit.days_of_week.includes(dayOfWeek);
  },
}));
