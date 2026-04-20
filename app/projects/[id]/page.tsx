'use client';

import { use, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Text, Button, Input, Select, Textarea, Badge, Tab, TabList,
  Dialog, DialogSurface, DialogTitle, DialogBody, DialogActions,
  makeStyles, tokens,
} from '@fluentui/react-components';
import { AddRegular, DeleteRegular, ArrowLeftRegular, EditRegular } from '@fluentui/react-icons';
import { useAppStore } from '@/store/useAppStore';
import { ATTRIBUTES } from '@/store/constants';
import { TaskKanban } from '@/components/projects/TaskKanban';
import { TaskEditDialog } from '@/components/projects/TaskEditDialog';
import type { Task, TaskStatus } from '@/store/types';

const PROJECT_ICONS = ['🚀','⭐','❤️','📚','💻','🎵','📷','🌍','⚡','🏆','🚩','💎','🔥','🎯','🧭','🎨','🌱','💡','🔬','🎮','🏠','🌙','🦋','🌊'];

const useStyles = makeStyles({
  page: { display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '780px' },
  progressBar: { height: '8px', borderRadius: '4px', overflow: 'hidden', background: tokens.colorNeutralBackground3 },
  taskItem: {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '10px 14px', borderRadius: '8px',
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground1,
  },
  formField: { display: 'flex', flexDirection: 'column', gap: '4px' },
  iconGrid: { display: 'flex', flexWrap: 'wrap', gap: '6px' },
  iconBtn: { width: '32px', height: '32px', borderRadius: '6px', fontSize: '18px', cursor: 'pointer', border: '2px solid transparent', background: tokens.colorNeutralBackground3 },
});

interface PageProps { params: Promise<{ id: string }> }

export default function ProjectDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const styles = useStyles();
  const router = useRouter();

  const allProjects = useAppStore((s) => s.projects);
  const allTasks = useAppStore((s) => s.tasks);
  const project = useMemo(() => allProjects.find((p) => p.id === id), [allProjects, id]);
  const tasks = useMemo(() => allTasks.filter((t) => t.projectId === id), [allTasks, id]);
  const addTask = useAppStore((s) => s.addTask);
  const updateTask = useAppStore((s) => s.updateTask);
  const deleteTask = useAppStore((s) => s.deleteTask);
  const moveTaskStatus = useAppStore((s) => s.moveTaskStatus);
  const updateProjectIcon = useAppStore((s) => s.updateProjectIcon);

  const [view, setView] = useState<'list' | 'kanban'>('list');
  const [open, setOpen] = useState(false);
  const [tTitle, setTTitle] = useState('');
  const [tDesc, setTDesc] = useState('');
  const [tStart, setTStart] = useState('');
  const [tEnd, setTEnd] = useState('');
  const [tStatus, setTStatus] = useState<TaskStatus>('todo');

  const [editingTask, setEditingTask] = useState<Task | null>(null);

  if (!project) {
    return (
      <div style={{ padding: 24 }}>
        <Button appearance="subtle" icon={<ArrowLeftRegular />} onClick={() => router.push('/projects')}>Voltar</Button>
        <Text block style={{ marginTop: 12 }}>Projeto não encontrado.</Text>
      </div>
    );
  }

  const attr = ATTRIBUTES.find((a) => a.key === project.attribute)!;
  const doneTasks = tasks.filter((t) => t.status === 'done').length;
  const totalTasks = tasks.length;
  const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
  const progressColor = progress === 100 ? '#55B96B' : attr.color;

  const sortedTasks = useMemo(() =>
    [...tasks].sort((a, b) => (a.endDate ?? '9999') > (b.endDate ?? '9999') ? 1 : -1),
    [tasks]);

  function openAdd() { setTTitle(''); setTDesc(''); setTStart(''); setTEnd(''); setTStatus('todo'); setOpen(true); }

  function handleAddTask() {
    if (!tTitle.trim()) return;
    addTask({ projectId: id, title: tTitle.trim(), description: tDesc.trim() || undefined, startDate: tStart || undefined, endDate: tEnd || undefined, status: tStatus });
    setOpen(false);
  }

  function handleToggleDone(taskId: string) {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    moveTaskStatus(taskId, task.status !== 'done' ? 'done' : 'todo');
  }

  const STATUS_LABEL: Record<TaskStatus, string> = { todo: 'A Fazer', in_progress: 'Em Progresso', done: 'Concluído' };
  const STATUS_COLOR: Record<TaskStatus, string> = { todo: '#9B8EA8', in_progress: '#F4A261', done: '#55B96B' };

  return (
    <div className={styles.page}>
      <Button appearance="subtle" icon={<ArrowLeftRegular />} onClick={() => router.push('/projects')} style={{ alignSelf: 'flex-start' }}>
        Voltar a Projetos
      </Button>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 36 }}>{project.icon ?? '📋'}</span>
          <div className={styles.iconGrid} style={{ maxWidth: 200 }}>
            {PROJECT_ICONS.map((ic) => (
              <button key={ic} className={styles.iconBtn}
                style={{ borderColor: project.icon === ic ? tokens.colorBrandBackground : 'transparent' }}
                onClick={() => updateProjectIcon(project.id, ic)}>
                {ic}
              </button>
            ))}
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
            <Text size={600} weight="bold">{project.name}</Text>
            <Badge appearance="filled" style={{ background: attr.color, color: '#fff' }}>{attr.icon} {attr.label}</Badge>
          </div>
          {project.description && (
            <Text size={300} style={{ color: tokens.colorNeutralForeground2 }} block>{project.description}</Text>
          )}
          <div style={{ display: 'flex', gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
            {project.startDate && <Text size={200} style={{ color: tokens.colorNeutralForeground2 }}>📅 {project.startDate}</Text>}
            {project.endDate && <Text size={200} style={{ color: tokens.colorNeutralForeground2 }}>🏁 {project.endDate}</Text>}
          </div>
        </div>
      </div>

      {/* Progresso */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Text size={200} style={{ color: tokens.colorNeutralForeground2 }}>Progresso — {doneTasks}/{totalTasks} tasks</Text>
          <Text size={200} weight="semibold" style={{ color: progressColor }}>{progress}%</Text>
        </div>
        <div className={styles.progressBar}>
          <div style={{ height: '100%', width: `${progress}%`, background: progressColor, transition: 'width 0.4s ease', borderRadius: 4 }} />
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <TabList selectedValue={view} onTabSelect={(_, d) => setView(d.value as 'list' | 'kanban')} size="small">
          <Tab value="list">Lista</Tab>
          <Tab value="kanban">Kanban</Tab>
        </TabList>
        <Button appearance="primary" size="small" icon={<AddRegular />} onClick={openAdd}>Nova Task</Button>
      </div>

      {/* Dialog add task */}
      <Dialog open={open} onOpenChange={(_, d) => setOpen(d.open)}>
        <DialogSurface style={{ maxWidth: 460 }}>
          <DialogTitle>Nova Task</DialogTitle>
          <DialogBody>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className={styles.formField}>
                <Text size={200}>Título *</Text>
                <Input value={tTitle} onChange={(_, d) => setTTitle(d.value)} placeholder="Nome da tarefa" />
              </div>
              <div className={styles.formField}>
                <Text size={200}>Descrição</Text>
                <Textarea value={tDesc} onChange={(_, d) => setTDesc(d.value)} rows={2} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                <div className={styles.formField}>
                  <Text size={200}>Início</Text>
                  <Input type="date" value={tStart} onChange={(_, d) => setTStart(d.value)} />
                </div>
                <div className={styles.formField}>
                  <Text size={200}>Fim</Text>
                  <Input type="date" value={tEnd} onChange={(_, d) => setTEnd(d.value)} />
                </div>
                <div className={styles.formField}>
                  <Text size={200}>Status</Text>
                  <Select value={tStatus} onChange={(_, d) => setTStatus(d.value as TaskStatus)}>
                    <option value="todo">A Fazer</option>
                    <option value="in_progress">Em Progresso</option>
                    <option value="done">Concluído</option>
                  </Select>
                </div>
              </div>
            </div>
          </DialogBody>
          <DialogActions>
            <Button appearance="secondary" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button appearance="primary" onClick={handleAddTask} disabled={!tTitle.trim()}>Criar</Button>
          </DialogActions>
        </DialogSurface>
      </Dialog>

      {/* Edit task dialog */}
      <TaskEditDialog
        task={editingTask}
        open={editingTask !== null}
        onClose={() => setEditingTask(null)}
        onSave={updateTask}
      />

      {/* List view */}
      {view === 'list' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {sortedTasks.length === 0 ? (
            <Text size={300} style={{ color: tokens.colorNeutralForeground2, textAlign: 'center', padding: 24 }}>
              Nenhuma task. Clique em &quot;Nova Task&quot; para começar.
            </Text>
          ) : sortedTasks.map((task) => (
            <div key={task.id} className={styles.taskItem} style={{ opacity: task.status === 'done' ? 0.6 : 1 }}>
              <button onClick={() => handleToggleDone(task.id)} style={{
                width: 20, height: 20, borderRadius: 4, flexShrink: 0, cursor: 'pointer',
                border: `2px solid ${attr.color}`, background: task.status === 'done' ? attr.color : 'transparent',
              }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <Text size={300} style={{ textDecoration: task.status === 'done' ? 'line-through' : 'none' }} block truncate>
                  {task.title}
                </Text>
                {(task.startDate || task.endDate) && (
                  <Text size={100} style={{ color: tokens.colorNeutralForeground3 }}>
                    {task.startDate}{task.startDate && task.endDate && ' → '}{task.endDate}
                  </Text>
                )}
              </div>
              <Select
                size="small"
                value={task.status}
                onChange={(_, d) => moveTaskStatus(task.id, d.value as TaskStatus)}
                style={{ width: 120 }}
              >
                <option value="todo">A Fazer</option>
                <option value="in_progress">Em Progresso</option>
                <option value="done">Concluído</option>
              </Select>
              <Badge size="small" appearance="filled" style={{ background: STATUS_COLOR[task.status], color: '#fff', flexShrink: 0 }}>
                {STATUS_LABEL[task.status]}
              </Badge>
              {task.status === 'done' && (
                <Text size={100} style={{ color: '#55B96B', flexShrink: 0 }}>+15 XP</Text>
              )}
              <Button appearance="subtle" size="small" icon={<EditRegular />} onClick={() => setEditingTask(task)} title="Editar" />
              <Button appearance="subtle" size="small" icon={<DeleteRegular />} onClick={() => deleteTask(task.id)} />
            </div>
          ))}
        </div>
      )}

      {/* Kanban view */}
      {view === 'kanban' && (
        <TaskKanban
          tasks={tasks}
          attrColor={attr.color}
          onMove={moveTaskStatus}
          onDelete={deleteTask}
          onEdit={(task) => setEditingTask(task)}
        />
      )}
    </div>
  );
}
