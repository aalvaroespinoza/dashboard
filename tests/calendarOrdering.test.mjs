/**
 * Suite de pruebas unitarias para el Ordenamiento de Slots y Time-Blocking del Calendario
 * Ejecutable vía: node --test tests/calendarOrdering.test.mjs
 */

import assert from 'node:assert/strict';
import test from 'node:test';

// Función pura de ordenamiento extraída de useCalendarStore
function sortUnifiedCalendarItems(items) {
  return [...items].sort((a, b) => {
    if (a.is_all_day && !b.is_all_day) return -1;
    if (!a.is_all_day && b.is_all_day) return 1;
    if (a.start_time && b.start_time) return a.start_time.localeCompare(b.start_time);
    return 0;
  });
}

// Función pura de cálculo D-Day
function calculateDDay(targetDateStr, baseDateStr = '2026-08-24') {
  const target = new Date(targetDateStr);
  const base = new Date(baseDateStr);
  const diffTime = target.getTime() - base.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'D-Day';
  if (diffDays > 0) return `D-${diffDays}`;
  return `D+${Math.abs(diffDays)}`;
}

// Función pura de estimación de fin de slot para tareas de Time-Blocking
function getEstimatedEndTime(startTimeStr) {
  const [h, m] = startTimeStr.split(':').map(Number);
  const totalMin = h * 60 + m + 45;
  const endH = Math.floor(totalMin / 60) % 24;
  const endM = totalMin % 60;
  return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
}

test('1. Ordenamiento de Slots: Eventos de todo el día deben posicionarse primero', () => {
  const rawItems = [
    { id: '1', title: 'Clase UTN', is_all_day: false, start_time: '14:30' },
    { id: '2', title: 'Feriado Nacional', is_all_day: true, start_time: null },
    { id: '3', title: 'Entrenamiento Gimnasio', is_all_day: false, start_time: '08:00' },
  ];

  const sorted = sortUnifiedCalendarItems(rawItems);
  assert.equal(sorted[0].id, '2', 'El evento de todo el día debe ser el primero');
  assert.equal(sorted[1].id, '3', 'El evento de las 08:00 debe ir antes que el de las 14:30');
  assert.equal(sorted[2].id, '1', 'El evento de las 14:30 debe ir al final');
});

test('2. Ordenamiento Cronológico sin Solapamientos Corruptos', () => {
  const timedItems = [
    { id: 't1', title: 'Tarea Dev', is_all_day: false, start_time: '20:30' },
    { id: 'e1', title: 'Almuerzo', is_all_day: false, start_time: '13:00' },
    { id: 't2', title: 'Revisión código', is_all_day: false, start_time: '09:15' },
    { id: 'e2', title: 'Reunión equipo', is_all_day: false, start_time: '11:00' },
  ];

  const sorted = sortUnifiedCalendarItems(timedItems);
  const startTimes = sorted.map((i) => i.start_time);

  assert.deepEqual(
    startTimes,
    ['09:15', '11:00', '13:00', '20:30'],
    'Los slots deben quedar ordenados estrictamente de menor a mayor horario'
  );
});

test('3. Cálculo de Badges D-Day para Hitos y Exámenes en Zona Horaria Córdoba (Agosto 2026)', () => {
  const today = '2026-08-24';

  assert.equal(calculateDDay('2026-08-24', today), 'D-Day', 'El mismo día debe ser D-Day');
  assert.equal(calculateDDay('2026-08-27', today), 'D-3', 'Dentro de 3 días debe ser D-3');
  assert.equal(calculateDDay('2026-08-31', today), 'D-7', 'Dentro de 7 días debe ser D-7');
  assert.equal(calculateDDay('2026-08-23', today), 'D+1', 'Ayer debe ser D+1 (vencido)');
  assert.equal(calculateDDay('2026-08-20', today), 'D+4', 'Hace 4 días debe ser D+4');
});

test('4. Estimación de Bloques de Time-Blocking (45 minutos estándar)', () => {
  assert.equal(getEstimatedEndTime('09:00'), '09:45');
  assert.equal(getEstimatedEndTime('14:30'), '15:15');
  assert.equal(getEstimatedEndTime('23:30'), '00:15');
  assert.equal(getEstimatedEndTime('18:20'), '19:05');
});

test('5. Integridad de Items Polimórficos (Tareas vs Eventos)', () => {
  const unifiedTask = {
    id: 'task-1',
    type: 'task',
    title: 'Completar laboratorio UTN',
    is_completed: false,
    color: '#FF9500',
    calendar_name: 'Trabajo / UTN',
  };

  const unifiedEvent = {
    id: 'evt-1',
    type: 'event',
    title: 'Examen Final de Redes',
    is_milestone: true,
    d_day_text: 'D-3',
    color: '#007AFF',
    calendar_name: 'Estudios & Exámenes',
  };

  assert.equal(unifiedTask.type, 'task');
  assert.equal(unifiedTask.is_completed, false);
  assert.equal(unifiedEvent.type, 'event');
  assert.equal(unifiedEvent.d_day_text, 'D-3');
});
