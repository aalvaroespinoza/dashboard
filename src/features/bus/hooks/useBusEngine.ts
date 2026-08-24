import { useState, useEffect, useMemo, useCallback } from 'react';
import { useBusStore } from '../stores/useBusStore';
import {
  NextBusResult,
  ResolvedBusService,
  ServiceStatusType,
  DayOfWeek,
  Direction,
} from '../types';
import {
  getNextBuses,
  getScheduleForDay,
  calculateTimeDifference,
  getServiceStatus,
  getCurrentTimeString,
} from '../engine/schedule.service';
import { dateToSchoolDay } from '../engine/scenario-engine';

export interface UseBusEngineResult {
  // Colectivos
  nextBus: NextBusResult | null;
  upcomingBuses: NextBusResult[];
  allDayServices: { ida: ResolvedBusService[]; vuelta: ResolvedBusService[] };

  // Escenario y Estado
  activeScenario: string;
  isAutoScenarioMode: boolean;
  status: ServiceStatusType;

  // Tiempo y Cuenta Regresiva
  timeRemainingFormatted: string;
  minutosRestantes: number | null;
  segundosRestantes: number;
  currentTime: string;
  currentDay: DayOfWeek;

  // Acciones
  refresh: () => void;
}

/**
 * Hook unificado que sincroniza el reloj del sistema, el cálculo de escenarios automáticos
 * y la cuenta regresiva en vivo de próximos colectivos.
 */
export function useBusEngine(): UseBusEngineResult {
  const {
    activeScenario,
    isAutoScenarioMode,
    selectedCompany,
    filterType,
    selectedDay,
    evaluateAutoScenario,
    refreshCalculations,
  } = useBusStore();

  const [now, setNow] = useState<Date>(() => new Date());

  // 1. Reloj interno: Ticker cada 1 segundo para el contador en vivo
  useEffect(() => {
    const secondTimer = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(secondTimer);
  }, []);

  // 2. Ticker cada 30 segundos para reordenamiento de grilla y reevaluación de escenario
  useEffect(() => {
    const thirtySecTimer = setInterval(() => {
      if (isAutoScenarioMode) {
        evaluateAutoScenario();
      }
      refreshCalculations();
    }, 30000);

    return () => clearInterval(thirtySecTimer);
  }, [isAutoScenarioMode]);

  const currentTime = useMemo(() => getCurrentTimeString(now), [now]);
  const currentDay = useMemo(() => dateToSchoolDay(now), [now]);

  // Recálculo reactivo de próximos colectivos
  const { nextBus, upcomingBuses, allDayServices } = useMemo(() => {
    const dir: Direction | undefined = filterType === 'all' ? undefined : filterType;
    const nextList = getNextBuses({
      direction: dir,
      day: selectedDay,
      currentTime,
      companyId: selectedCompany || undefined,
      limit: 6,
    });

    const daySchedule = getScheduleForDay(selectedDay);

    return {
      nextBus: nextList.length > 0 ? nextList[0] : null,
      upcomingBuses: nextList,
      allDayServices: daySchedule,
    };
  }, [selectedDay, currentTime, selectedCompany, filterType]);

  // Cálculo de segundos y string formateado de tiempo restante
  const { timeRemainingFormatted, minutosRestantes, segundosRestantes, status } = useMemo(() => {
    if (!nextBus) {
      return {
        timeRemainingFormatted: 'Sin más salidas hoy',
        minutosRestantes: null,
        segundosRestantes: 0,
        status: 'no_more_today' as ServiceStatusType,
      };
    }

    const [h, m] = nextBus.formattedDeparture.split(':').map(Number);
    const departureDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      h || 0,
      m || 0,
      0,
      0
    );

    const diffMs = departureDate.getTime() - now.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const mins = Math.floor(diffSecs / 60);
    const secs = Math.max(0, diffSecs % 60);

    const { status: calculatedStatus } = getServiceStatus(mins);

    let formatted = '';
    if (mins < -1) {
      formatted = 'Ya salió';
    } else if (mins <= 1 && mins >= -1) {
      formatted = '¡Saliendo ahora!';
    } else if (mins <= 15) {
      formatted = `Faltan ${mins}m ${secs.toString().padStart(2, '0')}s`;
    } else if (mins <= 60) {
      formatted = `Faltan ${mins} min`;
    } else {
      const hours = Math.floor(mins / 60);
      const remainingMins = mins % 60;
      formatted = remainingMins > 0 ? `Sale en ${hours}h ${remainingMins}m` : `Sale a las ${nextBus.formattedDeparture}`;
    }

    return {
      timeRemainingFormatted: formatted,
      minutosRestantes: mins,
      segundosRestantes: secs,
      status: calculatedStatus,
    };
  }, [nextBus, now]);

  const refresh = useCallback(() => {
    setNow(new Date());
    if (isAutoScenarioMode) {
      evaluateAutoScenario();
    }
    refreshCalculations();
  }, [isAutoScenarioMode]);

  return {
    nextBus,
    upcomingBuses,
    allDayServices,
    activeScenario,
    isAutoScenarioMode,
    status,
    timeRemainingFormatted,
    minutosRestantes,
    segundosRestantes,
    currentTime,
    currentDay,
    refresh,
  };
}
