'use client';

import { useState, useMemo, useCallback } from 'react';
import { Button, Text, makeStyles, tokens } from '@fluentui/react-components';
import { AddRegular } from '@fluentui/react-icons';
import { useAppStore } from '@/store/useAppStore';
import { dateISO } from '@/lib/utils';
import { WorkoutModal } from '@/components/workout/WorkoutModal';
import { WorkoutCard } from '@/components/workout/WorkoutCard';
import type { Workout } from '@/store/types';

const useStyles = makeStyles({
  page: { display: 'flex', flexDirection: 'column', gap: '24px' },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' },
  statCard: {
    backgroundColor: tokens.colorNeutralBackground2,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: '10px',
    padding: '16px',
    textAlign: 'center',
  },
  weekBar: {
    backgroundColor: tokens.colorNeutralBackground2,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: '10px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  dayCol: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
    flex: 1,
  },
});

const DAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function calcStreak(workouts: Workout[]): number {
  const today = dateISO();
  const dates = new Set(workouts.map((w) => w.date));
  let streak = 0;
  let d = new Date(today);
  while (dates.has(d.toISOString().slice(0, 10))) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

function getLast7Days(): string[] {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

export default function WorkoutPage() {
  const styles = useStyles();
  const workouts = useAppStore((s) => s.workouts);
  const addWorkout = useAppStore((s) => s.addWorkout);
  const deleteWorkout = useAppStore((s) => s.deleteWorkout);
  const completeWorkout = useAppStore((s) => s.completeWorkout);

  const [modalOpen, setModalOpen] = useState(false);

  const now = new Date();
  const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const thisMonth = workouts.filter((w) => w.date.startsWith(monthStr));
  const streak = useMemo(() => calcStreak(workouts), [workouts]);
  const last7 = useMemo(() => getLast7Days(), []);
  const workoutDates = useMemo(() => new Set(workouts.map((w) => w.date)), [workouts]);

  const sorted = useMemo(
    () => [...workouts].sort((a, b) => b.date.localeCompare(a.date)),
    [workouts],
  );

  const handleSave = useCallback((w: Omit<Workout, 'id'>) => addWorkout(w), [addWorkout]);
  const handleComplete = useCallback((id: string) => completeWorkout(id), [completeWorkout]);
  const handleDelete = useCallback((id: string) => deleteWorkout(id), [deleteWorkout]);

  return (
    <div className={styles.page}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <Text size={600} weight="bold">Treino</Text>
          <Text size={300} block style={{ color: tokens.colorNeutralForeground2, marginTop: 4 }}>
            Registre treinos · ganhe XP em Força, Vitalidade e Equilíbrio
          </Text>
        </div>
        <Button appearance="primary" icon={<AddRegular />} onClick={() => setModalOpen(true)}>
          Novo Treino
        </Button>
      </div>

      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <Text size={600} weight="bold" style={{ color: tokens.colorBrandBackground }}>{thisMonth.length}</Text>
          <Text size={200} block style={{ color: tokens.colorNeutralForeground2, marginTop: 4 }}>Treinos este mês</Text>
        </div>
        <div className={styles.statCard}>
          <Text size={600} weight="bold" style={{ color: '#E05C5C' }}>{thisMonth.filter((w) => w.done).length}</Text>
          <Text size={200} block style={{ color: tokens.colorNeutralForeground2, marginTop: 4 }}>Concluídos</Text>
        </div>
        <div className={styles.statCard}>
          <Text size={600} weight="bold" style={{ color: '#55B96B' }}>🔥 {streak}</Text>
          <Text size={200} block style={{ color: tokens.colorNeutralForeground2, marginTop: 4 }}>Dias seguidos</Text>
        </div>
      </div>

      <div className={styles.weekBar}>
        <Text size={300} weight="semibold">Últimos 7 dias</Text>
        <div style={{ display: 'flex', gap: 8 }}>
          {last7.map((day) => {
            const hasWorkout = workoutDates.has(day);
            const label = DAY_LABELS[new Date(day + 'T12:00:00').getDay()];
            return (
              <div key={day} className={styles.dayCol}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  backgroundColor: hasWorkout ? tokens.colorBrandBackground : tokens.colorNeutralBackground3,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {hasWorkout && <span style={{ color: '#fff', fontSize: 14 }}>✓</span>}
                </div>
                <Text size={100} style={{ color: tokens.colorNeutralForeground2 }}>{label}</Text>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {sorted.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <span style={{ fontSize: 48 }}>💪</span>
            <Text size={400} weight="semibold" block style={{ marginTop: 12 }}>Nenhum treino ainda</Text>
            <Text size={300} style={{ color: tokens.colorNeutralForeground2 }}>Clique em "Novo Treino" para começar</Text>
          </div>
        ) : (
          sorted.map((w) => (
            <WorkoutCard key={w.id} workout={w} onDelete={handleDelete} onComplete={handleComplete} />
          ))
        )}
      </div>

      <WorkoutModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSave} />
    </div>
  );
}
