import type {
  BusService,
  ResolvedBusService,
  ScheduleForDay,
  DayOfWeek,
  Direction,
  Company,
  RawScheduleEntry,
  NextBusResult,
  ServiceStatusType,
} from '../types';
import { companies as staticCompanies, COMPANIES_LIST } from '../data/companies';
import { rawScheduleEntries } from '../data/schedules';
import {
  parseAllScheduleEntries,
  filterByDay,
  filterByDirection,
} from './schedule-parser';
import { dateToSchoolDay } from './scenario-engine';

// ─── Helpers de Manipulación de Tiempo ───────────────────────────────────────

export function timeToMinutes(timeHHMM: string): number {
  const [h, m] = timeHHMM.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

export function minutesToTime(totalMins: number): string {
  const normalized = ((totalMins % 1440) + 1440) % 1440;
  const hh = Math.floor(normalized / 60).toString().padStart(2, '0');
  const mm = (normalized % 60).toString().padStart(2, '0');
  return `${hh}:${mm}`;
}

export function compareTime(a: string, b: string): number {
  return timeToMinutes(a) - timeToMinutes(b);
}

export function calculateTimeDifference(departureTime: string, currentTime: string): number {
  const depMins = timeToMinutes(departureTime);
  const curMins = timeToMinutes(currentTime);
  let diff = depMins - curMins;
  // Manejo de cruce de medianoche
  if (diff < -1200) {
    diff += 1440;
  }
  return diff;
}

export function calculateMarginMinutes(arrivalTime: string, targetTime: string): number {
  return timeToMinutes(targetTime) - timeToMinutes(arrivalTime);
}

export function getCurrentTimeString(date: Date = new Date()): string {
  const hh = date.getHours().toString().padStart(2, '0');
  const mm = date.getMinutes().toString().padStart(2, '0');
  return `${hh}:${mm}`;
}

export function calcularHoraLlegada(horaSalida: string, tipoViaje: 'ida' | 'vuelta'): string {
  const minutosSalida = timeToMinutes(horaSalida);
  let tiempoViajeMinutos = 65; // Base 65 min Despeñaderos <-> Córdoba

  if (tipoViaje === 'ida') {
    // Hora pico mañana: 06:00 a 07:30
    if (minutosSalida >= 360 && minutosSalida <= 450) {
      tiempoViajeMinutos += 15;
    }
  } else {
    // Hora pico tarde: 16:00 a 18:30
    if (minutosSalida >= 960 && minutosSalida <= 1110) {
      tiempoViajeMinutos += 15;
    }
  }

  return minutesToTime(minutosSalida + tiempoViajeMinutos);
}

// ─── Resolución y Ordenamiento de Servicios ─────────────────────────────────

export function resolveCompanyName(companyId: string, companyList: Company[] = COMPANIES_LIST): string {
  return companyList.find((c) => c.id === companyId)?.shortName || staticCompanies[companyId]?.shortName || companyId;
}

export function resolveCompanyColor(companyId: string, companyList: Company[] = COMPANIES_LIST): string {
  return companyList.find((c) => c.id === companyId)?.color || staticCompanies[companyId]?.color || '#6366F1';
}

export function sortByDepartureTime(services: BusService[]): BusService[] {
  return [...services].sort((a, b) => compareTime(a.departureTime, b.departureTime));
}

export function resolveServices(services: BusService[], companyList: Company[] = COMPANIES_LIST): ResolvedBusService[] {
  return services.map((s) => ({
    ...s,
    companyName: resolveCompanyName(s.companyId, companyList),
    companyColor: resolveCompanyColor(s.companyId, companyList),
  }));
}

export function getServiceStatus(minutesUntilDeparture: number): {
  status: ServiceStatusType;
  badgeText: string;
} {
  if (minutesUntilDeparture <= 1 && minutesUntilDeparture >= -2) {
    return { status: 'departing_now', badgeText: 'Saliendo ahora' };
  }
  if (minutesUntilDeparture < -2) {
    return { status: 'passed', badgeText: 'Ya salió' };
  }
  if (minutesUntilDeparture <= 15) {
    return { status: 'urgent', badgeText: `Faltan ${minutesUntilDeparture} min` };
  }
  if (minutesUntilDeparture <= 60) {
    return { status: 'upcoming', badgeText: `Faltan ${minutesUntilDeparture} min` };
  }
  return { status: 'later', badgeText: 'Más tarde' };
}

// ─── Funciones Principales de Consulta y Cálculo ────────────────────────────

export function getScheduleForDay(
  day: DayOfWeek = 'lunes',
  entries: RawScheduleEntry[] = rawScheduleEntries,
  companyList: Company[] = COMPANIES_LIST
): ScheduleForDay {
  const allServices = parseAllScheduleEntries(entries);
  const dayServices = filterByDay(allServices, day);
  const sorted = sortByDepartureTime(dayServices);

  const ida = resolveServices(filterByDirection(sorted, 'ida'), companyList);
  const vuelta = resolveServices(filterByDirection(sorted, 'vuelta'), companyList);

  return { ida, vuelta };
}

export function getUpcomingSchedules(params: {
  direction?: Direction;
  day?: DayOfWeek;
  currentTime?: string;
  companyId?: string;
  entries?: RawScheduleEntry[];
}): ResolvedBusService[] {
  const day = params.day || dateToSchoolDay(new Date());
  const currentTime = params.currentTime || getCurrentTimeString();
  const schedule = getScheduleForDay(day, params.entries);

  let services: ResolvedBusService[] = [];
  if (!params.direction || params.direction === 'ida') {
    services = [...services, ...schedule.ida];
  }
  if (!params.direction || params.direction === 'vuelta') {
    services = [...services, ...schedule.vuelta];
  }

  if (params.companyId && params.companyId !== 'all') {
    services = services.filter((s) => s.companyId === params.companyId);
  }

  return services
    .filter((s) => calculateTimeDifference(s.departureTime, currentTime) >= -2)
    .sort((a, b) => compareTime(a.departureTime, b.departureTime));
}

export function getNextBuses(params: {
  direction?: Direction;
  day?: DayOfWeek;
  currentTime?: string;
  companyId?: string;
  limit?: number;
  entries?: RawScheduleEntry[];
}): NextBusResult[] {
  const currentTime = params.currentTime || getCurrentTimeString();
  const limit = params.limit || 5;
  const upcoming = getUpcomingSchedules(params);

  return upcoming.slice(0, limit).map((service) => {
    const diff = calculateTimeDifference(service.departureTime, currentTime);
    const { status, badgeText } = getServiceStatus(diff);

    let message = `Sale en ${diff} min (${service.departureTime} · ${service.companyName})`;
    if (status === 'departing_now') {
      message = `El colectivo de las ${service.departureTime} (${service.companyName}) está saliendo ahora`;
    }

    return {
      service,
      minutesUntilDeparture: diff,
      formattedDeparture: service.departureTime,
      status,
      message,
    };
  });
}
