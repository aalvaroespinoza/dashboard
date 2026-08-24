import { getDatabase } from '../database';
import { CalendarEventItem, SyncStatus } from '../../types';

export const calendarRepo = {
  async getAll(): Promise<CalendarEventItem[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<CalendarEventItem>(
      'SELECT * FROM calendar_events ORDER BY start_date ASC'
    );
    return rows;
  },

  async getByDateRange(startDate: string, endDate: string): Promise<CalendarEventItem[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<CalendarEventItem>(
      `SELECT * FROM calendar_events 
       WHERE (start_date >= ? AND start_date <= ?) OR (end_date >= ? AND end_date <= ?)
       ORDER BY start_date ASC`,
      [startDate, endDate, startDate, endDate]
    );
    return rows;
  },

  async getById(id: string): Promise<CalendarEventItem | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<CalendarEventItem>(
      'SELECT * FROM calendar_events WHERE id = ?',
      [id]
    );
    return row || null;
  },

  async getByIcloudUid(uid: string): Promise<CalendarEventItem | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<CalendarEventItem>(
      'SELECT * FROM calendar_events WHERE icloud_uid = ?',
      [uid]
    );
    return row || null;
  },

  async create(event: Omit<CalendarEventItem, 'created_at' | 'updated_at'>): Promise<CalendarEventItem> {
    const db = await getDatabase();
    const now = new Date().toISOString();
    const newEvent: CalendarEventItem = {
      ...event,
      is_milestone: event.is_milestone ? 1 : 0,
      d_day_target: event.d_day_target || null,
      created_at: now,
      updated_at: now,
    };
    await db.runAsync(
      `INSERT INTO calendar_events (
        id, title, description, location, start_date, end_date,
        is_all_day, is_milestone, d_day_target, color, calendar_name, icloud_uid, icloud_href,
        icloud_etag, sync_status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newEvent.id,
        newEvent.title,
        newEvent.description || null,
        newEvent.location || null,
        newEvent.start_date,
        newEvent.end_date,
        newEvent.is_all_day ? 1 : 0,
        newEvent.is_milestone ? 1 : 0,
        newEvent.d_day_target || null,
        newEvent.color || '#3B82F6',
        newEvent.calendar_name || 'Personal',
        newEvent.icloud_uid || null,
        newEvent.icloud_href || null,
        newEvent.icloud_etag || null,
        newEvent.sync_status || 'synced',
        newEvent.created_at,
        newEvent.updated_at,
      ]
    );
    return newEvent;
  },

  async update(id: string, updates: Partial<CalendarEventItem>): Promise<void> {
    const db = await getDatabase();
    const now = new Date().toISOString();
    const fields: string[] = ['updated_at = ?'];
    const values: any[] = [now];

    if (updates.title !== undefined) {
      fields.push('title = ?');
      values.push(updates.title);
    }
    if (updates.description !== undefined) {
      fields.push('description = ?');
      values.push(updates.description);
    }
    if (updates.location !== undefined) {
      fields.push('location = ?');
      values.push(updates.location);
    }
    if (updates.start_date !== undefined) {
      fields.push('start_date = ?');
      values.push(updates.start_date);
    }
    if (updates.end_date !== undefined) {
      fields.push('end_date = ?');
      values.push(updates.end_date);
    }
    if (updates.is_all_day !== undefined) {
      fields.push('is_all_day = ?');
      values.push(updates.is_all_day ? 1 : 0);
    }
    if (updates.is_milestone !== undefined) {
      fields.push('is_milestone = ?');
      values.push(updates.is_milestone ? 1 : 0);
    }
    if (updates.d_day_target !== undefined) {
      fields.push('d_day_target = ?');
      values.push(updates.d_day_target || null);
    }
    if (updates.color !== undefined) {
      fields.push('color = ?');
      values.push(updates.color);
    }
    if (updates.calendar_name !== undefined) {
      fields.push('calendar_name = ?');
      values.push(updates.calendar_name);
    }
    if (updates.icloud_uid !== undefined) {
      fields.push('icloud_uid = ?');
      values.push(updates.icloud_uid);
    }
    if (updates.icloud_href !== undefined) {
      fields.push('icloud_href = ?');
      values.push(updates.icloud_href);
    }
    if (updates.icloud_etag !== undefined) {
      fields.push('icloud_etag = ?');
      values.push(updates.icloud_etag);
    }
    if (updates.sync_status !== undefined) {
      fields.push('sync_status = ?');
      values.push(updates.sync_status);
    }

    values.push(id);
    await db.runAsync(`UPDATE calendar_events SET ${fields.join(', ')} WHERE id = ?`, values);
  },

  async delete(id: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM calendar_events WHERE id = ?', [id]);
  },
};
