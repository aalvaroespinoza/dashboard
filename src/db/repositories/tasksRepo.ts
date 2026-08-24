import { getDatabase } from '../database';
import { TaskItem, Priority, SyncStatus } from '../../types';
import { calculateNextDueDate } from '../../services/recurrenceService';
import { notificationService } from '../../services/notificationService';

interface TaskDbRow {
  id: string;
  list_id: string;
  parent_id?: string | null;
  title: string;
  notes: string | null;
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
  return {
    ...row,
    parent_id: row.parent_id || null,
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
    return rows.map(parseRow);
  },

  async getByListId(listId: string): Promise<TaskItem[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<TaskDbRow>(
      'SELECT * FROM tasks WHERE list_id = ? ORDER BY is_completed ASC, position ASC, due_date ASC',
      [listId]
    );
    return rows.map(parseRow);
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
    return row ? parseRow(row) : null;
  },

  async getByIcloudUid(uid: string): Promise<TaskItem | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<TaskDbRow>('SELECT * FROM tasks WHERE icloud_uid = ?', [uid]);
    return row ? parseRow(row) : null;
  },

  async create(task: Omit<TaskItem, 'created_at' | 'updated_at'>): Promise<TaskItem> {
    const db = await getDatabase();
    const now = new Date().toISOString();

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

    const newTask: TaskItem = {
      ...task,
      notification_id: notifId,
      priority_num: priorityNum,
      created_at: now,
      updated_at: now,
    };

    await db.runAsync(
      `INSERT INTO tasks (
        id, list_id, parent_id, title, notes, due_date, due_time, is_completed,
        completed_at, priority, priority_num, flagged, rrule, tags, position,
        notification_id, icloud_uid, icloud_href, icloud_etag, sequence,
        sync_status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newTask.id,
        newTask.list_id,
        newTask.parent_id || null,
        newTask.title,
        newTask.notes || null,
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
    if (updates.parent_id !== undefined) {
      fields.push('parent_id = ?');
      values.push(updates.parent_id);
    }
    if (updates.title !== undefined) {
      fields.push('title = ?');
      values.push(updates.title);
    }
    if (updates.notes !== undefined) {
      fields.push('notes = ?');
      values.push(updates.notes);
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

  async delete(id: string): Promise<void> {
    const db = await getDatabase();
    const task = await this.getById(id);
    if (task?.notification_id) {
      await notificationService.cancelNotification(task.notification_id);
    }
    // Borrar la tarea y todas sus subtareas en cascada
    await db.runAsync('DELETE FROM tasks WHERE id = ? OR parent_id = ?', [id, id]);
  },

  async toggleComplete(id: string): Promise<{ completed: boolean; nextTaskCreated?: TaskItem }> {
    const db = await getDatabase();
    const task = await this.getById(id);
    if (!task) return { completed: false };

    const nextStatus = task.is_completed === 1 ? 0 : 1;
    const now = new Date().toISOString();

    await this.update(id, {
      is_completed: nextStatus,
      completed_at: nextStatus === 1 ? now : null,
      sync_status: 'pending_update',
    });

    if (nextStatus === 1 && task.notification_id) {
      await notificationService.cancelNotification(task.notification_id);
    }

    // Manejo de recurrencia si la tarea tiene RRULE y se acaba de completar
    let nextTaskCreated: TaskItem | undefined;
    if (nextStatus === 1 && task.rrule && task.due_date) {
      const nextDue = calculateNextDueDate(task.due_date, task.rrule);
      if (nextDue) {
        const nextId = `task-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
        nextTaskCreated = await this.create({
          id: nextId,
          list_id: task.list_id,
          parent_id: task.parent_id,
          title: task.title,
          notes: task.notes,
          due_date: nextDue,
          due_time: task.due_time,
          is_completed: 0,
          completed_at: null,
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

    return { completed: nextStatus === 1, nextTaskCreated };
  },

  async updatePositions(items: { id: string; position: number; list_id?: string; parent_id?: string | null }[]): Promise<void> {
    const db = await getDatabase();
    for (const item of items) {
      const sets = ['position = ?'];
      const vals: any[] = [item.position];
      if (item.list_id) {
        sets.push('list_id = ?');
        vals.push(item.list_id);
      }
      if (item.parent_id !== undefined) {
        sets.push('parent_id = ?');
        vals.push(item.parent_id);
      }
      vals.push(item.id);
      await db.runAsync(`UPDATE tasks SET ${sets.join(', ')} WHERE id = ?`, vals);
    }
  },
};
