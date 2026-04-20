'use client';

import { useState, useMemo } from 'react';
import {
  Text, Button, Input, Select, Dialog, DialogSurface, DialogTitle,
  DialogBody, DialogActions, Textarea, Checkbox, Badge, makeStyles, tokens,
} from '@fluentui/react-components';
import { AddRegular, DismissRegular } from '@fluentui/react-icons';
import { useAppStore } from '@/store/useAppStore';
import { EmptyState } from '@/components/shared/EmptyState';
import { ResourceCard } from '@/components/para/ResourceCard';
import { generateId } from '@/lib/utils';
import type { Tag, Resource } from '@/store/types';

const TAG_COLORS = ['#E05C5C', '#F4A261', '#55B96B', '#5B8DD9', '#7B68EE', '#4ECDC4', '#9B8EA8', '#8B6F47'];

const useStyles = makeStyles({
  page: { display: 'flex', flexDirection: 'column', gap: '24px' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  filters: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' },
  formField: { display: 'flex', flexDirection: 'column', gap: '4px' },
  tagRow: { display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '4px' },
  tagInput: { display: 'flex', gap: '6px', alignItems: 'center' },
  colorDot: { width: '20px', height: '20px', borderRadius: '50%', cursor: 'pointer', border: '2px solid transparent', flexShrink: 0 },
  projectList: { display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '140px', overflowY: 'auto' },
});

const emptyForm = { name: '', description: '', link: '', areaId: '', projectIds: [] as string[], tags: [] as Tag[] };

export default function ResourcesPage() {
  const styles = useStyles();
  const resources = useAppStore((s) => s.resources);
  const areas = useAppStore((s) => s.areas);
  const projects = useAppStore((s) => s.projects);
  const addResource = useAppStore((s) => s.addResource);
  const updateResource = useAppStore((s) => s.updateResource);
  const deleteResource = useAppStore((s) => s.deleteResource);
  const archiveResource = useAppStore((s) => s.archiveResource);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Resource | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [tagName, setTagName] = useState('');
  const [tagColor, setTagColor] = useState(TAG_COLORS[0]);
  const [search, setSearch] = useState('');
  const [filterArea, setFilterArea] = useState('');

  function openCreate() {
    setEditing(null); setForm(emptyForm); setTagName(''); setOpen(true);
  }
  function openEdit(r: Resource) {
    setEditing(r);
    setForm({ name: r.name, description: r.description ?? '', link: r.link ?? '', areaId: r.areaId ?? '', projectIds: r.projectIds, tags: r.tags });
    setTagName(''); setOpen(true);
  }

  function addTag() {
    if (!tagName.trim()) return;
    const tag: Tag = { id: generateId(), name: tagName.trim(), color: tagColor };
    setForm((f) => ({ ...f, tags: [...f.tags, tag] }));
    setTagName('');
  }
  function removeTag(id: string) { setForm((f) => ({ ...f, tags: f.tags.filter((t) => t.id !== id) })); }

  function toggleProject(id: string) {
    setForm((f) => ({
      ...f,
      projectIds: f.projectIds.includes(id) ? f.projectIds.filter((x) => x !== id) : [...f.projectIds, id],
    }));
  }

  function handleSave() {
    if (!form.name.trim()) return;
    const data = {
      name: form.name.trim(), description: form.description.trim() || undefined,
      link: form.link.trim() || undefined, areaId: form.areaId || undefined,
      projectIds: form.projectIds, tags: form.tags,
    };
    if (editing) updateResource(editing.id, data);
    else addResource(data);
    setOpen(false);
  }

  const filtered = useMemo(() => resources.filter((r) => {
    if (search && !r.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterArea && r.areaId !== filterArea) return false;
    return true;
  }), [resources, search, filterArea]);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <Text size={600} weight="bold">Resources</Text>
          <Text block size={300} style={{ color: tokens.colorNeutralForeground2 }}>
            Materiais de referência — links, notas, documentos
          </Text>
        </div>
        <Button appearance="primary" icon={<AddRegular />} onClick={openCreate}>Novo Resource</Button>
      </div>

      <div className={styles.filters}>
        <Input placeholder="Buscar por nome..." value={search} onChange={(_, d) => setSearch(d.value)} style={{ width: 220 }} />
        <Select value={filterArea} onChange={(_, d) => setFilterArea(d.value)} style={{ width: 180 }}>
          <option value="">Todas as áreas</option>
          {areas.map((a) => <option key={a.id} value={a.id}>{a.icon} {a.name}</option>)}
        </Select>
      </div>

      {/* Dialog criar/editar */}
      <Dialog open={open} onOpenChange={(_, d) => setOpen(d.open)}>
        <DialogSurface style={{ maxWidth: 500 }}>
          <DialogTitle>{editing ? 'Editar Resource' : 'Novo Resource'}</DialogTitle>
          <DialogBody>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className={styles.formField}>
                <Text size={200}>Nome *</Text>
                <Input value={form.name} onChange={(_, d) => setForm((f) => ({ ...f, name: d.value }))} />
              </div>
              <div className={styles.formField}>
                <Text size={200}>Descrição</Text>
                <Textarea value={form.description} onChange={(_, d) => setForm((f) => ({ ...f, description: d.value }))} rows={2} />
              </div>
              <div className={styles.formField}>
                <Text size={200}>Link (URL)</Text>
                <Input type="url" value={form.link} onChange={(_, d) => setForm((f) => ({ ...f, link: d.value }))} placeholder="https://..." />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className={styles.formField}>
                  <Text size={200}>Área</Text>
                  <Select value={form.areaId} onChange={(_, d) => setForm((f) => ({ ...f, areaId: d.value }))}>
                    <option value="">Nenhuma</option>
                    {areas.map((a) => <option key={a.id} value={a.id}>{a.icon} {a.name}</option>)}
                  </Select>
                </div>
              </div>
              <div className={styles.formField}>
                <Text size={200}>Projetos relacionados</Text>
                <div className={styles.projectList}>
                  {projects.length === 0
                    ? <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>Nenhum projeto criado</Text>
                    : projects.map((p) => (
                      <Checkbox key={p.id} label={p.name} checked={form.projectIds.includes(p.id)}
                        onChange={() => toggleProject(p.id)} />
                    ))}
                </div>
              </div>
              <div className={styles.formField}>
                <Text size={200}>Tags</Text>
                <div className={styles.tagRow}>
                  {form.tags.map((t) => (
                    <Badge key={t.id} appearance="filled" size="small" style={{ background: t.color, color: '#fff', gap: 4 }}>
                      {t.name}
                      <button onClick={() => removeTag(t.id)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 0, lineHeight: 1 }}>
                        <DismissRegular style={{ fontSize: 10 }} />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className={styles.tagInput}>
                  <Input size="small" value={tagName} onChange={(_, d) => setTagName(d.value)}
                    placeholder="Nome da tag" style={{ flex: 1 }}
                    onKeyDown={(e) => e.key === 'Enter' && addTag()} />
                  {TAG_COLORS.map((c) => (
                    <button key={c} className={styles.colorDot}
                      style={{ background: c, borderColor: tagColor === c ? '#fff' : 'transparent', boxShadow: tagColor === c ? `0 0 0 2px ${c}` : 'none' }}
                      onClick={() => setTagColor(c)} />
                  ))}
                  <Button size="small" onClick={addTag} disabled={!tagName.trim()}>+</Button>
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

      {resources.length === 0 ? (
        <EmptyState icon="📚" title="Nenhum resource ainda"
          description="Resources são materiais de referência: links, artigos, notas, documentos."
          action={<Button appearance="primary" icon={<AddRegular />} onClick={openCreate}>Criar Resource</Button>} />
      ) : filtered.length === 0 ? (
        <EmptyState icon="🔍" title="Nenhum resultado" description="Tente outros filtros ou termos de busca." />
      ) : (
        <div className={styles.grid}>
          {filtered.map((r) => (
            <ResourceCard key={r.id} resource={r} areas={areas} projects={projects}
              onEdit={() => openEdit(r)}
              onDelete={() => deleteResource(r.id)}
              onArchive={() => archiveResource(r.id)} />
          ))}
        </div>
      )}
    </div>
  );
}
