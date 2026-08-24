import { useState, useEffect, useMemo } from 'react';
import type { DayOfWeek, Direction, RawScheduleEntry, Subject } from '../types';
import { calcularColectivos, addMinutes, OFFSET_PARADA_VUELTA_MIN } from '../engine/recommendation-engine';
import { subjects as defaultSubjects } from '../data/subjects';
import { settingsRepo } from '../../../db/repositories/settingsRepo';

export interface ClassItem {
  id?: string;
  nombre: string;
  horaInicio: string;
  horaFin: string;
  color?: string;
  aula?: string;
  curso?: string;
  docente?: string;
  modality?: string;
}

export function useTodaySchedule() {
  const [diaSeleccionado, setDiaSeleccionadoState] = useState<DayOfWeek>(() => {
    const dayIndex = new Date().getDay();
    const dayMap: Record<number, DayOfWeek> = {
      0: 'domingo',
      1: 'lunes',
      2: 'martes',
      3: 'miercoles',
      4: 'jueves',
      5: 'viernes',
      6: 'sabado',
    };
    return dayMap[dayIndex] || 'lunes';
  });

  const [cursaArquitectura, setCursaArquitecturaState] = useState(true);
  const [duermeEnCordoba, setDuermeEnCordobaState] = useState(false);

  // Manual Overrides de colectivos seleccionados
  const [overrideIda, setOverrideIdaState] = useState<RawScheduleEntry | null>(null);
  const [overrideVuelta, setOverrideVueltaState] = useState<RawScheduleEntry | null>(null);

  // Registro de BEC (Boleto Educativo Gratuito)
  const [becIda, setBecIdaState] = useState(false);
  const [becVuelta, setBecVueltaState] = useState(false);

  // Registro de asistencia a clases
  const [attendedClasses, setAttendedClasses] = useState<Record<string, boolean>>({});

  const [horaActualHHMM, setHoraActualHHMM] = useState('08:00');

  const todayDateStr = new Date().toISOString().split('T')[0];

  // Cargar preferencias guardadas en SQLite
  useEffect(() => {
    async function loadSettings() {
      try {
        const arqVal = await settingsRepo.get('bus_cursa_arquitectura');
        const dormVal = await settingsRepo.get('bus_duerme_en_cordoba');
        const becRaw = await settingsRepo.get('bus_bec_status');
        const attendanceRaw = await settingsRepo.get('bus_class_attendance');

        if (arqVal !== null) setCursaArquitecturaState(arqVal === '1');
        if (dormVal !== null) setDuermeEnCordobaState(dormVal === '1');

        if (becRaw) {
          try {
            const parsed = JSON.parse(becRaw);
            if (parsed && parsed.date === todayDateStr) {
              setBecIdaState(Boolean(parsed.ida));
              setBecVueltaState(Boolean(parsed.vuelta));
            }
          } catch {}
        }

        if (attendanceRaw) {
          try {
            const parsed = JSON.parse(attendanceRaw);
            if (parsed && parsed.date === todayDateStr) {
              setAttendedClasses(parsed.attended || {});
            }
          } catch {}
        }
      } catch (e) {
        console.error('Error cargando preferencias de viaje:', e);
      }
    }

    loadSettings();
  }, [todayDateStr]);

  // Reloj en tiempo real
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const h = now.getHours().toString().padStart(2, '0');
      const m = now.getMinutes().toString().padStart(2, '0');
      setHoraActualHHMM(`${h}:${m}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  const dayMapRev: Record<string, number> = {
    lunes: 1,
    martes: 2,
    miercoles: 3,
    jueves: 4,
    viernes: 5,
    sabado: 6,
    domingo: 0,
  };
  const targetDay = dayMapRev[diaSeleccionado] ?? 1;
  const isToday = new Date().getDay() === targetDay;

  // Filtrar materias para el día seleccionado
  const materiasDelDia: ClassItem[] = useMemo(() => {
    const list: ClassItem[] = [];

    defaultSubjects.forEach((subject) => {
      if (
        diaSeleccionado === 'martes' &&
        !cursaArquitectura &&
        subject.name.toLowerCase().includes('arquitectura')
      ) {
        return;
      }

      subject.classBlocks.forEach((block) => {
        if (block.day.toLowerCase() === diaSeleccionado.toLowerCase()) {
          list.push({
            id: subject.id,
            nombre: subject.name,
            horaInicio: block.startTime,
            horaFin: block.endTime,
            color: subject.color,
            aula: block.classroom || 'Aula 400',
            curso: subject.name.toLowerCase().includes('sistemas') ? '2K3' : subject.name.toLowerCase().includes('sintaxis') ? '2K7' : '2K1',
            docente: subject.name.toLowerCase().includes('sistemas') ? 'I. Chaurrondo' : subject.name.toLowerCase().includes('sintaxis') ? 'Soro' : 'Docente Titular',
            modality: subject.modality || 'Presencial',
          });
        }
      });
    });

    list.sort((a, b) => {
      const [h1, m1] = a.horaInicio.split(':').map(Number);
      const [h2, m2] = b.horaInicio.split(':').map(Number);
      return (h1 * 60 + m1) - (h2 * 60 + m2);
    });

    return list;
  }, [diaSeleccionado, cursaArquitectura]);

  // Posición de la línea de tiempo
  const { activeIndex, linePosition } = useMemo(() => {
    let actIdx = -1;
    let linePos: 'before' | 'inside' | 'after' | 'none' = 'none';

    if (isToday && materiasDelDia.length > 0) {
      if (horaActualHHMM < materiasDelDia[0].horaInicio) {
        actIdx = 0;
        linePos = 'before';
      } else if (horaActualHHMM >= materiasDelDia[materiasDelDia.length - 1].horaFin) {
        actIdx = materiasDelDia.length - 1;
        linePos = 'after';
      } else {
        for (let i = 0; i < materiasDelDia.length; i++) {
          const m = materiasDelDia[i];
          if (horaActualHHMM >= m.horaInicio && horaActualHHMM < m.horaFin) {
            actIdx = i;
            linePos = 'inside';
            break;
          } else if (
            i < materiasDelDia.length - 1 &&
            horaActualHHMM >= m.horaFin &&
            horaActualHHMM < materiasDelDia[i + 1].horaInicio
          ) {
            actIdx = i;
            linePos = 'after';
            break;
          }
        }
      }
    }

    return { activeIndex: actIdx, linePosition: linePos };
  }, [isToday, materiasDelDia, horaActualHHMM]);

  const horaParaFiltro = isToday ? horaActualHHMM : '00:00';

  const recomendacionIdaRaw = useMemo(() => {
    return calcularColectivos(
      diaSeleccionado,
      'ida',
      cursaArquitectura,
      duermeEnCordoba,
      horaParaFiltro
    );
  }, [diaSeleccionado, cursaArquitectura, duermeEnCordoba, horaParaFiltro]);

  const recomendacionVueltaRaw = useMemo(() => {
    return calcularColectivos(
      diaSeleccionado,
      'vuelta',
      cursaArquitectura,
      duermeEnCordoba,
      horaParaFiltro
    );
  }, [diaSeleccionado, cursaArquitectura, duermeEnCordoba, horaParaFiltro]);

  const recomendacionIda = {
    recomendado: overrideIda || recomendacionIdaRaw.recomendado,
    alternativas: recomendacionIdaRaw.alternativas.filter(
      (a) => !overrideIda || a.horaSalida !== overrideIda.horaSalida
    ),
  };

  const recomendacionVuelta = {
    recomendado: overrideVuelta || recomendacionVueltaRaw.recomendado,
    alternativas: recomendacionVueltaRaw.alternativas.filter(
      (a) => !overrideVuelta || a.horaSalida !== overrideVuelta.horaSalida
    ),
  };

  // Acciones
  const setDiaSeleccionado = (dia: DayOfWeek) => {
    setDiaSeleccionadoState(dia);
    setOverrideIdaState(null);
    setOverrideVueltaState(null);
  };

  const setCursaArquitectura = async (val: boolean) => {
    setCursaArquitecturaState(val);
    await settingsRepo.set('bus_cursa_arquitectura', val ? '1' : '0');
  };

  const setDuermeEnCordoba = async (val: boolean) => {
    setDuermeEnCordobaState(val);
    await settingsRepo.set('bus_duerme_en_cordoba', val ? '1' : '0');
  };

  const toggleBec = async (direction: 'ida' | 'vuelta') => {
    let nextIda = becIda;
    let nextVuelta = becVuelta;

    if (direction === 'ida') {
      nextIda = !becIda;
      setBecIdaState(nextIda);
    } else {
      nextVuelta = !becVuelta;
      setBecVueltaState(nextVuelta);
    }

    await settingsRepo.set(
      'bus_bec_status',
      JSON.stringify({
        ida: nextIda,
        vuelta: nextVuelta,
        date: todayDateStr,
      })
    );
  };

  const toggleAttendance = async (classIndex: number) => {
    const key = `class-${classIndex}`;
    const next = { ...attendedClasses, [key]: !attendedClasses[key] };
    setAttendedClasses(next);
    await settingsRepo.set(
      'bus_class_attendance',
      JSON.stringify({
        attended: next,
        date: todayDateStr,
      })
    );
  };

  return {
    diaSeleccionado,
    setDiaSeleccionado,
    cursaArquitectura,
    setCursaArquitectura,
    duermeEnCordoba,
    setDuermeEnCordoba,
    materiasDelDia,
    isToday,
    horaActualHHMM,
    linePosition,
    activeIndex,
    recomendacionIda,
    recomendacionVuelta,
    overrideIda,
    setOverrideIda: setOverrideIdaState,
    overrideVuelta,
    setOverrideVuelta: setOverrideVueltaState,
    becIda,
    becVuelta,
    toggleBec,
    attendedClasses,
    toggleAttendance,
  };
}
