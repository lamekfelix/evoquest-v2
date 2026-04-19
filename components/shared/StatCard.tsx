'use client';

import { Card, Text, makeStyles, tokens } from '@fluentui/react-components';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}

const useStyles = makeStyles({
  card: {
    padding: '16px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    borderRadius: '10px',
    border: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  iconBox: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    flexShrink: '0',
  },
  textGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
});

export function StatCard({ icon, label, value, sub, color = tokens.colorBrandBackground }: StatCardProps) {
  const styles = useStyles();

  return (
    <Card className={styles.card}>
      <div className={styles.iconBox} style={{ background: `${color}20` }}>
        <span style={{ color }}>{icon}</span>
      </div>
      <div className={styles.textGroup}>
        <Text size={100} style={{ color: tokens.colorNeutralForeground2 }}>{label}</Text>
        <Text size={500} weight="bold">{value}</Text>
        {sub && <Text size={100} style={{ color: tokens.colorNeutralForeground2 }}>{sub}</Text>}
      </div>
    </Card>
  );
}
