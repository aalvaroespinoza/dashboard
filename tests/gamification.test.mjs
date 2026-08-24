/**
 * Suite de pruebas unitarias para el Sistema de Gamificación RPG de Hábitos
 * Ejecutable vía: node --test tests/gamification.test.mjs
 */

import assert from 'node:assert/strict';
import test from 'node:test';

// Fórmulas puras de gamificación
function calculateExpForLevel(level) {
  if (level <= 1) return 100;
  return Math.floor(100 * Math.pow(level, 1.4));
}

function getRankTitle(level) {
  if (level >= 50) return 'Monarca Legendario 👑';
  if (level >= 35) return 'Maestro del Enfoque 🔮';
  if (level >= 20) return 'Adepto del Hábito ⚡';
  if (level >= 10) return 'Guerrero Disciplinado ⚔️';
  if (level >= 5) return 'Aprendiz Constante 🛡️';
  return 'Novato de la Rutina 🥉';
}

function getStreakMultiplier(streakCount = 0) {
  const streak = Math.max(streakCount, 0);
  if (streak >= 30) return 2.0;
  if (streak >= 14) return 1.75;
  if (streak >= 7) return 1.5;
  if (streak >= 3) return 1.25;
  return 1.0;
}

function calculateActionExp(type, value, streakCount = 0) {
  let baseExp = 25;

  if (type === 'counter') {
    baseExp = Math.min(Math.max(Math.round(value * 10), 10), 40);
  } else if (type === 'timer') {
    const minutes = Math.floor(value / 60);
    baseExp = Math.min(Math.max(minutes, 10), 60);
  }

  const multiplier = getStreakMultiplier(streakCount);
  return Math.round(baseExp * multiplier);
}

function calculateMasteryBadge(totalCompletions = 0) {
  if (totalCompletions >= 150) {
    return { level: 10, tier: 'diamond', icon: '💎', name: 'Diamante Corona' };
  }
  if (totalCompletions >= 110) {
    return { level: 9, tier: 'diamond', icon: '💎', name: 'Diamante' };
  }
  if (totalCompletions >= 75) {
    return { level: 8, tier: 'gold', icon: '🥇', name: 'Oro III' };
  }
  if (totalCompletions >= 50) {
    return { level: 7, tier: 'gold', icon: '🥇', name: 'Oro II' };
  }
  if (totalCompletions >= 35) {
    return { level: 6, tier: 'gold', icon: '🥇', name: 'Oro I' };
  }
  if (totalCompletions >= 25) {
    return { level: 5, tier: 'silver', icon: '🥈', name: 'Plata III' };
  }
  if (totalCompletions >= 15) {
    return { level: 4, tier: 'silver', icon: '🥈', name: 'Plata II' };
  }
  if (totalCompletions >= 10) {
    return { level: 3, tier: 'silver', icon: '🥈', name: 'Plata I' };
  }
  if (totalCompletions >= 5) {
    return { level: 2, tier: 'bronze', icon: '🥉', name: 'Bronce II' };
  }
  return { level: 1, tier: 'bronze', icon: '🥉', name: 'Bronce I' };
}

test('1. Progresión Exponencial de Niveles de Jugador', () => {
  assert.equal(calculateExpForLevel(1), 100);
  assert.equal(calculateExpForLevel(2), 263);
  assert.equal(calculateExpForLevel(3), 465);
  assert.equal(calculateExpForLevel(5), 951);
  assert.equal(calculateExpForLevel(10), 2511);
});

test('2. Títulos y Rangos RPG según Nivel', () => {
  assert.equal(getRankTitle(1), 'Novato de la Rutina 🥉');
  assert.equal(getRankTitle(4), 'Novato de la Rutina 🥉');
  assert.equal(getRankTitle(5), 'Aprendiz Constante 🛡️');
  assert.equal(getRankTitle(12), 'Guerrero Disciplinado ⚔️');
  assert.equal(getRankTitle(25), 'Adepto del Hábito ⚡');
  assert.equal(getRankTitle(38), 'Maestro del Enfoque 🔮');
  assert.equal(getRankTitle(55), 'Monarca Legendario 👑');
});

test('3. Multiplicadores de Racha (Loss Aversion Mechanics)', () => {
  assert.equal(getStreakMultiplier(0), 1.0);
  assert.equal(getStreakMultiplier(2), 1.0);
  assert.equal(getStreakMultiplier(3), 1.25);
  assert.equal(getStreakMultiplier(7), 1.5);
  assert.equal(getStreakMultiplier(14), 1.75);
  assert.equal(getStreakMultiplier(30), 2.0);
  assert.equal(getStreakMultiplier(45), 2.0);
});

test('4. Cálculo Dinámico de EXP por Tipo de Hábito', () => {
  // Check simple sin racha
  assert.equal(calculateActionExp('check', 1, 0), 25);
  // Check simple con racha de 7 días (x1.5)
  assert.equal(calculateActionExp('check', 1, 7), 38);
  // Check simple con racha de 30 días (x2.0)
  assert.equal(calculateActionExp('check', 1, 30), 50);

  // Contador: 3 unidades con racha de 3 días (30 * 1.25 = 38)
  assert.equal(calculateActionExp('counter', 3, 3), 38);

  // Timer: 25 minutos (1500 segundos) con racha de 14 días (25 * 1.75 = 44)
  assert.equal(calculateActionExp('timer', 1500, 14), 44);
});

test('5. Rangos de Maestría Individual de Hábito (Bronce a Diamante)', () => {
  assert.equal(calculateMasteryBadge(0).level, 1);
  assert.equal(calculateMasteryBadge(0).tier, 'bronze');

  assert.equal(calculateMasteryBadge(6).level, 2);
  assert.equal(calculateMasteryBadge(6).tier, 'bronze');

  assert.equal(calculateMasteryBadge(12).level, 3);
  assert.equal(calculateMasteryBadge(12).tier, 'silver');

  assert.equal(calculateMasteryBadge(28).level, 5);
  assert.equal(calculateMasteryBadge(28).tier, 'silver');

  assert.equal(calculateMasteryBadge(55).level, 7);
  assert.equal(calculateMasteryBadge(55).tier, 'gold');

  assert.equal(calculateMasteryBadge(120).level, 9);
  assert.equal(calculateMasteryBadge(120).tier, 'diamond');

  assert.equal(calculateMasteryBadge(160).level, 10);
  assert.equal(calculateMasteryBadge(160).tier, 'diamond');
});
