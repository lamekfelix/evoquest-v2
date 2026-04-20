'use client';

import { useState, useEffect } from 'react';
import {
  Dialog, DialogSurface, DialogTitle, DialogBody, DialogActions,
  Button, Input, Select, Textarea, Text, makeStyles,
} from '@fluentui/react-components';
import type { Task, TaskStatus } from '@/store/types';

const useStyles = makeStyles({
  formField: { display: 'flex', flexDirection: 'column', gap: '4px' },
});

interface Props {
  task: Task | null;
  open: boolean;
  onClose: () => void;
  onSave: (id: string, partial: Partial<Task>) => void;
}

export function TaskEditDialog({ task, open, onClose, onSave }: Props) {
  const styles = useStyles();
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState<TaskStatus>('todo');

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDesc(task.description ?? '');
      setStartDate(task.startDate ?? '');
      setEndDate(task.endDate ?? '');
      setStatus(task.status);
    }
  }, [task]);

  function handleSave() {
    if (!task || !title.trim()) return;
    onSave(task.id, {
      title: title.trim(),
      description: desc.trim() || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      status,
    });
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(_, d) => !d.open && onClose()}>
      <DialogSurface style={{ maxWidth: 460 }}>
        <DialogTitle>Editar Task</DialogTitle>
        <DialogBody>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className={styles.formField}>
              <Text size={200}>Título *</Text>
              <Input value={title} onChange={(_, d) => setTitle(d.value)} />
            </div>
            <div className={styles.formField}>
              <Text size={200}>Descrição</Text>
              <Textarea value={desc} onChange={(_, d) => setDesc(d.value)} rows={2} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
              <div className={styles.formField}>
                <Text size={200}>Início</Text>
                <Input type="date" value={startDate} onChange={(_, d) => setStartDate(d.value)} />
              </div>
              <div className={styles.formField}>
                <Text size={200}>Fim</Text>
                <Input type="date" value={endDate} onChange={(_, d) => setEndDate(d.value)} />
              </div>
              <div className={styles.formField}>
                <Text size={200}>Status</Text>
                <Select value={status} onChange={(_, d) => setStatus(d.value as TaskStatus)}>
                  <option value="todo">A Fazer</option>
                  <option value="in_progress">Em Progresso</option>
                  <option value="done">Concluído</option>
                </Select>
              </div>
            </div>
          </div>
        </DialogBody>
        <DialogActions>
          <Button appearance="secondary" onClick={onClose}>Cancelar</Button>
          <Button appearance="primary" onClick={handleSave} disabled={!title.trim()}>Salvar</Button>
        </DialogActions>
      </DialogSurface>
    </Dialog>
  );
}
