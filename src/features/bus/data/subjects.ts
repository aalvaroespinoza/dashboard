import type { Subject, SubjectData } from '../types';

export const subjectData: SubjectData = {
  version: "2.0.0",
  updatedAt: new Date().toISOString(),
  subjects: [
    {
      id: "ingles-1",
      name: "1K9 Aula:209 Inglés I",
      shift: "mañana",
      modality: "presencial",
      color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
      classBlocks: [
        { day: "lunes", startTime: "11:20", endTime: "12:50" }
      ]
    },
    {
      id: "arquitectura-comp-mar",
      name: "1K2 Aula:520 Arquitectura de Computadoras",
      shift: "mañana",
      modality: "presencial",
      color: "bg-rose-500/20 text-rose-300 border-rose-500/30",
      classBlocks: [
        { day: "martes", startTime: "08:00", endTime: "11:10" }
      ]
    },
    {
      id: "paradigmas-prog-mar",
      name: "2K8 Aula:514 Paradigmas de Programación",
      shift: "tarde",
      modality: "presencial",
      color: "bg-purple-500/20 text-purple-300 border-purple-500/30",
      classBlocks: [
        { day: "martes", startTime: "17:20", endTime: "20:40" }
      ]
    },
    {
      id: "analisis-sistemas-mier",
      name: "2K3 Aula:400 Análisis de Sistemas de Información",
      shift: "mañana",
      modality: "presencial",
      color: "bg-pink-500/20 text-pink-300 border-pink-500/30",
      classBlocks: [
        { day: "miercoles", startTime: "08:00", endTime: "10:25" }
      ]
    },
    {
      id: "sintaxis-semantica-mier",
      name: "2K7 Aula:702 Sintaxis y Semántica de los Lenguajes",
      shift: "tarde",
      modality: "presencial",
      color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
      classBlocks: [
        { day: "miercoles", startTime: "12:05", endTime: "15:40" }
      ]
    },
    {
      id: "arquitectura-comp-jue",
      name: "1K2 Aula:702 Arquitectura de Computadoras",
      shift: "mañana",
      modality: "presencial",
      color: "bg-rose-500/20 text-rose-300 border-rose-500/30",
      classBlocks: [
        { day: "jueves", startTime: "08:00", endTime: "11:10" }
      ]
    },
    {
      id: "analisis-sistemas-jue",
      name: "2K3 Aula:702 Análisis de Sistemas de Información",
      shift: "mañana",
      modality: "presencial",
      color: "bg-pink-500/20 text-pink-300 border-pink-500/30",
      classBlocks: [
        { day: "jueves", startTime: "11:20", endTime: "14:00" }
      ]
    },
    {
      id: "sintaxis-semantica-jue",
      name: "2K7 Aula:500 Sintaxis y Semántica de los Lenguajes",
      shift: "tarde",
      modality: "presencial",
      color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
      classBlocks: [
        { day: "jueves", startTime: "14:55", endTime: "18:05" }
      ]
    },
    {
      id: "algebra-viernes",
      name: "1HK Álgebra y Geometría Analítica",
      shift: "tarde",
      modality: "presencial",
      color: "bg-blue-500/20 text-blue-300 border-blue-500/30",
      classBlocks: [
        { day: "viernes", startTime: "14:00", endTime: "17:10" }
      ]
    },
    {
      id: "paradigmas-prog-vie",
      name: "2K8 Aula:802 Paradigmas de Programación",
      shift: "noche",
      modality: "presencial",
      color: "bg-purple-500/20 text-purple-300 border-purple-500/30",
      classBlocks: [
        { day: "viernes", startTime: "19:55", endTime: "23:05" }
      ]
    },
    {
      id: "fisica-sabado",
      name: "1H20 Aula:999 Física I",
      shift: "mañana",
      modality: "presencial",
      color: "bg-amber-500/20 text-amber-300 border-amber-500/30",
      classBlocks: [
        { day: "sabado", startTime: "09:00", endTime: "13:00" }
      ]
    }
  ]
};

export const subjects: Subject[] = subjectData.subjects;
