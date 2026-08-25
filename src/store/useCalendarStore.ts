import { create } from 'zustand';
import {
  CalendarEventItem,
  CalendarViewMode,
  UnifiedCalendarItem,
  CalendarCategoryItem,
  CalendarSettings,
} from '../types';
import { calendarRepo } from '../db/repositories/calendarRepo';
import { calendarCategoriesRepo } from '../db/repositories/calendarCategoriesRepo';
import { useTasksStore } from './useTasksStore';

interface CalendarState {
  events: CalendarEventItem[];
  selectedDate: string; // YYYY-MM-DD
  viewMode: CalendarViewMode;
  categories: CalendarCategoryItem[];
  settings: CalendarSettings;
  isLoading: boolean;

  loadEvents: () => Promise<void>;
  loadCategories: () => Promise<void>;
  setSelectedDate: (date: string) => void;
  setViewMode: (mode: CalendarViewMode) => void;
  nextPeriod: () => void;
  prevPeriod: () => void;
  goToToday: () => void;
  toggleCategoryVisibility: (categoryId: string) => Promise<void>;

  // Gestión de Calendarios
  createCategory: (name: string, color: string) => Promise<CalendarCategoryItem>;
  updateCategory: (id: string, updates: Partial<CalendarCategoryItem>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;

  // Configuración Pro
  updateSettings: (updates: Partial<CalendarSettings>) => void;

  addEvent: (event: {
    title: string;
    description?: string;
    location?: string;
    start_date: string;
    end_date: string;
    is_all_day?: boolean;
    is_milestone?: boolean;
    d_day_target?: string;
    color?: string;
    calendar_name?: string;
  }) => Promise<CalendarEventItem>;

  updateEvent: (id: string, updates: Partial<CalendarEventItem>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;

  // Selectores de Alimentación Unificada (Google Time-Blocking + D-Day)
  getUnifiedItemsForDate: (dateStr: string) => UnifiedCalendarItem[];
  getUnifiedItemsForRange: (startDate: string, endDate: string) => UnifiedCalendarItem[];
  getDDayText: (targetDateStr: string, baseDateStr?: string) => string;
}

const DEFAULT_SETTINGS: CalendarSettings = {
  hourRange: 'extended', // 'extended' (06:00-23:00), '24h' (00:00-23:00), 'work' (08:00-20:00)
  slotDensity: 'standard', // 'compact' (48px), 'standard' (60px), 'spacious' (76px)
  firstDayOfWeek: 'monday',
  hideWeekends: false,
  hideCompletedTasks: false,
  defaultTaskDuration: 45,
  showDDayBadges: true,
};

export const useCalendarStore = create<CalendarState>((set, get) => ({
  events: [],
  selectedDate: '2026-08-24',
  viewMode: 'month_hybrid',
  categories: [],
  settings: DEFAULT_SETTINGS,
  isLoading: false,

  loadEvents: async () => {
    set({ isLoading: true });
    try {
      const [events, categories] = await Promise.all([
        calendarRepo.getAll(),
        calendarCategoriesRepo.getAll(),
      ]);
      set({ events, categories, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  loadCategories: async () => {
    try {
      const categories = await calendarCategoriesRepo.getAll();
      set({ categories });
    } catch (e) {
      console.error('Error loading categories', e);
    }
  },

  setSelectedDate: (date) => set({ selectedDate: date }),
  setViewMode: (mode) => set({ viewMode: mode }),

  goToToday: () => set({ selectedDate: '2026-08-24' }),

  updateSettings: (updates) => {
    set((state) => ({
      settings: { ...state.settings, ...updates },
    }));
  },

  toggleCategoryVisibility: async (categoryId) => {
    const current = get().categories.find((c) => c.id === categoryId);
    if (!current) return;

    const newVisibility = current.is_visible ? 0 : 1;
    set((state) => ({
      categories: state.categories.map((c) =>
        c.id === categoryId ? { ...c, is_visible: newVisibility } : c
      ),
    }));

    await calendarCategoriesRepo.update(categoryId, { is_visible: newVisibility });
  },

  createCategory: async (name, color) => {
    const created = await calendarCategoriesRepo.create(name, color);
    set((state) => ({ categories: [...state.categories, created] }));
    return created;
  },

  updateCategory: async (id, updates) => {
    await calendarCategoriesRepo.update(id, updates);
    set((state) => ({
      categories: state.categories.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    }));
  },

  deleteCategory: async (id) => {
    const cat = get().categories.find((c) => c.id === id);
    await calendarCategoriesRepo.delete(id);
    set((state) => ({
      categories: state.categories.filter((c) => c.id !== id),
      events: cat ? state.events.filter((e) => e.calendar_name !== cat.name) : state.events,
    }));
  },

  nextPeriod: () => {
    const current = new Date(get().selectedDate);
    const mode = get().viewMode;
    if (mode === 'month_hybrid') {
      current.setMonth(current.getMonth() + 1);
    } else if (mode === 'week') {
      current.setDate(current.getDate() + 7);
    } else {
      current.setDate(current.getDate() + 1);
    }
    set({ selectedDate: current.toISOString().split('T')[0] });
  },

  prevPeriod: () => {
    const current = new Date(get().selectedDate);
    const mode = get().viewMode;
    if (mode === 'month_hybrid') {
      current.setMonth(current.getMonth() - 1);
    } else if (mode === 'week') {
      current.setDate(current.getDate() - 7);
    } else {
      current.setDate(current.getDate() - 1);
    }
    set({ selectedDate: current.toISOString().split('T')[0] });
  },

  addEvent: async (data) => {
    const newEvent: Omit<CalendarEventItem, 'created_at' | 'updated_at'> = {
      id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      title: data.title.trim(),
      description: data.description?.trim() || null,
      location: data.location?.trim() || null,
      start_date: data.start_date,
      end_date: data.end_date,
      is_all_day: data.is_all_day ? 1 : 0,
      is_milestone: data.is_milestone ? 1 : 0,
      d_day_target: data.d_day_target || null,
      color: data.color || '#007AFF',
      calendar_name: data.calendar_name || 'Personal',
      sync_status: 'pending_insert',
    };

    const created = await calendarRepo.create(newEvent);
    set((state) => ({ events: [...state.events, created] }));
    return created;
  },

  updateEvent: async (id, updates) => {
    await calendarRepo.update(id, updates);
    set((state) => ({
      events: state.events.map((e) => (e.id === id ? { ...e, ...updates } : e)),
    }));
  },

  deleteEvent: async (id) => {
    await calendarRepo.delete(id);
    set((state) => ({
      events: state.events.filter((e) => e.id !== id),
    }));
  },

  getDDayText: (targetDateStr: string, baseDateStr = '2026-08-24') => {
    const target = new Date(targetDateStr);
    const base = new Date(baseDateStr);
    const diffTime = target.getTime() - base.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'D-Day';
    if (diffDays > 0) return `D-${diffDays}`;
    return `D+${Math.abs(diffDays)}`;
  },

  getUnifiedItemsForDate: (dateStr: string) => {
    const { events, categories, settings, getDDayText } = get();
    const tasks = useTasksStore.getState().tasks;
    const lists = useTasksStore.getState().lists;

    const visibleCategories = categories.filter((c) => c.is_visible).map((c) => c.name.toLowerCase());

    const result: UnifiedCalendarItem[] = [];

    // 1. Filtrar eventos del día
    events.forEach((evt) => {
      const evtDate = evt.start_date.split('T')[0];
      const calName = evt.calendar_name || 'Personal';
      if (evtDate === dateStr && (visibleCategories.includes(calName.toLowerCase()) || visibleCategories.length === 0)) {
        const startTime = evt.start_date.includes('T') ? evt.start_date.split('T')[1].slice(0, 5) : null;
        const endTime = evt.end_date.includes('T') ? evt.end_date.split('T')[1].slice(0, 5) : null;
        
        let dDayText = null;
        if (settings.showDDayBadges && (evt.is_milestone || evt.d_day_target)) {
          dDayText = getDDayText(evt.d_day_target || evtDate, '2026-08-24');
        }

        result.push({
          id: `evt-${evt.id}`,
          type: 'event',
          title: evt.title,
          description: evt.description,
          location: evt.location,
          date: evtDate,
          start_time: startTime,
          end_time: endTime,
          is_all_day: Boolean(evt.is_all_day),
          color: evt.color || '#007AFF',
          calendar_name: calName,
          is_milestone: Boolean(evt.is_milestone),
          d_day_text: dDayText,
          event_id: evt.id,
        });
      }
    });

    // 2. Inyectar tareas programadas para el día (Google Time-Blocking)
    tasks.forEach((task) => {
      if (task.due_date === dateStr) {
        if (settings.hideCompletedTasks && task.is_completed) {
          return;
        }

        const list = lists.find((l) => l.id === task.list_id);
        const listName = list?.title || 'Recordatorios';
        const listColor = list?.color || '#007AFF';

        result.push({
          id: `task-${task.id}`,
          type: 'task',
          title: task.title,
          description: task.notes,
          location: null,
          date: dateStr,
          start_time: task.due_time || null,
          end_time: task.due_time ? getEstimatedEndTime(task.due_time, settings.defaultTaskDuration) : null,
          is_all_day: !task.due_time,
          color: listColor,
          calendar_name: listName,
          is_completed: Boolean(task.is_completed),
          priority: task.priority,
          tags: task.tags,
          task_id: task.id,
        });
      }
    });

    // Ordenar: primero todo el día, luego por hora de inicio
    return result.sort((a, b) => {
      if (a.is_all_day && !b.is_all_day) return -1;
      if (!a.is_all_day && b.is_all_day) return 1;
      if (a.start_time && b.start_time) return a.start_time.localeCompare(b.start_time);
      return 0;
    });
  },

  getUnifiedItemsForRange: (startDate: string, endDate: string) => {
    const { getUnifiedItemsForDate } = get();
    const start = new Date(startDate);
    const end = new Date(endDate);

    const items: UnifiedCalendarItem[] = [];
    const current = new Date(start);

    while (current <= end) {
      const dateStr = current.toISOString().split('T')[0];
      items.push(...getUnifiedItemsForDate(dateStr));
      current.setDate(current.getDate() + 1);
    }

    return items;
  },
}));

export function getEstimatedEndTime(startTimeStr: string, durationMinutes = 45): string {
  const [h, m] = startTimeStr.split(':').map(Number);
  const totalMin = h * 60 + m + durationMinutes;
  const endH = Math.floor(totalMin / 60) % 24;
  const endM = totalMin % 60;
  return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
}
