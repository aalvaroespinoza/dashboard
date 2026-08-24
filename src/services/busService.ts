import { SQLiteDatabase } from 'expo-sqlite';

// ─── Tipos Estrictos del Módulo de Colectivos ────────────────────────────────

export type DayOfWeek =
  | 'lunes'
  | 'martes'
  | 'miercoles'
  | 'jueves'
  | 'viernes'
  | 'sabado'
  | 'domingo';

export type Direction = 'ida' | 'vuelta';

export type DayType = 'weekday' | 'saturday' | 'sunday_holiday';

export interface Company {
  id: string;
  name: string;
  shortName: string;
  color: string;
}

export interface BusCoordinates {
  lat: number;
  lng: number;
}

export interface BusStopLocation {
  id: string;
  name: string;
  coordinates: BusCoordinates | null;
}

export interface RawScheduleEntry {
  empresa: string;
  sentido: Direction;
  horaSalida: string; // "HH:MM"
  horaLlegada: string; // "HH:MM"
  dia: DayOfWeek;
  linea?: string;
  notas?: string;
}

export interface BusServiceItem {
  id: string;
  companyId: string;
  companyName: string;
  companyColor: string;
  line?: string;
  direction: Direction;
  day: DayOfWeek;
  departureTime: string; // "HH:MM"
  arrivalTime: string;   // "HH:MM"
  notes?: string;
}

export interface NextBusResult {
  service: BusServiceItem;
  minutesUntilDeparture: number;
  formattedDeparture: string;
  status: 'departing_now' | 'upcoming' | 'passed';
  message: string;
}

// ─── Datos Maestros: Empresas y Ubicaciones ─────────────────────────────────

export const COMPANIES: Record<string, Company> = {
  canelo: {
    id: 'canelo',
    name: 'Transporte Canelo',
    shortName: 'Canelo',
    color: '#0071e3', // Azul
  },
  lumasa: {
    id: 'lumasa',
    name: 'Lumasa',
    shortName: 'Lumasa',
    color: '#ff9500', // Naranja
  },
  intercordoba: {
    id: 'intercordoba',
    name: 'Intercórdoba',
    shortName: 'Intercórdoba',
    color: '#10b981', // Verde
  },
};

export const BUS_LOCATIONS: Record<string, BusStopLocation> = {
  despenaderosBusStop: {
    id: 'stop-despenaderos',
    name: 'Parada Despeñaderos (Ruta 36)',
    coordinates: { lat: -31.8153, lng: -64.2894 },
  },
  cordobaBusStop: {
    id: 'stop-cordoba-terminal',
    name: 'Terminal de Ómnibus Córdoba',
    coordinates: { lat: -31.4422, lng: -64.1938 },
  },
  ministry: {
    id: 'stop-cordoba-ministerio',
    name: 'Parada Ministerio / UTN Córdoba',
    coordinates: { lat: -31.4422, lng: -64.1938 },
  },
};

// ─── Base de Datos Cruda de Horarios ────────────────────────────────────────

const DIAS_HABILES: DayOfWeek[] = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'];
const VIAJE_ESTIMADO_MIN = 65;

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

export function sumarMinutos(hora: string, minutos: number): string {
  return minutesToTime(timeToMinutes(hora) + minutos);
}

function expandirLunesAViernes(
  empresa: string,
  sentido: Direction,
  horas: string[],
  llegadas?: string[],
  notas?: string
): RawScheduleEntry[] {
  const entries: RawScheduleEntry[] = [];
  DIAS_HABILES.forEach((dia) => {
    horas.forEach((horaSalida, i) => {
      const horaLlegada = llegadas ? llegadas[i] : sumarMinutos(horaSalida, VIAJE_ESTIMADO_MIN);
      entries.push({
        empresa,
        sentido,
        horaSalida,
        horaLlegada,
        dia,
        notas: llegadas ? notas : (notas ? `${notas} · llegada estimada` : 'llegada estimada'),
      });
    });
  });
  return entries;
}

// 1. IDA (Despeñaderos → Córdoba), Lunes a Viernes
const CANELO_IDA = [
  '06:30', '06:40', '07:50', '09:20', '10:50',
  '12:20', '13:40', '15:20', '16:55', '18:20', '20:00', '21:20',
];

const INTERCORDOBA_IDA = [
  '06:45', '08:45', '11:35', '14:00', '16:00', '18:45', '20:00', '20:45', '22:25',
];

const LUMASA_IDA_SALIDA = ['07:20', '09:20', '11:20', '13:20', '15:20', '17:20', '19:20', '21:20'];
const LUMASA_IDA_LLEGADA = ['08:20', '10:20', '12:20', '14:20', '16:20', '18:20', '20:20', '22:20'];

// 2. VUELTA (Córdoba → Despeñaderos), Lunes a Viernes
const CANELO_VUELTA = [
  '06:25', '07:50', '09:20', '10:50', '12:20', '13:40',
  '15:20', '16:40', '18:20', '20:00', '21:20', '23:00',
];

const INTERCORDOBA_VUELTA = [
  '07:00', '09:45', '10:30', '12:15', '13:15', '14:00', '16:00', '17:00', '18:15', '20:00', '21:15',
];

const LUMASA_VUELTA_SALIDA = ['06:30', '08:30', '10:40', '12:30', '14:30', '16:30', '18:30', '20:30'];
const LUMASA_VUELTA_LLEGADA = ['07:30', '09:30', '11:40', '13:30', '15:30', '17:30', '19:30', '21:30'];

// 3. SÁBADOS
const CANELO_IDA_SABADO = ['07:00'];
const INTERCORDOBA_IDA_SABADO = ['08:45', '10:45', '14:00', '16:45', '18:45', '20:00', '22:25'];
const LUMASA_IDA_SABADO_SALIDA = ['09:20', '11:20', '13:20', '15:20', '17:20', '19:20', '21:20'];
const LUMASA_IDA_SABADO_LLEGADA = ['10:20', '12:20', '14:20', '16:20', '18:20', '20:20', '22:20'];

const CANELO_VUELTA_SABADO = ['13:30'];
const INTERCORDOBA_VUELTA_SABADO = ['10:30', '12:15', '13:15', '17:00', '18:15', '20:00'];
const LUMASA_VUELTA_SABADO_SALIDA = ['08:30', '10:40', '12:30', '14:30', '16:30', '18:30', '20:30'];
const LUMASA_VUELTA_SABADO_LLEGADA = ['09:30', '11:40', '13:30', '15:30', '17:30', '19:30', '21:30'];

export const RAW_SCHEDULE_ENTRIES: RawScheduleEntry[] = [
  ...expandirLunesAViernes('canelo', 'ida', CANELO_IDA),
  ...expandirLunesAViernes('intercordoba', 'ida', INTERCORDOBA_IDA),
  ...expandirLunesAViernes('lumasa', 'ida', LUMASA_IDA_SALIDA, LUMASA_IDA_LLEGADA),

  ...expandirLunesAViernes('canelo', 'vuelta', CANELO_VUELTA),
  ...expandirLunesAViernes('intercordoba', 'vuelta', INTERCORDOBA_VUELTA),
  ...expandirLunesAViernes('lumasa', 'vuelta', LUMASA_VUELTA_SALIDA, LUMASA_VUELTA_LLEGADA),

  ...CANELO_IDA_SABADO.map((horaSalida): RawScheduleEntry => ({
    empresa: 'canelo',
    sentido: 'ida',
    horaSalida,
    horaLlegada: sumarMinutos(horaSalida, VIAJE_ESTIMADO_MIN),
    dia: 'sabado',
    notas: 'confirmado por teléfono · llegada estimada',
  })),
  ...INTERCORDOBA_IDA_SABADO.map((horaSalida): RawScheduleEntry => ({
    empresa: 'intercordoba',
    sentido: 'ida',
    horaSalida,
    horaLlegada: sumarMinutos(horaSalida, VIAJE_ESTIMADO_MIN),
    dia: 'sabado',
    notas: 'servicio diario · llegada estimada',
  })),
  ...LUMASA_IDA_SABADO_SALIDA.map((horaSalida, i): RawScheduleEntry => ({
    empresa: 'lumasa',
    sentido: 'ida',
    horaSalida,
    horaLlegada: LUMASA_IDA_SABADO_LLEGADA[i],
    dia: 'sabado',
  })),
  ...CANELO_VUELTA_SABADO.map((horaSalida): RawScheduleEntry => ({
    empresa: 'canelo',
    sentido: 'vuelta',
    horaSalida,
    horaLlegada: sumarMinutos(horaSalida, VIAJE_ESTIMADO_MIN),
    dia: 'sabado',
    notas: 'confirmado por teléfono · llegada estimada',
  })),
  ...INTERCORDOBA_VUELTA_SABADO.map((horaSalida): RawScheduleEntry => ({
    empresa: 'intercordoba',
    sentido: 'vuelta',
    horaSalida,
    horaLlegada: sumarMinutos(horaSalida, VIAJE_ESTIMADO_MIN),
    dia: 'sabado',
    notas: 'solo servicios diarios · llegada estimada',
  })),
  ...LUMASA_VUELTA_SABADO_SALIDA.map((horaSalida, i): RawScheduleEntry => ({
    empresa: 'lumasa',
    sentido: 'vuelta',
    horaSalida,
    horaLlegada: LUMASA_VUELTA_SABADO_LLEGADA[i],
    dia: 'sabado',
  })),
];

// ─── Funciones de Transformación y Normalización ─────────────────────────────

export function parseScheduleEntry(entry: RawScheduleEntry): BusServiceItem {
  const company = COMPANIES[entry.empresa] || {
    id: entry.empresa,
    name: entry.empresa,
    shortName: entry.empresa,
    color: '#6366F1',
  };

  const salidaClean = entry.horaSalida.replace(':', '');
  const id = `svc-${entry.empresa}-${entry.sentido}-${entry.dia}-${salidaClean}`;

  return {
    id,
    companyId: company.id,
    companyName: company.shortName,
    companyColor: company.color,
    line: entry.linea,
    direction: entry.sentido,
    day: entry.dia,
    departureTime: entry.horaSalida,
    arrivalTime: entry.horaLlegada,
    notes: entry.notas,
  };
}

export function getAllParsedServices(): BusServiceItem[] {
  return RAW_SCHEDULE_ENTRIES.map(parseScheduleEntry);
}

// ─── Funciones de Cálculo Horario ───────────────────────────────────────────

/**
 * Compara dos cadenas de hora HH:MM para ordenamiento cronológico.
 */
export function compareTime(a: string, b: string): number {
  return timeToMinutes(a) - timeToMinutes(b);
}

/**
 * Calcula la diferencia en minutos entre la hora de salida y la hora actual.
 */
export function getTimeUntilNextBus(departureTime: string, currentTime?: string): number {
  const nowStr = currentTime || getCurrentTimeString();
  const depMins = timeToMinutes(departureTime);
  const nowMins = timeToMinutes(nowStr);

  let diff = depMins - nowMins;
  // Cruce de medianoche (ej. salida 00:30 y son las 23:45)
  if (diff < -1200) {
    diff += 1440;
  }
  return diff;
}

/**
 * Devuelve la hora actual en formato HH:MM (24h)
 */
export function getCurrentTimeString(date: Date = new Date()): string {
  const hh = date.getHours().toString().padStart(2, '0');
  const mm = date.getMinutes().toString().padStart(2, '0');
  return `${hh}:${mm}`;
}

/**
 * Obtiene el día de la semana actual tipado
 */
export function getCurrentDayOfWeek(date: Date = new Date()): DayOfWeek {
  const dayIndex = date.getDay(); // 0 = Domingo, 1 = Lunes, ...
  const map: DayOfWeek[] = [
    'domingo',
    'lunes',
    'martes',
    'miercoles',
    'jueves',
    'viernes',
    'sabado',
  ];
  return map[dayIndex];
}

/**
 * Calcula los próximos colectivos a partir de la hora actual.
 */
export function getNextBuses(params: {
  direction?: Direction;
  day?: DayOfWeek;
  currentTime?: string;
  companyId?: string;
  limit?: number;
}): NextBusResult[] {
  const day = params.day || getCurrentDayOfWeek();
  const currentTime = params.currentTime || getCurrentTimeString();
  const currentMins = timeToMinutes(currentTime);
  const limit = params.limit || 5;

  let services = getAllParsedServices().filter((s) => s.day === day);

  if (params.direction) {
    services = services.filter((s) => s.direction === params.direction);
  }

  if (params.companyId) {
    services = services.filter((s) => s.companyId === params.companyId);
  }

  // Ordenar cronológicamente
  services.sort((a, b) => compareTime(a.departureTime, b.departureTime));

  const results: NextBusResult[] = [];

  for (const s of services) {
    const diff = getTimeUntilNextBus(s.departureTime, currentTime);

    // Solo colectivos futuros o que están saliendo (dentro de un margen de -2 minutos)
    if (diff >= -2) {
      let status: 'departing_now' | 'upcoming' | 'passed' = 'upcoming';
      let message = '';

      if (diff <= 1 && diff >= -2) {
        status = 'departing_now';
        message = `El colectivo de las ${s.departureTime} (${s.companyName}) está saliendo ahora`;
      } else {
        status = 'upcoming';
        message = `Sale en ${diff} min (${s.departureTime} · ${s.companyName})`;
      }

      results.push({
        service: s,
        minutesUntilDeparture: diff,
        formattedDeparture: s.departureTime,
        status,
        message,
      });
    }
  }

  return results.slice(0, limit);
}

/**
 * Obtiene el cronograma completo para una empresa/ruta y sentido.
 */
export function getScheduleByRoute(
  companyId: string,
  direction: Direction = 'ida',
  day: DayOfWeek = 'lunes'
): BusServiceItem[] {
  return getAllParsedServices()
    .filter((s) => s.companyId === companyId && s.direction === direction && s.day === day)
    .sort((a, b) => compareTime(a.departureTime, b.departureTime));
}

/**
 * Obtiene los servicios agrupados por sentido para un día.
 */
export function getScheduleForDay(day: DayOfWeek = 'lunes'): {
  ida: BusServiceItem[];
  vuelta: BusServiceItem[];
} {
  const dayServices = getAllParsedServices().filter((s) => s.day === day);
  const ida = dayServices.filter((s) => s.direction === 'ida').sort((a, b) => compareTime(a.departureTime, b.departureTime));
  const vuelta = dayServices.filter((s) => s.direction === 'vuelta').sort((a, b) => compareTime(a.departureTime, b.departureTime));

  return { ida, vuelta };
}

// ─── Script de Sembrado para expo-sqlite ─────────────────────────────────────

/**
 * Siembra los datos migrados de AppHorarios en las tablas SQLite locales.
 */
export async function seedBusDatabase(db: SQLiteDatabase): Promise<void> {
  // Limpiar tablas de transporte previas
  await db.execAsync(`
    DELETE FROM bus_schedules;
    DELETE FROM bus_stops;
    DELETE FROM bus_routes;
  `);

  // 1. Insertar Rutas / Empresas
  await db.execAsync(`
    INSERT INTO bus_routes (id, line_number, name, description, color, origin, destination) VALUES
    ('canelo', 'Canelo', 'Transporte Canelo', 'Servicio interurbano directo Despeñaderos ↔ Córdoba', '#0071E3', 'Despeñaderos', 'Córdoba'),
    ('lumasa', 'Lumasa', 'Lumasa Calamuchita', 'Servicio interurbano con horarios fijos de cabecera', '#FF9500', 'Despeñaderos', 'Córdoba'),
    ('intercordoba', 'Intercórdoba', 'Intercórdoba Regional', 'Frecuencias diarias regulares y servicios nocturnos', '#10B981', 'Despeñaderos', 'Córdoba'),
    ('sierras', 'Sierras', 'Sierras de Calamuchita', 'Servicios regionales por Valle de Paravachasca', '#EF4444', 'Despeñaderos', 'Córdoba');
  `);

  // 2. Insertar Paradas (Ida y Vuelta)
  await db.execAsync(`
    -- Paradas Canelo
    INSERT INTO bus_stops (id, route_id, name, latitude, longitude, sequence_order, direction) VALUES
    ('stop-canelo-ida-1', 'canelo', 'Despeñaderos (Terminal / Garita)', -31.8153, -64.2894, 1, 'outbound'),
    ('stop-canelo-ida-2', 'canelo', 'Córdoba (Terminal de Ómnibus)', -31.4422, -64.1938, 2, 'outbound'),
    ('stop-canelo-vuelta-1', 'canelo', 'Córdoba (Terminal de Ómnibus)', -31.4422, -64.1938, 1, 'inbound'),
    ('stop-canelo-vuelta-2', 'canelo', 'Despeñaderos (Garita Central)', -31.8153, -64.2894, 2, 'inbound'),

    -- Paradas Lumasa
    INSERT INTO bus_stops (id, route_id, name, latitude, longitude, sequence_order, direction) VALUES
    ('stop-lumasa-ida-1', 'lumasa', 'Despeñaderos (Ruta 36)', -31.8153, -64.2894, 1, 'outbound'),
    ('stop-lumasa-ida-2', 'lumasa', 'Córdoba (Terminal T1 / T2)', -31.4422, -64.1938, 2, 'outbound'),
    ('stop-lumasa-vuelta-1', 'lumasa', 'Córdoba (Terminal T1 / T2)', -31.4422, -64.1938, 1, 'inbound'),
    ('stop-lumasa-vuelta-2', 'lumasa', 'Despeñaderos (Ruta 36)', -31.8153, -64.2894, 2, 'inbound'),

    -- Paradas Intercórdoba
    INSERT INTO bus_stops (id, route_id, name, latitude, longitude, sequence_order, direction) VALUES
    ('stop-inter-ida-1', 'intercordoba', 'Despeñaderos (Garita)', -31.8153, -64.2894, 1, 'outbound'),
    ('stop-inter-ida-2', 'intercordoba', 'Córdoba (Terminal Nueva)', -31.4422, -64.1938, 2, 'outbound'),
    ('stop-inter-vuelta-1', 'intercordoba', 'Córdoba (Terminal Nueva)', -31.4422, -64.1938, 1, 'inbound'),
    ('stop-inter-vuelta-2', 'intercordoba', 'Despeñaderos (Garita)', -31.8153, -64.2894, 2, 'inbound');
  `);

  // 3. Insertar Horarios Crudos en SQLite
  // Días hábiles
  const insertStatements: string[] = [];

  // Canelo Lunes a Viernes
  CANELO_IDA.forEach((hora, i) => {
    insertStatements.push(
      `INSERT INTO bus_schedules (id, route_id, stop_id, day_type, departure_time) VALUES ('sch-can-ida-${i}', 'canelo', 'stop-canelo-ida-1', 'weekday', '${hora}');`
    );
  });
  CANELO_VUELTA.forEach((hora, i) => {
    insertStatements.push(
      `INSERT INTO bus_schedules (id, route_id, stop_id, day_type, departure_time) VALUES ('sch-can-vue-${i}', 'canelo', 'stop-canelo-vuelta-1', 'weekday', '${hora}');`
    );
  });

  // Intercordoba Lunes a Viernes
  INTERCORDOBA_IDA.forEach((hora, i) => {
    insertStatements.push(
      `INSERT INTO bus_schedules (id, route_id, stop_id, day_type, departure_time) VALUES ('sch-int-ida-${i}', 'intercordoba', 'stop-inter-ida-1', 'weekday', '${hora}');`
    );
  });
  INTERCORDOBA_VUELTA.forEach((hora, i) => {
    insertStatements.push(
      `INSERT INTO bus_schedules (id, route_id, stop_id, day_type, departure_time) VALUES ('sch-int-vue-${i}', 'intercordoba', 'stop-inter-vuelta-1', 'weekday', '${hora}');`
    );
  });

  // Lumasa Lunes a Viernes
  LUMASA_IDA_SALIDA.forEach((hora, i) => {
    insertStatements.push(
      `INSERT INTO bus_schedules (id, route_id, stop_id, day_type, departure_time) VALUES ('sch-lum-ida-${i}', 'lumasa', 'stop-lumasa-ida-1', 'weekday', '${hora}');`
    );
  });
  LUMASA_VUELTA_SALIDA.forEach((hora, i) => {
    insertStatements.push(
      `INSERT INTO bus_schedules (id, route_id, stop_id, day_type, departure_time) VALUES ('sch-lum-vue-${i}', 'lumasa', 'stop-lumasa-vuelta-1', 'weekday', '${hora}');`
    );
  });

  // Sábados
  CANELO_IDA_SABADO.forEach((hora, i) => {
    insertStatements.push(
      `INSERT INTO bus_schedules (id, route_id, stop_id, day_type, departure_time) VALUES ('sch-can-sab-ida-${i}', 'canelo', 'stop-canelo-ida-1', 'saturday', '${hora}');`
    );
  });
  CANELO_VUELTA_SABADO.forEach((hora, i) => {
    insertStatements.push(
      `INSERT INTO bus_schedules (id, route_id, stop_id, day_type, departure_time) VALUES ('sch-can-sab-vue-${i}', 'canelo', 'stop-canelo-vuelta-1', 'saturday', '${hora}');`
    );
  });

  INTERCORDOBA_IDA_SABADO.forEach((hora, i) => {
    insertStatements.push(
      `INSERT INTO bus_schedules (id, route_id, stop_id, day_type, departure_time) VALUES ('sch-int-sab-ida-${i}', 'intercordoba', 'stop-inter-ida-1', 'saturday', '${hora}');`
    );
  });
  INTERCORDOBA_VUELTA_SABADO.forEach((hora, i) => {
    insertStatements.push(
      `INSERT INTO bus_schedules (id, route_id, stop_id, day_type, departure_time) VALUES ('sch-int-sab-vue-${i}', 'intercordoba', 'stop-inter-vuelta-1', 'saturday', '${hora}');`
    );
  });

  LUMASA_IDA_SABADO_SALIDA.forEach((hora, i) => {
    insertStatements.push(
      `INSERT INTO bus_schedules (id, route_id, stop_id, day_type, departure_time) VALUES ('sch-lum-sab-ida-${i}', 'lumasa', 'stop-lumasa-ida-1', 'saturday', '${hora}');`
    );
  });
  LUMASA_VUELTA_SABADO_SALIDA.forEach((hora, i) => {
    insertStatements.push(
      `INSERT INTO bus_schedules (id, route_id, stop_id, day_type, departure_time) VALUES ('sch-lum-sab-vue-${i}', 'lumasa', 'stop-lumasa-vuelta-1', 'saturday', '${hora}');`
    );
  });

  await db.execAsync(insertStatements.join('\n'));
}
