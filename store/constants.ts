// Constantes do sistema RPG do EvoQuest

import type { AttributeKey } from './types';

export const ATTRIBUTES: { key: AttributeKey; label: string; icon: string; color: string }[] = [
  { key: 'forca', label: 'Força', icon: '⚔️', color: '#E05C5C' },
  { key: 'inteligencia', label: 'Inteligência', icon: '🧠', color: '#5B8DD9' },
  { key: 'sabedoria', label: 'Sabedoria', icon: '📖', color: '#7B68EE' },
  { key: 'disciplina', label: 'Disciplina', icon: '🎯', color: '#8B6F47' },
  { key: 'foco', label: 'Foco', icon: '🔮', color: '#4ECDC4' },
  { key: 'vitalidade', label: 'Vitalidade', icon: '💚', color: '#55B96B' },
  { key: 'resiliencia', label: 'Resiliência', icon: '🛡️', color: '#F4A261' },
  { key: 'equilibrio', label: 'Equilíbrio', icon: '☯️', color: '#9B8EA8' },
];

export const MAX_LEVEL = 99;

// XP necessário para chegar ao nível N: 100 * N * 1.28^(N-1)
export function xpForLevel(level: number): number {
  return Math.floor(100 * level * Math.pow(1.28, level - 1));
}

// XP total acumulado para atingir o nível N
export function totalXpForLevel(level: number): number {
  let total = 0;
  for (let i = 1; i < level; i++) {
    total += xpForLevel(i);
  }
  return total;
}

export const INITIAL_ATTR_XP: Record<AttributeKey, number> = {
  forca: 0,
  inteligencia: 0,
  sabedoria: 0,
  disciplina: 0,
  foco: 0,
  vitalidade: 0,
  resiliencia: 0,
  equilibrio: 0,
};

export const CLASSES = [
  'Guerreiro',
  'Mago',
  'Sábio',
  'Monge',
  'Explorador',
  'Paladino',
  'Druida',
  'Arqueiro',
];

export const HABIT_XP_REWARDS: Record<string, number> = {
  easy: 10,
  medium: 25,
  hard: 50,
};

export const FINANCIAL_CATEGORIES_INCOME = [
  'Salário', 'Freelance', 'Investimentos', 'Presente', 'Outros',
];

export const FINANCIAL_CATEGORIES_EXPENSE = [
  'Alimentação', 'Moradia', 'Transporte', 'Saúde', 'Educação',
  'Lazer', 'Vestuário', 'Tecnologia', 'Assinaturas', 'Outros',
];
