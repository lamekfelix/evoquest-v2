'use client';

import { useState } from 'react';
import {
  Dialog, DialogSurface, DialogTitle, DialogBody, DialogActions,
  Button, Input, Select, Option, Text, makeStyles, tokens,
} from '@fluentui/react-components';
import { AddRegular, DeleteRegular } from '@fluentui/react-icons';
import type { Workout, WorkoutType, WorkoutExercise } from '@/store/types';
import { dateISO } from '@/lib/utils';

const WORKOUT_ICONS = ['🏋️','🏃','🚴','🤸','🏊','⛹️','🥊','🧘','💪','⚡','🔥','🎯','🌀','🏅','⚽','🎾','🧗','🤼','🥋','🏇'];

const WORKOUT_TYPES: { value: WorkoutType; label: string; color: string }[] = [
  { value: 'musculacao', label: 'Musculação', color: '#E05C5C' },
  { value: 'cardio', label: 'Cardio', color: '#5B8DD9' },
  { value: 'funcional', label: 'Funcional', color: '#55B96B' },
  { value: 'mobilidade', label: 'Mobilidade', color: '#9B8EA8' },
  { value: 'yoga', label: 'Yoga', color: '#4ECDC4' },
];

interface ExerciseRow {
  tempId: string;
  name: string;
  sets: string;
  reps: string;
  weight: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (w: Omit<Workout, 'id'>) => void;
}

const useStyles = makeStyles({
  field: { display: 'flex', flexDirection: 'column', gap: '4px' },
  iconGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(10, 1fr)',
    gap: '4px',
  },
  iconBtn: {
    fontSize: '20px',
    cursor: 'pointer',
    borderRadius: '6px',
    padding: '4px',
    border: '2px solid transparent',
    background: 'none',
    ':hover': { backgroundColor: tokens.colorNeutralBackground3 },
  },
  exRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 60px 60px 80px 32px',
    gap: '6px',
    alignItems: 'center',
  },
});

function makeId() {
  return Math.random().toString(36).slice(2);
}

function emptyRow(): ExerciseRow {
  return { tempId: makeId(), name: '', sets: '3', reps: '10', weight: '' };
}

export function WorkoutModal({ open, onClose, onSave }: Props) {
  const styles = useStyles();
  const [name, setName] = useState('');
  const [date, setDate] = useState(dateISO());
  const [type, setType] = useState<WorkoutType>('musculacao');
  const [icon, setIcon] = useState('🏋️');
  const [exercises, setExercises] = useState<ExerciseRow[]>([emptyRow()]);

  function handleSave() {
    if (!name.trim()) return;
    const ex: WorkoutExercise[] = exercises
      .filter((r) => r.name.trim())
      .map((r) => ({
        id: makeId(),
        name: r.name.trim(),
        sets: Array.from({ length: Math.max(1, parseInt(r.sets) || 1) }, () => ({
          reps: parseInt(r.reps) || undefined,
          weight: parseFloat(r.weight) || undefined,
        })),
      }));
    onSave({ name: name.trim(), date, type, icon, exercises: ex, done: false });
    setName('');
    setDate(dateISO());
    setType('musculacao');
    setIcon('🏋️');
    setExercises([emptyRow()]);
    onClose();
  }

  function updateRow(tempId: string, field: keyof ExerciseRow, value: string) {
    setExercises((prev) => prev.map((r) => r.tempId === tempId ? { ...r, [field]: value } : r));
  }

  function removeRow(tempId: string) {
    setExercises((prev) => prev.filter((r) => r.tempId !== tempId));
  }

  return (
    <Dialog open={open} onOpenChange={(_, d) => !d.open && onClose()}>
      <DialogSurface style={{ maxWidth: 540 }}>
        <DialogTitle>Novo Treino</DialogTitle>
        <DialogBody>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px', gap: 10 }}>
              <div className={styles.field}>
                <Text size={200}>Nome *</Text>
                <Input value={name} onChange={(_, d) => setName(d.value)} placeholder="Ex: Peito e Tríceps" />
              </div>
              <div className={styles.field}>
                <Text size={200}>Data</Text>
                <Input type="date" value={date} onChange={(_, d) => setDate(d.value)} />
              </div>
            </div>

            <div className={styles.field}>
              <Text size={200}>Tipo</Text>
              <Select value={type} onChange={(_, d) => setType(d.value as WorkoutType)}>
                {WORKOUT_TYPES.map((t) => (
                  <Option key={t.value} value={t.value}>{t.label}</Option>
                ))}
              </Select>
            </div>

            <div className={styles.field}>
              <Text size={200}>Ícone</Text>
              <div className={styles.iconGrid}>
                {WORKOUT_ICONS.map((ic) => (
                  <button
                    key={ic}
                    className={styles.iconBtn}
                    style={{ border: icon === ic ? `2px solid ${tokens.colorBrandBackground}` : '2px solid transparent' }}
                    onClick={() => setIcon(ic)}
                    type="button"
                  >
                    {ic}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.field}>
              <Text size={200}>Exercícios</Text>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div className={styles.exRow}>
                  <Text size={100} style={{ color: tokens.colorNeutralForeground2 }}>Nome</Text>
                  <Text size={100} style={{ color: tokens.colorNeutralForeground2 }}>Séries</Text>
                  <Text size={100} style={{ color: tokens.colorNeutralForeground2 }}>Reps</Text>
                  <Text size={100} style={{ color: tokens.colorNeutralForeground2 }}>Peso (kg)</Text>
                  <span />
                </div>
                {exercises.map((row) => (
                  <div key={row.tempId} className={styles.exRow}>
                    <Input size="small" value={row.name} onChange={(_, d) => updateRow(row.tempId, 'name', d.value)} placeholder="Exercício" />
                    <Input size="small" value={row.sets} onChange={(_, d) => updateRow(row.tempId, 'sets', d.value)} type="number" />
                    <Input size="small" value={row.reps} onChange={(_, d) => updateRow(row.tempId, 'reps', d.value)} type="number" />
                    <Input size="small" value={row.weight} onChange={(_, d) => updateRow(row.tempId, 'weight', d.value)} type="number" placeholder="—" />
                    <Button
                      size="small"
                      appearance="subtle"
                      icon={<DeleteRegular />}
                      onClick={() => removeRow(row.tempId)}
                    />
                  </div>
                ))}
                <Button
                  size="small"
                  appearance="subtle"
                  icon={<AddRegular />}
                  onClick={() => setExercises((prev) => [...prev, emptyRow()])}
                  style={{ alignSelf: 'flex-start' }}
                >
                  Adicionar exercício
                </Button>
              </div>
            </div>
          </div>
        </DialogBody>
        <DialogActions>
          <Button appearance="secondary" onClick={onClose}>Cancelar</Button>
          <Button appearance="primary" onClick={handleSave} disabled={!name.trim()}>Salvar</Button>
        </DialogActions>
      </DialogSurface>
    </Dialog>
  );
}
