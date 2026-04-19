'use client';

import { Text, makeStyles, tokens } from '@fluentui/react-components';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px 24px',
    gap: '12px',
    textAlign: 'center',
  },
});

export function EmptyState({ icon = '📭', title, description, action }: EmptyStateProps) {
  const styles = useStyles();

  return (
    <div className={styles.container}>
      <span style={{ fontSize: 48 }}>{icon}</span>
      <Text size={400} weight="semibold">{title}</Text>
      {description && (
        <Text size={300} style={{ color: tokens.colorNeutralForeground2, maxWidth: 320 }}>
          {description}
        </Text>
      )}
      {action}
    </div>
  );
}
