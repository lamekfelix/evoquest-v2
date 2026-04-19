'use client';

import {
  Text, Card, makeStyles, tokens,
} from '@fluentui/react-components';
import { useAppStore } from '@/store/useAppStore';
import { AttributeCard } from '@/components/rpg/AttributeCard';
import { LevelBadge } from '@/components/rpg/LevelBadge';
import { XPBar } from '@/components/rpg/XPBar';
import { ATTRIBUTES } from '@/store/constants';
import { getLevelFromXp, calcTotalXp } from '@/lib/xp';
import type { AttributeKey } from '@/store/types';

const useStyles = makeStyles({
  page: { display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px' },
  heroCard: {
    padding: '24px', borderRadius: '12px',
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    display: 'flex', gap: '24px', alignItems: 'center',
    background: `linear-gradient(135deg, ${tokens.colorNeutralBackground2}, ${tokens.colorNeutralBackground1})`,
  },
  avatar: {
    width: '80px', height: '80px', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '36px', fontWeight: '700', color: '#fff', flexShrink: '0',
  },
  attrGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' },
  statsRow: { display: 'flex', gap: '20px', flexWrap: 'wrap' },
  statItem: { display: 'flex', flexDirection: 'column', gap: '2px' },
});

export default function CharacterPage() {
  const styles = useStyles();
  const user = useAppStore((s) => s.user);
  const attrXp = useAppStore((s) => s.attrXp);
  const habits = useAppStore((s) => s.habits);
  const projects = useAppStore((s) => s.projects);

  const totalXp = calcTotalXp(attrXp);
  const { level, currentXp, xpForNextLevel, progressPercent } = getLevelFromXp(totalXp);

  const completedProjects = projects.filter((p) => p.status === 'done').length;
  const totalHabits = habits.length;
  const totalStreak = habits.reduce((s, h) => s + h.streak, 0);

  if (!user) {
    return (
      <div style={{ padding: 24 }}>
        <Text>Crie seu personagem no Dashboard primeiro.</Text>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Text size={600} weight="bold">Personagem</Text>

      {/* Hero */}
      <Card className={styles.heroCard}>
        <div className={styles.avatar} style={{ background: tokens.colorBrandBackground }}>
          {user.name[0]?.toUpperCase()}
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Text size={600} weight="bold">{user.name}</Text>
            <LevelBadge level={level} size="large" />
          </div>
          <Text size={300} style={{ color: tokens.colorNeutralForeground2 }}>{user.class}</Text>
          <div>
            <Text size={100} style={{ color: tokens.colorNeutralForeground2, marginBottom: 4, display: 'block' }}>
              XP para nível {level + 1}
            </Text>
            <XPBar currentXp={currentXp} maxXp={xpForNextLevel} height={10} showLabel />
          </div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <Text size={100} style={{ color: tokens.colorNeutralForeground2 }} block>XP Total</Text>
          <Text size={600} weight="bold">{totalXp.toLocaleString('pt-BR')}</Text>
        </div>
      </Card>

      {/* Estatísticas */}
      <Card style={{ padding: 20, borderRadius: 12, border: `1px solid ${tokens.colorNeutralStroke2}` }}>
        <Text size={400} weight="semibold" block style={{ marginBottom: 16 }}>📊 Estatísticas</Text>
        <div className={styles.statsRow}>
          <div className={styles.statItem}>
            <Text size={100} style={{ color: tokens.colorNeutralForeground2 }}>Projetos concluídos</Text>
            <Text size={500} weight="bold">{completedProjects}</Text>
          </div>
          <div className={styles.statItem}>
            <Text size={100} style={{ color: tokens.colorNeutralForeground2 }}>Hábitos ativos</Text>
            <Text size={500} weight="bold">{totalHabits}</Text>
          </div>
          <div className={styles.statItem}>
            <Text size={100} style={{ color: tokens.colorNeutralForeground2 }}>Streaks totais</Text>
            <Text size={500} weight="bold">🔥 {totalStreak}</Text>
          </div>
          <div className={styles.statItem}>
            <Text size={100} style={{ color: tokens.colorNeutralForeground2 }}>Nível atual</Text>
            <Text size={500} weight="bold">{level}</Text>
          </div>
          <div className={styles.statItem}>
            <Text size={100} style={{ color: tokens.colorNeutralForeground2 }}>Progressão</Text>
            <Text size={500} weight="bold">{progressPercent}%</Text>
          </div>
        </div>
      </Card>

      {/* Atributos */}
      <div>
        <Text size={400} weight="semibold" block style={{ marginBottom: 12 }}>⚔️ Atributos</Text>
        <div className={styles.attrGrid}>
          {ATTRIBUTES.map((attr) => (
            <AttributeCard key={attr.key} attrKey={attr.key as AttributeKey} xp={attrXp[attr.key as AttributeKey] ?? 0} />
          ))}
        </div>
      </div>
    </div>
  );
}
