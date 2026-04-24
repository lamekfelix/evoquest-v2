import type { AttributeKey } from '@/store/types';

export const XP_REWARDS = {
  // Hábitos
  HABIT_COMPLETE: 20,
  HABIT_LOSE_STREAK: -10,
  HABIT_STREAK_7: 50,
  HABIT_STREAK_30: 200,
  HABIT_STREAK_100: 1000,

  // Agenda
  AGENDA_TASK_ON_TIME: 10,
  AGENDA_TASK_LATE: 3,
  AGENDA_DAILY_CLEAR: 25,

  // Projetos
  PROJECT_CREATE: 5,
  PROJECT_START: 5,
  PROJECT_TASK_COMPLETE: 10,
  PROJECT_TASK_ON_TIME: 15,
  PROJECT_ALL_TASKS_DONE: 30,
  PROJECT_DONE: 50,
  PROJECT_ARCHIVE: 5,

  // PARA
  AREA_CREATE: 5,
  RESOURCE_CREATE: 10,
  RESOURCE_LINK_PROJECT: 5,
  ARCHIVE_ITEM: 5,

  // Corpo
  WORKOUT_LOG: 15,
  WORKOUT_COMPLETE: 25,
  MEAL_LOG: 5,
  WATER_GOAL: 10,
  THREE_MEALS_DAY: 15,

  // Finanças
  TRANSACTION_LOG: 5,

  // Diário
  JOURNAL_ENTRY: 15,

  // Módulo Financeiro
  INVOICE_PAID: 20,
  EXPENSE_LOG: 5,
  SAVINGS_GOAL_MET: 30,
} as const;

export interface XpGrant {
  attr: AttributeKey;
  amount: number;
  reason: string;
}

export function workoutAttr(type?: import('@/store/types').WorkoutType): AttributeKey {
  if (type === 'cardio') return 'vitalidade';
  if (type === 'mobilidade' || type === 'yoga') return 'equilibrio';
  return 'forca';
}

export function streakBonus(streak: number, attr: AttributeKey): XpGrant | null {
  if (streak > 0 && streak % 100 === 0)
    return { attr, amount: XP_REWARDS.HABIT_STREAK_100, reason: `🔥 Streak lendário: ${streak} dias!` };
  if (streak > 0 && streak % 30 === 0)
    return { attr, amount: XP_REWARDS.HABIT_STREAK_30, reason: `⭐ Streak épico: ${streak} dias!` };
  if (streak > 0 && streak % 7 === 0)
    return { attr, amount: XP_REWARDS.HABIT_STREAK_7, reason: `✨ Streak de ${streak} dias!` };
  return null;
}
