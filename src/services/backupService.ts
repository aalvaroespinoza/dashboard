/**
 * backupService.ts
 * Servicio completo de Backup, Restauración JSON y Reset selectivo por módulo.
 */
import { getDatabase } from '../db/database';
import { seedDatabase } from '../db/seed';

export interface BackupData {
  version: string;
  exportedAt: string;
  app: string;
  data: {
    lists?: any[];
    list_sections?: any[];
    tasks?: any[];
    calendar_categories?: any[];
    calendar_events?: any[];
    categories?: any[];
    accounts?: any[];
    transactions?: any[];
    habit_categories?: any[];
    habits?: any[];
    habit_logs?: any[];
    habit_gamification_profile?: any[];
    app_settings?: any[];
  };
}

export const backupService = {
  /**
   * Exporta toda la base de datos a un objeto JSON serializado
   */
  async exportToJson(): Promise<string> {
    const db = await getDatabase();
    if (!db) throw new Error('Base de datos no inicializada');

    const [
      lists,
      list_sections,
      tasks,
      calendar_categories,
      calendar_events,
      categories,
      accounts,
      transactions,
      habit_categories,
      habits,
      habit_logs,
      habit_gamification_profile,
      app_settings,
    ] = await Promise.all([
      db.getAllAsync('SELECT * FROM lists'),
      db.getAllAsync('SELECT * FROM list_sections'),
      db.getAllAsync('SELECT * FROM tasks'),
      db.getAllAsync('SELECT * FROM calendar_categories'),
      db.getAllAsync('SELECT * FROM calendar_events'),
      db.getAllAsync('SELECT * FROM categories'),
      db.getAllAsync('SELECT * FROM accounts'),
      db.getAllAsync('SELECT * FROM transactions'),
      db.getAllAsync('SELECT * FROM habit_categories'),
      db.getAllAsync('SELECT * FROM habits'),
      db.getAllAsync('SELECT * FROM habit_logs'),
      db.getAllAsync('SELECT * FROM habit_gamification_profile'),
      db.getAllAsync('SELECT * FROM app_settings'),
    ]);

    const backup: BackupData = {
      version: '2.0.0',
      exportedAt: new Date().toISOString(),
      app: 'MiHub iPadOS 18',
      data: {
        lists,
        list_sections,
        tasks,
        calendar_categories,
        calendar_events,
        categories,
        accounts,
        transactions,
        habit_categories,
        habits,
        habit_logs,
        habit_gamification_profile,
        app_settings,
      },
    };

    return JSON.stringify(backup, null, 2);
  },

  /**
   * Restaura la base de datos desde un archivo JSON
   */
  async importFromJson(jsonString: string): Promise<{ success: boolean; message: string }> {
    const db = await getDatabase();
    if (!db) throw new Error('Base de datos no inicializada');

    let parsed: BackupData;
    try {
      parsed = JSON.parse(jsonString);
    } catch {
      throw new Error('El archivo proporcionado no es un JSON válido');
    }

    if (!parsed.data) {
      throw new Error('Estructura de backup incompatible o corrupta');
    }

    const { data } = parsed;

    // Ejecutar inserciones dentro de SQLite
    try {
      if (data.lists && data.lists.length > 0) {
        await db.runAsync('DELETE FROM lists');
        for (const r of data.lists) {
          await db.runAsync(
            'INSERT OR REPLACE INTO lists (id, title, color, icon, position, is_pinned, icloud_href, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [r.id, r.title, r.color, r.icon, r.position, r.is_pinned || 0, r.icloud_href, r.created_at, r.updated_at]
          );
        }
      }

      if (data.tasks && data.tasks.length > 0) {
        await db.runAsync('DELETE FROM tasks');
        for (const r of data.tasks) {
          await db.runAsync(
            `INSERT OR REPLACE INTO tasks (
              id, list_id, section_id, parent_id, title, notes, url, due_date, due_time,
              is_completed, completed_at, priority, priority_num, flagged, rrule, tags,
              position, notification_id, icloud_uid, icloud_href, icloud_etag, sequence,
              sync_status, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              r.id, r.list_id, r.section_id, r.parent_id, r.title, r.notes, r.url, r.due_date, r.due_time,
              r.is_completed, r.completed_at, r.priority, r.priority_num || 0, r.flagged || 0, r.rrule, r.tags,
              r.position, r.notification_id, r.icloud_uid, r.icloud_href, r.icloud_etag, r.sequence || 0,
              r.sync_status || 'synced', r.created_at, r.updated_at
            ]
          );
        }
      }

      if (data.calendar_categories && data.calendar_categories.length > 0) {
        await db.runAsync('DELETE FROM calendar_categories');
        for (const r of data.calendar_categories) {
          await db.runAsync(
            'INSERT OR REPLACE INTO calendar_categories (id, name, color, is_visible, is_default, created_at) VALUES (?, ?, ?, ?, ?, ?)',
            [r.id, r.name, r.color, r.is_visible, r.is_default || 0, r.created_at]
          );
        }
      }

      if (data.calendar_events && data.calendar_events.length > 0) {
        await db.runAsync('DELETE FROM calendar_events');
        for (const r of data.calendar_events) {
          await db.runAsync(
            `INSERT OR REPLACE INTO calendar_events (
              id, title, description, location, start_date, end_date, is_all_day,
              is_milestone, d_day_target, color, calendar_name, icloud_uid, icloud_href,
              icloud_etag, sync_status, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              r.id, r.title, r.description, r.location, r.start_date, r.end_date, r.is_all_day,
              r.is_milestone || 0, r.d_day_target, r.color, r.calendar_name, r.icloud_uid, r.icloud_href,
              r.icloud_etag, r.sync_status || 'synced', r.created_at, r.updated_at
            ]
          );
        }
      }

      if (data.accounts && data.accounts.length > 0) {
        await db.runAsync('DELETE FROM accounts');
        for (const r of data.accounts) {
          await db.runAsync(
            'INSERT OR REPLACE INTO accounts (id, name, type, color, icon, initial_balance, position, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [r.id, r.name, r.type, r.color, r.icon, r.initial_balance || 0, r.position || 0, r.created_at]
          );
        }
      }

      if (data.transactions && data.transactions.length > 0) {
        await db.runAsync('DELETE FROM transactions');
        for (const r of data.transactions) {
          await db.runAsync(
            `INSERT OR REPLACE INTO transactions (
              id, category_id, account_id, type, amount, description, payment_method,
              transaction_date, installments, installment_current, is_recurring,
              recurring_day, next_due_date, notes, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              r.id, r.category_id, r.account_id, r.type, r.amount, r.description, r.payment_method,
              r.transaction_date, r.installments || 1, r.installment_current || 1, r.is_recurring || 0,
              r.recurring_day, r.next_due_date, r.notes, r.created_at
            ]
          );
        }
      }

      if (data.habits && data.habits.length > 0) {
        await db.runAsync('DELETE FROM habits');
        for (const r of data.habits) {
          await db.runAsync(
            `INSERT OR REPLACE INTO habits (
              id, category_id, title, type, target_value, target_unit, frequency, color, icon,
              points, streak_count, days_of_week, reminder_time, motivation, mastery_level,
              mastery_exp, total_completions, is_archived, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              r.id, r.category_id, r.title, r.type, r.target_value, r.target_unit, r.frequency, r.color, r.icon,
              r.points || 10, r.streak_count || 0, r.days_of_week, r.reminder_time, r.motivation, r.mastery_level || 1,
              r.mastery_exp || 0, r.total_completions || 0, r.is_archived || 0, r.created_at, r.updated_at
            ]
          );
        }
      }

      if (data.habit_logs && data.habit_logs.length > 0) {
        await db.runAsync('DELETE FROM habit_logs');
        for (const r of data.habit_logs) {
          await db.runAsync(
            'INSERT OR REPLACE INTO habit_logs (id, habit_id, date, completed_value, is_completed, is_skipped, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [r.id, r.habit_id, r.date, r.completed_value, r.is_completed, r.is_skipped || 0, r.notes, r.created_at]
          );
        }
      }

      return { success: true, message: 'Copia de seguridad restaurada correctamente' };
    } catch (e: any) {
      throw new Error(`Error durante la restauración: ${e.message}`);
    }
  },

  /**
   * Reset selectivo por módulo
   */
  async resetModule(module: 'tasks' | 'calendar' | 'habits' | 'finances' | 'all'): Promise<void> {
    const db = await getDatabase();
    if (!db) return;

    if (module === 'tasks' || module === 'all') {
      await db.runAsync('DELETE FROM tasks');
      await db.runAsync('DELETE FROM list_sections');
      await db.runAsync('DELETE FROM link_previews');
      await db.runAsync('DELETE FROM lists');
    }

    if (module === 'calendar' || module === 'all') {
      await db.runAsync('DELETE FROM calendar_events');
      await db.runAsync('DELETE FROM calendar_categories');
    }

    if (module === 'habits' || module === 'all') {
      await db.runAsync('DELETE FROM habit_logs');
      await db.runAsync('DELETE FROM habits');
      await db.runAsync('DELETE FROM habit_categories');
      await db.runAsync('DELETE FROM habit_gamification_profile');
      await db.runAsync('DELETE FROM active_timers');
    }

    if (module === 'finances' || module === 'all') {
      await db.runAsync('DELETE FROM transactions');
      await db.runAsync('DELETE FROM finance_budgets');
      await db.runAsync('DELETE FROM accounts');
      await db.runAsync('DELETE FROM categories');
    }

    // Re-sembrar las estructuras base limpias
    await seedDatabase(db, true);
  },
};
