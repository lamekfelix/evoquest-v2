'use client';

import { Text } from '@fluentui/react-components';
import { tokens } from '@fluentui/react-components';
import { ATTRIBUTES } from '@/store/constants';
import type { Habit } from '@/store/types';

interface Props {
  habit: Habit;
  doneToday: boolean;
  onToggle: (id: string) => void;
}

export function HabitCard({ habit, doneToday, onToggle }: Props) {
  const attr = ATTRIBUTES.find((a) => a.key === habit.attribute);
  const color = attr?.color ?? tokens.colorBrandBackground;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onToggle(habit.id)}
      onKeyDown={(e) => e.key === 'Enter' && onToggle(habit.id)}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 16px', borderRadius: 10,
        border: `1.5px solid ${doneToday ? color : tokens.colorNeutralStroke2}`,
        background: doneToday ? `${color}18` : tokens.colorNeutralBackground1,
        cursor: 'pointer', userSelect: 'none',
        transition: 'border-color 0.2s, background 0.2s',
      }}
    >
      {/* Big checkbox */}
      <div style={{
        width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
        border: `2px solid ${color}`,
        background: doneToday ? color : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 0.2s',
      }}>
        {doneToday && (
          <span style={{ color: '#fff', fontSize: 14, lineHeight: 1 }}>✓</span>
        )}
      </div>

      {/* Name + attribute */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <Text
          size={300} weight="semibold" block
          style={{ textDecoration: doneToday ? 'line-through' : 'none', color: doneToday ? tokens.colorNeutralForeground3 : undefined }}
        >
          {habit.name}
        </Text>
        <Text size={100} style={{ color }}>
          {attr?.icon} {attr?.label}
        </Text>
      </div>

      {/* Streak + XP */}
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        {habit.streak > 0 && (
          <Text size={200} weight="bold" block style={{ color: '#F4A261' }}>
            🔥 {habit.streak}
          </Text>
        )}
        <Text size={100} style={{ color: doneToday ? '#55B96B' : tokens.colorNeutralForeground3 }}>
          {doneToday ? '✓ ' : '+'}{habit.xpReward} XP
        </Text>
      </div>
    </div>
  );
}
