import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  DayOfWeek,
  Direction,
  BusServiceItem,
  NextBusResult,
  getCurrentDayOfWeek,
  getCurrentTimeString,
  getTimeUntilNextBus,
  getAllParsedServices,
  compareTime,
} from '../services/busService';
import { useBusStore } from '../stores/useBusStore';

export interface UseBusScheduleOptions {
  companyId?: string | null;
  direction?: 'outbound' | 'inbound' | 'ida' | 'vuelta';
  origin?: string;
  destination?: string;
  day?: DayOfWeek;
  limit?: number;
  updateIntervalMs?: number; // Por defecto 30000 (30 seg)
}

export type BusScheduleStatus =
  | 'departing_now' // <= 1 min
  | 'urgent'        // <= 15 min (alerta)
  | 'upcoming'      // 16 a 60 min
  | 'later'         // > 60 min
  | 'passed'        // ya salió
  | 'no_more_today';// no hay más servicios

export interface UseBusScheduleResult {
  nextBus: NextBusResult | null;
  upcomingBuses: NextBusResult[];
  allDayServices: BusServiceItem[];
  minutosRestantes: number | null;
  status: BusScheduleStatus;
  badgeText: string;
  currentTime: string;
  currentDay: DayOfWeek;
  direction: 'ida' | 'vuelta';
  refresh: () => void;
}

/**
 * Hook reactivo para el cálculo en tiempo real de horarios y cuenta regresiva de colectivos.
 */
export function useBusSchedule(options?: UseBusScheduleOptions): UseBusScheduleResult {
  const store = useBusStore();

  // Opciones combinadas con el store
  const effectiveDirection: 'ida' | 'vuelta' = useMemo(() => {
    const d = options?.direction || store.selectedDirection;
    return d === 'inbound' || d === 'vuelta' ? 'vuelta' : 'ida';
  }, [options?.direction, store.selectedDirection]);

  const effectiveCompanyId = options?.companyId !== undefined ? options.companyId : store.selectedRouteId;
  const updateInterval = options?.updateIntervalMs || 30000;

  // Estado de tiempo en vivo
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());

  const currentTime = useMemo(() => getCurrentTimeString(currentDate), [currentDate]);
  const currentDay = useMemo(() => options?.day || getCurrentDayOfWeek(currentDate), [options?.day, currentDate]);

  const refresh = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  // Intervalo de actualización en tiempo real
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, updateInterval);

    return () => clearInterval(timer);
  }, [updateInterval]);

  // Filtrado y cálculo de servicios
  const { nextBus, upcomingBuses, allDayServices } = useMemo(() => {
    let services = getAllParsedServices().filter((s) => s.day === currentDay && s.direction === effectiveDirection);

    if (effectiveCompanyId && effectiveCompanyId !== 'all') {
      services = services.filter((s) => s.companyId === effectiveCompanyId);
    }

    // Ordenar cronológicamente
    services.sort((a, b) => compareTime(a.departureTime, b.departureTime));

    const upcoming: NextBusResult[] = [];

    for (const s of services) {
      const diff = getTimeUntilNextBus(s.departureTime, currentTime);

      if (diff >= -2) {
        let st: 'departing_now' | 'upcoming' | 'passed' = 'upcoming';
        let msg = '';

        if (diff <= 1 && diff >= -2) {
          st = 'departing_now';
          msg = `El colectivo de las ${s.departureTime} (${s.companyName}) está saliendo ahora`;
        } else {
          st = 'upcoming';
          msg = `Sale en ${diff} min (${s.departureTime} · ${s.companyName})`;
        }

        upcoming.push({
          service: s,
          minutesUntilDeparture: diff,
          formattedDeparture: s.departureTime,
          status: st,
          message: msg,
        });
      }
    }

    return {
      nextBus: upcoming.length > 0 ? upcoming[0] : null,
      upcomingBuses: upcoming.slice(0, options?.limit || 5),
      allDayServices: services,
    };
  }, [currentDay, effectiveDirection, effectiveCompanyId, currentTime, options?.limit]);

  // Determinación de estado y badge estilo ContadorVivo
  const { minutosRestantes, status, badgeText } = useMemo(() => {
    if (!nextBus) {
      return {
        minutosRestantes: null,
        status: 'no_more_today' as BusScheduleStatus,
        badgeText: 'Sin más salidas hoy',
      };
    }

    const mins = nextBus.minutesUntilDeparture;

    if (mins <= 1 && mins >= -2) {
      return {
        minutosRestantes: Math.max(0, mins),
        status: 'departing_now' as BusScheduleStatus,
        badgeText: 'Saliendo ahora',
      };
    }

    if (mins < 0) {
      return {
        minutosRestantes: mins,
        status: 'passed' as BusScheduleStatus,
        badgeText: 'El colectivo ya pasó',
      };
    }

    if (mins <= 15) {
      return {
        minutosRestantes: mins,
        status: 'urgent' as BusScheduleStatus,
        badgeText: `Faltan ${mins} min`,
      };
    }

    if (mins <= 60) {
      return {
        minutosRestantes: mins,
        status: 'upcoming' as BusScheduleStatus,
        badgeText: `Faltan ${mins} min`,
      };
    }

    return {
      minutosRestantes: mins,
      status: 'later' as BusScheduleStatus,
      badgeText: `Sale a las ${nextBus.formattedDeparture}`,
    };
  }, [nextBus]);

  return {
    nextBus,
    upcomingBuses,
    allDayServices,
    minutosRestantes,
    status,
    badgeText,
    currentTime,
    currentDay,
    direction: effectiveDirection,
    refresh,
  };
}
