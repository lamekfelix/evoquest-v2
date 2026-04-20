'use client';

import { Button, Text, tokens } from '@fluentui/react-components';

const WATER_GOAL = 2000;

interface Props {
  waterToday: number;
  onAdd: (ml: number) => void;
}

export function WaterCard({ waterToday, onAdd }: Props) {
  const pct = Math.min(100, Math.round((waterToday / WATER_GOAL) * 100));
  const done = waterToday >= WATER_GOAL;

  return (
    <div style={{
      padding: '12px 14px', borderRadius: 10,
      border: `1px solid ${done ? '#4ECDC4' : tokens.colorNeutralStroke2}`,
      background: done ? 'rgba(78,205,196,0.08)' : tokens.colorNeutralBackground1,
      display: 'flex', flexDirection: 'column', gap: 8,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text size={300} weight="semibold">💧 Hidratação</Text>
        <Text size={200} weight="semibold" style={{ color: done ? '#4ECDC4' : tokens.colorNeutralForeground2 }}>
          {waterToday} / {WATER_GOAL} ml
        </Text>
      </div>
      <div style={{ height: 6, borderRadius: 3, background: tokens.colorNeutralBackground3, overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${pct}%`,
          background: done ? '#4ECDC4' : 'rgba(78,205,196,0.7)',
          borderRadius: 3, transition: 'width 0.4s ease',
        }} />
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        <Button
          size="small" appearance="outline"
          onClick={() => onAdd(250)}
          style={{ flex: 1, fontSize: '12px' }}
        >
          + 250 ml
        </Button>
        <Button
          size="small" appearance="outline"
          onClick={() => onAdd(500)}
          style={{ flex: 1, fontSize: '12px' }}
        >
          + 500 ml
        </Button>
      </div>
    </div>
  );
}
