/**
 * Tipos canónicos del módulo de Transporte / Colectivos
 * Portados 1:1 desde AppHorarios para React Native / Expo
 */

export type ID = string;

export type TimeString = string; // Formato "HH:MM" (24h)

export type DayOfWeek =
  | 'lunes'
  | 'martes'
  | 'miercoles'
  | 'jueves'
  | 'viernes'
  | 'sabado'
  | 'domingo';

export type Shift = 'mañana' | 'tarde' | 'noche';

export type Direction = 'ida' | 'vuelta';

export type DayType = 'weekday' | 'saturday' | 'sunday_holiday';

// ─── Empresa ─────────────────────────────────────────────────────────────────

export interface Company {
  id: ID;
  name: string;
  shortName: string;
  color: string;
}

// ─── Ubicaciones y Paradas ───────────────────────────────────────────────────

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface BusStopLocation {
  id: ID;
  name: string;
  coordinates: Coordinates | null;
}

// ─── Servicio de Colectivo ───────────────────────────────────────────────────

export interface BusService {
  id: ID;
  companyId: ID;
  line?: string;
  direction: Direction;
  day: DayOfWeek;
  departureTime: TimeString;
  arrivalTime: TimeString;
  notes?: string;
}

export interface ResolvedBusService extends BusService {
  companyName: string;
  companyColor: string;
}

export interface RawScheduleEntry {
  empresa: string;
  sentido: Direction;
  horaSalida: TimeString;
  horaLlegada: TimeString;
  dia: DayOfWeek;
  linea?: string;
  notas?: string;
  tiempoCaminataPrevioMin?: number;
  tiempoCaminataPosteriorMin?: number;
  horaSalidaCasa?: TimeString;
  horaSalidaUTN?: TimeString;
  llegadaDestinoEstimada?: TimeString;
}

export interface ScheduleData {
  version: string;
  updatedAt: string;
  services: BusService[];
}

export interface ScheduleForDay {
  ida: ResolvedBusService[];
  vuelta: ResolvedBusService[];
}

// ─── Materias y Bloques Académicos ──────────────────────────────────────────

export interface ClassBlock {
  day: DayOfWeek;
  startTime: TimeString;
  endTime: TimeString;
  classroom?: string;
}

export interface Subject {
  id: ID;
  name: string;
  code?: string;
  year?: number;
  semester?: 1 | 2;
  shift?: Shift | string;
  classBlocks: ClassBlock[];
  professor?: string;
  modality?: 'presencial' | 'virtual' | string;
  isOptional?: boolean;
  color?: string;
}

export interface SubjectData {
  version: string;
  updatedAt: string;
  subjects: Subject[];
}

// ─── Escenarios ─────────────────────────────────────────────────────────────

export type ScenarioId =
  | 'cursado-regular'
  | 'martes-con-arquitectura'
  | 'martes-sin-arquitectura'
  | 'miercoles'
  | 'jueves'
  | 'viernes';

export type ScenarioResult = ScenarioId | null;

export interface Scenario {
  id: ScenarioId | string;
  label: string;
  day?: DayOfWeek;
  activeSubjectIds: Subject['id'][];
  description: string;
}

export interface ScenarioEngineOptions {
  tuesdayHasArquitectura?: boolean;
  referenceDate?: Date;
}

// ─── Próximo Colectivo & Recomendaciones ─────────────────────────────────────

export type ServiceStatusType = 'departing_now' | 'urgent' | 'upcoming' | 'later' | 'passed' | 'no_more_today';

export interface NextBusResult {
  service: ResolvedBusService;
  minutesUntilDeparture: number;
  formattedDeparture: string;
  status: ServiceStatusType;
  message: string;
}

export interface RecommendationResult {
  recomendado: RawScheduleEntry | null;
  alternativas: RawScheduleEntry[];
}
