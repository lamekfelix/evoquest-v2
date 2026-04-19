'use client';

import { useState } from 'react';
import {
  Text, Button, Card, Dialog, DialogSurface, DialogTitle,
  DialogBody, DialogActions, Input, Select, Badge,
  makeStyles, tokens,
} from '@fluentui/react-components';
import { AddRegular, DeleteRegular } from '@fluentui/react-icons';
import { useAppStore } from '@/store/useAppStore';
import { EmptyState } from '@/components/shared/EmptyState';
import { ATTRIBUTES } from '@/store/constants';
import { dateISO } from '@/lib/utils';
import type { AttributeKey } from '@/store/types';

const useStyles = makeStyles({
  page: { display: 'flex', flexDirection: 'column', gap: '24px' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' },
  habitCard: {
    padding: '16px', borderRadius: '10px',
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    display: 'flex', flexDirection: 'column', gap: '10px',
  },
  habitHeader: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' },
  streakRow: { display: 'flex', alignItems: 'center', gap: '6px' },
  calendarRow: { display: 'flex', gap: '4px', flexWrap: 'wrap' },
  dayDot: {
    width: '14px', height: '14px', borderRadius: '50%',
  },
  formField: { display: 'flex', flexDirection: 'column', gap: '4px' },
});

export default function HabitsPage() {
  const styles = useStyles();
  const habits = useAppStore((s) => s.habits);
  const addHabit = useAppStore((s) => s.addHabit);
  const deleteHabit = useAppStore((s) => s.deleteHabit);
  const toggleHabitToday = useAppStore((s) => s.toggleHabitToday);
  const addAttrXp = useAppStore((s) => s.addAttrXp);

  const [open, setOpen] = useState(false);
  const [habitName, setHabitName] = useState('');
  const [habitDesc, setHabitDesc] = useState('');
  const [habitAttr, setHabitAttr] = useState<AttributeKey>('disciplina');
  const [habitFreq, setHabitFreq] = useState<'daily' | 'weekly'>('daily');

  const today = dateISO();

  // Últimos 7 dias para o mini calendário
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return dateISO(d);
  });

  function handleAdd() {
    if (!habitName.trim()) return;
    addHabit({
      name: habitName.trim(),
      description: habitDesc.trim() || undefined,
      attribute: habitAttr,
      frequency: habitFreq,
      xpReward: 25,
    });
    setHabitName('');
    setHabitDesc('');
    setOpen(false);
  }

  function handleToggle(id: string, attr: AttributeKey, xpReward: number) {
    const habit = habits.find((h) => h.id === id);
    const wasDone = !!habit?.logs.find((l) => l.date === today && l.done);
    toggleHabitToday(id);
    if (!wasDone) addAttrXp(attr, xpReward);
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <Text size={600} weight="bold">Hábitos</Text>
          <Text block size={300} style={{ color: tokens.colorNeutralForeground2 }}>
            Construa consistência, ganhe XP
          </Text>
        </div>
        <Button appearance="primary" icon={<AddRegular />} onClick={() => setOpen(true)}>
          Novo Hábito
        </Button>
      </div>

      {/* Dialog criar hábito */}
      <Dialog open={open} onOpenChange={(_, d) => setOpen(d.open)}>
        <DialogSurface>
          <DialogTitle>Novo Hábito</DialogTitle>
          <DialogBody>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className={styles.formField}>
                <Text size={200}>Nome</Text>
                <Input placeholder="Ex: Meditar 10 minutos" value={habitName} onChange={(_, d) => setHabitName(d.value)} />
              </div>
              <div className={styles.formField}>
                <Text size={200}>Descrição (opcional)</Text>
                <Input placeholder="Detalhes..." value={habitDesc} onChange={(_, d) => setHabitDesc(d.value)} />
              </div>
              <div className={styles.formField}>
                <Text size={200}>Atributo</Text>
                <Select value={habitAttr} onChange={(_, d) => setHabitAttr(d.value as AttributeKey)}>
                  {ATTRIBUTES.map((a) => (
                    <option key={a.key} value={a.key}>{a.icon} {a.label}</option>
                  ))}
                </Select>
              </div>
              <div className={styles.formField}>
                <Text size={200}>Frequência</Text>
                <Select value={habitFreq} onChange={(_, d) => setHabitFreq(d.value as 'daily' | 'weekly')}>
                  <option value="daily">Diário</option>
                  <option value="weekly">Semanal</option>
                </Select>
              </div>
            </div>
          </DialogBody>
          <DialogActions>
            <Button appearance="secondary" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button appearance="primary" onClick={handleAdd} disabled={!habitName.trim()}>Criar</Button>
          </DialogActions>
        </DialogSurface>
      </Dialog>

      {/* Lista de hábitos */}
      {habits.length === 0 ? (
        <EmptyState
          icon="🔄"
          title="Nenhum hábito ainda"
          description="Crie seu primeiro hábito para começar a acumular XP e manter streaks."
          action={
            <Button appearance="primary" icon={<AddRegular />} onClick={() => setOpen(true)}>
              Criar Hábito
            </Button>
          }
        />
      ) : (
        <div className={styles.grid}>
          {habits.map((habit) => {
            const attr = ATTRIBUTES.find((a) => a.key === habit.attribute)!;
            const doneToday = !!habit.logs.find((l) => l.date === today && l.done);
            return (
              <Card
                key={habit.id}
                className={styles.habitCard}
                style={{ borderLeft: `4px solid ${attr.color}` }}
              >
                <div className={styles.habitHeader}>
                  <div style={{ flex: 1 }}>
                    <Text size={300} weight="semibold" block>{habit.name}</Text>
                    {habit.description && (
                      <Text size={200} style={{ color: tokens.colorNeutralForeground2 }}>{habit.description}</Text>
                    )}
                  </div>
                  <Button
                    appearance="subtle"
                    size="small"
                    icon={<DeleteRegular />}
                    onClick={() => deleteHabit(habit.id)}
                  />
                </div>

                {/* Badge atributo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 14 }}>{attr.icon}</span>
                  <Text size={100} style={{ color: attr.color }}>{attr.label}</Text>
                  <Badge appearance="outline" size="small" style={{ marginLeft: 'auto' }}>
                    {habit.frequency === 'daily' ? 'Diário' : 'Semanal'}
                  </Badge>
                </div>

                {/* Streak */}
                <div className={styles.streakRow}>
                  <span>🔥</span>
                  <Text size={300} weight="bold" style={{ color: '#F4A261' }}>{habit.streak}</Text>
                  <Text size={100} style={{ color: tokens.colorNeutralForeground2 }}>dias consecutivos</Text>
                </div>

                {/* Mini calendário últimos 7 dias */}
                <div className={styles.calendarRow}>
                  {last7.map((day) => {
                    const log = habit.logs.find((l) => l.date === day);
                    return (
                      <div
                        key={day}
                        className={styles.dayDot}
                        title={day}
                        style={{
                          backgroundColor: log?.done ? attr.color : tokens.colorNeutralBackground3,
                          border: day === today ? `2px solid ${attr.color}` : 'none',
                        }}
                      />
                    );
                  })}
                  <Text size={100} style={{ color: tokens.colorNeutralForeground2, marginLeft: 4 }}>
                    últimos 7 dias
                  </Text>
                </div>

                {/* Botão check today */}
                <Button
                  appearance={doneToday ? 'secondary' : 'primary'}
                  size="small"
                  onClick={() => handleToggle(habit.id, habit.attribute, habit.xpReward)}
                  style={{
                    background: doneToday ? tokens.colorNeutralBackground3 : attr.color,
                    color: doneToday ? tokens.colorNeutralForeground1 : '#fff',
                    border: 'none',
                  }}
                >
                  {doneToday ? '✓ Concluído hoje' : 'Marcar como feito'}
                </Button>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
