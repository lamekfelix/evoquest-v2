'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Text, Button, Card, Tab, TabList,
  Dialog, DialogSurface, DialogTitle, DialogBody, DialogActions,
  Input, Select, Textarea, Badge, makeStyles, tokens,
} from '@fluentui/react-components';
import { AddRegular, DeleteRegular, ArchiveRegular, EditRegular } from '@fluentui/react-icons';
import { useAppStore } from '@/store/useAppStore';
import { EmptyState } from '@/components/shared/EmptyState';
import { ProjectEditDialog } from '@/components/projects/ProjectEditDialog';
import { ATTRIBUTES } from '@/store/constants';
import { dateISO } from '@/lib/utils';
import type { AttributeKey, ProjectStatus, Project } from '@/store/types';

const useStyles = makeStyles({
  page: { display: 'flex', flexDirection: 'column', gap: '24px' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  kanban: { display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '8px' },
  column: {
    minWidth: '250px', flex: '0 0 250px',
    display: 'flex', flexDirection: 'column', gap: '8px',
  },
  colHeader: {
    padding: '8px 12px', borderRadius: '8px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  projectCard: {
    padding: '12px', borderRadius: '8px',
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    display: 'flex', flexDirection: 'column', gap: '8px',
    cursor: 'pointer',
  },
  formField: { display: 'flex', flexDirection: 'column', gap: '4px' },
  listGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' },
});

const PROJECT_ICONS = ['🚀','⭐','❤️','📚','💻','🎵','📷','🌍','⚡','🏆','🚩','💎','🔥','🎯','🧭','🎨','🌱','💡','🔬','🎮','🏠','🌙','🦋','🌊'];

const COLUMNS: { key: ProjectStatus; label: string; color: string }[] = [
  { key: 'inbox', label: 'Inbox', color: '#9B8EA8' },
  { key: 'planned', label: 'Planejado', color: '#5B8DD9' },
  { key: 'in-progress', label: 'Em Progresso', color: '#F4A261' },
  { key: 'done', label: 'Concluído', color: '#55B96B' },
];

export default function ProjectsPage() {
  const styles = useStyles();
  const projects = useAppStore((s) => s.projects);
  const tasks = useAppStore((s) => s.tasks);
  const areas = useAppStore((s) => s.areas);
  const addProject = useAppStore((s) => s.addProject);
  const updateProject = useAppStore((s) => s.updateProject);
  const deleteProject = useAppStore((s) => s.deleteProject);
  const updateProjectStatus = useAppStore((s) => s.updateProjectStatus);
  const archiveProject = useAppStore((s) => s.archiveProject);

  const [view, setView] = useState<'kanban' | 'list'>('kanban');
  const [open, setOpen] = useState(false);
  const [pName, setPName] = useState('');
  const [pDesc, setPDesc] = useState('');
  const [pStatus, setPStatus] = useState<ProjectStatus>('inbox');
  const [pAttr, setPAttr] = useState<AttributeKey>('foco');
  const [pAreaId, setPAreaId] = useState('');
  const [pIcon, setPIcon] = useState('🚀');
  const [pStart, setPStart] = useState('');
  const [pEnd, setPEnd] = useState('');

  const [editingProject, setEditingProject] = useState<Project | null>(null);

  function handleAdd() {
    if (!pName.trim()) return;
    addProject({
      name: pName.trim(),
      description: pDesc.trim(),
      status: pStatus,
      attribute: pAttr,
      icon: pIcon,
      areaId: pAreaId || undefined,
      startDate: pStart || undefined,
      endDate: pEnd || undefined,
    });
    setPName(''); setPDesc(''); setPAreaId(''); setPIcon('🚀'); setPStart(''); setPEnd('');
    setOpen(false);
  }

  function statusLabel(status: ProjectStatus) {
    return COLUMNS.find((c) => c.key === status)?.label ?? status;
  }

  function statusColor(status: ProjectStatus) {
    return COLUMNS.find((c) => c.key === status)?.color ?? tokens.colorBrandBackground;
  }

  const today = dateISO();

  function taskProgress(projectId: string) {
    const pt = tasks.filter((t) => t.projectId === projectId);
    if (!pt.length) return { pct: 0, label: '0/0' };
    const done = pt.filter((t) => t.status === 'done').length;
    return { pct: Math.round((done / pt.length) * 100), label: `${done}/${pt.length}` };
  }

  function ProjectCardActions({ p }: { p: Project }) {
    return (
      <div style={{ display: 'flex', gap: 2 }}>
        <Button appearance="subtle" size="small" icon={<EditRegular />}
          onClick={(e) => { e.preventDefault(); setEditingProject(p); }} title="Editar" />
        <Button appearance="subtle" size="small" icon={<ArchiveRegular />}
          onClick={(e) => { e.preventDefault(); archiveProject(p.id); }} title="Arquivar" />
        <Button appearance="subtle" size="small" icon={<DeleteRegular />}
          onClick={(e) => { e.preventDefault(); deleteProject(p.id); }} />
      </div>
    );
  }

  function ProgressBar({ projectId, attrColor }: { projectId: string; attrColor: string }) {
    const { pct, label } = taskProgress(projectId);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div style={{ height: 4, borderRadius: 2, background: tokens.colorNeutralBackground3, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: pct === 100 ? '#55B96B' : attrColor, borderRadius: 2 }} />
        </div>
        <Text size={100} style={{ color: pct === 100 ? '#55B96B' : tokens.colorNeutralForeground2 }}>{label} · {pct}%</Text>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <Text size={600} weight="bold">Projetos</Text>
          <Text block size={300} style={{ color: tokens.colorNeutralForeground2 }}>
            {projects.length} projeto{projects.length !== 1 ? 's' : ''} no total
          </Text>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <TabList selectedValue={view} onTabSelect={(_, d) => setView(d.value as 'kanban' | 'list')} size="small">
            <Tab value="kanban">Kanban</Tab>
            <Tab value="list">Lista</Tab>
          </TabList>
          <Button appearance="primary" icon={<AddRegular />} onClick={() => setOpen(true)}>
            Novo Projeto
          </Button>
        </div>
      </div>

      {/* Dialog criar projeto */}
      <Dialog open={open} onOpenChange={(_, d) => setOpen(d.open)}>
        <DialogSurface style={{ maxWidth: 480 }}>
          <DialogTitle>Novo Projeto</DialogTitle>
          <DialogBody>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className={styles.formField}>
                <Text size={200}>Ícone</Text>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {PROJECT_ICONS.map((ic) => (
                    <button key={ic} onClick={() => setPIcon(ic)} style={{
                      width: 30, height: 30, fontSize: 16, borderRadius: 6, cursor: 'pointer',
                      border: `2px solid ${pIcon === ic ? tokens.colorBrandBackground : 'transparent'}`,
                      background: tokens.colorNeutralBackground3,
                    }}>{ic}</button>
                  ))}
                </div>
              </div>
              <div className={styles.formField}>
                <Text size={200}>Nome *</Text>
                <Input placeholder="Nome do projeto" value={pName} onChange={(_, d) => setPName(d.value)} />
              </div>
              <div className={styles.formField}>
                <Text size={200}>Descrição</Text>
                <Textarea placeholder="Descreva o projeto..." value={pDesc} onChange={(_, d) => setPDesc(d.value)} rows={3} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className={styles.formField}>
                  <Text size={200}>Status</Text>
                  <Select value={pStatus} onChange={(_, d) => setPStatus(d.value as ProjectStatus)}>
                    {COLUMNS.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
                  </Select>
                </div>
                <div className={styles.formField}>
                  <Text size={200}>Atributo</Text>
                  <Select value={pAttr} onChange={(_, d) => setPAttr(d.value as AttributeKey)}>
                    {ATTRIBUTES.map((a) => <option key={a.key} value={a.key}>{a.icon} {a.label}</option>)}
                  </Select>
                </div>
                <div className={styles.formField}>
                  <Text size={200}>Área</Text>
                  <Select value={pAreaId} onChange={(_, d) => setPAreaId(d.value)}>
                    <option value="">Nenhuma</option>
                    {areas.map((a) => <option key={a.id} value={a.id}>{a.icon} {a.name}</option>)}
                  </Select>
                </div>
                <div className={styles.formField}>
                  <Text size={200}>Início</Text>
                  <Input type="date" value={pStart} onChange={(_, d) => setPStart(d.value)} />
                </div>
                <div className={styles.formField}>
                  <Text size={200}>Fim</Text>
                  <Input type="date" value={pEnd} onChange={(_, d) => setPEnd(d.value)} />
                </div>
              </div>
            </div>
          </DialogBody>
          <DialogActions>
            <Button appearance="secondary" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button appearance="primary" onClick={handleAdd} disabled={!pName.trim()}>Criar</Button>
          </DialogActions>
        </DialogSurface>
      </Dialog>

      {/* Dialog editar projeto */}
      <ProjectEditDialog
        project={editingProject}
        open={editingProject !== null}
        areas={areas}
        onClose={() => setEditingProject(null)}
        onSave={updateProject}
        onDelete={deleteProject}
      />

      {projects.length === 0 ? (
        <EmptyState
          icon="📋"
          title="Nenhum projeto ainda"
          description="Crie seu primeiro projeto para organizar suas tarefas e ganhar XP."
          action={
            <Button appearance="primary" icon={<AddRegular />} onClick={() => setOpen(true)}>
              Criar Projeto
            </Button>
          }
        />
      ) : view === 'kanban' ? (
        <div className={styles.kanban}>
          {COLUMNS.map((col) => {
            const colProjects = projects.filter((p) => p.status === col.key);
            return (
              <div key={col.key} className={styles.column}>
                <div className={styles.colHeader} style={{ background: `${col.color}20` }}>
                  <Text size={300} weight="semibold" style={{ color: col.color }}>{col.label}</Text>
                  <Badge appearance="filled" style={{ background: col.color, color: '#fff' }}>
                    {colProjects.length}
                  </Badge>
                </div>
                {colProjects.map((p) => {
                  const attr = ATTRIBUTES.find((a) => a.key === p.attribute)!;
                  const done = p.todos.filter((t) => t.done).length;
                  const total = p.todos.length;
                  return (
                    <Card key={p.id} className={styles.projectCard}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Link href={`/projects/${p.id}`} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 18, flexShrink: 0 }}>{p.icon ?? '📋'}</span>
                          <Text size={300} weight="semibold" block>{p.name}</Text>
                        </Link>
                        <ProjectCardActions p={p} />
                      </div>
                      {p.description && (
                        <Text size={200} style={{ color: tokens.colorNeutralForeground2 }} truncate block>{p.description}</Text>
                      )}
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 12 }}>{attr.icon}</span>
                        <Text size={100} style={{ color: attr.color }}>{attr.label}</Text>
                        {p.areaId && areas.find((a) => a.id === p.areaId) && (
                          <Badge appearance="outline" size="small" style={{ marginLeft: 'auto' }}>
                            {areas.find((a) => a.id === p.areaId)!.icon} {areas.find((a) => a.id === p.areaId)!.name}
                          </Badge>
                        )}
                        {total > 0 && (
                          <Text size={100} style={{ marginLeft: 'auto', color: tokens.colorNeutralForeground2 }}>
                            {done}/{total} tarefas
                          </Text>
                        )}
                      </div>
                      {p.endDate && (
                        <Text size={100} style={{ color: p.endDate < today ? '#E05C5C' : tokens.colorNeutralForeground2 }}>
                          📅 {p.endDate}
                        </Text>
                      )}
                      <ProgressBar projectId={p.id} attrColor={attr.color} />
                      <Select
                        size="small"
                        value={p.status}
                        onChange={(_, d) => updateProjectStatus(p.id, d.value as ProjectStatus)}
                      >
                        {COLUMNS.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
                      </Select>
                    </Card>
                  );
                })}
              </div>
            );
          })}
        </div>
      ) : (
        <div className={styles.listGrid}>
          {projects.map((p) => {
            const attr = ATTRIBUTES.find((a) => a.key === p.attribute)!;
            const done = p.todos.filter((t) => t.done).length;
            const total = p.todos.length;
            return (
              <Card key={p.id} className={styles.projectCard} style={{ borderLeft: `4px solid ${statusColor(p.status)}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Link href={`/projects/${p.id}`} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 18, flexShrink: 0 }}>{p.icon ?? '📋'}</span>
                    <Text size={300} weight="semibold">{p.name}</Text>
                  </Link>
                  <ProjectCardActions p={p} />
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                  <Badge appearance="filled" size="small" style={{ background: statusColor(p.status), color: '#fff' }}>
                    {statusLabel(p.status)}
                  </Badge>
                  <Text size={100} style={{ color: attr.color }}>{attr.icon} {attr.label}</Text>
                  {p.areaId && areas.find((a) => a.id === p.areaId) && (
                    <Badge appearance="outline" size="small">
                      {areas.find((a) => a.id === p.areaId)!.icon} {areas.find((a) => a.id === p.areaId)!.name}
                    </Badge>
                  )}
                </div>
                <ProgressBar projectId={p.id} attrColor={attr.color} />
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
