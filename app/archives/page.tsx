'use client';

import { useState, useMemo } from 'react';
import {
  Text, Button, Badge, Input, Tab, TabList, makeStyles, tokens,
} from '@fluentui/react-components';
import { ArrowReplyRegular, DeleteRegular } from '@fluentui/react-icons';
import { useAppStore } from '@/store/useAppStore';
import { EmptyState } from '@/components/shared/EmptyState';

const TYPE_LABELS: Record<string, { label: string; color: string; icon: string }> = {
  project:  { label: 'Projeto',  color: '#5B8DD9', icon: '📋' },
  area:     { label: 'Área',     color: '#55B96B', icon: '📁' },
  resource: { label: 'Resource', color: '#9B8EA8', icon: '📚' },
};

const useStyles = makeStyles({
  page: { display: 'flex', flexDirection: 'column', gap: '24px' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  toolbar: { display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' },
  card: {
    padding: '14px', borderRadius: '10px',
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    display: 'flex', flexDirection: 'column', gap: '10px',
    backgroundColor: tokens.colorNeutralBackground2,
  },
  cardHeader: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' },
  actions: { display: 'flex', gap: '4px', flexShrink: 0 },
  meta: { display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' },
});

type FilterType = 'all' | 'project' | 'area' | 'resource';

export default function ArchivesPage() {
  const styles = useStyles();
  const archives = useAppStore((s) => s.archives);
  const restoreFromArchive = useAppStore((s) => s.restoreFromArchive);
  const deleteFromArchive = useAppStore((s) => s.deleteFromArchive);

  const [filter, setFilter] = useState<FilterType>('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => archives.filter((a) => {
    if (filter !== 'all' && a.originalType !== filter) return false;
    if (search && !a.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [archives, filter, search]);

  const counts = useMemo(() => ({
    all: archives.length,
    project: archives.filter((a) => a.originalType === 'project').length,
    area: archives.filter((a) => a.originalType === 'area').length,
    resource: archives.filter((a) => a.originalType === 'resource').length,
  }), [archives]);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <Text size={600} weight="bold">Archives</Text>
          <Text block size={300} style={{ color: tokens.colorNeutralForeground2 }}>
            Itens inativos preservados — restaure ou delete permanentemente
          </Text>
        </div>
      </div>

      <div className={styles.toolbar}>
        <TabList selectedValue={filter} onTabSelect={(_, d) => setFilter(d.value as FilterType)} size="small">
          <Tab value="all">Todos ({counts.all})</Tab>
          <Tab value="project">Projetos ({counts.project})</Tab>
          <Tab value="area">Áreas ({counts.area})</Tab>
          <Tab value="resource">Resources ({counts.resource})</Tab>
        </TabList>
        <Input placeholder="Buscar por nome..." value={search}
          onChange={(_, d) => setSearch(d.value)} style={{ width: 220 }} />
      </div>

      {archives.length === 0 ? (
        <EmptyState icon="🗄️" title="Nenhum item arquivado"
          description="Itens arquivados de Projects, Areas ou Resources aparecerão aqui." />
      ) : filtered.length === 0 ? (
        <EmptyState icon="🔍" title="Nenhum resultado" description="Tente outros filtros." />
      ) : (
        <div className={styles.grid}>
          {filtered.map((entry) => {
            const meta = TYPE_LABELS[entry.originalType];
            return (
              <div key={entry.id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <div>
                    <Text size={300} weight="semibold" block>{meta.icon} {entry.name}</Text>
                    <Text size={100} style={{ color: tokens.colorNeutralForeground3 }}>
                      Arquivado em {entry.archivedAt}
                    </Text>
                  </div>
                  <div className={styles.actions}>
                    <Button appearance="subtle" size="small" icon={<ArrowReplyRegular />}
                      onClick={() => restoreFromArchive(entry.id)} title="Restaurar" />
                    <Button appearance="subtle" size="small" icon={<DeleteRegular />}
                      onClick={() => deleteFromArchive(entry.id)} title="Deletar permanentemente" />
                  </div>
                </div>
                <div className={styles.meta}>
                  <Badge appearance="filled" size="small"
                    style={{ background: meta.color, color: '#fff' }}>
                    {meta.label}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
