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

export async function resetDatabase(): Promise<void> {
  const db = await getDatabase();
  await db.execAsync(`
    DROP TABLE IF EXISTS tasks;
    DROP TABLE IF EXISTS lists;
    DROP TABLE IF EXISTS calendar_events;
    DROP TABLE IF EXISTS transactions;
    DROP TABLE IF EXISTS categories;
    DROP TABLE IF EXISTS notes;
    DROP TABLE IF EXISTS bus_schedules;
    DROP TABLE IF EXISTS bus_stops;
    DROP TABLE IF EXISTS bus_routes;
    DROP TABLE IF EXISTS app_settings;
  `);
  await db.execAsync(CREATE_TABLES_SQL);
  await seedDatabase(db);
}
