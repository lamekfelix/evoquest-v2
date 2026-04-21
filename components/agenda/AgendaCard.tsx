'use client';

import { Text, Button, tokens, makeStyles } from '@fluentui/react-components';
import { DeleteRegular, EditRegular } from '@fluentui/react-icons';
import { ATTRIBUTES } from '@/store/constants';
import type { AgendaItem, Project, Area } from '@/store/types';

const DEFAULT_ICONS: Record<string, string> = { task: '📝', event: '📅', reminder: '🔔' };

const useStyles = makeStyles({
  card: {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '10px 14px', borderRadius: '8px',
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground1,
  },
  meta: {
    display: 'flex', gap: '6px', marginTop: '2px',
    alignItems: 'center', flexWrap: 'wrap',
  },
});

interface Props {
  item: AgendaItem;
  project?: Project;
  area?: Area;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function AgendaCard({ item, project, area, onToggle, onEdit, onDelete }: Props) {
  const styles = useStyles();
  const attr = item.attribute ? ATTRIBUTES.find((a) => a.key === item.attribute) : undefined;
  const icon = item.icon || DEFAULT_ICONS[item.type] || '📅';

  return (
    <div
      className={styles.card}
      style={{
        opacity: item.done ? 0.65 : 1,
        borderLeft: area?.color ? `4px solid ${area.color}` : undefined,
      }}
    >
      <button
        onClick={onToggle}
        style={{
          width: 20, height: 20,
          borderRadius: item.type === 'task' ? 4 : '50%',
          border: `2px solid ${tokens.colorBrandBackground}`,
          background: item.done ? tokens.colorBrandBackground : 'transparent',
          cursor: 'pointer', flexShrink: 0,
        }}
      />
      <span style={{ fontSize: 16, flexShrink: 0 }}>{icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <Text size={300} style={{ textDecoration: item.done ? 'line-through' : 'none' }}>
          {item.title}
        </Text>
        {(project || attr || item.description) && (
          <div className={styles.meta}>
            {project && (
              <Text size={100} style={{ color: tokens.colorNeutralForeground2 }}>
                {project.icon ?? '📋'} {project.name}
              </Text>
            )}
            {attr && (
              <Text size={100} style={{ color: attr.color }}>
                {attr.icon} {attr.label}
              </Text>
            )}
            {item.description && !project && !attr && (
              <Text size={100} style={{ color: tokens.colorNeutralForeground2 }}>
                {item.description}
              </Text>
            )}
          </div>
        )}
      </div>
      {item.startTime && (
        <Text size={100} style={{ color: tokens.colorNeutralForeground2, flexShrink: 0 }}>
          {item.startTime}{item.endTime ? ` – ${item.endTime}` : ''}
        </Text>
      )}
      <Button appearance="subtle" size="small" icon={<EditRegular />} onClick={onEdit} />
      <Button appearance="subtle" size="small" icon={<DeleteRegular />} onClick={onDelete} />
    </div>
  );
}
