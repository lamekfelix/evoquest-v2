'use client';

import { Card, Text, makeStyles, tokens } from '@fluentui/react-components';
import { XPBar } from './XPBar';
import { getAttrLevel } from '@/lib/xp';
import type { AttributeKey } from '@/store/types';
import { ATTRIBUTES } from '@/store/constants';

interface AttributeCardProps {
  attrKey: AttributeKey;
  xp: number;
}

const useStyles = makeStyles({
  card: {
    padding: '12px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    borderRadius: '10px',
    border: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  top: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nameRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
});

export function AttributeCard({ attrKey, xp }: AttributeCardProps) {
  const styles = useStyles();
  const attr = ATTRIBUTES.find((a) => a.key === attrKey)!;
  const { level, currentXp, xpForNextLevel } = getAttrLevel(xp);

  return (
    <Card className={styles.card} style={{ borderLeft: `4px solid ${attr.color}` }}>
      <div className={styles.top}>
        <div className={styles.nameRow}>
          <span style={{ fontSize: 20 }}>{attr.icon}</span>
          <Text size={300} weight="semibold">{attr.label}</Text>
        </div>
        <Text
          size={200}
          weight="bold"
          style={{
            background: attr.color,
            color: '#fff',
            borderRadius: '12px',
            padding: '2px 8px',
          }}
        >
          Nv {level}
        </Text>
      </div>
      <XPBar currentXp={currentXp} maxXp={xpForNextLevel} color={attr.color} height={6} />
      <Text size={100} style={{ color: tokens.colorNeutralForeground2 }}>
        {currentXp} / {xpForNextLevel} XP
      </Text>
    </Card>
  );
}
