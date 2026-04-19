'use client';

import { useState } from 'react';
import {
  Text, Button, Tab, TabList, Card,
  Dialog, DialogSurface, DialogTitle, DialogBody, DialogActions,
  Input, Select, makeStyles, tokens,
} from '@fluentui/react-components';
import { AddRegular, DeleteRegular } from '@fluentui/react-icons';
import { useAppStore } from '@/store/useAppStore';
import { EmptyState } from '@/components/shared/EmptyState';
import { dateISO, addDays, getStartOfWeek } from '@/lib/utils';
import type { AgendaItemType } from '@/store/types';

const useStyles = makeStyles({
  page: { display: 'flex', flexDirection: 'column', gap: '24px' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  taskItem: {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '10px 14px', borderRadius: '8px',
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground1,
  },
  weekGrid: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' },
  weekDay: {
    minHeight: '100px', padding: '8px', borderRadius: '8px',
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    display: 'flex', flexDirection: 'column', gap: '4px',
  },
  formField: { display: 'flex', flexDirection: 'column', gap: '4px' },
  dayEventDot: {
    fontSize: '11px', padding: '2px 6px', borderRadius: '4px',
    backgroundColor: tokens.colorNeutralBackground3,
    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
  },
});

const DAYS_PT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS_PT = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

export default function AgendaPage() {
  const styles = useStyles();
  const agenda = useAppStore((s) => s.agenda);
  const addAgendaItem = useAppStore((s) => s.addAgendaItem);
  const toggleAgendaItem = useAppStore((s) => s.toggleAgendaItem);
  const deleteAgendaItem = useAppStore((s) => s.deleteAgendaItem);

  const [view, setView] = useState<'day' | 'week' | 'month'>('day');
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(dateISO());
  const [title, setTitle] = useState('');
  const [type, setType] = useState<AgendaItemType>('task');
  const [date, setDate] = useState(dateISO());
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const today = dateISO();

  function handleAdd() {
    if (!title.trim()) return;
    addAgendaItem({ title: title.trim(), type, date, startTime: startTime || undefined, endTime: endTime || undefined, done: false });
    setTitle(''); setStartTime(''); setEndTime('');
    setOpen(false);
  }

  const dayItems = agenda.filter((a) => a.date === selectedDate);

  // Semana atual
  const weekStart = getStartOfWeek(new Date());
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(weekStart, i);
    return dateISO(d);
  });

  // Mês atual
  const now = new Date();
  const monthYear = { year: now.getFullYear(), month: now.getMonth() };
  const firstDay = new Date(monthYear.year, monthYear.month, 1).getDay();
  const daysInMonth = new Date(monthYear.year, monthYear.month + 1, 0).getDate();
  const monthCells: (string | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => {
      const d = new Date(monthYear.year, monthYear.month, i + 1);
      return dateISO(d);
    }),
  ];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <Text size={600} weight="bold">Agenda</Text>
          <Text block size={300} style={{ color: tokens.colorNeutralForeground2 }}>
            Organize seus eventos e tarefas
          </Text>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <TabList selectedValue={view} onTabSelect={(_, d) => setView(d.value as typeof view)} size="small">
            <Tab value="day">Diária</Tab>
            <Tab value="week">Semanal</Tab>
            <Tab value="month">Mensal</Tab>
          </TabList>
          <Button appearance="primary" icon={<AddRegular />} onClick={() => setOpen(true)}>
            Novo Item
          </Button>
        </div>
      </div>

      {/* Dialog */}
      <Dialog open={open} onOpenChange={(_, d) => setOpen(d.open)}>
        <DialogSurface>
          <DialogTitle>Novo Item na Agenda</DialogTitle>
          <DialogBody>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className={styles.formField}>
                <Text size={200}>Título *</Text>
                <Input placeholder="Nome do evento/tarefa" value={title} onChange={(_, d) => setTitle(d.value)} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className={styles.formField}>
                  <Text size={200}>Tipo</Text>
                  <Select value={type} onChange={(_, d) => setType(d.value as AgendaItemType)}>
                    <option value="task">Tarefa</option>
                    <option value="event">Evento</option>
                    <option value="reminder">Lembrete</option>
                  </Select>
                </div>
                <div className={styles.formField}>
                  <Text size={200}>Data</Text>
                  <Input type="date" value={date} onChange={(_, d) => setDate(d.value)} />
                </div>
                <div className={styles.formField}>
                  <Text size={200}>Início</Text>
                  <Input type="time" value={startTime} onChange={(_, d) => setStartTime(d.value)} />
                </div>
                <div className={styles.formField}>
                  <Text size={200}>Fim</Text>
                  <Input type="time" value={endTime} onChange={(_, d) => setEndTime(d.value)} />
                </div>
              </div>
            </div>
          </DialogBody>
          <DialogActions>
            <Button appearance="secondary" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button appearance="primary" onClick={handleAdd} disabled={!title.trim()}>Adicionar</Button>
          </DialogActions>
        </DialogSurface>
      </Dialog>

      {/* Vista Diária */}
      {view === 'day' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Input type="date" value={selectedDate} onChange={(_, d) => setSelectedDate(d.value)}
            style={{ maxWidth: 200 }} />
          {dayItems.length === 0 ? (
            <EmptyState icon="📅" title="Nenhum item neste dia" description="Adicione tarefas ou eventos para esse dia." />
          ) : (
            dayItems.map((item) => (
              <div key={item.id} className={styles.taskItem} style={{ opacity: item.done ? 0.65 : 1 }}>
                <button
                  onClick={() => toggleAgendaItem(item.id)}
                  style={{
                    width: 20, height: 20, borderRadius: item.type === 'task' ? 4 : '50%',
                    border: `2px solid ${tokens.colorBrandBackground}`,
                    background: item.done ? tokens.colorBrandBackground : 'transparent',
                    cursor: 'pointer', flexShrink: 0,
                  }}
                />
                <Text size={300} style={{ flex: 1, textDecoration: item.done ? 'line-through' : 'none' }}>
                  {item.title}
                </Text>
                {item.startTime && (
                  <Text size={100} style={{ color: tokens.colorNeutralForeground2 }}>
                    {item.startTime}{item.endTime ? ` – ${item.endTime}` : ''}
                  </Text>
                )}
                <Button appearance="subtle" size="small" icon={<DeleteRegular />}
                  onClick={() => deleteAgendaItem(item.id)} />
              </div>
            ))
          )}
        </div>
      )}

      {/* Vista Semanal */}
      {view === 'week' && (
        <div className={styles.weekGrid}>
          {weekDays.map((day, i) => {
            const items = agenda.filter((a) => a.date === day);
            const isToday = day === today;
            return (
              <div key={day} className={styles.weekDay}
                style={{ background: isToday ? `${tokens.colorBrandBackground}10` : undefined,
                  borderColor: isToday ? tokens.colorBrandBackground : undefined }}>
                <Text size={100} weight={isToday ? 'bold' : 'regular'}
                  style={{ color: isToday ? tokens.colorBrandBackground : tokens.colorNeutralForeground2 }}>
                  {DAYS_PT[i]}
                </Text>
                <Text size={300} weight={isToday ? 'bold' : 'regular'}>
                  {new Date(day + 'T12:00:00').getDate()}
                </Text>
                {items.map((item) => (
                  <div key={item.id} className={styles.dayEventDot}
                    style={{ textDecoration: item.done ? 'line-through' : 'none' }}>
                    {item.title}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {/* Vista Mensal */}
      {view === 'month' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Text size={400} weight="semibold">
            {MONTHS_PT[monthYear.month]} {monthYear.year}
          </Text>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
            {DAYS_PT.map((d) => (
              <Text key={d} size={100} style={{ textAlign: 'center', color: tokens.colorNeutralForeground2, padding: '4px 0' }}>
                {d}
              </Text>
            ))}
            {monthCells.map((day, i) => {
              if (!day) return <div key={`empty-${i}`} />;
              const items = agenda.filter((a) => a.date === day);
              const isToday = day === today;
              return (
                <div
                  key={day}
                  style={{
                    minHeight: 64, padding: 4, borderRadius: 6,
                    border: `1px solid ${isToday ? tokens.colorBrandBackground : tokens.colorNeutralStroke2}`,
                    background: isToday ? `${tokens.colorBrandBackground}15` : undefined,
                    cursor: 'pointer',
                  }}
                  onClick={() => { setSelectedDate(day); setView('day'); }}
                >
                  <Text size={100} weight={isToday ? 'bold' : 'regular'}
                    style={{ color: isToday ? tokens.colorBrandBackground : undefined }}>
                    {new Date(day + 'T12:00:00').getDate()}
                  </Text>
                  {items.slice(0, 2).map((item) => (
                    <div key={item.id} style={{
                      fontSize: 10, padding: '1px 4px', borderRadius: 3, marginTop: 2,
                      background: tokens.colorBrandBackground, color: '#fff',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {item.title}
                    </div>
                  ))}
                  {items.length > 2 && (
                    <Text size={100} style={{ color: tokens.colorNeutralForeground2 }}>+{items.length - 2}</Text>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
