import type { DayOfWeek, Scenario, ScenarioEngineOptions, ScenarioId } from '../types';
import { ALL_SCENARIOS, scenarios } from '../data/scenarios';

/**
 * Convierte un objeto Date en el día de la semana correspondiente
 */
export function dateToSchoolDay(date: Date = new Date()): DayOfWeek {
  const map: DayOfWeek[] = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
  return map[date.getDay()];
}

/**
 * Determina si una fecha corresponde a un día lectivo (Lunes a Sábado)
 */
export function isSchoolDay(date: Date = new Date()): boolean {
  const day = date.getDay();
  return day >= 1 && day <= 6;
}

/**
 * Determina automáticamente el escenario activo según el día, la hora y el contexto
 */
export function determineScenario(opts?: ScenarioEngineOptions): ScenarioId | string {
  const refDate = opts?.referenceDate || new Date();
  const day = dateToSchoolDay(refDate);

  if (day === 'martes') {
    return opts?.tuesdayHasArquitectura !== false
      ? 'martes-con-arquitectura'
      : 'martes-sin-arquitectura';
  }

  if (day === 'miercoles') return 'miercoles';
  if (day === 'jueves') return 'jueves';
  if (day === 'viernes') return 'viernes';

  return 'cursado-regular';
}

export function determineScenarioOrThrow(opts?: ScenarioEngineOptions): ScenarioId | string {
  return determineScenario(opts);
}

export function findScenario(scenarioId: string): Scenario | undefined {
  return ALL_SCENARIOS.find((s) => s.id === scenarioId) || ALL_SCENARIOS[0];
}

export function getScenariosForDay(day: DayOfWeek): Scenario[] {
  const matching = scenarios.filter((s) => s.day === day);
  return matching.length > 0 ? matching : ALL_SCENARIOS;
}

export function getNextSchoolDay(fromDate: Date = new Date()): Date {
  const next = new Date(fromDate);
  next.setDate(next.getDate() + 1);
  while (next.getDay() === 0) {
    next.setDate(next.getDate() + 1);
  }
  return next;
}
