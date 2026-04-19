'use client';

import { Text, makeStyles, tokens } from '@fluentui/react-components';
import { EmptyState } from '@/components/shared/EmptyState';

const useStyles = makeStyles({
  page: { display: 'flex', flexDirection: 'column', gap: '24px' },
});

export default function WorkoutPage() {
  const styles = useStyles();
  return (
    <div className={styles.page}>
      <Text size={600} weight="bold">Treino</Text>
      <Text size={300} style={{ color: tokens.colorNeutralForeground2 }}>
        Registre seus treinos e ganhe XP em Força e Vitalidade
      </Text>
      <EmptyState icon="💪" title="Em desenvolvimento" description="Tracker de treinos chegará em breve." />
    </div>
  );
}
