import { CalDavClient, CalDavCollection } from './caldavClient';
import { credentialsStore } from './credentialsStore';
import { icalParser } from './icalParser';
import { tasksRepo } from '../../db/repositories/tasksRepo';
import { listsRepo } from '../../db/repositories/listsRepo';
import { calendarRepo } from '../../db/repositories/calendarRepo';
import { TaskItem, CalendarEventItem } from '../../types';

export interface SyncResult {
  success: boolean;
  tasksPulled: number;
  tasksPushed: number;
  eventsPulled: number;
  eventsPushed: number;
  errors: string[];
}

export const syncEngine = {
  /**
   * Ejecuta la sincronización bidireccional completa de Recordatorios y Calendarios
   */
  async runFullSync(): Promise<SyncResult> {
    const result: SyncResult = {
      success: true,
      tasksPulled: 0,
      tasksPushed: 0,
      eventsPulled: 0,
      eventsPushed: 0,
      errors: [],
    };

    const { appleId, appPassword, caldavUrl } = await credentialsStore.getCredentials();
    if (!appleId || !appPassword) {
      result.success = false;
      result.errors.push('No hay credenciales de iCloud configuradas.');
      return result;
    }

    try {
      const client = new CalDavClient(appleId, appPassword, caldavUrl);

      // 1. Descubrir Principal y Calendar Home
      let calendarHome = await credentialsStore.getCalendarsHome();
      if (!calendarHome) {
        const principal = await client.findPrincipal();
        calendarHome = await client.findCalendarHomeSet(principal);
        await credentialsStore.saveCalendarsHome(calendarHome);
      }

      // 2. Obtener colecciones
      const collections = await client.listCollections(calendarHome);
      const todoCollections = collections.filter(c => c.supportsTodos);
      const eventCollections = collections.filter(c => c.supportsEvents);

      // Sincronizar listas locales con colecciones de recordatorios
      const existingLists = await listsRepo.getAll();
      let defaultList = existingLists[0];

      for (const coll of todoCollections) {
        let matchingList = existingLists.find(l => l.icloud_href === coll.href || l.title.toLowerCase() === coll.name.toLowerCase());
        if (!matchingList) {
          matchingList = await listsRepo.create({
            id: `list-icloud-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            title: coll.name,
            color: coll.color || '#6366F1',
            icon: 'list',
            position: existingLists.length,
            icloud_href: coll.href,
          });
        } else if (!matchingList.icloud_href) {
          await listsRepo.update(matchingList.id, { icloud_href: coll.href });
        }
      }

      // 3. Sincronizar VTODO (Recordatorios / Grit Tasks)
      for (const coll of todoCollections) {
        try {
          const list = (await listsRepo.getAll()).find(l => l.icloud_href === coll.href) || defaultList;
          const items = await client.fetchCollectionItems(coll.href, 'VTODO');

          for (const remoteItem of items) {
            const parsedList = icalParser.parseVTodos(remoteItem.icsData);
            for (const parsed of parsedList) {
              if (!parsed.icloud_uid && !parsed.title) continue;

              const existingTask = parsed.icloud_uid ? await tasksRepo.getByIcloudUid(parsed.icloud_uid) : null;

              if (existingTask) {
                // Actualizar si no hay cambios locales pendientes
                if (existingTask.sync_status === 'synced') {
                  await tasksRepo.update(existingTask.id, {
                    title: parsed.title || existingTask.title,
                    notes: parsed.notes !== undefined ? parsed.notes : existingTask.notes,
                    due_date: parsed.due_date !== undefined ? parsed.due_date : existingTask.due_date,
                    due_time: parsed.due_time !== undefined ? parsed.due_time : existingTask.due_time,
                    is_completed: parsed.is_completed !== undefined ? parsed.is_completed : existingTask.is_completed,
                    priority: parsed.priority || existingTask.priority,
                    tags: parsed.tags && parsed.tags.length > 0 ? parsed.tags : existingTask.tags,
                    icloud_href: remoteItem.href,
                    icloud_etag: remoteItem.etag,
                    sync_status: 'synced',
                  });
                  result.tasksPulled++;
                }
              } else {
                // Crear nueva tarea recibida de iCloud
                await tasksRepo.create({
                  id: `task-icloud-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
                  list_id: list ? list.id : 'list-inbox',
                  title: parsed.title || 'Sin Título',
                  notes: parsed.notes || null,
                  due_date: parsed.due_date || null,
                  due_time: parsed.due_time || null,
                  is_completed: parsed.is_completed || 0,
                  priority: parsed.priority || 'none',
                  tags: parsed.tags || [],
                  position: 0,
                  icloud_uid: parsed.icloud_uid || null,
                  icloud_href: remoteItem.href,
                  icloud_etag: remoteItem.etag,
                  sync_status: 'synced',
                });
                result.tasksPulled++;
              }
            }
          }

          // Subir tareas pendientes locales hacia esta colección
          const pendingTasks = (await tasksRepo.getAll()).filter(t => t.sync_status !== 'synced');
          for (const task of pendingTasks) {
            try {
              if (task.sync_status === 'pending_delete' && task.icloud_href) {
                await client.deleteItem(task.icloud_href);
                await tasksRepo.delete(task.id);
                result.tasksPushed++;
              } else {
                const ics = icalParser.generateVTodo(task);
                const targetHref = task.icloud_href || `${coll.href.replace(/\/$/, '')}/${task.id}.ics`;
                const putRes = await client.putItem(targetHref, ics, task.icloud_etag || undefined);
                await tasksRepo.update(task.id, {
                  icloud_href: targetHref,
                  icloud_etag: putRes.etag,
                  sync_status: 'synced',
                });
                result.tasksPushed++;
              }
            } catch (err: any) {
              result.errors.push(`Error subiendo tarea ${task.title}: ${err.message}`);
            }
          }
        } catch (err: any) {
          result.errors.push(`Error en colección de recordatorios ${coll.name}: ${err.message}`);
        }
      }

      // 4. Sincronizar VEVENT (Calendarios)
      for (const coll of eventCollections) {
        try {
          const items = await client.fetchCollectionItems(coll.href, 'VEVENT');

          for (const remoteItem of items) {
            const parsedList = icalParser.parseVEvents(remoteItem.icsData);
            for (const parsed of parsedList) {
              if (!parsed.icloud_uid || !parsed.title || !parsed.start_date) continue;

              const existingEvent = await calendarRepo.getByIcloudUid(parsed.icloud_uid);

              if (existingEvent) {
                if (existingEvent.sync_status === 'synced') {
                  await calendarRepo.update(existingEvent.id, {
                    title: parsed.title,
                    description: parsed.description,
                    location: parsed.location,
                    start_date: parsed.start_date,
                    end_date: parsed.end_date || parsed.start_date,
                    is_all_day: parsed.is_all_day || 0,
                    calendar_name: coll.name,
                    color: coll.color || existingEvent.color,
                    icloud_href: remoteItem.href,
                    icloud_etag: remoteItem.etag,
                    sync_status: 'synced',
                  });
                  result.eventsPulled++;
                }
              } else {
                await calendarRepo.create({
                  id: `evt-icloud-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
                  title: parsed.title,
                  description: parsed.description || null,
                  location: parsed.location || null,
                  start_date: parsed.start_date,
                  end_date: parsed.end_date || parsed.start_date,
                  is_all_day: parsed.is_all_day || 0,
                  color: coll.color || '#3B82F6',
                  calendar_name: coll.name,
                  icloud_uid: parsed.icloud_uid,
                  icloud_href: remoteItem.href,
                  icloud_etag: remoteItem.etag,
                  sync_status: 'synced',
                });
                result.eventsPulled++;
              }
            }
          }

          // Subir eventos pendientes locales
          const pendingEvents = (await calendarRepo.getAll()).filter(e => e.sync_status !== 'synced');
          for (const event of pendingEvents) {
            try {
              if (event.sync_status === 'pending_delete' && event.icloud_href) {
                await client.deleteItem(event.icloud_href);
                await calendarRepo.delete(event.id);
                result.eventsPushed++;
              } else {
                const ics = icalParser.generateVEvent(event);
                const targetHref = event.icloud_href || `${coll.href.replace(/\/$/, '')}/${event.id}.ics`;
                const putRes = await client.putItem(targetHref, ics, event.icloud_etag || undefined);
                await calendarRepo.update(event.id, {
                  icloud_href: targetHref,
                  icloud_etag: putRes.etag,
                  sync_status: 'synced',
                });
                result.eventsPushed++;
              }
            } catch (err: any) {
              result.errors.push(`Error subiendo evento ${event.title}: ${err.message}`);
            }
          }
        } catch (err: any) {
          result.errors.push(`Error en colección de eventos ${coll.name}: ${err.message}`);
        }
      }

    } catch (err: any) {
      result.success = false;
      result.errors.push(err.message || 'Error desconocido durante la sincronización CalDAV.');
    }

    return result;
  },
};
