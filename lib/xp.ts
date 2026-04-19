// Cálculos de XP e nível

import { xpForLevel, totalXpForLevel, MAX_LEVEL } from '@/store/constants';
import type { AttributeKey } from '@/store/types';

export interface LevelInfo {
  level: number;
  currentXp: number;
  xpForNextLevel: number;
  progressPercent: number;
}

export function getLevelFromXp(totalXp: number): LevelInfo {
  let level = 1;

  while (level < MAX_LEVEL) {
    const needed = totalXpForLevel(level + 1);
    if (totalXp < needed) break;
    level++;
  }

  const xpAtCurrentLevel = totalXpForLevel(level);
  const xpAtNextLevel = totalXpForLevel(level + 1);
  const currentXp = totalXp - xpAtCurrentLevel;
  const xpForNextLevel = xpAtNextLevel - xpAtCurrentLevel;
  const progressPercent = Math.min(100, Math.floor((currentXp / xpForNextLevel) * 100));

  return { level, currentXp, xpForNextLevel, progressPercent };
}

export function getAttrLevel(xp: number): LevelInfo {
  return getLevelFromXp(xp);
}

export function calcTotalXp(attrXp: Record<AttributeKey, number>): number {
  return Object.values(attrXp).reduce((sum, v) => sum + v, 0);
}
