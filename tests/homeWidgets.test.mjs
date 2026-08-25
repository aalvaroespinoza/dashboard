/**
 * Suite de pruebas unitarias para los Widgets del Dashboard Bento Grid
 * Ejecutable vía: node --test tests/homeWidgets.test.mjs
 */

import assert from 'node:assert/strict';
import test from 'node:test';

function calculateBusCountdown(departureTime, nowHours = 1, nowMinutes = 9) {
  const [h, m] = departureTime.split(':').map(Number);
  let diffMin = (h * 60 + m) - (nowHours * 60 + nowMinutes);
  if (diffMin < 0) {
    diffMin += 24 * 60; // cruza medianoche
  }

  const hours = Math.floor(diffMin / 60);
  const mins = diffMin % 60;
  return `${hours}h ${mins}m`;
}

function calculateNetBalance(income, expense) {
  return income - expense;
}

function formatTimerSeconds(totalSec) {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function calculateFortnightProgress(completedDaysArray) {
  const total = completedDaysArray.length;
  const completed = completedDaysArray.filter(Boolean).length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  return { completed, total, percentage };
}

function cycleHabitIndex(currentIndex, totalHabits, direction = 'next') {
  if (totalHabits <= 0) return 0;
  if (direction === 'next') {
    return (currentIndex + 1) % totalHabits;
  }
  return (currentIndex - 1 + totalHabits) % totalHabits;
}

function getWeatherConditionInfo(code, isDay = true) {
  switch (code) {
    case 0:
      return { condition: 'Despejado', emoji: isDay ? '☀️' : '🌙' };
    case 1:
      return { condition: 'Mayormente despejado', emoji: isDay ? '🌤️' : '🌙' };
    case 2:
      return { condition: 'Parcialmente nublado', emoji: '⛅' };
    case 3:
      return { condition: 'Nublado', emoji: '☁️' };
    case 61:
    case 63:
    case 65:
      return { condition: 'Lluvia', emoji: '🌧️' };
    case 95:
      return { condition: 'Tormenta eléctrica', emoji: '⛈️' };
    default:
      return { condition: 'Despejado', emoji: '☀️' };
  }
}

test('1. Cálculo de cuenta regresiva para el próximo colectivo', () => {
  // Colectivo de las 06:25 saliendo a la 01:09 -> 5h 16m
  const countdown = calculateBusCountdown('06:25', 1, 9);
  assert.equal(countdown, '5h 16m');

  // Colectivo de las 20:45 saliendo a las 18:30 -> 2h 15m
  const countdown2 = calculateBusCountdown('20:45', 18, 30);
  assert.equal(countdown2, '2h 15m');
});

test('2. Cálculo de balance financiero neto y formato numérico', () => {
  const income = 850000;
  const expense = 44300;
  const net = calculateNetBalance(income, expense);
  assert.equal(net, 805700);
});

test('3. Formateo de temporizador y progreso quincenal de hábitos', () => {
  // 540 segundos = 09:00
  assert.equal(formatTimerSeconds(540), '09:00');
  // 900 segundos = 15:00
  assert.equal(formatTimerSeconds(900), '15:00');

  // 8 de 10 días completados = 80%
  const progress = calculateFortnightProgress([true, true, true, true, true, true, true, true, false, false]);
  assert.equal(progress.completed, 8);
  assert.equal(progress.total, 10);
  assert.equal(progress.percentage, 80);
});

test('4. Paginación y ciclado horizontal de carrusel de hábitos', () => {
  const total = 3;
  // Avanzar del 0 al 1, 1 al 2, 2 al 0
  assert.equal(cycleHabitIndex(0, total, 'next'), 1);
  assert.equal(cycleHabitIndex(1, total, 'next'), 2);
  assert.equal(cycleHabitIndex(2, total, 'next'), 0);

  // Retroceder del 0 al 2, 2 al 1
  assert.equal(cycleHabitIndex(0, total, 'prev'), 2);
  assert.equal(cycleHabitIndex(2, total, 'prev'), 1);
});

test('5. Mapeo de códigos meteorológicos WMO para Despeñaderos', () => {
  assert.equal(getWeatherConditionInfo(0, true).condition, 'Despejado');
  assert.equal(getWeatherConditionInfo(2, true).condition, 'Parcialmente nublado');
  assert.equal(getWeatherConditionInfo(61, true).condition, 'Lluvia');
  assert.equal(getWeatherConditionInfo(95, true).condition, 'Tormenta eléctrica');
});
