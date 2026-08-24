import { getDatabase } from '../database';
import { CalendarCategoryItem } from '../../types';

const DEFAULT_CATEGORIES: Omit<CalendarCategoryItem, 'created_at'>[] = [
  { id: 'cat-personal', name: 'Personal', color: '#34C759', is_visible: 1, is_default: 1 },
  { id: 'cat-work', name: 'Trabajo / UTN', color: '#FF9500', is_visible: 1, is_default: 0 },
  { id: 'cat-study', name: 'Estudios & Exámenes', color: '#007AFF', is_visible: 1, is_default: 0 },
  { id: 'cat-bday', name: 'Cumpleaños & Eventos', color: '#FF2D55', is_visible: 1, is_default: 0 },
];

export const calendarCategoriesRepo = {
  async getAll(): Promise<CalendarCategoryItem[]> {
    const db = await getDatabase();
    let rows = await db.getAllAsync<CalendarCategoryItem>(
      'SELECT * FROM calendar_categories ORDER BY is_default DESC, name ASC'
    );

    if (rows.length === 0) {
      // Seed default categories
      const now = new Date().toISOString();
      for (const cat of DEFAULT_CATEGORIES) {
        await db.runAsync(
          `INSERT INTO calendar_categories (id, name, color, is_visible, is_default, created_at)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [cat.id, cat.name, cat.color, cat.is_visible, cat.is_default || 0, now]
        );
      }
      rows = await db.getAllAsync<CalendarCategoryItem>(
        'SELECT * FROM calendar_categories ORDER BY is_default DESC, name ASC'
      );
    }

    return rows;
  },

  async create(name: string, color: string): Promise<CalendarCategoryItem> {
    const db = await getDatabase();
    const now = new Date().toISOString();
    const id = `cat-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const newCat: CalendarCategoryItem = {
      id,
      name: name.trim(),
      color,
      is_visible: 1,
      is_default: 0,
      created_at: now,
    };

    await db.runAsync(
      `INSERT INTO calendar_categories (id, name, color, is_visible, is_default, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [newCat.id, newCat.name, newCat.color, newCat.is_visible, 0, now]
    );

    return newCat;
  },

  async update(id: string, updates: Partial<CalendarCategoryItem>): Promise<void> {
    const db = await getDatabase();
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.name !== undefined) {
      fields.push('name = ?');
      values.push(updates.name.trim());
    }
    if (updates.color !== undefined) {
      fields.push('color = ?');
      values.push(updates.color);
    }
    if (updates.is_visible !== undefined) {
      fields.push('is_visible = ?');
      values.push(updates.is_visible);
    }

    if (fields.length > 0) {
      values.push(id);
      await db.runAsync(`UPDATE calendar_categories SET ${fields.join(', ')} WHERE id = ?`, values);
    }
  },

  async delete(id: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM calendar_categories WHERE id = ? AND is_default = 0', [id]);
  },
};
