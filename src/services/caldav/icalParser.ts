import { TaskItem, CalendarEventItem, Priority } from '../../types';

/**
 * Despliega líneas dobladas en formato RFC 5545 (líneas que empiezan con espacio o tabulador)
 */
function unfoldLines(icsString: string): string[] {
  const normalized = icsString.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const rawLines = normalized.split('\n');
  const lines: string[] = [];

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i];
    if (line.startsWith(' ') || line.startsWith('\t')) {
      if (lines.length > 0) {
        lines[lines.length - 1] += line.substring(1);
      }
    } else if (line.trim().length > 0) {
      lines.push(line);
    }
  }

  return lines;
}

function unescapeText(text: string): string {
  return text
    .replace(/\\n/g, '\n')
    .replace(/\\N/g, '\n')
    .replace(/\\,/g, ',')
    .replace(/\\;/g, ';')
    .replace(/\\\\/g, '\\');
}

function escapeText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

/**
 * Parsea fechas iCalendar (ej. 20260824T150000Z o 20260824) a ISO string
 */
function parseIcalDate(val: string): { iso: string; dateOnly: boolean } {
  const cleanVal = val.split(':')[1] || val; // remover parámetros TZID si vienen
  const digits = cleanVal.replace(/[^0-9TZ]/g, '');

  if (digits.length === 8) {
    // Solo fecha YYYYMMDD
    const y = digits.substring(0, 4);
    const m = digits.substring(4, 6);
    const d = digits.substring(6, 8);
    return { iso: `${y}-${m}-${d}T00:00:00`, dateOnly: true };
  }

  if (digits.length >= 15) {
    // YYYYMMDDTHHmmss o con Z
    const y = digits.substring(0, 4);
    const m = digits.substring(4, 6);
    const d = digits.substring(6, 8);
    const hh = digits.substring(9, 11);
    const mm = digits.substring(11, 13);
    const ss = digits.substring(13, 15);
    return { iso: `${y}-${m}-${d}T${hh}:${mm}:${ss}`, dateOnly: false };
  }

  return { iso: new Date().toISOString(), dateOnly: false };
}

/**
 * Convierte ISO string a formato iCal UTC (YYYYMMDDTHHmmssZ)
 */
function toIcalUtc(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  } catch {
    return new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  }
}

export const icalParser = {
  /**
   * Parsea un bloque iCalendar y extrae todos los VTODO (Recordatorios de Apple)
   */
  parseVTodos(icsString: string): Partial<TaskItem>[] {
    const lines = unfoldLines(icsString);
    const tasks: Partial<TaskItem>[] = [];
    let inVTodo = false;
    let currentTask: any = {};

    for (const line of lines) {
      if (line === 'BEGIN:VTODO') {
        inVTodo = true;
        currentTask = {
          tags: [],
          priority: 'none',
          is_completed: 0,
        };
      } else if (line === 'END:VTODO') {
        if (inVTodo && currentTask.title) {
          tasks.push(currentTask);
        }
        inVTodo = false;
        currentTask = {};
      } else if (inVTodo) {
        const colonIdx = line.indexOf(':');
        if (colonIdx === -1) continue;

        const propKey = line.substring(0, colonIdx).split(';')[0].toUpperCase();
        const propVal = line.substring(colonIdx + 1);

        switch (propKey) {
          case 'UID':
            currentTask.icloud_uid = propVal.trim();
            break;
          case 'SUMMARY':
            currentTask.title = unescapeText(propVal.trim());
            break;
          case 'DESCRIPTION':
            currentTask.notes = unescapeText(propVal.trim());
            break;
          case 'STATUS':
            if (propVal.trim().toUpperCase() === 'COMPLETED') {
              currentTask.is_completed = 1;
            }
            break;
          case 'PERCENT-COMPLETE':
            if (parseInt(propVal.trim(), 10) === 100) {
              currentTask.is_completed = 1;
            }
            break;
          case 'COMPLETED':
            currentTask.is_completed = 1;
            break;
          case 'DUE': {
            const { iso, dateOnly } = parseIcalDate(line);
            currentTask.due_date = iso.split('T')[0];
            if (!dateOnly) {
              const timeParts = iso.split('T')[1];
              currentTask.due_time = timeParts.substring(0, 5);
            }
            break;
          }
          case 'PRIORITY': {
            const prioNum = parseInt(propVal.trim(), 10);
            if (prioNum >= 1 && prioNum <= 4) {
              currentTask.priority = 'high';
            } else if (prioNum === 5) {
              currentTask.priority = 'medium';
            } else if (prioNum >= 6 && prioNum <= 9) {
              currentTask.priority = 'low';
            } else {
              currentTask.priority = 'none';
            }
            break;
          }
          case 'CATEGORIES': {
            const catItems = propVal.split(',').map(c => unescapeText(c.trim()));
            currentTask.tags = catItems;
            break;
          }
        }
      }
    }

    return tasks;
  },

  /**
   * Parsea un bloque iCalendar y extrae todos los VEVENT (Eventos de calendario)
   */
  parseVEvents(icsString: string): Partial<CalendarEventItem>[] {
    const lines = unfoldLines(icsString);
    const events: Partial<CalendarEventItem>[] = [];
    let inVEvent = false;
    let currentEvent: any = {};

    for (const line of lines) {
      if (line === 'BEGIN:VEVENT') {
        inVEvent = true;
        currentEvent = {
          is_all_day: 0,
        };
      } else if (line === 'END:VEVENT') {
        if (inVEvent && currentEvent.title && currentEvent.start_date) {
          if (!currentEvent.end_date) {
            currentEvent.end_date = currentEvent.start_date;
          }
          events.push(currentEvent);
        }
        inVEvent = false;
        currentEvent = {};
      } else if (inVEvent) {
        const colonIdx = line.indexOf(':');
        if (colonIdx === -1) continue;

        const propKey = line.substring(0, colonIdx).split(';')[0].toUpperCase();
        const propVal = line.substring(colonIdx + 1);

        switch (propKey) {
          case 'UID':
            currentEvent.icloud_uid = propVal.trim();
            break;
          case 'SUMMARY':
            currentEvent.title = unescapeText(propVal.trim());
            break;
          case 'DESCRIPTION':
            currentEvent.description = unescapeText(propVal.trim());
            break;
          case 'LOCATION':
            currentEvent.location = unescapeText(propVal.trim());
            break;
          case 'DTSTART': {
            const { iso, dateOnly } = parseIcalDate(line);
            currentEvent.start_date = iso;
            if (dateOnly) {
              currentEvent.is_all_day = 1;
            }
            break;
          }
          case 'DTEND': {
            const { iso } = parseIcalDate(line);
            currentEvent.end_date = iso;
            break;
          }
        }
      }
    }

    return events;
  },

  /**
   * Genera un VCALENDAR con VTODO para subir una tarea a iCloud Reminders
   */
  generateVTodo(task: TaskItem): string {
    const uid = task.icloud_uid || `${task.id}@dashboard.local`;
    const dtstamp = toIcalUtc(new Date().toISOString());
    let priorityNum = 0;
    if (task.priority === 'high') priorityNum = 1;
    else if (task.priority === 'medium') priorityNum = 5;
    else if (task.priority === 'low') priorityNum = 9;

    let dueProp = '';
    if (task.due_date) {
      if (task.due_time) {
        const dueIso = `${task.due_date}T${task.due_time}:00`;
        dueProp = `DUE:${toIcalUtc(dueIso)}\r\n`;
      } else {
        dueProp = `DUE;VALUE=DATE:${task.due_date.replace(/-/g, '')}\r\n`;
      }
    }

    const statusProp = task.is_completed ? 'STATUS:COMPLETED\r\nPERCENT-COMPLETE:100\r\n' : 'STATUS:NEEDS-ACTION\r\n';
    const descProp = task.notes ? `DESCRIPTION:${escapeText(task.notes)}\r\n` : '';
    const tagsProp = task.tags && task.tags.length > 0 ? `CATEGORIES:${task.tags.map(escapeText).join(',')}\r\n` : '';

    return (
      'BEGIN:VCALENDAR\r\n' +
      'VERSION:2.0\r\n' +
      'PRODID:-//Dashboard Tablet//Grit Clone//ES\r\n' +
      'CALSCALE:GREGORIAN\r\n' +
      'BEGIN:VTODO\r\n' +
      `UID:${uid}\r\n` +
      `DTSTAMP:${dtstamp}\r\n` +
      `SUMMARY:${escapeText(task.title)}\r\n` +
      descProp +
      dueProp +
      statusProp +
      `PRIORITY:${priorityNum}\r\n` +
      tagsProp +
      'END:VTODO\r\n' +
      'END:VCALENDAR\r\n'
    );
  },

  /**
   * Genera un VCALENDAR con VEVENT para subir un evento a iCloud Calendar
   */
  generateVEvent(event: CalendarEventItem): string {
    const uid = event.icloud_uid || `${event.id}@dashboard.local`;
    const dtstamp = toIcalUtc(new Date().toISOString());
    const dtstart = event.is_all_day
      ? `DTSTART;VALUE=DATE:${event.start_date.split('T')[0].replace(/-/g, '')}\r\n`
      : `DTSTART:${toIcalUtc(event.start_date)}\r\n`;
    const dtend = event.is_all_day
      ? `DTEND;VALUE=DATE:${event.end_date.split('T')[0].replace(/-/g, '')}\r\n`
      : `DTEND:${toIcalUtc(event.end_date)}\r\n`;

    const descProp = event.description ? `DESCRIPTION:${escapeText(event.description)}\r\n` : '';
    const locProp = event.location ? `LOCATION:${escapeText(event.location)}\r\n` : '';

    return (
      'BEGIN:VCALENDAR\r\n' +
      'VERSION:2.0\r\n' +
      'PRODID:-//Dashboard Tablet//Calendar//ES\r\n' +
      'CALSCALE:GREGORIAN\r\n' +
      'BEGIN:VEVENT\r\n' +
      `UID:${uid}\r\n` +
      `DTSTAMP:${dtstamp}\r\n` +
      `SUMMARY:${escapeText(event.title)}\r\n` +
      descProp +
      locProp +
      dtstart +
      dtend +
      'END:VEVENT\r\n' +
      'END:VCALENDAR\r\n'
    );
  },
};
