/**
 * Motor de Recurrencia estándar RFC 5545 para Apple Reminders en MiHub
 */

export type RecurrencePreset =
  | 'none'
  | 'daily'
  | 'weekdays'
  | 'weekly'
  | 'biweekly'
  | 'monthly'
  | 'yearly';

export const RECURRENCE_PRESETS: { id: RecurrencePreset; label: string; rrule: string | null }[] = [
  { id: 'none', label: 'No repetir', rrule: null },
  { id: 'daily', label: 'Todos los días', rrule: 'RRULE:FREQ=DAILY' },
  { id: 'weekdays', label: 'Días hábiles (Lun-Vie)', rrule: 'RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR' },
  { id: 'weekly', label: 'Cada semana', rrule: 'RRULE:FREQ=WEEKLY' },
  { id: 'biweekly', label: 'Cada 2 semanas', rrule: 'RRULE:FREQ=WEEKLY;INTERVAL=2' },
  { id: 'monthly', label: 'Cada mes', rrule: 'RRULE:FREQ=MONTHLY' },
  { id: 'yearly', label: 'Cada año', rrule: 'RRULE:FREQ=YEARLY' },
];

/**
 * Convierte una regla RRULE en texto legible para el usuario
 */
export function getHumanReadableRRule(rrule?: string | null): string {
  if (!rrule) return 'No repetir';
  const found = RECURRENCE_PRESETS.find((p) => p.rrule === rrule);
  if (found) return found.label;

  if (rrule.includes('FREQ=DAILY')) return 'Diario';
  if (rrule.includes('MO,TU,WE,TH,FR')) return 'Días hábiles';
  if (rrule.includes('FREQ=WEEKLY')) return 'Semanal';
  if (rrule.includes('FREQ=MONTHLY')) return 'Mensual';
  if (rrule.includes('FREQ=YEARLY')) return 'Anual';

  return 'Personalizado';
}

/**
 * Calcula la próxima fecha de vencimiento a partir de la fecha actual y la regla RRULE
 * @param currentDueDate Fecha en formato 'YYYY-MM-DD'
 * @param rrule Regla en formato RFC 5545
 * @returns Próxima fecha 'YYYY-MM-DD' o null
 */
export function calculateNextDueDate(
  currentDueDate: string,
  rrule: string | null | undefined
): string | null {
  if (!rrule || !currentDueDate) return null;

  const [y, m, d] = currentDueDate.split('-').map(Number);
  const date = new Date(y, (m || 1) - 1, d || 1);

  if (rrule.includes('FREQ=DAILY')) {
    date.setDate(date.getDate() + 1);
  } else if (rrule.includes('BYDAY=MO,TU,WE,TH,FR')) {
    // Días hábiles
    const dayOfWeek = date.getDay(); // 0 = Domingo, 5 = Viernes, 6 = Sábado
    if (dayOfWeek === 5) {
      // De viernes salta a lunes (+3)
      date.setDate(date.getDate() + 3);
    } else if (dayOfWeek === 6) {
      // De sábado salta a lunes (+2)
      date.setDate(date.getDate() + 2);
    } else {
      date.setDate(date.getDate() + 1);
    }
  } else if (rrule.includes('FREQ=WEEKLY;INTERVAL=2')) {
    date.setDate(date.getDate() + 14);
  } else if (rrule.includes('FREQ=WEEKLY')) {
    date.setDate(date.getDate() + 7);
  } else if (rrule.includes('FREQ=MONTHLY')) {
    date.setMonth(date.getMonth() + 1);
  } else if (rrule.includes('FREQ=YEARLY')) {
    date.setFullYear(date.getFullYear() + 1);
  } else {
    // Default fallback +1 day
    date.setDate(date.getDate() + 1);
  }

  const nextY = date.getFullYear();
  const nextM = (date.getMonth() + 1).toString().padStart(2, '0');
  const nextD = date.getDate().toString().padStart(2, '0');

  return `${nextY}-${nextM}-${nextD}`;
}
