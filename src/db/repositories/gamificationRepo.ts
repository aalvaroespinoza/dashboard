import { getDatabase } from '../database';
import { UserRPGProfile } from '../../types';
import { calculateExpForLevel, getRankTitle } from '../../features/habits/utils/gamificationUtils';

const DEFAULT_PROFILE: UserRPGProfile = {
  level: 1,
  current_exp: 0,
  next_level_exp: 100,
  rank_title: 'Novato de la Rutina 🥉',
  strength_exp: 0,
  intelligence_exp: 0,
  focus_exp: 0,
  perfect_days_count: 0,
  total_exp_earned: 0,
};

export const gamificationRepo = {
  async getProfile(): Promise<UserRPGProfile> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<any>(
      'SELECT * FROM habit_gamification_profile WHERE id = ?',
      ['default_player']
    );

    if (!row) {
      const now = new Date().toISOString();
      await db.runAsync(
        `INSERT INTO habit_gamification_profile (
          id, level, current_exp, strength_exp, intelligence_exp,
          focus_exp, perfect_days_count, total_exp_earned, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          'default_player',
          DEFAULT_PROFILE.level,
          DEFAULT_PROFILE.current_exp,
          DEFAULT_PROFILE.strength_exp,
          DEFAULT_PROFILE.intelligence_exp,
          DEFAULT_PROFILE.focus_exp,
          DEFAULT_PROFILE.perfect_days_count,
          DEFAULT_PROFILE.total_exp_earned,
          now,
        ]
      );
      return DEFAULT_PROFILE;
    }

    const level = row.level || 1;
    return {
      level,
      current_exp: row.current_exp || 0,
      next_level_exp: calculateExpForLevel(level),
      rank_title: getRankTitle(level),
      strength_exp: row.strength_exp || 0,
      intelligence_exp: row.intelligence_exp || 0,
      focus_exp: row.focus_exp || 0,
      perfect_days_count: row.perfect_days_count || 0,
      total_exp_earned: row.total_exp_earned || 0,
    };
  },

  async addExp(
    amount: number,
    categoryName = '',
    isPerfectDay = false
  ): Promise<{ profile: UserRPGProfile; didLevelUp: boolean; oldLevel: number; newLevel: number }> {
    const current = await this.getProfile();
    const oldLevel = current.level;

    let newCurrentExp = current.current_exp + amount;
    let newLevel = current.level;
    let nextThreshold = calculateExpForLevel(newLevel);
    let didLevelUp = false;

    // Subida de nivel progresiva (puede subir varios niveles si la EXP es muy alta)
    while (newCurrentExp >= nextThreshold) {
      newCurrentExp -= nextThreshold;
      newLevel++;
      nextThreshold = calculateExpForLevel(newLevel);
      didLevelUp = true;
    }

    // Atributos RPG según categoría
    const catLower = categoryName.toLowerCase();
    let strAdd = 0;
    let intAdd = 0;
    let focAdd = 0;

    if (catLower.includes('cuerpo') || catLower.includes('salud') || catLower.includes('físico')) {
      strAdd = amount;
    } else if (catLower.includes('mente') || catLower.includes('estudio') || catLower.includes('lectura') || catLower.includes('utn')) {
      intAdd = amount;
    } else {
      focAdd = amount;
    }

    const newProfile: UserRPGProfile = {
      level: newLevel,
      current_exp: newCurrentExp,
      next_level_exp: nextThreshold,
      rank_title: getRankTitle(newLevel),
      strength_exp: current.strength_exp + strAdd,
      intelligence_exp: current.intelligence_exp + intAdd,
      focus_exp: current.focus_exp + focAdd,
      perfect_days_count: current.perfect_days_count + (isPerfectDay ? 1 : 0),
      total_exp_earned: current.total_exp_earned + amount,
    };

    const db = await getDatabase();
    const now = new Date().toISOString();
    await db.runAsync(
      `UPDATE habit_gamification_profile SET
        level = ?,
        current_exp = ?,
        strength_exp = ?,
        intelligence_exp = ?,
        focus_exp = ?,
        perfect_days_count = ?,
        total_exp_earned = ?,
        updated_at = ?
       WHERE id = ?`,
      [
        newProfile.level,
        newProfile.current_exp,
        newProfile.strength_exp,
        newProfile.intelligence_exp,
        newProfile.focus_exp,
        newProfile.perfect_days_count,
        newProfile.total_exp_earned,
        now,
        'default_player',
      ]
    );

    return {
      profile: newProfile,
      didLevelUp,
      oldLevel,
      newLevel,
    };
  },

  async incrementHabitCompletions(habitId: string): Promise<number> {
    const db = await getDatabase();
    const habit = await db.getFirstAsync<any>(
      'SELECT total_completions, mastery_level FROM habits WHERE id = ?',
      [habitId]
    );

    const currentCompletions = (habit?.total_completions || 0) + 1;
    await db.runAsync(
      'UPDATE habits SET total_completions = ?, mastery_exp = ? WHERE id = ?',
      [currentCompletions, currentCompletions * 25, habitId]
    );

    return currentCompletions;
  },
};
