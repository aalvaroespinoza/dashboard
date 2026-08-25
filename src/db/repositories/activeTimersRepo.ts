/**
 * activeTimersRepo.ts
 * Repositorio para persistir timers activos de hábitos entre sesiones de la app.
 * Usa delta-timestamp: solo se guarda startTimestamp (ms epoch) y accumulated_seconds.
 */
import { getDatabase } from '../database';

export interface PersistedTimer {
  habit_id: string;
  start_timestamp: number;
  accumulated_seconds: number;
  is_running: boolean;
  saved_at: string;
}

export const activeTimersRepo = {
  /**
   * Guardar o actualizar el estado de un timer activo
   */
  async upsert(timer: PersistedTimer): Promise<void> {
    const db = await getDatabase();
    if (!db) return;
    try {
      await db.runAsync(
        `INSERT OR REPLACE INTO active_timers
          (habit_id, start_timestamp, accumulated_seconds, is_running, saved_at)
         VALUES (?, ?, ?, ?, ?)`,
        [
          timer.habit_id,
          timer.start_timestamp,
          timer.accumulated_seconds,
          timer.is_running ? 1 : 0,
          timer.saved_at,
        ]
      );
    } catch (e) {
      console.warn('[activeTimersRepo] upsert error:', e);
    }
  },

  /**
   * Leer todos los timers activos al iniciar la app
   */
  async getAll(): Promise<PersistedTimer[]> {
    const db = await getDatabase();
    if (!db) return [];
    try {
      const rows = await db.getAllAsync<{
        habit_id: string;
        start_timestamp: number;
        accumulated_seconds: number;
        is_running: number;
        saved_at: string;
      }>('SELECT * FROM active_timers');
      return rows.map((r) => ({
        ...r,
        is_running: Boolean(r.is_running),
      }));
    } catch {
      return [];
    }
  },

  /**
   * Eliminar un timer al completarse o detenerse
   */
  async delete(habitId: string): Promise<void> {
    const db = await getDatabase();
    if (!db) return;
    try {
      await db.runAsync('DELETE FROM active_timers WHERE habit_id = ?', [habitId]);
    } catch (e) {
      console.warn('[activeTimersRepo] delete error:', e);
    }
  },

  /**
   * Limpiar todos los timers (por ejemplo al hacer reset de datos)
   */
  async clearAll(): Promise<void> {
    const db = await getDatabase();
    if (!db) return;
    try {
      await db.runAsync('DELETE FROM active_timers');
    } catch (e) {
      console.warn('[activeTimersRepo] clearAll error:', e);
    }
  },
};
