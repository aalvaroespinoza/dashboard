import { SQLiteDatabase } from 'expo-sqlite';
import { seedBusDatabase } from '../services/busService';

/**
 * seedDatabase
 * Inicializa la base de datos limpia lista para su uso real (0 datos falsos).
 * Crea únicamente las listas y categorías base, el perfil inicial de gamificación (Nivel 1 con 0 EXP)
 * y la base de datos completa de Colectivos / Transporte.
 */
export async function seedDatabase(db: SQLiteDatabase, force: boolean = false): Promise<void> {
  const checkLists = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM lists');
  if (!force && checkLists && checkLists.count > 0) {
    // Si ya existen listas y no es forzado, asegurar que los datos de transporte estén sembrados
    await seedBusDatabase(db);
    return;
  }

  const now = new Date().toISOString();

  // 1. Listas base de Recordatorios (0 tareas)
  await db.execAsync(`
    INSERT OR IGNORE INTO lists (id, title, color, icon, position, created_at, updated_at) VALUES
    ('list-reminders', 'Recordatorios', '#007AFF', 'list', 0, '${now}', '${now}'),
    ('list-personal', 'Personal', '#34C759', 'user', 1, '${now}', '${now}'),
    ('list-trabajo', 'Trabajo / UTN', '#FF9500', 'graduation-cap', 2, '${now}', '${now}');

    -- 2. Categorías base de Calendario (0 eventos)
    INSERT OR IGNORE INTO calendar_categories (id, name, color, is_visible, is_default, created_at) VALUES
    ('cat-personal', 'Personal', '#007AFF', 1, 1, '${now}'),
    ('cat-trabajo', 'Trabajo', '#34C759', 1, 0, '${now}'),
    ('cat-facultad', 'Universidad / UTN', '#FF9500', 1, 0, '${now}');

    -- 3. Categorías base de Finanzas (0 transacciones)
    INSERT OR IGNORE INTO categories (id, name, type, icon, color, budget_limit) VALUES
    ('cat-salary', 'Salario / Honorarios', 'income', 'briefcase', '#34C759', NULL),
    ('cat-food', 'Supermercado & Alimentos', 'expense', 'shopping-cart', '#FF9500', 180000),
    ('cat-services', 'Servicios & Suscripciones', 'expense', 'zap', '#007AFF', 45000),
    ('cat-transport', 'Transporte & Colectivo', 'expense', 'bus', '#FF2D55', 30000),
    ('cat-rent', 'Alquiler & Expensas', 'expense', 'home', '#FF3B30', 350000);

    -- 4. Cuenta Principal de Finanzas (Saldo inicial $0)
    INSERT OR IGNORE INTO accounts (id, name, type, balance, color, is_archived, created_at, updated_at) VALUES
    ('acc-main', 'Cuenta Principal', 'bank', 0, '#007AFF', 0, '${now}', '${now}');

    -- 5. Categorías base de Hábitos y Perfil RPG Nivel 1 (0 hábitos iniciales, 0 EXP)
    INSERT OR IGNORE INTO habit_categories (id, name, emoji, color, position) VALUES
    ('cat-body', 'Cuerpo y Movimiento', '🌿', '#34C759', 0),
    ('cat-general', 'General', '💧', '#32ADE6', 1),
    ('cat-bonds', 'Vínculos', '🧡', '#FF9500', 2),
    ('cat-focus', 'Certificación y Foco', '🎯', '#FF3B30', 3);

    INSERT OR IGNORE INTO habit_gamification_profile (id, level, current_exp, next_level_exp, rank_title, strength_exp, intelligence_exp, focus_exp, perfect_days_count, total_exp_earned, created_at, updated_at) VALUES
    ('main-profile', 1, 0, 100, 'Novato', 0, 0, 0, 0, 0, '${now}', '${now}');

    -- 6. Ajustes iniciales de la App
    INSERT OR IGNORE INTO app_settings (key, value) VALUES
    ('theme_mode', 'light'),
    ('user_name', 'Álvaro'),
    ('user_avatar', '👨‍💻'),
    ('user_title', 'Product Designer & Dev'),
    ('sidebar_collapsed', 'false');
  `);

  // 7. Sembrar SIEMPRE todos los datos completos de Colectivos y Horarios
  await seedBusDatabase(db);
}
