import { Platform } from 'react-native';
import * as SQLite from 'expo-sqlite';
import { CREATE_TABLES_SQL, runMigrations } from './schema';
import { seedDatabase } from './seed';
import { webSqliteFallback } from './webFallback';

let dbInstance: any = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (dbInstance) {
    return dbInstance;
  }

  // En Native (Android / Tablet), usa el motor C nativo de SQLite
  if (Platform.OS !== 'web') {
    dbInstance = await SQLite.openDatabaseAsync('dashboard_tablet.db');
    await dbInstance.execAsync(CREATE_TABLES_SQL);
    await runMigrations(dbInstance);
    await seedDatabase(dbInstance);
    return dbInstance;
  }

  // En Web, intenta abrir expo-sqlite con wa-sqlite, y si el navegador bloquea OPFS, usa el fallback seguro
  try {
    const webDb = await SQLite.openDatabaseAsync('dashboard_tablet.db');
    await webDb.execAsync(CREATE_TABLES_SQL);
    await runMigrations(webDb);
    await seedDatabase(webDb);
    dbInstance = webDb;
    return dbInstance;
  } catch (webErr) {
    console.warn('Usando Web SQLite Fallback (almacenamiento en memoria/localStorage) debido a restricciones OPFS del navegador:', webErr);
    dbInstance = webSqliteFallback;
    await dbInstance.execAsync(CREATE_TABLES_SQL);
    await runMigrations(dbInstance);
    await seedDatabase(dbInstance);
    return dbInstance;
  }
}

/**
 * resetDatabase
 * Restablece toda la base de datos a 0 para uso real:
 * - Borra todas las tareas, subtareas, notas, eventos, transacciones, presupuestos, hábitos y logs.
 * - PRESERVA 100% las tablas y datos de transportes, colectivos y paradas.
 * - Re-crea las categorías y listas limpias base.
 */
export async function resetDatabase(): Promise<void> {
  const db = await getDatabase();
  await db.execAsync(`
    DELETE FROM tasks;
    DELETE FROM list_sections;
    DELETE FROM link_previews;
    DELETE FROM lists;
    DELETE FROM calendar_events;
    DELETE FROM calendar_categories;
    DELETE FROM transactions;
    DELETE FROM accounts;
    DELETE FROM categories;
    DELETE FROM finance_budgets;
    DELETE FROM notes;
    DELETE FROM habit_logs;
    DELETE FROM habits;
    DELETE FROM habit_categories;
    DELETE FROM habit_gamification_profile;
    DELETE FROM active_timers;
  `);
  await seedDatabase(db, true);
}
