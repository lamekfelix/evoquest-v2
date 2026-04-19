'use client';

import {
  Button, Text, Tooltip, Badge,
  makeStyles, tokens,
} from '@fluentui/react-components';
import {
  WeatherMoonRegular, WeatherSunnyRegular,
  AlertRegular,
} from '@fluentui/react-icons';
import { useAppStore } from '@/store/useAppStore';
import { getLevelFromXp, calcTotalXp } from '@/lib/xp';

const useStyles = makeStyles({
  header: {
    height: '56px',
    backgroundColor: tokens.colorNeutralBackground1,
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 24px',
    flexShrink: 0,
  },
  xpBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  xpTrack: {
    width: '160px',
    height: '6px',
    backgroundColor: tokens.colorNeutralBackground3,
    borderRadius: '3px',
    overflow: 'hidden',
  },
  xpFill: {
    height: '100%',
    backgroundColor: tokens.colorBrandBackground,
    borderRadius: '3px',
    transition: 'width 0.5s ease',
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
});

export function Header() {
  const styles = useStyles();
  const darkMode = useAppStore((s) => s.darkMode);
  const toggleDarkMode = useAppStore((s) => s.toggleDarkMode);
  const attrXp = useAppStore((s) => s.attrXp);
  const xpGainedToday = useAppStore((s) => s.xpGainedToday);

  const totalXp = calcTotalXp(attrXp);
  const { level, progressPercent, currentXp, xpForNextLevel } = getLevelFromXp(totalXp);

  return (
    <header className={styles.header}>
      {/* Barra de XP */}
      <div className={styles.xpBar}>
        <Badge
          appearance="filled"
          color="brand"
          style={{ background: tokens.colorBrandBackground, minWidth: 40 }}
        >
          Nv {level}
        </Badge>
        <Tooltip
          content={`${currentXp} / ${xpForNextLevel} XP para o próximo nível`}
          relationship="label"
        >
          <div className={styles.xpTrack}>
            <div className={styles.xpFill} style={{ width: `${progressPercent}%` }} />
          </div>
        </Tooltip>
        <Text size={200} style={{ color: tokens.colorNeutralForeground2 }}>
          {progressPercent}%
        </Text>
        {xpGainedToday > 0 && (
          <Text size={100} style={{ color: tokens.colorBrandBackground }}>
            +{xpGainedToday} XP hoje
          </Text>
        )}
      </div>

      {/* Ações */}
      <div className={styles.actions}>
        <Tooltip content="Notificações" relationship="label">
          <Button appearance="subtle" icon={<AlertRegular />} />
        </Tooltip>
        <Tooltip content={darkMode ? 'Modo claro' : 'Modo escuro'} relationship="label">
          <Button
            appearance="subtle"
            icon={darkMode ? <WeatherSunnyRegular /> : <WeatherMoonRegular />}
            onClick={toggleDarkMode}
          />
        </Tooltip>
      </div>
    </header>
  );
}
