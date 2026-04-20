'use client';

import { useState, useEffect } from 'react';
import {
  Dialog, DialogSurface, DialogTitle, DialogBody, DialogActions,
  Button, Input, Select, Textarea, Text, makeStyles, tokens,
} from '@fluentui/react-components';
import { DeleteRegular } from '@fluentui/react-icons';
import { ATTRIBUTES } from '@/store/constants';
import type { Project, ProjectStatus, AttributeKey, Area } from '@/store/types';

const PROJECT_ICONS = ['🚀','⭐','❤️','📚','💻','🎵','📷','🌍','⚡','🏆','🚩','💎','🔥','🎯','🧭','🎨','🌱','💡','🔬','🎮','🏠','🌙','🦋','🌊'];

const STATUS_OPTIONS: { key: ProjectStatus; label: string }[] = [
  { key: 'inbox', label: 'Inbox' },
  { key: 'planned', label: 'Planejado' },
  { key: 'in-progress', label: 'Em Progresso' },
  { key: 'done', label: 'Concluído' },
];

const useStyles = makeStyles({
  formField: { display: 'flex', flexDirection: 'column', gap: '4px' },
});

interface Props {
  project: Project | null;
  open: boolean;
  areas: Area[];
  onClose: () => void;
  onSave: (id: string, partial: Partial<Project>) => void;
  onDelete: (id: string) => void;
}

export function ProjectEditDialog({ project, open, areas, onClose, onSave, onDelete }: Props) {
  const styles = useStyles();
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('inbox');
  const [attr, setAttr] = useState<AttributeKey>('foco');
  const [areaId, setAreaId] = useState('');
  const [icon, setIcon] = useState('🚀');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (project) {
      setName(project.name);
      setDesc(project.description ?? '');
      setStatus(project.status);
      setAttr(project.attribute);
      setAreaId(project.areaId ?? '');
      setIcon(project.icon ?? '🚀');
      setStartDate(project.startDate ?? '');
      setEndDate(project.endDate ?? '');
    }
  }, [project]);

  function handleSave() {
    if (!project || !name.trim()) return;
    onSave(project.id, {
      name: name.trim(),
      description: desc.trim(),
      status,
      attribute: attr,
      areaId: areaId || undefined,
      icon,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });
    onClose();
  }

  function handleDelete() {
    if (!project) return;
    onDelete(project.id);
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(_, d) => !d.open && onClose()}>
      <DialogSurface style={{ maxWidth: 500 }}>
        <DialogTitle>Editar Projeto</DialogTitle>
        <DialogBody>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className={styles.formField}>
              <Text size={200}>Ícone</Text>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {PROJECT_ICONS.map((ic) => (
                  <button key={ic} onClick={() => setIcon(ic)} style={{
                    width: 30, height: 30, fontSize: 16, borderRadius: 6, cursor: 'pointer',
                    border: `2px solid ${icon === ic ? tokens.colorBrandBackground : 'transparent'}`,
                    background: tokens.colorNeutralBackground3,
                  }}>{ic}</button>
                ))}
              </div>
            </div>
            <div className={styles.formField}>
              <Text size={200}>Nome *</Text>
              <Input value={name} onChange={(_, d) => setName(d.value)} />
            </div>
            <div className={styles.formField}>
              <Text size={200}>Descrição</Text>
              <Textarea value={desc} onChange={(_, d) => setDesc(d.value)} rows={2} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className={styles.formField}>
                <Text size={200}>Status</Text>
                <Select value={status} onChange={(_, d) => setStatus(d.value as ProjectStatus)}>
                  {STATUS_OPTIONS.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
                </Select>
              </div>
              <div className={styles.formField}>
                <Text size={200}>Atributo</Text>
                <Select value={attr} onChange={(_, d) => setAttr(d.value as AttributeKey)}>
                  {ATTRIBUTES.map((a) => <option key={a.key} value={a.key}>{a.icon} {a.label}</option>)}
                </Select>
              </div>
              <div className={styles.formField}>
                <Text size={200}>Área</Text>
                <Select value={areaId} onChange={(_, d) => setAreaId(d.value)}>
                  <option value="">Nenhuma</option>
                  {areas.map((a) => <option key={a.id} value={a.id}>{a.icon} {a.name}</option>)}
                </Select>
              </div>
              <div className={styles.formField}>
                <Text size={200}>Início</Text>
                <Input type="date" value={startDate} onChange={(_, d) => setStartDate(d.value)} />
              </div>
              <div className={styles.formField}>
                <Text size={200}>Fim</Text>
                <Input type="date" value={endDate} onChange={(_, d) => setEndDate(d.value)} />
              </div>
            </div>
          </div>
        </DialogBody>
        <DialogActions>
          <Button
            appearance="subtle" icon={<DeleteRegular />}
            style={{ color: '#E05C5C', marginRight: 'auto' }}
            onClick={handleDelete}
          >
            Deletar
          </Button>
          <Button appearance="secondary" onClick={onClose}>Cancelar</Button>
          <Button appearance="primary" onClick={handleSave} disabled={!name.trim()}>Salvar</Button>
        </DialogActions>
      </DialogSurface>
    </Dialog>
  );
}
