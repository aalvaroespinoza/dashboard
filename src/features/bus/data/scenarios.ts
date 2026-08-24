import type { Scenario } from '../types';

/**
 * Escenarios de cursada según el día (AppHorarios).
 */
export const scenarios: Scenario[] = [
  {
    id: 'martes-con-arquitectura',
    label: 'Martes con Arquitectura',
    day: 'martes',
    activeSubjectIds: ['arquitectura-comp-mar', 'paradigmas-prog-mar'],
    description: 'Arquitectura 08:00 + Paradigmas 17:20 a 20:40',
  },
  {
    id: 'martes-sin-arquitectura',
    label: 'Martes sin Arquitectura',
    day: 'martes',
    activeSubjectIds: ['paradigmas-prog-mar'],
    description: 'Solo Paradigmas 17:20 a 20:40',
  },
  {
    id: 'miercoles',
    label: 'Miércoles',
    day: 'miercoles',
    activeSubjectIds: ['analisis-sistemas-mier', 'sintaxis-semantica-mier'],
    description: 'Cursada corrida 08:00 a 15:40',
  },
  {
    id: 'jueves',
    label: 'Jueves',
    day: 'jueves',
    activeSubjectIds: [
      'arquitectura-comp-jue',
      'analisis-sistemas-jue',
      'sintaxis-semantica-jue',
    ],
    description: 'Cursada corrida 08:00 a 18:05',
  },
  {
    id: 'viernes',
    label: 'Viernes',
    day: 'viernes',
    activeSubjectIds: ['paradigmas-prog-vie'],
    description: 'Álgebra es virtual — solo viaja para Paradigmas 19:55',
  },
];

export const ALL_SCENARIOS: Scenario[] = [
  {
    id: 'cursado-regular',
    label: 'Cursado Regular UTN',
    description: 'Escenario de cursado regular completo',
    activeSubjectIds: [
      'ingles-1',
      'arquitectura-comp-mar',
      'paradigmas-prog-mar',
      'analisis-sistemas-mier',
      'sintaxis-semantica-mier',
      'arquitectura-comp-jue',
      'analisis-sistemas-jue',
      'sintaxis-semantica-jue',
      'algebra-viernes',
      'paradigmas-prog-vie',
      'fisica-sabado',
    ],
  },
  ...scenarios,
];
