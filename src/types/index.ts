export type Priority = 'none' | 'low' | 'medium' | 'high';

export type SyncStatus = 'synced' | 'pending_insert' | 'pending_update' | 'pending_delete' | 'error';

export interface TaskList {
  id: string;
  title: string;
  color?: string;
  icon?: string;
  position: number;
  icloud_href?: string | null;
  created_at: string;
  updated_at: string;
}

export interface TaskItem {
  id: string;
  list_id: string;
  parent_id?: string | null; // ID de la tarea padre para subtareas
  title: string;
  notes?: string | null;
  due_date?: string | null; // YYYY-MM-DD
  due_time?: string | null; // HH:mm
  is_completed: number; // 0 or 1
  completed_at?: string | null; // ISO 8601 UTC
  priority: Priority;
  priority_num?: number; // 0=none, 1=high, 5=medium, 9=low
  flagged?: number; // 0 or 1
  rrule?: string | null; // Regla de recurrencia RFC 5545 (FREQ=DAILY, etc.)
  tags: string[]; // parsed from JSON array
  position: number;
  notification_id?: string | null;
  icloud_uid?: string | null;
  icloud_href?: string | null;
  icloud_etag?: string | null;
  sequence?: number;
  sync_status: SyncStatus;
  created_at: string;
  updated_at: string;

  // Propiedades derivadas en memoria (para árbol de subtareas)
  level?: number;
  has_subtasks?: boolean;
  subtasks_count?: number;
  subtasks_completed_count?: number;
  is_collapsed?: boolean;
}

export type RemindersViewMode = 'list' | 'columns';
export type RemindersGroupBy = 'list' | 'date' | 'priority';
export type SmartListFilter = 'today' | 'scheduled' | 'all' | 'flagged' | 'completed' | 'custom';

export interface CalendarEventItem {
  id: string;
  title: string;
  description?: string | null;
  location?: string | null;
  start_date: string; // ISO string YYYY-MM-DDTHH:mm:ss
  end_date: string;   // ISO string YYYY-MM-DDTHH:mm:ss
  is_all_day: number; // 0 or 1
  color?: string | null;
  calendar_name?: string | null;
  icloud_uid?: string | null;
  icloud_href?: string | null;
  icloud_etag?: string | null;
  sync_status: SyncStatus;
  created_at: string;
  updated_at: string;
}

export type TransactionType = 'income' | 'expense';

export type PaymentMethod = 'cash' | 'debit' | 'credit' | 'transfer' | 'other';

export interface FinanceCategory {
  id: string;
  name: string;
  type: TransactionType;
  icon: string;
  color: string;
  budget_limit?: number | null;
}

export interface FinanceTransaction {
  id: string;
  category_id: string;
  category_name?: string;
  category_icon?: string;
  category_color?: string;
  type: TransactionType;
  amount: number;
  description: string;
  payment_method: PaymentMethod;
  transaction_date: string; // YYYY-MM-DD
  created_at: string;
}

export interface NoteItem {
  id: string;
  title: string;
  content: string; // Markdown
  folder: string;
  tags: string[];
  is_pinned: number; // 0 or 1
  is_favorite: number; // 0 or 1
  created_at: string;
  updated_at: string;
}

export interface BusRouteItem {
  id: string;
  line_number: string;
  name: string;
  description: string;
  color: string;
  origin: string;
  destination: string;
}

export interface BusStopItem {
  id: string;
  route_id: string;
  name: string;
  latitude?: number | null;
  longitude?: number | null;
  sequence_order: number;
  direction: 'outbound' | 'inbound';
}

export type DayType = 'weekday' | 'saturday' | 'sunday_holiday';

export interface BusScheduleItem {
  id: string;
  route_id: string;
  stop_id?: string | null;
  day_type: DayType;
  departure_time: string; // HH:mm
}

export type HabitType = 'timer' | 'counter' | 'check';
export type GritNavigationTab = 'today' | 'stats' | 'settings';

export interface HabitCategory {
  id: string;
  name: string;
  emoji: string;
  color: string;
  position: number;
}

export interface HabitItem {
  id: string;
  category_id: string;
  title: string;
  type: HabitType;
  target_value: number;
  target_unit: string;
  frequency: string;
  color: string;
  icon: string;
  points: number;
  streak_count?: number; // ej. -20 o +14
  days_of_week?: number[]; // [0, 1, 2, 3, 4, 5, 6]
  reminder_time?: string | null; // HH:mm
  motivation?: string | null;
  is_archived?: number; // 0 or 1
  created_at: string;
  updated_at: string;
}

export interface HabitLogItem {
  id: string;
  habit_id: string;
  date: string; // YYYY-MM-DD
  completed_value: number;
  is_completed: number; // 0 or 1
  is_skipped?: number; // 0 or 1
  notes?: string | null;
  created_at: string;
}

export interface CalDAVConfig {
  appleId: string;
  appPassword?: string;
  serverUrl: string;
  isConnected: boolean;
  lastSyncTime?: string | null;
  calendarsUrl?: string | null;
}

export type ActiveModule = 'dashboard' | 'tasks' | 'habits' | 'calendar' | 'bus' | 'finance' | 'notes' | 'settings';
