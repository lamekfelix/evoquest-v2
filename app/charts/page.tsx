'use client';

import { Text, Card, makeStyles, tokens } from '@fluentui/react-components';
import { useAppStore } from '@/store/useAppStore';
import { ATTRIBUTES } from '@/store/constants';
import { getAttrLevel } from '@/lib/xp';
import type { AttributeKey } from '@/store/types';

const useStyles = makeStyles({
  page: { display: 'flex', flexDirection: 'column', gap: '24px' },
  radarWrap: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
  },
  barList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  barRow: { display: 'flex', flexDirection: 'column', gap: '4px' },
  barTrack: {
    height: '12px', borderRadius: '6px',
    backgroundColor: tokens.colorNeutralBackground3,
    overflow: 'hidden',
  },
});

export default function ChartsPage() {
  const styles = useStyles();
  const attrXp = useAppStore((s) => s.attrXp);

  const maxLevel = Math.max(...ATTRIBUTES.map((a) => getAttrLevel(attrXp[a.key as AttributeKey] ?? 0).level), 1);

  return (
    <div className={styles.page}>
      <Text size={600} weight="bold">Evolução</Text>
      <Text size={300} style={{ color: tokens.colorNeutralForeground2 }}>
        Acompanhe o crescimento dos seus atributos
      </Text>

      <Card style={{ padding: 24, borderRadius: 12, border: `1px solid ${tokens.colorNeutralStroke2}` }}>
        <Text size={400} weight="semibold" block style={{ marginBottom: 16 }}>
          📊 Nível por Atributo
        </Text>
        <div className={styles.barList}>
          {ATTRIBUTES.map((attr) => {
            const { level, progressPercent } = getAttrLevel(attrXp[attr.key as AttributeKey] ?? 0);
            const relativePercent = Math.floor((level / maxLevel) * 100);
            return (
              <div key={attr.key} className={styles.barRow}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text size={300}>
                    {attr.icon} {attr.label}
                  </Text>
                  <Text size={200} weight="semibold" style={{ color: attr.color }}>
                    Nv {level} ({progressPercent}%)
                  </Text>
                </div>
                <div className={styles.barTrack}>
                  <div style={{
                    height: '100%',
                    width: `${relativePercent}%`,
                    backgroundColor: attr.color,
                    borderRadius: 6,
                    transition: 'width 0.5s ease',
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
