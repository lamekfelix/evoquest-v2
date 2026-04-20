'use client';

import {
  Text, Button, Badge, Card, makeStyles, tokens,
} from '@fluentui/react-components';
import { DeleteRegular, ArchiveRegular, EditRegular, OpenRegular } from '@fluentui/react-icons';
import type { Resource, Area, Project } from '@/store/types';

const useStyles = makeStyles({
  card: {
    padding: '14px', borderRadius: '10px',
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    display: 'flex', flexDirection: 'column', gap: '10px',
  },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' },
  actions: { display: 'flex', gap: '2px', flexShrink: 0 },
  tagRow: { display: 'flex', gap: '4px', flexWrap: 'wrap' },
  metaRow: { display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' },
});

interface Props {
  resource: Resource;
  areas: Area[];
  projects: Project[];
  onEdit: () => void;
  onDelete: () => void;
  onArchive: () => void;
}

export function ResourceCard({ resource, areas, projects, onEdit, onDelete, onArchive }: Props) {
  const styles = useStyles();
  const area = areas.find((a) => a.id === resource.areaId);
  const linkedProjects = projects.filter((p) => resource.projectIds.includes(p.id));

  return (
    <Card className={styles.card}>
      <div className={styles.header}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Text size={300} weight="semibold" block truncate>{resource.name}</Text>
          {resource.description && (
            <Text size={200} style={{ color: tokens.colorNeutralForeground2 }} truncate block>
              {resource.description}
            </Text>
          )}
        </div>
        <div className={styles.actions}>
          {resource.link && (
            <Button appearance="subtle" size="small" icon={<OpenRegular />}
              onClick={() => window.open(resource.link, '_blank')} title="Abrir link" />
          )}
          <Button appearance="subtle" size="small" icon={<EditRegular />} onClick={onEdit} />
          <Button appearance="subtle" size="small" icon={<ArchiveRegular />} onClick={onArchive} title="Arquivar" />
          <Button appearance="subtle" size="small" icon={<DeleteRegular />} onClick={onDelete} />
        </div>
      </div>

      {resource.tags.length > 0 && (
        <div className={styles.tagRow}>
          {resource.tags.map((tag) => (
            <Badge key={tag.id} appearance="filled" size="small"
              style={{ background: tag.color, color: '#fff' }}>
              {tag.name}
            </Badge>
          ))}
        </div>
      )}

      <div className={styles.metaRow}>
        {area && (
          <Badge appearance="outline" size="small"
            style={{ borderColor: area.color, color: area.color }}>
            {area.icon} {area.name}
          </Badge>
        )}
        {linkedProjects.map((p) => (
          <Badge key={p.id} appearance="filled" size="small"
            style={{ background: tokens.colorNeutralBackground3, color: tokens.colorNeutralForeground1 }}>
            📋 {p.name}
          </Badge>
        ))}
        {resource.link && (
          <Text size={100} style={{ color: tokens.colorNeutralForeground3, marginLeft: 'auto' }} truncate>
            🔗 {resource.link.replace(/^https?:\/\//, '').split('/')[0]}
          </Text>
        )}
      </div>
    </Card>
  );
}
