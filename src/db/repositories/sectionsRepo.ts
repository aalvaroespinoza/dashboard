import { getDatabase } from '../database';
import { ListSection } from '../../types';

export const sectionsRepo = {
  async getByListId(listId: string): Promise<ListSection[]> {
    const db = await getDatabase();
    return db.getAllAsync<ListSection>(
      'SELECT * FROM list_sections WHERE list_id = ? ORDER BY position ASC, created_at ASC',
      [listId]
    );
  },

  async createSection(section: Omit<ListSection, 'created_at'>): Promise<ListSection> {
    const db = await getDatabase();
    const now = new Date().toISOString();
    const newSection: ListSection = {
      ...section,
      created_at: now,
    };
    await db.runAsync(
      'INSERT INTO list_sections (id, list_id, name, position, created_at) VALUES (?, ?, ?, ?, ?)',
      [newSection.id, newSection.list_id, newSection.name, newSection.position, now]
    );
    return newSection;
  },

  async updateSection(id: string, name: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('UPDATE list_sections SET name = ? WHERE id = ?', [name, id]);
  },

  async deleteSection(id: string): Promise<void> {
    const db = await getDatabase();
    // Reasignar tareas de la sección a null
    await db.runAsync('UPDATE tasks SET section_id = NULL WHERE section_id = ?', [id]);
    await db.runAsync('DELETE FROM list_sections WHERE id = ?', [id]);
  },
};
