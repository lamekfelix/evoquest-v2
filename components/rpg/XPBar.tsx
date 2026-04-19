'use client';

import { Text, makeStyles, tokens } from '@fluentui/react-components';

interface XPBarProps {
  currentXp: number;
  maxXp: number;
  color?: string;
  showLabel?: boolean;
  height?: number;
}

const useStyles = makeStyles({
  track: {
    width: '100%',
    backgroundColor: tokens.colorNeutralBackground3,
    borderRadius: '4px',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.5s ease',
  },
});

export function XPBar({ currentXp, maxXp, color, showLabel = false, height = 8 }: XPBarProps) {
  const styles = useStyles();
  const percent = maxXp > 0 ? Math.min(100, Math.floor((currentXp / maxXp) * 100)) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <div className={styles.track} style={{ height }}>
        <div
          className={styles.fill}
          style={{
            width: `${percent}%`,
            height: '100%',
            backgroundColor: color ?? tokens.colorBrandBackground,
          }}
        />
      </div>
      {showLabel && (
        <Text size={100} style={{ color: tokens.colorNeutralForeground2 }}>
          {currentXp} / {maxXp} XP ({percent}%)
        </Text>
      )}
    </div>
  );
}
