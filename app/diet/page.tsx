'use client';

import { Text, makeStyles, tokens } from '@fluentui/react-components';
import { EmptyState } from '@/components/shared/EmptyState';

const useStyles = makeStyles({
  page: { display: 'flex', flexDirection: 'column', gap: '24px' },
});

export default function DietPage() {
  const styles = useStyles();
  return (
    <div className={styles.page}>
      <Text size={600} weight="bold">Dieta</Text>
      <Text size={300} style={{ color: tokens.colorNeutralForeground2 }}>
        Acompanhe sua alimentação e macros
      </Text>
      <EmptyState icon="🥗" title="Em desenvolvimento" description="Tracker de refeições e macros chegará em breve." />
    </div>
  );
}
