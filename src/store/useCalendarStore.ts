import { create } from 'zustand';
import { CalendarEventItem } from '../types';
import { calendarRepo } from '../db/repositories/calendarRepo';

export type CalendarViewMode = 'month' | 'week' | 'day' | 'agenda';

interface CalendarState {
  events: CalendarEventItem[];
  selectedDate: string; // YYYY-MM-DD
  viewMode: CalendarViewMode;
  isLoading: boolean;

  loadEvents: () => Promise<void>;
  setSelectedDate: (date: string) => void;
  setViewMode: (mode: CalendarViewMode) => void;
  nextPeriod: () => void;
  prevPeriod: () => void;
  goToToday: () => void;

  addEvent: (event: {
    title: string;
    description?: string;
    location?: string;
    start_date: string;
    end_date: string;
    is_all_day?: boolean;
    color?: string;
    calendar_name?: string;
  }) => Promise<CalendarEventItem>;

  updateEvent: (id: string, updates: Partial<CalendarEventItem>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
}

export const useCalendarStore = create<CalendarState>((set, get) => ({
  events: [],
  selectedDate: new Date().toISOString().split('T')[0],
  viewMode: 'month',
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

  goToToday: () => set({ selectedDate: new Date().toISOString().split('T')[0] }),

  nextPeriod: () => {
    const current = new Date(get().selectedDate);
    const mode = get().viewMode;
    if (mode === 'month') {
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
    if (mode === 'month') {
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
      color: data.color || '#3B82F6',
      calendar_name: data.calendar_name || 'Personal',
      sync_status: 'pending_insert',
    };

    const created = await calendarRepo.create(newEvent);
    set((state) => ({ events: [...state.events, created] }));
    return created;
  },

  updateEvent: async (id, updates) => {
    await calendarRepo.update(id, {
      ...updates,
      sync_status: 'pending_update',
    });
    set((state) => ({
      events: state.events.map((e) =>
        e.id === id ? { ...e, ...updates, sync_status: 'pending_update' } : e
      ),
    }));
  },

  deleteEvent: async (id) => {
    const evt = get().events.find((e) => e.id === id);
    if (evt?.icloud_href) {
      await calendarRepo.update(id, { sync_status: 'pending_delete' });
    } else {
      await calendarRepo.delete(id);
    }
    set((state) => ({ events: state.events.filter((e) => e.id !== id) }));
  },
}));
