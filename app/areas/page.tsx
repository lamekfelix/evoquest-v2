'use client';

import { useState } from 'react';
import {
  Text, Button, Card, Badge, Dialog, DialogSurface, DialogTitle,
  DialogBody, DialogActions, Input, Textarea, makeStyles, tokens,
} from '@fluentui/react-components';
import { AddRegular, DeleteRegular, ArchiveRegular, EditRegular } from '@fluentui/react-icons';
import { useAppStore } from '@/store/useAppStore';
import { EmptyState } from '@/components/shared/EmptyState';
import type { Area } from '@/store/types';

const AREA_COLORS = [
  '#E05C5C', '#F4A261', '#55B96B', '#5B8DD9',
  '#7B68EE', '#4ECDC4', '#9B8EA8', '#8B6F47',
];
const AREA_ICONS = ['📁', '💼', '❤️', '💰', '🎓', '🏠', '🏋️', '🎯', '🌿', '⚡'];

const useStyles = makeStyles({
  page: { display: 'flex', flexDirection: 'column', gap: '24px' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' },
  card: {
    padding: '16px', borderRadius: '10px',
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    display: 'flex', flexDirection: 'column', gap: '10px',
  },
  cardHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' },
  colorRow: { display: 'flex', gap: '6px', flexWrap: 'wrap' },
  colorDot: { width: '22px', height: '22px', borderRadius: '50%', cursor: 'pointer', border: '2px solid transparent' },
  iconRow: { display: 'flex', gap: '6px', flexWrap: 'wrap' },
  iconBtn: {
    width: '30px', height: '30px', borderRadius: '6px', cursor: 'pointer', fontSize: '16px',
    background: tokens.colorNeutralBackground3, border: '2px solid transparent',
  },
  formField: { display: 'flex', flexDirection: 'column', gap: '4px' },
  actions: { display: 'flex', gap: '4px' },
});

const emptyForm = { name: '', description: '', icon: '📁', color: '#5B8DD9' };

export default function AreasPage() {
  const styles = useStyles();
  const areas = useAppStore((s) => s.areas);
  const projects = useAppStore((s) => s.projects);
  const addArea = useAppStore((s) => s.addArea);
  const updateArea = useAppStore((s) => s.updateArea);
  const deleteArea = useAppStore((s) => s.deleteArea);
  const archiveArea = useAppStore((s) => s.archiveArea);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Area | null>(null);
  const [form, setForm] = useState(emptyForm);

  function openCreate() { setEditing(null); setForm(emptyForm); setOpen(true); }
  function openEdit(area: Area) {
    setEditing(area);
    setForm({ name: area.name, description: area.description ?? '', icon: area.icon ?? '📁', color: area.color ?? '#5B8DD9' });
    setOpen(true);
  }

  function handleSave() {
    if (!form.name.trim()) return;
    if (editing) {
      updateArea(editing.id, { name: form.name.trim(), description: form.description.trim(), icon: form.icon, color: form.color });
    } else {
      addArea({ name: form.name.trim(), description: form.description.trim(), icon: form.icon, color: form.color });
    }
    setOpen(false);
  }

  function projectCount(areaId: string) {
    return projects.filter((p) => p.areaId === areaId).length;
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <Text size={600} weight="bold">Áreas</Text>
          <Text block size={300} style={{ color: tokens.colorNeutralForeground2 }}>
            Responsabilidades contínuas da sua vida
          </Text>
        </div>
        <Button appearance="primary" icon={<AddRegular />} onClick={openCreate}>Nova Área</Button>
      </div>

      <Dialog open={open} onOpenChange={(_, d) => setOpen(d.open)}>
        <DialogSurface style={{ maxWidth: 440 }}>
          <DialogTitle>{editing ? 'Editar Área' : 'Nova Área'}</DialogTitle>
          <DialogBody>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className={styles.formField}>
                <Text size={200}>Nome *</Text>
                <Input value={form.name} onChange={(_, d) => setForm((f) => ({ ...f, name: d.value }))} placeholder="Ex: Saúde, Finanças, Carreira..." />
              </div>
              <div className={styles.formField}>
                <Text size={200}>Descrição</Text>
                <Textarea value={form.description} onChange={(_, d) => setForm((f) => ({ ...f, description: d.value }))} rows={2} />
              </div>
              <div className={styles.formField}>
                <Text size={200}>Ícone</Text>
                <div className={styles.iconRow}>
                  {AREA_ICONS.map((ic) => (
                    <button key={ic} className={styles.iconBtn}
                      style={{ borderColor: form.icon === ic ? tokens.colorBrandBackground : 'transparent' }}
                      onClick={() => setForm((f) => ({ ...f, icon: ic }))}>
                      {ic}
                    </button>
                  ))}
                </div>
              </div>
              <div className={styles.formField}>
                <Text size={200}>Cor</Text>
                <div className={styles.colorRow}>
                  {AREA_COLORS.map((c) => (
                    <button key={c} className={styles.colorDot}
                      style={{ background: c, borderColor: form.color === c ? '#fff' : 'transparent', boxShadow: form.color === c ? `0 0 0 2px ${c}` : 'none' }}
                      onClick={() => setForm((f) => ({ ...f, color: c }))} />
                  ))}
                </div>
              </div>
            </div>
          </DialogBody>
          <DialogActions>
            <Button appearance="secondary" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button appearance="primary" onClick={handleSave} disabled={!form.name.trim()}>
              {editing ? 'Salvar' : 'Criar'}
            </Button>
          </DialogActions>
        </DialogSurface>
      </Dialog>

      {areas.length === 0 ? (
        <EmptyState icon="📁" title="Nenhuma área ainda"
          description="Áreas são responsabilidades contínuas: saúde, finanças, carreira, família..."
          action={<Button appearance="primary" icon={<AddRegular />} onClick={openCreate}>Criar Área</Button>} />
      ) : (
        <div className={styles.grid}>
          {areas.map((area) => {
            const count = projectCount(area.id);
            return (
              <Card key={area.id} className={styles.card} style={{ borderLeft: `4px solid ${area.color ?? '#5B8DD9'}` }}>
                <div className={styles.cardHeader}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 22 }}>{area.icon ?? '📁'}</span>
                    <Text size={400} weight="semibold">{area.name}</Text>
                  </div>
                  <div className={styles.actions}>
                    <Button appearance="subtle" size="small" icon={<EditRegular />} onClick={() => openEdit(area)} />
                    <Button appearance="subtle" size="small" icon={<ArchiveRegular />} onClick={() => archiveArea(area.id)} title="Arquivar" />
                    <Button appearance="subtle" size="small" icon={<DeleteRegular />} onClick={() => deleteArea(area.id)} />
                  </div>
                </div>
                {area.description && (
                  <Text size={200} style={{ color: tokens.colorNeutralForeground2 }}>{area.description}</Text>
                )}
                <Badge appearance="filled" style={{ background: area.color ?? '#5B8DD9', color: '#fff', alignSelf: 'flex-start' }}>
                  {count} projeto{count !== 1 ? 's' : ''}
                </Badge>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
