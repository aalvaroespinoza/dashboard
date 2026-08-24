import { getDatabase } from '../database';
import { TaskItem, Priority, SyncStatus, LinkPreviewData } from '../../types';
import { calculateNextDueDate } from '../../services/recurrenceService';
import { notificationService } from '../../services/notificationService';
import { linkPreviewService } from '../../services/linkPreviewService';

interface TaskDbRow {
  id: string;
  list_id: string;
  section_id?: string | null;
  parent_id?: string | null;
  title: string;
  notes: string | null;
  url?: string | null;
  due_date: string | null;
  due_time: string | null;
  is_completed: number;
  completed_at: string | null;
  priority: Priority;
  priority_num: number;
  flagged: number;
  rrule: string | null;
  tags: string;
  position: number;
  notification_id: string | null;
  icloud_uid: string | null;
  icloud_href: string | null;
  icloud_etag: string | null;
  sequence: number;
  sync_status: SyncStatus;
  created_at: string;
  updated_at: string;
}

function priorityToNumber(p: Priority): number {
  switch (p) {
    case 'high':
      return 1;
    case 'medium':
      return 5;
    case 'low':
      return 9;
    default:
      return 0;
  }
}

function parseRow(row: TaskDbRow): TaskItem {
  let tags: string[] = [];
  try {
    tags = row.tags ? JSON.parse(row.tags) : [];
  } catch {
    tags = [];
  }

  // Detectar URL si no está explícita
  const extractedUrl = row.url || linkPreviewService.extractUrl(row.title) || linkPreviewService.extractUrl(row.notes || '');

  return {
    ...row,
    section_id: row.section_id || null,
    parent_id: row.parent_id || null,
    url: extractedUrl,
    completed_at: row.completed_at || null,
    priority_num: row.priority_num ?? priorityToNumber(row.priority),
    flagged: row.flagged ?? 0,
    rrule: row.rrule || null,
    notification_id: row.notification_id || null,
    sequence: row.sequence ?? 0,
    tags,
  };
}

export const tasksRepo = {
  async getAll(): Promise<TaskItem[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<TaskDbRow>(
      'SELECT * FROM tasks ORDER BY is_completed ASC, position ASC, due_date ASC, created_at DESC'
    );
    const parsed = rows.map(parseRow);

    // Obtener previews en batch para todas las tareas que tienen URL
    const previewsMap = await this.getPreviewsMap();
    return parsed.map((t) => ({
      ...t,
      link_preview: t.url ? previewsMap[t.url] || null : null,
    }));
  },

  async getPreviewsMap(): Promise<Record<string, LinkPreviewData>> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<LinkPreviewData>('SELECT * FROM link_previews');
    const map: Record<string, LinkPreviewData> = {};
    rows.forEach((r) => {
      map[r.url] = r;
    });
    return map;
  },

  async getByListId(listId: string): Promise<TaskItem[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<TaskDbRow>(
      'SELECT * FROM tasks WHERE list_id = ? ORDER BY is_completed ASC, position ASC, due_date ASC',
      [listId]
    );
    const parsed = rows.map(parseRow);
    const previewsMap = await this.getPreviewsMap();
    return parsed.map((t) => ({
      ...t,
      link_preview: t.url ? previewsMap[t.url] || null : null,
    }));
  },

  async getSubtasks(parentId: string): Promise<TaskItem[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<TaskDbRow>(
      'SELECT * FROM tasks WHERE parent_id = ? ORDER BY is_completed ASC, position ASC',
      [parentId]
    );
    return rows.map(parseRow);
  },

  async getById(id: string): Promise<TaskItem | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<TaskDbRow>('SELECT * FROM tasks WHERE id = ?', [id]);
    if (!row) return null;
    const task = parseRow(row);
    if (task.url) {
      task.link_preview = await linkPreviewService.getOrFetchPreview(task.url);
    }
    return task;
  },

  async getByIcloudUid(uid: string): Promise<TaskItem | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<TaskDbRow>('SELECT * FROM tasks WHERE icloud_uid = ?', [uid]);
    return row ? parseRow(row) : null;
  },

  async create(task: Omit<TaskItem, 'created_at' | 'updated_at'>): Promise<TaskItem> {
    const db = await getDatabase();
    const now = new Date().toISOString();

    // Detección de URL
    const detectedUrl = task.url || linkPreviewService.extractUrl(task.title) || linkPreviewService.extractUrl(task.notes || '');

    // Programar alarma si tiene fecha
    let notifId: string | null = task.notification_id || null;
    if (task.due_date && !notifId && !task.is_completed) {
      notifId = await notificationService.scheduleTaskAlarm(
        task.id,
        task.title,
        task.due_date,
        task.due_time,
        task.notes
      );
    }

    const priorityNum = task.priority_num ?? priorityToNumber(task.priority || 'none');

    let linkPreview: LinkPreviewData | null = null;
    if (detectedUrl) {
      linkPreview = await linkPreviewService.getOrFetchPreview(detectedUrl);
    }

    const newTask: TaskItem = {
      ...task,
      url: detectedUrl,
      link_preview: linkPreview,
      notification_id: notifId,
      priority_num: priorityNum,
      created_at: now,
      updated_at: now,
    };

    await db.runAsync(
      `INSERT INTO tasks (
        id, list_id, section_id, parent_id, title, notes, url, due_date, due_time, is_completed,
        completed_at, priority, priority_num, flagged, rrule, tags, position,
        notification_id, icloud_uid, icloud_href, icloud_etag, sequence,
        sync_status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newTask.id,
        newTask.list_id,
        newTask.section_id || null,
        newTask.parent_id || null,
        newTask.title,
        newTask.notes || null,
        newTask.url || null,
        newTask.due_date || null,
        newTask.due_time || null,
        newTask.is_completed ? 1 : 0,
        newTask.completed_at || null,
        newTask.priority || 'none',
        priorityNum,
        newTask.flagged ? 1 : 0,
        newTask.rrule || null,
        JSON.stringify(newTask.tags || []),
        newTask.position ?? 0,
        newTask.notification_id || null,
        newTask.icloud_uid || null,
        newTask.icloud_href || null,
        newTask.icloud_etag || null,
        newTask.sequence ?? 0,
        newTask.sync_status || 'synced',
        newTask.created_at,
        newTask.updated_at,
      ]
    );
    return newTask;
  },

  async update(id: string, updates: Partial<TaskItem>): Promise<void> {
    const db = await getDatabase();
    const now = new Date().toISOString();
    const fields: string[] = ['updated_at = ?'];
    const values: any[] = [now];

    if (updates.list_id !== undefined) {
      fields.push('list_id = ?');
      values.push(updates.list_id);
    }
    if (updates.section_id !== undefined) {
      fields.push('section_id = ?');
      values.push(updates.section_id || null);
    }
    if (updates.parent_id !== undefined) {
      fields.push('parent_id = ?');
      values.push(updates.parent_id || null);
    }
    if (updates.title !== undefined) {
      fields.push('title = ?');
      values.push(updates.title);
      const url = updates.url || linkPreviewService.extractUrl(updates.title);
      if (url) {
        fields.push('url = ?');
        values.push(url);
        await linkPreviewService.getOrFetchPreview(url);
      }
    }
    if (updates.notes !== undefined) {
      fields.push('notes = ?');
      values.push(updates.notes);
    }
    if (updates.url !== undefined) {
      fields.push('url = ?');
      values.push(updates.url || null);
      if (updates.url) {
        await linkPreviewService.getOrFetchPreview(updates.url);
      }
    }
    if (updates.due_date !== undefined) {
      fields.push('due_date = ?');
      values.push(updates.due_date);
    }
    if (updates.due_time !== undefined) {
      fields.push('due_time = ?');
      values.push(updates.due_time);
    }
    if (updates.is_completed !== undefined) {
      fields.push('is_completed = ?');
      values.push(updates.is_completed ? 1 : 0);
    }
    if (updates.completed_at !== undefined) {
      fields.push('completed_at = ?');
      values.push(updates.completed_at);
    }
    if (updates.priority !== undefined) {
      fields.push('priority = ?');
      values.push(updates.priority);
      fields.push('priority_num = ?');
      values.push(priorityToNumber(updates.priority));
    }
    if (updates.flagged !== undefined) {
      fields.push('flagged = ?');
      values.push(updates.flagged ? 1 : 0);
    }
    if (updates.rrule !== undefined) {
      fields.push('rrule = ?');
      values.push(updates.rrule);
    }
    if (updates.tags !== undefined) {
      fields.push('tags = ?');
      values.push(JSON.stringify(updates.tags));
    }
    if (updates.position !== undefined) {
      fields.push('position = ?');
      values.push(updates.position);
    }
    if (updates.notification_id !== undefined) {
      fields.push('notification_id = ?');
      values.push(updates.notification_id);
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
    if (updates.sequence !== undefined) {
      fields.push('sequence = ?');
      values.push(updates.sequence);
    }
    if (updates.sync_status !== undefined) {
      fields.push('sync_status = ?');
      values.push(updates.sync_status);
    }

    values.push(id);
    await db.runAsync(`UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`, values);
  },

  async toggleComplete(id: string): Promise<{ task: TaskItem; recurringCreated?: TaskItem }> {
    const task = await this.getById(id);
    if (!task) throw new Error('Task not found');

    const nextCompleted = task.is_completed ? 0 : 1;
    const completedAt = nextCompleted ? new Date().toISOString() : null;

    await this.update(id, {
      is_completed: nextCompleted,
      completed_at: completedAt,
      sync_status: 'pending_update',
    });

    if (task.notification_id && nextCompleted) {
      await notificationService.cancelNotification(task.notification_id);
    }

    let recurringCreated: TaskItem | undefined;
    if (nextCompleted && task.rrule && task.due_date) {
      const nextDue = calculateNextDueDate(task.due_date, task.rrule);
      if (nextDue) {
        recurringCreated = await this.create({
          id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          list_id: task.list_id,
          section_id: task.section_id || null,
          parent_id: task.parent_id || null,
          title: task.title,
          notes: task.notes,
          url: task.url || null,
          due_date: nextDue,
          due_time: task.due_time,
          is_completed: 0,
          priority: task.priority,
          priority_num: task.priority_num,
          flagged: task.flagged,
          rrule: task.rrule,
          tags: task.tags,
          position: task.position,
          sync_status: 'pending_insert',
        });
      }
    }

    const updated = await this.getById(id);
    return { task: updated!, recurringCreated };
  },

  async delete(id: string): Promise<void> {
    const db = await getDatabase();
    const task = await this.getById(id);
    if (task?.notification_id) {
      await notificationService.cancelNotification(task.notification_id);
    }
    await db.runAsync('DELETE FROM tasks WHERE parent_id = ?', [id]);
    await db.runAsync('DELETE FROM tasks WHERE id = ?', [id]);
  },
};
