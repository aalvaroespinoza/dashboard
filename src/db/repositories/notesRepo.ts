import { getDatabase } from '../database';
import { NoteItem } from '../../types';

interface NoteDbRow {
  id: string;
  title: string;
  content: string;
  folder: string;
  tags: string;
  is_pinned: number;
  is_favorite: number;
  created_at: string;
  updated_at: string;
}

function parseNoteRow(row: NoteDbRow): NoteItem {
  let tags: string[] = [];
  try {
    tags = row.tags ? JSON.parse(row.tags) : [];
  } catch {
    tags = [];
  }
  return {
    ...row,
    tags,
  };
}

export const notesRepo = {
  async getAll(): Promise<NoteItem[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<NoteDbRow>(
      'SELECT * FROM notes ORDER BY is_pinned DESC, updated_at DESC'
    );
    return rows.map(parseNoteRow);
  },

  async getById(id: string): Promise<NoteItem | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<NoteDbRow>('SELECT * FROM notes WHERE id = ?', [id]);
    return row ? parseNoteRow(row) : null;
  },

  async getFolders(): Promise<string[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<{ folder: string }>(
      'SELECT DISTINCT folder FROM notes ORDER BY folder ASC'
    );
    return rows.map(r => r.folder);
  },

  async create(note: Omit<NoteItem, 'created_at' | 'updated_at'>): Promise<NoteItem> {
    const db = await getDatabase();
    const now = new Date().toISOString();
    const newNote: NoteItem = {
      ...note,
      created_at: now,
      updated_at: now,
    };
    await db.runAsync(
      `INSERT INTO notes (id, title, content, folder, tags, is_pinned, is_favorite, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newNote.id,
        newNote.title,
        newNote.content,
        newNote.folder || 'General',
        JSON.stringify(newNote.tags || []),
        newNote.is_pinned ? 1 : 0,
        newNote.is_favorite ? 1 : 0,
        newNote.created_at,
        newNote.updated_at,
      ]
    );
    return newNote;
  },

  async update(id: string, updates: Partial<NoteItem>): Promise<void> {
    const db = await getDatabase();
    const now = new Date().toISOString();
    const fields: string[] = ['updated_at = ?'];
    const values: any[] = [now];

    if (updates.title !== undefined) {
      fields.push('title = ?');
      values.push(updates.title);
    }
    if (updates.content !== undefined) {
      fields.push('content = ?');
      values.push(updates.content);
    }
    if (updates.folder !== undefined) {
      fields.push('folder = ?');
      values.push(updates.folder);
    }
    if (updates.tags !== undefined) {
      fields.push('tags = ?');
      values.push(JSON.stringify(updates.tags));
    }
    if (updates.is_pinned !== undefined) {
      fields.push('is_pinned = ?');
      values.push(updates.is_pinned ? 1 : 0);
    }
    if (updates.is_favorite !== undefined) {
      fields.push('is_favorite = ?');
      values.push(updates.is_favorite ? 1 : 0);
    }

    values.push(id);
    await db.runAsync(`UPDATE notes SET ${fields.join(', ')} WHERE id = ?`, values);
  },

  async delete(id: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM notes WHERE id = ?', [id]);
  },
};
