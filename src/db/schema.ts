export const CREATE_TABLES_SQL = `
  PRAGMA foreign_keys = ON;

  -- Listas de recordatorios / tableros
  CREATE TABLE IF NOT EXISTS lists (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    color TEXT DEFAULT '#007AFF',
    icon TEXT DEFAULT 'list',
    position INTEGER DEFAULT 0,
    is_pinned INTEGER DEFAULT 0,
    icloud_href TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  -- Secciones dentro de una lista de recordatorios (ej. Salud, Universidad, Otros)
  CREATE TABLE IF NOT EXISTS list_sections (
    id TEXT PRIMARY KEY,
    list_id TEXT NOT NULL,
    name TEXT NOT NULL,
    position INTEGER DEFAULT 0,
    created_at TEXT NOT NULL,
    FOREIGN KEY (list_id) REFERENCES lists(id) ON DELETE CASCADE
  );
  CREATE INDEX IF NOT EXISTS idx_list_sections_list ON list_sections(list_id);

  -- Metadatos de Link Previews (URLs y videos enriquecidos)
  CREATE TABLE IF NOT EXISTS link_previews (
    url TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    domain TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  -- Tareas / Recordatorios con soporte de subtareas, secciones y URLs
  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    list_id TEXT NOT NULL,
    section_id TEXT,
    parent_id TEXT,
    title TEXT NOT NULL,
    notes TEXT,
    url TEXT,
    due_date TEXT,
    due_time TEXT,
    is_completed INTEGER DEFAULT 0,
    completed_at TEXT,
    priority TEXT DEFAULT 'none',
    priority_num INTEGER DEFAULT 0,
    flagged INTEGER DEFAULT 0,
    rrule TEXT,
    tags TEXT DEFAULT '[]',
    position INTEGER DEFAULT 0,
    notification_id TEXT,
    icloud_uid TEXT,
    icloud_href TEXT,
    icloud_etag TEXT,
    sequence INTEGER DEFAULT 0,
    sync_status TEXT DEFAULT 'synced',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (list_id) REFERENCES lists(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (section_id) REFERENCES list_sections(id) ON DELETE SET NULL
  );
  CREATE INDEX IF NOT EXISTS idx_tasks_list_id ON tasks(list_id);
  CREATE INDEX IF NOT EXISTS idx_tasks_section_id ON tasks(section_id);
  CREATE INDEX IF NOT EXISTS idx_tasks_parent_id ON tasks(parent_id);
  CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
  CREATE INDEX IF NOT EXISTS idx_tasks_is_completed ON tasks(is_completed);
  CREATE INDEX IF NOT EXISTS idx_tasks_flagged ON tasks(flagged);

  -- Eventos de calendario
  CREATE TABLE IF NOT EXISTS calendar_events (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    location TEXT,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    is_all_day INTEGER DEFAULT 0,
    is_milestone INTEGER DEFAULT 0,
    d_day_target TEXT,
    color TEXT DEFAULT '#3B82F6',
    calendar_name TEXT DEFAULT 'Personal',
    icloud_uid TEXT,
    icloud_href TEXT,
    icloud_etag TEXT,
    sync_status TEXT DEFAULT 'synced',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  -- Categorías / Calendarios personalizados
  CREATE TABLE IF NOT EXISTS calendar_categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    color TEXT NOT NULL DEFAULT '#007AFF',
    is_visible INTEGER DEFAULT 1,
    is_default INTEGER DEFAULT 0,
    created_at TEXT NOT NULL
  );

  -- Categorías de finanzas
  CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
    icon TEXT NOT NULL DEFAULT 'tag',
    color TEXT NOT NULL DEFAULT '#10B981',
    budget_limit REAL
  );

  -- Transacciones financieras
  CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    category_id TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
    amount REAL NOT NULL,
    description TEXT NOT NULL,
    payment_method TEXT NOT NULL DEFAULT 'debit',
    transaction_date TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
  );
  CREATE INDEX IF NOT EXISTS idx_trans_date ON transactions(transaction_date);
  CREATE INDEX IF NOT EXISTS idx_trans_cat ON transactions(category_id);

  -- Notas en Markdown
  CREATE TABLE IF NOT EXISTS notes (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    folder TEXT NOT NULL DEFAULT 'General',
    tags TEXT DEFAULT '[]',
    is_pinned INTEGER DEFAULT 0,
    is_favorite INTEGER DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_notes_folder ON notes(folder);
  CREATE INDEX IF NOT EXISTS idx_notes_pinned ON notes(is_pinned);

  -- Colectivos: Líneas / Recorridos
  CREATE TABLE IF NOT EXISTS bus_routes (
    id TEXT PRIMARY KEY,
    line_number TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    color TEXT NOT NULL DEFAULT '#E11D48',
    origin TEXT NOT NULL,
    destination TEXT NOT NULL
  );

  -- Colectivos: Paradas
  CREATE TABLE IF NOT EXISTS bus_stops (
    id TEXT PRIMARY KEY,
    route_id TEXT NOT NULL,
    name TEXT NOT NULL,
    latitude REAL,
    longitude REAL,
    sequence_order INTEGER NOT NULL,
    direction TEXT NOT NULL DEFAULT 'outbound',
    FOREIGN KEY (route_id) REFERENCES bus_routes(id) ON DELETE CASCADE
  );
  CREATE INDEX IF NOT EXISTS idx_stops_route ON bus_stops(route_id);

  -- Colectivos: Horarios
  CREATE TABLE IF NOT EXISTS bus_schedules (
    id TEXT PRIMARY KEY,
    route_id TEXT NOT NULL,
    stop_id TEXT,
    day_type TEXT NOT NULL CHECK(day_type IN ('weekday', 'saturday', 'sunday_holiday')),
    departure_time TEXT NOT NULL,
    FOREIGN KEY (route_id) REFERENCES bus_routes(id) ON DELETE CASCADE
  );
  CREATE INDEX IF NOT EXISTS idx_sched_route_day ON bus_schedules(route_id, day_type);

  -- Configuración de la aplicación
  CREATE TABLE IF NOT EXISTS app_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  -- Hábitos & Rutinas: Categorías
  CREATE TABLE IF NOT EXISTS habit_categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    emoji TEXT NOT NULL DEFAULT '⚡',
    color TEXT NOT NULL DEFAULT '#007AFF',
    position INTEGER DEFAULT 0
  );

  -- Hábitos & Rutinas: Hábitos
  CREATE TABLE IF NOT EXISTS habits (
    id TEXT PRIMARY KEY,
    category_id TEXT NOT NULL,
    title TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('timer', 'counter', 'check')),
    target_value REAL NOT NULL DEFAULT 1,
    target_unit TEXT NOT NULL DEFAULT 'min',
    frequency TEXT NOT NULL DEFAULT 'Cada día',
    color TEXT NOT NULL DEFAULT '#007AFF',
    icon TEXT NOT NULL DEFAULT '⚡',
    points INTEGER DEFAULT 10,
    streak_count INTEGER DEFAULT 0,
    days_of_week TEXT,
    reminder_time TEXT,
    motivation TEXT,
    is_archived INTEGER DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (category_id) REFERENCES habit_categories(id) ON DELETE CASCADE
  );
  CREATE INDEX IF NOT EXISTS idx_habits_cat ON habits(category_id);

  -- Hábitos & Rutinas: Registros Diarios
  CREATE TABLE IF NOT EXISTS habit_logs (
    id TEXT PRIMARY KEY,
    habit_id TEXT NOT NULL,
    date TEXT NOT NULL,
    completed_value REAL NOT NULL DEFAULT 0,
    is_completed INTEGER DEFAULT 0,
    is_skipped INTEGER DEFAULT 0,
    notes TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE
  );
  CREATE INDEX IF NOT EXISTS idx_habit_logs_habit_date ON habit_logs(habit_id, date);
`;

/**
 * Script de migración idempotente para agregar columnas a bases de datos existentes
 */
export async function runMigrations(db: any) {
  const columnsToAdd = [
    { table: 'tasks', column: 'parent_id TEXT' },
    { table: 'tasks', column: 'section_id TEXT' },
    { table: 'tasks', column: 'url TEXT' },
    { table: 'tasks', column: 'completed_at TEXT' },
    { table: 'tasks', column: 'priority_num INTEGER DEFAULT 0' },
    { table: 'tasks', column: 'flagged INTEGER DEFAULT 0' },
    { table: 'tasks', column: 'rrule TEXT' },
    { table: 'tasks', column: 'notification_id TEXT' },
    { table: 'tasks', column: 'sequence INTEGER DEFAULT 0' },
    { table: 'calendar_events', column: 'is_milestone INTEGER DEFAULT 0' },
    { table: 'calendar_events', column: 'd_day_target TEXT' },
    { table: 'lists', column: 'is_pinned INTEGER DEFAULT 0' },
    { table: 'habits', column: 'streak_count INTEGER DEFAULT 0' },
    { table: 'habits', column: 'days_of_week TEXT' },
    { table: 'habits', column: 'reminder_time TEXT' },
    { table: 'habits', column: 'motivation TEXT' },
    { table: 'habits', column: 'is_archived INTEGER DEFAULT 0' },
    { table: 'habit_logs', column: 'is_skipped INTEGER DEFAULT 0' },
  ];

  for (const item of columnsToAdd) {
    try {
      if (typeof db.runAsync === 'function') {
        await db.runAsync(`ALTER TABLE ${item.table} ADD COLUMN ${item.column}`);
      } else if (typeof db.execAsync === 'function') {
        await db.execAsync(`ALTER TABLE ${item.table} ADD COLUMN ${item.column};`);
      }
    } catch {
      // La columna ya existe o tabla no creada aún, ignorar de forma segura
    }
  }
}
