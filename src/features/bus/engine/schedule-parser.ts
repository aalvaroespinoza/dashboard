import type { BusService, RawScheduleEntry, Direction, DayOfWeek } from '../types';

function buildServiceId(entry: RawScheduleEntry): string {
  const salida = entry.horaSalida.replace(':', '');
  return `svc-${entry.empresa}-${entry.sentido}-${entry.dia}-${salida}`;
}

export function isValidTimeString(time: string): boolean {
  return /^\d{2}:\d{2}$/.test(time);
}

export function isValidDirection(value: string): value is Direction {
  return value === 'ida' || value === 'vuelta';
}

export function isValidDay(value: string): value is DayOfWeek {
  const allowed: DayOfWeek[] = [
    'lunes',
    'martes',
    'miercoles',
    'jueves',
    'viernes',
    'sabado',
    'domingo',
  ];
  return allowed.includes(value as DayOfWeek);
}

export function parseScheduleEntry(entry: RawScheduleEntry): BusService {
  if (!entry.empresa || entry.empresa.trim() === '') {
    throw new Error(`[parseScheduleEntry] Campo 'empresa' vacío: ${JSON.stringify(entry)}`);
  }

  return {
    id: buildServiceId(entry),
    companyId: entry.empresa.trim(),
    line: entry.linea?.trim(),
    direction: entry.sentido,
    day: entry.dia,
    departureTime: entry.horaSalida,
    arrivalTime: entry.horaLlegada,
    notes: entry.notas?.trim(),
  };
}

export function parseAllScheduleEntries(rawEntries: RawScheduleEntry[]): BusService[] {
  const results: BusService[] = [];

  for (const entry of rawEntries) {
    try {
      results.push(parseScheduleEntry(entry));
    } catch (err: any) {
      console.warn('[schedule-parser]', err.message);
    }
  }

  return results;
}

export function filterByDay(services: BusService[], day: DayOfWeek): BusService[] {
  return services.filter((s) => s.day === day);
}

export function filterByDirection(services: BusService[], direction: Direction): BusService[] {
  return services.filter((s) => s.direction === direction);
}

export function filterByCompany(services: BusService[], companyId: string): BusService[] {
  return services.filter((s) => s.companyId === companyId);
}

export function filterByDayAndDirection(
  services: BusService[],
  day: DayOfWeek,
  direction: Direction
): BusService[] {
  return services.filter((s) => s.day === day && s.direction === direction);
}
