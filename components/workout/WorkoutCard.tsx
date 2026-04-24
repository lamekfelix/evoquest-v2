'use client';

import { useState, useEffect } from 'react';
import { Button, Text, Checkbox, makeStyles, tokens } from '@fluentui/react-components';
import { DeleteRegular, CheckmarkCircleRegular } from '@fluentui/react-icons';
import type { Workout } from '@/store/types';

const TYPE_COLORS: Record<string, string> = {
  musculacao: '#E05C5C',
  cardio: '#5B8DD9',
  funcional: '#55B96B',
  mobilidade: '#9B8EA8',
  yoga: '#4ECDC4',
};

const TYPE_LABELS: Record<string, string> = {
  musculacao: 'Musculação',
  cardio: 'Cardio',
  funcional: 'Funcional',
  mobilidade: 'Mobilidade',
  yoga: 'Yoga',
};

interface Props {
  workout: Workout;
  onDelete: (id: string) => void;
  onComplete: (id: string) => void;
}

const useStyles = makeStyles({
  card: {
    backgroundColor: tokens.colorNeutralBackground2,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: '10px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  badge: {
    borderRadius: '4px',
    padding: '2px 8px',
    fontSize: '11px',
    fontWeight: 600,
    color: '#fff',
  },
  exRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '4px 0',
    borderBottom: `1px solid ${tokens.colorNeutralStroke3}`,
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '4px',
  },
});

export function WorkoutCard({ workout, onDelete, onComplete }: Props) {
  const styles = useStyles();
  const [checkedExercises, setCheckedExercises] = useState<Set<string>>(new Set());

  const allChecked =
    workout.exercises.length > 0 &&
    workout.exercises.every((ex) => checkedExercises.has(ex.id));

  useEffect(() => {
    if (allChecked && !workout.done) {
      onComplete(workout.id);
    }
  }, [allChecked, workout.done, workout.id, onComplete]);

  function toggleEx(id: string) {
    setCheckedExercises((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const color = workout.type ? TYPE_COLORS[workout.type] : '#888';
  const typeLabel = workout.type ? TYPE_LABELS[workout.type] : '';

  return (
    <div className={styles.card} style={{ opacity: workout.done ? 0.7 : 1 }}>
      <div className={styles.header}>
        <span style={{ fontSize: 24 }}>{workout.icon ?? '💪'}</span>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Text size={400} weight="semibold">{workout.name}</Text>
            {workout.done && (
              <span style={{ fontSize: 14, color: tokens.colorPaletteGreenForeground1 }}>✓ Concluído</span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
            {typeLabel && (
              <span className={styles.badge} style={{ backgroundColor: color }}>{typeLabel}</span>
            )}
            <Text size={200} style={{ color: tokens.colorNeutralForeground2 }}>{workout.date}</Text>
          </div>
        </div>
      </div>

      {workout.exercises.length > 0 && (
        <div>
          {workout.exercises.map((ex) => {
            const firstSet = ex.sets[0];
            const setsSummary = `${ex.sets.length} séries × ${firstSet?.reps ?? '—'} reps${firstSet?.weight ? ` · ${firstSet.weight}kg` : ''}`;
            return (
              <div key={ex.id} className={styles.exRow}>
                <Checkbox
                  checked={checkedExercises.has(ex.id)}
                  onChange={() => toggleEx(ex.id)}
                />
                <Text size={300} style={{ flex: 1 }}>{ex.name}</Text>
                <Text size={200} style={{ color: tokens.colorNeutralForeground2 }}>{setsSummary}</Text>
              </div>
            );
          })}
        </div>
      )}

      <div className={styles.footer}>
        <Button
          appearance="primary"
          icon={<CheckmarkCircleRegular />}
          disabled={workout.done}
          onClick={() => onComplete(workout.id)}
          size="small"
        >
          {workout.done ? 'Concluído' : 'Concluir Treino'}
        </Button>
        <Button
          appearance="subtle"
          icon={<DeleteRegular />}
          onClick={() => onDelete(workout.id)}
          size="small"
        />
      </div>
    </div>
  );
}
