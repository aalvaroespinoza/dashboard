import { getDatabase } from '../database';
import { TaskList } from '../../types';

export const listsRepo = {
  async getAll(): Promise<TaskList[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<TaskList>('SELECT * FROM lists ORDER BY position ASC, created_at ASC');
    return rows;
  },

  async getById(id: string): Promise<TaskList | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<TaskList>('SELECT * FROM lists WHERE id = ?', [id]);
    return row || null;
  },

  async create(list: Omit<TaskList, 'created_at' | 'updated_at'>): Promise<TaskList> {
    const db = await getDatabase();
    const now = new Date().toISOString();
    const newList: TaskList = {
      ...list,
      created_at: now,
      updated_at: now,
    };
    await db.runAsync(
      `INSERT INTO lists (id, title, color, icon, position, icloud_href, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newList.id,
        newList.title,
        newList.color || '#6366F1',
        newList.icon || 'list',
        newList.position ?? 0,
        newList.icloud_href || null,
        newList.created_at,
        newList.updated_at,
      ]
    );
    return newList;
  },

  async update(id: string, updates: Partial<TaskList>): Promise<void> {
    const db = await getDatabase();
    const now = new Date().toISOString();
    const fields: string[] = ['updated_at = ?'];
    const values: any[] = [now];

    if (updates.title !== undefined) {
      fields.push('title = ?');
      values.push(updates.title);
    }
    if (updates.color !== undefined) {
      fields.push('color = ?');
      values.push(updates.color);
    }
    if (updates.icon !== undefined) {
      fields.push('icon = ?');
      values.push(updates.icon);
    }
    if (updates.position !== undefined) {
      fields.push('position = ?');
      values.push(updates.position);
    }
    if (updates.icloud_href !== undefined) {
      fields.push('icloud_href = ?');
      values.push(updates.icloud_href);
    }

    values.push(id);
    await db.runAsync(`UPDATE lists SET ${fields.join(', ')} WHERE id = ?`, values);
  },

  async delete(id: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM lists WHERE id = ?', [id]);
  },
};
