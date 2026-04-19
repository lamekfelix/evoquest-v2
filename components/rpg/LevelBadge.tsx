'use client';

import { Badge } from '@fluentui/react-components';
import { tokens } from '@fluentui/react-components';

interface LevelBadgeProps {
  level: number;
  size?: 'small' | 'medium' | 'large' | 'extra-large';
}

export function LevelBadge({ level, size = 'medium' }: LevelBadgeProps) {
  return (
    <Badge
      appearance="filled"
      size={size}
      style={{
        background: tokens.colorBrandBackground,
        color: '#fff',
        fontWeight: 700,
        minWidth: 36,
      }}
    >
      Nv {level}
    </Badge>
  );
}
