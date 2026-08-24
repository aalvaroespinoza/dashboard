import { create } from 'zustand';
import { CalendarEventItem, CalendarViewMode, UnifiedCalendarItem, TaskItem } from '../types';
import { calendarRepo } from '../db/repositories/calendarRepo';
import { useTasksStore } from './useTasksStore';

export interface CalendarCategoryItem {
  id: string;
  name: string;
  color: string;
  isVisible: boolean;
}

interface CalendarState {
  events: CalendarEventItem[];
  selectedDate: string; // YYYY-MM-DD
  viewMode: CalendarViewMode;
  categories: CalendarCategoryItem[];
  isLoading: boolean;

  loadEvents: () => Promise<void>;
  setSelectedDate: (date: string) => void;
  setViewMode: (mode: CalendarViewMode) => void;
  nextPeriod: () => void;
  prevPeriod: () => void;
  goToToday: () => void;
  toggleCategoryVisibility: (categoryId: string) => void;

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

const DEFAULT_CATEGORIES: CalendarCategoryItem[] = [
  { id: 'cat-personal', name: 'Personal', color: '#34C759', isVisible: true },
  { id: 'cat-work', name: 'Trabajo / UTN', color: '#FF9500', isVisible: true },
  { id: 'cat-study', name: 'Estudios & Exámenes', color: '#007AFF', isVisible: true },
  { id: 'cat-bday', name: 'Cumpleaños & Eventos', color: '#FF2D55', isVisible: true },
];

export const useCalendarStore = create<CalendarState>((set, get) => ({
  events: [],
  selectedDate: '2026-08-24',
  viewMode: 'month_hybrid',
  categories: DEFAULT_CATEGORIES,
  isLoading: false,

  loadEvents: async () => {
    set({ isLoading: true });
    try {
      const events = await calendarRepo.getAll();
      set({ events, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  setSelectedDate: (date) => set({ selectedDate: date }),
  setViewMode: (mode) => set({ viewMode: mode }),

  goToToday: () => set({ selectedDate: '2026-08-24' }),

  toggleCategoryVisibility: (categoryId) => {
    set((state) => ({
      categories: state.categories.map((c) =>
        c.id === categoryId ? { ...c, isVisible: !c.isVisible } : c
      ),
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
    const { events, categories, getDDayText } = get();
    const tasks = useTasksStore.getState().tasks;
    const lists = useTasksStore.getState().lists;

    const visibleCategories = categories.filter((c) => c.isVisible).map((c) => c.name.toLowerCase());

    const result: UnifiedCalendarItem[] = [];

    // 1. Filtrar eventos del día
    events.forEach((evt) => {
      const evtDate = evt.start_date.split('T')[0];
      const calName = evt.calendar_name || 'Personal';
      if (evtDate === dateStr && (visibleCategories.includes(calName.toLowerCase()) || visibleCategories.length === 0)) {
        const startTime = evt.start_date.includes('T') ? evt.start_date.split('T')[1].slice(0, 5) : null;
        const endTime = evt.end_date.includes('T') ? evt.end_date.split('T')[1].slice(0, 5) : null;
        
        let dDayText = null;
        if (evt.is_milestone || evt.d_day_target) {
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
          end_time: task.due_time ? getEstimatedEndTime(task.due_time) : null,
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

function getEstimatedEndTime(startTimeStr: string): string {
  const [h, m] = startTimeStr.split(':').map(Number);
  const totalMin = h * 60 + m + 45; // default 45min block
  const endH = Math.floor(totalMin / 60) % 24;
  const endM = totalMin % 60;
  return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
}
