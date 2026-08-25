/**
 * Suite de pruebas unitarias para Persistencia y Cálculo Delta de Timers de Hábitos
 * Ejecutable vía: node --test tests/timerPersistence.test.mjs
 */

import assert from 'node:assert/strict';
import test from 'node:test';

function calculateLiveSeconds(startTimestamp, accumulatedSeconds, isRunning, nowTimestamp) {
  if (!isRunning) return accumulatedSeconds;
  const elapsed = Math.floor((nowTimestamp - startTimestamp) / 1000);
  return accumulatedSeconds + Math.max(0, elapsed);
}

function pauseTimerCalculation(startTimestamp, accumulatedSeconds, nowTimestamp) {
  const elapsed = Math.floor((nowTimestamp - startTimestamp) / 1000);
  return {
    startTimestamp,
    accumulatedSeconds: accumulatedSeconds + Math.max(0, elapsed),
    isRunning: false,
  };
}

test('1. Cálculo de segundos vivos con delta-timestamp mientras corre', () => {
  const start = 1700000000000; // Epoch base
  const now = start + 45000; // 45 segundos después
  const accumulated = 120; // 2 minutos acumulados previos

  const live = calculateLiveSeconds(start, accumulated, true, now);
  assert.equal(live, 165); // 120 + 45
});

test('2. Temporizador en pausa devuelve exactamente los segundos acumulados', () => {
  const start = 1700000000000;
  const now = start + 500000;
  const accumulated = 300;

  const live = calculateLiveSeconds(start, accumulated, false, now);
  assert.equal(live, 300);
});

test('3. Pausar temporizador computa e incrementa los segundos acumulados para SQLite', () => {
  const start = 1700000000000;
  const now = start + 75000; // 75 segundos después
  const accumulated = 100;

  const paused = pauseTimerCalculation(start, accumulated, now);
  assert.equal(paused.accumulatedSeconds, 175);
  assert.equal(paused.isRunning, false);
});

test('4. Auto-completar hábito cuando los segundos vivos alcanzan la meta', () => {
  const targetMinutes = 25; // 25 min = 1500 segundos
  const targetSeconds = targetMinutes * 60;
  const previousSaved = 1200; // 20 min ya guardados hoy
  const currentSession = 305; // 5 min y 5 seg en la sesión actual
  const totalEffective = previousSaved + currentSession;

  const shouldAutoComplete = totalEffective >= targetSeconds;
  assert.equal(shouldAutoComplete, true);
  assert.equal(totalEffective >= 1500, true);
});

