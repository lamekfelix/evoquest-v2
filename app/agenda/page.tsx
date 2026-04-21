'use client';

import { useState } from 'react';
import {
  Text, Button, Tab, TabList, Input,
  Popover, PopoverTrigger, PopoverSurface,
  Badge, makeStyles, tokens,
} from '@fluentui/react-components';
import { AddRegular } from '@fluentui/react-icons';
import { useAppStore } from '@/store/useAppStore';
import { EmptyState } from '@/components/shared/EmptyState';
import { ATTRIBUTES } from '@/store/constants';
import { dateISO, addDays, getStartOfWeek } from '@/lib/utils';
import type { Task, Project, AgendaItem } from '@/store/types';
import { AgendaItemDialog } from '@/components/agenda/AgendaItemDialog';
import { AgendaCard } from '@/components/agenda/AgendaCard';

const useStyles = makeStyles({
  page: { display: 'flex', flexDirection: 'column', gap: '24px' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  weekGrid: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' },
  weekDay: {
    minHeight: '120px', padding: '8px', borderRadius: '8px',
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    display: 'flex', flexDirection: 'column', gap: '4px',
  },
  dayEventDot: {
    fontSize: '11px', padding: '2px 6px', borderRadius: '4px',
    backgroundColor: tokens.colorNeutralBackground3,
    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
    cursor: 'pointer',
  },
  taskChip: {
    fontSize: '11px', padding: '2px 6px', borderRadius: '4px',
    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
    cursor: 'pointer', color: '#fff',
    borderLeft: '3px solid rgba(0,0,0,0.2)',
  },
});

const DAYS_PT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS_PT = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

function TaskPopover({ task, project }: { task: Task; project: Project | undefined }) {
  const attr = project ? ATTRIBUTES.find((a) => a.key === project.attribute) : undefined;
  const STATUS_LABEL: Record<string, string> = { todo: 'A Fazer', in_progress: 'Em Progresso', done: 'Concluído' };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 200, maxWidth: 260 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 18 }}>{project?.icon ?? '📋'}</span>
        <Text size={300} weight="semibold">{task.title}</Text>
      </div>
      {task.description && (
        <Text size={200} style={{ color: tokens.colorNeutralForeground2 }}>{task.description}</Text>
      )}
      {project && (
        <Text size={200} style={{ color: tokens.colorNeutralForeground2 }}>
          Projeto: <strong>{project.name}</strong>
        </Text>
      )}
      {attr && (
        <Badge appearance="filled" size="small" style={{ background: attr.color, color: '#fff', alignSelf: 'flex-start' }}>
          {attr.icon} {attr.label}
        </Badge>
      )}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {task.startDate && <Text size={100} style={{ color: tokens.colorNeutralForeground2 }}>📅 Início: {task.startDate}</Text>}
        {task.endDate && <Text size={100} style={{ color: tokens.colorNeutralForeground2 }}>🏁 Fim: {task.endDate}</Text>}
      </div>
      <Badge appearance="outline" size="small" style={{ alignSelf: 'flex-start' }}>
        {STATUS_LABEL[task.status]}
      </Badge>
    </div>
  );
}

export default function AgendaPage() {
  const styles = useStyles();
  const agenda = useAppStore((s) => s.agenda);
  const projects = useAppStore((s) => s.projects);
  const areas = useAppStore((s) => s.areas);
  const tasks = useAppStore((s) => s.tasks);
  const addAgendaItem = useAppStore((s) => s.addAgendaItem);
  const updateAgendaItem = useAppStore((s) => s.updateAgendaItem);
  const toggleAgendaItem = useAppStore((s) => s.toggleAgendaItem);
  const deleteAgendaItem = useAppStore((s) => s.deleteAgendaItem);

  const [view, setView] = useState<'day' | 'week' | 'month'>('day');
  const [selectedDate, setSelectedDate] = useState(dateISO());
  const [createOpen, setCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<AgendaItem | null>(null);

  const today = dateISO();

  function dayProjects(day: string) {
    return projects.filter((p) => p.startDate && p.endDate && p.startDate <= day && p.endDate >= day);
  }
  function dayTasks(day: string) {
    return tasks.filter((t) => t.status !== 'done' && (
      t.endDate === day ||
      (t.startDate && t.endDate && t.startDate <= day && t.endDate >= day) ||
      (t.startDate && !t.endDate && t.startDate === day)
    ));
  }

  const dayItems = agenda.filter((a) => a.date === selectedDate);

  const weekStart = getStartOfWeek(new Date());
  const weekDays = Array.from({ length: 7 }, (_, i) => dateISO(addDays(weekStart, i)));

  const now = new Date();
  const monthYear = { year: now.getFullYear(), month: now.getMonth() };
  const firstDay = new Date(monthYear.year, monthYear.month, 1).getDay();
  const daysInMonth = new Date(monthYear.year, monthYear.month + 1, 0).getDate();
  const monthCells: (string | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => dateISO(new Date(monthYear.year, monthYear.month, i + 1))),
  ];

  const DEFAULT_ICONS: Record<string, string> = { task: '📝', event: '📅', reminder: '🔔' };

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
          <Button appearance="primary" icon={<AddRegular />} onClick={() => setCreateOpen(true)}>
            Novo Item
          </Button>
        </div>
      </div>

      {/* Dialog criar */}
      <AgendaItemDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSave={(data) => addAgendaItem({ ...data, done: false })}
        projects={projects}
        areas={areas}
        defaultDate={selectedDate}
      />

      {/* Dialog editar */}
      <AgendaItemDialog
        open={!!editItem}
        onClose={() => setEditItem(null)}
        item={editItem}
        onSave={(data) => { if (editItem) updateAgendaItem(editItem.id, data); }}
        onDelete={() => { if (editItem) { deleteAgendaItem(editItem.id); setEditItem(null); } }}
        projects={projects}
        areas={areas}
      />

      {/* Vista Diária */}
      {view === 'day' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Input type="date" value={selectedDate} onChange={(_, d) => setSelectedDate(d.value)}
            style={{ maxWidth: 200 }} />
          {dayItems.length === 0 ? (
            <EmptyState icon="📅" title="Nenhum item neste dia" description="Adicione tarefas ou eventos para esse dia." />
          ) : (
            dayItems.map((item) => (
              <AgendaCard
                key={item.id}
                item={item}
                project={item.projectId ? projects.find((p) => p.id === item.projectId) : undefined}
                area={item.areaId ? areas.find((a) => a.id === item.areaId) : undefined}
                onToggle={() => toggleAgendaItem(item.id)}
                onEdit={() => setEditItem(item)}
                onDelete={() => deleteAgendaItem(item.id)}
              />
            ))
          )}
        </div>
      )}

      {/* Vista Semanal */}
      {view === 'week' && (
        <div className={styles.weekGrid}>
          {weekDays.map((day, i) => {
            const items = agenda.filter((a) => a.date === day);
            const wTasks = dayTasks(day);
            const isToday = day === today;
            return (
              <div key={day} className={styles.weekDay}
                style={{
                  background: isToday ? `${tokens.colorBrandBackground}10` : undefined,
                  borderColor: isToday ? tokens.colorBrandBackground : undefined,
                }}>
                <Text size={100} weight={isToday ? 'bold' : 'regular'}
                  style={{ color: isToday ? tokens.colorBrandBackground : tokens.colorNeutralForeground2 }}>
                  {DAYS_PT[i]}
                </Text>
                <Text size={300} weight={isToday ? 'bold' : 'regular'}>
                  {new Date(day + 'T12:00:00').getDate()}
                </Text>

                {wTasks.map((task) => {
                  const proj = projects.find((p) => p.id === task.projectId);
                  const attr = proj ? ATTRIBUTES.find((a) => a.key === proj.attribute) : undefined;
                  const bgColor = attr?.color ?? '#8B6F47';
                  const isMultiDay = !!(task.startDate && task.endDate && task.startDate !== task.endDate);
                  return (
                    <Popover key={task.id} withArrow positioning="below-start">
                      <PopoverTrigger>
                        <div className={styles.taskChip} style={{ background: bgColor }} title={task.title}>
                          {proj?.icon ?? '📋'} {task.title}{isMultiDay && ' ↔'}
                        </div>
                      </PopoverTrigger>
                      <PopoverSurface style={{ padding: 12 }}>
                        <TaskPopover task={task} project={proj} />
                      </PopoverSurface>
                    </Popover>
                  );
                })}

                {items.map((item) => {
                  const icon = item.icon || DEFAULT_ICONS[item.type] || '📅';
                  const areaColor = item.areaId ? areas.find((a) => a.id === item.areaId)?.color : undefined;
                  return (
                    <div
                      key={item.id}
                      className={styles.dayEventDot}
                      style={{
                        textDecoration: item.done ? 'line-through' : 'none',
                        borderLeft: areaColor ? `3px solid ${areaColor}` : undefined,
                        cursor: 'pointer',
                      }}
                      onClick={() => setEditItem(item)}
                    >
                      {icon} {item.title}
                    </div>
                  );
                })}
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
                  {dayProjects(day).slice(0, 1).map((p) => (
                    <div key={p.id} style={{
                      fontSize: 10, padding: '1px 4px', borderRadius: 3, marginTop: 2,
                      background: '#8B6F47', color: '#fff',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {p.icon ?? '📋'} {p.name}
                    </div>
                  ))}
                  {dayTasks(day).slice(0, 1).map((t) => {
                    const proj = projects.find((p) => p.id === t.projectId);
                    const attr = proj ? ATTRIBUTES.find((a) => a.key === proj.attribute) : undefined;
                    return (
                      <div key={t.id} style={{
                        fontSize: 10, padding: '1px 4px', borderRadius: 3, marginTop: 2,
                        background: attr?.color ?? '#5B8DD9', color: '#fff',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        borderLeft: '3px solid rgba(0,0,0,0.2)',
                      }}>
                        {proj?.icon ?? '✓'} {t.title}
                      </div>
                    );
                  })}
                  {items.slice(0, 1).map((item) => {
                    const icon = item.icon || DEFAULT_ICONS[item.type] || '📅';
                    const areaColor = item.areaId ? areas.find((a) => a.id === item.areaId)?.color : undefined;
                    return (
                      <div key={item.id} style={{
                        fontSize: 10, padding: '1px 4px', borderRadius: 3, marginTop: 2,
                        background: tokens.colorBrandBackground, color: '#fff',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        borderLeft: areaColor ? `3px solid ${areaColor}` : undefined,
                      }}>
                        {icon} {item.title}
                      </div>
                    );
                  })}
                  {(items.length + dayProjects(day).length + dayTasks(day).length) > 3 && (
                    <Text size={100} style={{ color: tokens.colorNeutralForeground2 }}>
                      +{items.length + dayProjects(day).length + dayTasks(day).length - 3}
                    </Text>
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
