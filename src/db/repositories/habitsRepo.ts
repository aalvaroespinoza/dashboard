import { getDatabase } from '../database';
import { HabitCategory, HabitItem, HabitLogItem } from '../../types';

export const GRIT_CATEGORIES: HabitCategory[] = [
  {
    id: 'cat-body',
    name: 'Cuerpo y Movimiento',
    emoji: '🌿',
    color: '#34C759',
    position: 0,
  },
  {
    id: 'cat-general',
    name: 'General',
    emoji: '💧',
    color: '#32ADE6',
    position: 1,
  },
  {
    id: 'cat-bonds',
    name: 'Vínculos',
    emoji: '🧡',
    color: '#FF9500',
    position: 2,
  },
  {
    id: 'cat-focus',
    name: 'Certificación y Foco',
    emoji: '🎯',
    color: '#FF3B30',
    position: 3,
  },
];

export const GRIT_HABITS: Omit<HabitItem, 'created_at' | 'updated_at'>[] = [
  {
    id: 'habit-care',
    category_id: 'cat-body',
    title: 'Cuidado personal',
    type: 'check',
    target_value: 5,
    target_unit: 'min',
    frequency: 'Cada día, 5 min',
    color: '#34C759',
    icon: '🧖‍♂️',
    points: 15,
    streak_count: -20,
  },
  {
    id: 'habit-room',
    category_id: 'cat-body',
    title: 'Ordenar habitación',
    type: 'check',
    target_value: 5,
    target_unit: 'min',
    frequency: 'Cada día, 5 min',
    color: '#34C759',
    icon: '🧹',
    points: 15,
    streak_count: -20,
  },
  {
    id: 'habit-bike',
    category_id: 'cat-body',
    title: 'Bicicleta por Despeñaderos',
    type: 'counter',
    target_value: 8,
    target_unit: 'km',
    frequency: '3x semana, 8 km',
    color: '#34C759',
    icon: '🚴‍♂️',
    points: 35,
    streak_count: 3,
  },
  {
    id: 'habit-water',
    category_id: 'cat-general',
    title: 'Beber agua',
    type: 'counter',
    target_value: 2,
    target_unit: 'litros',
    frequency: 'Cada día, 2L',
    color: '#32ADE6',
    icon: '💧',
    points: 20,
    streak_count: 12,
  },
  {
    id: 'habit-girlfriend',
    category_id: 'cat-bonds',
    title: 'Planes novia',
    type: 'check',
    target_value: 2,
    target_unit: 'x semana',
    frequency: '2 veces por semana',
    color: '#FF9500',
    icon: '💑',
    points: 30,
    streak_count: 6,
  },
  {
    id: 'habit-friends',
    category_id: 'cat-bonds',
    title: 'Amigos',
    type: 'check',
    target_value: 1,
    target_unit: 'x semana',
    frequency: '1 vez por semana',
    color: '#FF9500',
    icon: '🍕',
    points: 25,
    streak_count: 4,
  },
  {
    id: 'habit-study',
    category_id: 'cat-focus',
    title: 'Estudio enfocado',
    type: 'timer',
    target_value: 90,
    target_unit: 'min',
    frequency: 'Entre semana, 1h 30m',
    color: '#FF3B30',
    icon: '🎯',
    points: 50,
    streak_count: 14,
  },
];

// Genera logs iniciales históricos para agosto 2026 (del 14 al 23 de agosto)
function generateSeedLogs(): { habit_id: string; date: string; completed_value: number; is_completed: number; notes: string | null }[] {
  const logs: { habit_id: string; date: string; completed_value: number; is_completed: number; notes: string | null }[] = [];
  const baseDate = new Date(2026, 7, 24); // 24 de agosto de 2026

  for (let i = 10; i >= 1; i--) {
    const d = new Date(2026, 7, 24 - i);
    const dateStr = d.toISOString().split('T')[0];

    // Estudio enfocado (gran racha)
    logs.push({
      habit_id: 'habit-study',
      date: dateStr,
      completed_value: 90,
      is_completed: 1,
      notes: i === 1 ? 'Sesión productiva en UTN' : null,
    });

    // Beber agua (muy constante)
    logs.push({
      habit_id: 'habit-water',
      date: dateStr,
      completed_value: 2,
      is_completed: 1,
      notes: null,
    });

    // Bicicleta (días alternados)
    if (i % 3 === 0) {
      logs.push({
        habit_id: 'habit-bike',
        date: dateStr,
        completed_value: 8,
        is_completed: 1,
        notes: 'Recorrido por la costanera',
      });
    }

    // Planes novia (fines de semana)
    if (d.getDay() === 0 || d.getDay() === 6) {
      logs.push({
        habit_id: 'habit-girlfriend',
        date: dateStr,
        completed_value: 2,
        is_completed: 1,
        notes: 'Cena y caminata',
      });
    }

    // Amigos (viernes)
    if (d.getDay() === 5) {
      logs.push({
        habit_id: 'habit-friends',
        date: dateStr,
        completed_value: 1,
        is_completed: 1,
        notes: 'Pizzas y charla',
      });
    }
  }

  return logs;
}

export const habitsRepo = {
  async getAllCategories(): Promise<HabitCategory[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<HabitCategory>(
      'SELECT * FROM habit_categories ORDER BY position ASC'
    );
    if (rows.length === 0) {
      for (const cat of GRIT_CATEGORIES) {
        await db.runAsync(
          'INSERT INTO habit_categories (id, name, emoji, color, position) VALUES (?, ?, ?, ?, ?)',
          [cat.id, cat.name, cat.emoji, cat.color, cat.position]
        );
      }
      return GRIT_CATEGORIES;
    }
    return rows;
  },

  async getAllHabits(): Promise<HabitItem[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<HabitItem>(
      'SELECT * FROM habits ORDER BY created_at ASC'
    );
    if (rows.length === 0) {
      const now = '2026-08-24T12:00:00.000Z';
      for (const h of GRIT_HABITS) {
        await db.runAsync(
          `INSERT INTO habits (
            id, category_id, title, type, target_value, target_unit,
            frequency, color, icon, points, streak_count, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            h.id,
            h.category_id,
            h.title,
            h.type,
            h.target_value,
            h.target_unit,
            h.frequency,
            h.color,
            h.icon,
            h.points,
            h.streak_count ?? 0,
            now,
            now,
          ]
        );
      }

      // Sembrar logs históricos
      const seedLogs = generateSeedLogs();
      for (const l of seedLogs) {
        await db.runAsync(
          `INSERT INTO habit_logs (
            id, habit_id, date, completed_value, is_completed, is_skipped, notes, created_at
          ) VALUES (?, ?, ?, ?, ?, 0, ?, ?)`,
          [
            `log-${l.habit_id}-${l.date}`,
            l.habit_id,
            l.date,
            l.completed_value,
            l.is_completed,
            l.notes,
            now,
          ]
        );
      }

      return GRIT_HABITS.map((h) => ({ ...h, created_at: now, updated_at: now }));
    }
    return rows;
  },

  async getLogsByDate(date: string): Promise<HabitLogItem[]> {
    const db = await getDatabase();
    return db.getAllAsync<HabitLogItem>(
      'SELECT * FROM habit_logs WHERE date = ?',
      [date]
    );
  },

  async getLogsForHabit(habitId: string, limit: number = 10): Promise<HabitLogItem[]> {
    const db = await getDatabase();
    return db.getAllAsync<HabitLogItem>(
      'SELECT * FROM habit_logs WHERE habit_id = ? ORDER BY date DESC LIMIT ?',
      [habitId, limit]
    );
  },

  async getRecentLogsMap(): Promise<Record<string, Record<string, HabitLogItem>>> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<HabitLogItem>(
      'SELECT * FROM habit_logs ORDER BY date DESC'
    );
    const map: Record<string, Record<string, HabitLogItem>> = {};
    rows.forEach((row) => {
      if (!map[row.habit_id]) {
        map[row.habit_id] = {};
      }
      map[row.habit_id][row.date] = {
        ...row,
        is_skipped: row.is_skipped ?? 0,
      };
    });
    return map;
  },

  async upsertLog(
    habitId: string,
    date: string,
    completedValue: number,
    isCompleted: number,
    isSkipped: number = 0,
    notes?: string | null
  ): Promise<HabitLogItem> {
    const db = await getDatabase();
    const existing = await db.getFirstAsync<HabitLogItem>(
      'SELECT * FROM habit_logs WHERE habit_id = ? AND date = ?',
      [habitId, date]
    );

    const now = new Date().toISOString();
    if (existing) {
      await db.runAsync(
        'UPDATE habit_logs SET completed_value = ?, is_completed = ?, is_skipped = ?, notes = COALESCE(?, notes) WHERE id = ?',
        [completedValue, isCompleted, isSkipped, notes || null, existing.id]
      );
      return {
        ...existing,
        completed_value: completedValue,
        is_completed: isCompleted,
        is_skipped: isSkipped,
        notes: notes !== undefined ? notes : existing.notes,
      };
    } else {
      const id = `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
      const newLog: HabitLogItem = {
        id,
        habit_id: habitId,
        date,
        completed_value: completedValue,
        is_completed: isCompleted,
        is_skipped: isSkipped,
        notes: notes || null,
        created_at: now,
      };
      await db.runAsync(
        'INSERT INTO habit_logs (id, habit_id, date, completed_value, is_completed, is_skipped, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [id, habitId, date, completedValue, isCompleted, isSkipped, notes || null, now]
      );
      return newLog;
    }
  },

  async createHabit(habit: Omit<HabitItem, 'created_at' | 'updated_at'>): Promise<HabitItem> {
    const db = await getDatabase();
    const now = new Date().toISOString();
    const newHabit: HabitItem = {
      ...habit,
      created_at: now,
      updated_at: now,
    };
    await db.runAsync(
      `INSERT INTO habits (
        id, category_id, title, type, target_value, target_unit,
        frequency, color, icon, points, streak_count, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newHabit.id,
        newHabit.category_id,
        newHabit.title,
        newHabit.type,
        newHabit.target_value,
        newHabit.target_unit,
        newHabit.frequency,
        newHabit.color,
        newHabit.icon,
        newHabit.points,
        newHabit.streak_count ?? 0,
        now,
        now,
      ]
    );
    return newHabit;
  },

  async updateHabit(id: string, updates: Partial<HabitItem>): Promise<void> {
    const db = await getDatabase();
    const now = new Date().toISOString();
    const fields: string[] = ['updated_at = ?'];
    const values: any[] = [now];

    if (updates.title !== undefined) {
      fields.push('title = ?');
      values.push(updates.title);
    }
    if (updates.target_value !== undefined) {
      fields.push('target_value = ?');
      values.push(updates.target_value);
    }
    if (updates.target_unit !== undefined) {
      fields.push('target_unit = ?');
      values.push(updates.target_unit);
    }
    if (updates.frequency !== undefined) {
      fields.push('frequency = ?');
      values.push(updates.frequency);
    }
    if (updates.color !== undefined) {
      fields.push('color = ?');
      values.push(updates.color);
    }
    if (updates.icon !== undefined) {
      fields.push('icon = ?');
      values.push(updates.icon);
    }
    if (updates.points !== undefined) {
      fields.push('points = ?');
      values.push(updates.points);
    }
    if (updates.streak_count !== undefined) {
      fields.push('streak_count = ?');
      values.push(updates.streak_count);
    }

    values.push(id);
    await db.runAsync(`UPDATE habits SET ${fields.join(', ')} WHERE id = ?`, values);
  },

  async deleteHabit(id: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM habits WHERE id = ?', [id]);
    await db.runAsync('DELETE FROM habit_logs WHERE habit_id = ?', [id]);
  },

  async resetAllHabitsData(): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM habit_logs');
    await db.runAsync('DELETE FROM habits');
    await db.runAsync('DELETE FROM habit_categories');
    // Re-seed
    await this.getAllCategories();
    await this.getAllHabits();
  },
};
