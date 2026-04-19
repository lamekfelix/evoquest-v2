'use client';

import { Text, makeStyles, tokens } from '@fluentui/react-components';
import { EmptyState } from '@/components/shared/EmptyState';

const useStyles = makeStyles({
  page: { display: 'flex', flexDirection: 'column', gap: '24px' },
});

export default function ParaPage() {
  const styles = useStyles();
  return (
    <div className={styles.page}>
      <Text size={600} weight="bold">Áreas & Resources</Text>
      <Text size={300} style={{ color: tokens.colorNeutralForeground2 }}>
        Método P.A.R.A — Projects, Areas, Resources, Archives
      </Text>
      <EmptyState
        icon="📁"
        title="Em desenvolvimento"
        description="Organização por Áreas, Resources e Archives chegará em breve."
      />
    </div>
  );
}
