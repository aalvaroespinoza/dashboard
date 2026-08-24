import { HabitType } from '../../../types';

/**
 * Retorna la experiencia total requerida para alcanzar el siguiente nivel
 * Escala exponencial suave: 100 * level^1.4
 * Lv 1 -> 100 EXP
 * Lv 2 -> 263 EXP
 * Lv 3 -> 465 EXP
 * Lv 5 -> 951 EXP
 * Lv 10 -> 2511 EXP
 */
export function calculateExpForLevel(level: number): number {
  if (level <= 1) return 100;
  return Math.floor(100 * Math.pow(level, 1.4));
}

/**
 * Título / Rango RPG según el nivel del jugador
 */
export function getRankTitle(level: number): string {
  if (level >= 50) return 'Monarca Legendario 👑';
  if (level >= 35) return 'Maestro del Enfoque 🔮';
  if (level >= 20) return 'Adepto del Hábito ⚡';
  if (level >= 10) return 'Guerrero Disciplinado ⚔️';
  if (level >= 5) return 'Aprendiz Constante 🛡️';
  return 'Novato de la Rutina 🥉';
}

/**
 * Multiplicador de Racha (Loss Aversion & Retención)
 */
export function getStreakMultiplier(streakCount = 0): number {
  const streak = Math.max(streakCount, 0);
  if (streak >= 30) return 2.0; // Fuego Dorado
  if (streak >= 14) return 1.75; // Racha Legendaria
  if (streak >= 7) return 1.5; // Racha Semanal
  if (streak >= 3) return 1.25; // Racha Inicial
  return 1.0;
}

/**
 * Calcula la EXP ganada por una acción
 */
export function calculateActionExp(type: HabitType, value: number, streakCount = 0): number {
  let baseExp = 25; // Check simple por defecto

  if (type === 'counter') {
    baseExp = Math.min(Math.max(Math.round(value * 10), 10), 40);
  } else if (type === 'timer') {
    const minutes = Math.floor(value / 60);
    baseExp = Math.min(Math.max(minutes, 10), 60);
  }

  const multiplier = getStreakMultiplier(streakCount);
  return Math.round(baseExp * multiplier);
}

export type MasteryTier = 'bronze' | 'silver' | 'gold' | 'diamond';

/**
 * Nivel de maestría individual del hábito (Lv. 1 a Lv. 10)
 */
export function calculateMasteryBadge(totalCompletions = 0): {
  level: number;
  tier: MasteryTier;
  icon: string;
  name: string;
  nextTierCompletions: number;
} {
  if (totalCompletions >= 150) {
    return { level: 10, tier: 'diamond', icon: '💎', name: 'Diamante Corona', nextTierCompletions: 150 };
  }
  if (totalCompletions >= 110) {
    return { level: 9, tier: 'diamond', icon: '💎', name: 'Diamante', nextTierCompletions: 150 };
  }
  if (totalCompletions >= 75) {
    return { level: 8, tier: 'gold', icon: '🥇', name: 'Oro III', nextTierCompletions: 110 };
  }
  if (totalCompletions >= 50) {
    return { level: 7, tier: 'gold', icon: '🥇', name: 'Oro II', nextTierCompletions: 75 };
  }
  if (totalCompletions >= 35) {
    return { level: 6, tier: 'gold', icon: '🥇', name: 'Oro I', nextTierCompletions: 50 };
  }
  if (totalCompletions >= 25) {
    return { level: 5, tier: 'silver', icon: '🥈', name: 'Plata III', nextTierCompletions: 35 };
  }
  if (totalCompletions >= 15) {
    return { level: 4, tier: 'silver', icon: '🥈', name: 'Plata II', nextTierCompletions: 25 };
  }
  if (totalCompletions >= 10) {
    return { level: 3, tier: 'silver', icon: '🥈', name: 'Plata I', nextTierCompletions: 15 };
  }
  if (totalCompletions >= 5) {
    return { level: 2, tier: 'bronze', icon: '🥉', name: 'Bronce II', nextTierCompletions: 10 };
  }
  return { level: 1, tier: 'bronze', icon: '🥉', name: 'Bronce I', nextTierCompletions: 5 };
}
