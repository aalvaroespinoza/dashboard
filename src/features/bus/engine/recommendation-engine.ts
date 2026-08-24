import type { DayOfWeek, Direction, RawScheduleEntry, Subject, RecommendationResult } from '../types';
import { rawScheduleEntries } from '../data/schedules';
import { subjects as defaultSubjects } from '../data/subjects';

export const OFFSET_PARADA_VUELTA_MIN = 10;

export const timeToMins = (timeHHMM: string): number => {
  const [hours, minutes] = timeHHMM.split(':').map(Number);
  return (hours || 0) * 60 + (minutes || 0);
};

export const addMinutes = (timeHHMM: string, minsToAdd: number): string => {
  const [hours, minutes] = timeHHMM.split(':').map(Number);
  const totalMins = (hours || 0) * 60 + (minutes || 0) + minsToAdd;
  const h = Math.floor(((totalMins % 1440) + 1440) % 1440 / 60);
  const m = ((totalMins % 1440) + 1440) % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

export const subMinutes = (timeHHMM: string, minsToSub: number): string => {
  return addMinutes(timeHHMM, -minsToSub);
};

/**
 * Calcula el colectivo recomendado y las alternativas según el horario académico y contexto.
 */
export const calcularColectivos = (
  dia: DayOfWeek,
  tipo: Direction,
  cursaArquitectura: boolean = true,
  duermeEnCordoba: boolean = false,
  horaActualHHMM: string = '08:00',
  providedSubjects?: Subject[]
): RecommendationResult => {
  const subjectsToUse = providedSubjects || defaultSubjects;

  // Filtrar bloques de cursada para el día solicitado
  const classBlocks = subjectsToUse
    .filter((s) => {
      if (dia === 'martes' && !cursaArquitectura && s.name.toLowerCase().includes('arquitectura')) {
        return false;
      }
      return true;
    })
    .flatMap((s) => s.classBlocks)
    .filter((cb) => cb.day.toLowerCase() === dia.toLowerCase());

  // Todos los horarios disponibles en ese día y dirección
  const todasOpciones = rawScheduleEntries.filter(
    (h) => h.dia === dia && h.sentido === tipo
  );

  if (todasOpciones.length === 0) {
    return { recomendado: null, alternativas: [] };
  }

  let idealBus: RawScheduleEntry | null = null;

  if (classBlocks.length > 0) {
    classBlocks.sort((a, b) => timeToMins(a.startTime) - timeToMins(b.startTime));

    if (tipo === 'ida') {
      const primerBloque = classBlocks[0];
      const limiteLlegadaTerminal = timeToMins(primerBloque.startTime);

      // Buses que llegan antes o a la hora de cursar
      const validas = todasOpciones.filter((h) => timeToMins(h.horaLlegada) <= limiteLlegadaTerminal);
      if (validas.length > 0) {
        validas.sort((a, b) => timeToMins(b.horaSalida) - timeToMins(a.horaSalida));
        idealBus = validas[0];

        // Preferencia por el Canelo 06:30 si cursa a las 08:00
        if (primerBloque.startTime === '08:00') {
          const canelo0630 = validas.find((h) => h.empresa === 'canelo' && h.horaSalida === '06:30');
          if (canelo0630) {
            idealBus = canelo0630;
          }
        }
      }
    } else {
      // VUELTA
      if (dia === 'viernes' && duermeEnCordoba) {
        return { recomendado: null, alternativas: [] };
      }
      const ultimoBloque = classBlocks[classBlocks.length - 1];
      const limiteSalidaTerminal = timeToMins(ultimoBloque.endTime);

      const validas = todasOpciones.filter((h) => timeToMins(h.horaSalida) >= limiteSalidaTerminal);

      if (validas.length > 0) {
        validas.sort((a, b) => timeToMins(a.horaSalida) - timeToMins(b.horaSalida));
        idealBus = validas[0];
      } else {
        const todasOrdenadas = [...todasOpciones].sort((a, b) => timeToMins(b.horaSalida) - timeToMins(a.horaSalida));
        idealBus = todasOrdenadas[0];
      }
    }
  }

  // Fallback si no hay materias o no hubo coincidencia estricta
  if (!idealBus) {
    const opcionesFuturas = todasOpciones.filter((h) => timeToMins(h.horaSalida) >= timeToMins(horaActualHHMM));
    if (opcionesFuturas.length > 0) {
      opcionesFuturas.sort((a, b) => timeToMins(a.horaSalida) - timeToMins(b.horaSalida));
      idealBus = opcionesFuturas[0];
    } else {
      const todasOrdenadas = [...todasOpciones].sort((a, b) => timeToMins(a.horaSalida) - timeToMins(b.horaSalida));
      idealBus = todasOrdenadas[0];
    }
  }

  // Alternativas siguientes
  const opcionesFuturas = todasOpciones.filter((h) => timeToMins(h.horaSalida) >= timeToMins(horaActualHHMM));
  const alternativas = opcionesFuturas.filter((h) => h.horaSalida !== idealBus?.horaSalida);
  alternativas.sort((a, b) => timeToMins(a.horaSalida) - timeToMins(b.horaSalida));

  return { recomendado: idealBus, alternativas };
};
