'use client';

import { useState, useEffect } from 'react';
import {
  Dialog, DialogSurface, DialogTitle, DialogBody, DialogActions,
  Button, Input, Select, Textarea, Text, makeStyles, tokens,
} from '@fluentui/react-components';
import { DeleteRegular } from '@fluentui/react-icons';
import { ATTRIBUTES } from '@/store/constants';
import type { AgendaItem, AgendaItemType, AttributeKey, Project, Area } from '@/store/types';

const AGENDA_ICONS = [
  '📅', '⚡', '🎯', '💡', '📝', '🔔', '🏃', '📚', '💪', '🧠',
  '🎨', '🎵', '🏠', '🌱', '⭐', '❤️', '🔬', '🎮', '💻', '🌍',
  '🧭', '🚀', '💎', '🔥',
];

const useStyles = makeStyles({
  formField: { display: 'flex', flexDirection: 'column', gap: '4px' },
  iconGrid: { display: 'flex', flexWrap: 'wrap', gap: '4px' },
});

interface FormState {
  title: string;
  description: string;
  type: AgendaItemType;
  date: string;
  startTime: string;
  endTime: string;
  icon: string;
  attribute: string;
  projectId: string;
  areaId: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (data: Omit<AgendaItem, 'id' | 'done'>) => void;
  onDelete?: () => void;
  item?: AgendaItem | null;
  projects: Project[];
  areas: Area[];
  defaultDate?: string;
}

export function AgendaItemDialog({ open, onClose, onSave, onDelete, item, projects, areas, defaultDate }: Props) {
  const styles = useStyles();
  const isEdit = !!item;

  const makeEmpty = (): FormState => ({
    title: '', description: '', type: 'task',
    date: defaultDate ?? new Date().toISOString().split('T')[0],
    startTime: '', endTime: '', icon: '', attribute: '', projectId: '', areaId: '',
  });

  const [form, setForm] = useState<FormState>(makeEmpty());

  useEffect(() => {
    if (open) {
      if (item) {
        setForm({
          title: item.title,
          description: item.description ?? '',
          type: item.type,
          date: item.date,
          startTime: item.startTime ?? '',
          endTime: item.endTime ?? '',
          icon: item.icon ?? '',
          attribute: item.attribute ?? '',
          projectId: item.projectId ?? '',
          areaId: item.areaId ?? '',
        });
      } else {
        setForm(makeEmpty());
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, item]);

  function patch<K extends keyof FormState>(key: K, val: FormState[K]) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  function handleSave() {
    if (!form.title.trim()) return;
    onSave({
      title: form.title.trim(),
      description: form.description || undefined,
      type: form.type,
      date: form.date,
      startTime: form.startTime || undefined,
      endTime: form.endTime || undefined,
      icon: form.icon || undefined,
      attribute: (form.attribute as AttributeKey) || undefined,
      projectId: form.projectId || undefined,
      areaId: form.areaId || undefined,
    });
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(_, d) => { if (!d.open) onClose(); }}>
      <DialogSurface style={{ maxWidth: 520 }}>
        <DialogTitle>{isEdit ? 'Editar Item' : 'Novo Item na Agenda'}</DialogTitle>
        <DialogBody>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className={styles.formField}>
              <Text size={200}>Título *</Text>
              <Input
                placeholder="Nome do evento/tarefa"
                value={form.title}
                onChange={(_, d) => patch('title', d.value)}
              />
            </div>
            <div className={styles.formField}>
              <Text size={200}>Descrição</Text>
              <Textarea
                placeholder="Descrição opcional..."
                value={form.description}
                onChange={(_, d) => patch('description', d.value)}
                rows={2}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className={styles.formField}>
                <Text size={200}>Tipo</Text>
                <Select value={form.type} onChange={(_, d) => patch('type', d.value as AgendaItemType)}>
                  <option value="task">Tarefa</option>
                  <option value="event">Evento</option>
                  <option value="reminder">Lembrete</option>
                </Select>
              </div>
              <div className={styles.formField}>
                <Text size={200}>Data</Text>
                <Input type="date" value={form.date} onChange={(_, d) => patch('date', d.value)} />
              </div>
              <div className={styles.formField}>
                <Text size={200}>Início</Text>
                <Input type="time" value={form.startTime} onChange={(_, d) => patch('startTime', d.value)} />
              </div>
              <div className={styles.formField}>
                <Text size={200}>Fim</Text>
                <Input type="time" value={form.endTime} onChange={(_, d) => patch('endTime', d.value)} />
              </div>
            </div>
            <div className={styles.formField}>
              <Text size={200}>Ícone</Text>
              <div className={styles.iconGrid}>
                {AGENDA_ICONS.map((ic) => (
                  <button
                    key={ic}
                    onClick={() => patch('icon', form.icon === ic ? '' : ic)}
                    style={{
                      width: 32, height: 32, fontSize: 16, borderRadius: 6, cursor: 'pointer',
                      border: `2px solid ${form.icon === ic ? tokens.colorBrandBackground : 'transparent'}`,
                      background: tokens.colorNeutralBackground3,
                    }}
                  >
                    {ic}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className={styles.formField}>
                <Text size={200}>Atributo RPG</Text>
                <Select value={form.attribute} onChange={(_, d) => patch('attribute', d.value)}>
                  <option value="">— Nenhum —</option>
                  {ATTRIBUTES.map((a) => (
                    <option key={a.key} value={a.key}>{a.icon} {a.label}</option>
                  ))}
                </Select>
              </div>
              <div className={styles.formField}>
                <Text size={200}>Projeto</Text>
                <Select value={form.projectId} onChange={(_, d) => patch('projectId', d.value)}>
                  <option value="">— Nenhum —</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.icon ?? '📋'} {p.name}</option>
                  ))}
                </Select>
              </div>
              <div className={styles.formField}>
                <Text size={200}>Área</Text>
                <Select value={form.areaId} onChange={(_, d) => patch('areaId', d.value)}>
                  <option value="">— Nenhuma —</option>
                  {areas.map((a) => (
                    <option key={a.id} value={a.id}>{a.icon ?? '📂'} {a.name}</option>
                  ))}
                </Select>
              </div>
            </div>
          </div>
        </DialogBody>
        <DialogActions>
          {onDelete && (
            <Button
              appearance="subtle"
              icon={<DeleteRegular />}
              onClick={onDelete}
              style={{ marginRight: 'auto', color: tokens.colorPaletteRedForeground1 }}
            >
              Deletar
            </Button>
          )}
          <Button appearance="secondary" onClick={onClose}>Cancelar</Button>
          <Button appearance="primary" onClick={handleSave} disabled={!form.title.trim()}>
            {isEdit ? 'Salvar' : 'Adicionar'}
          </Button>
        </DialogActions>
      </DialogSurface>
    </Dialog>
  );
}
