'use client';

import { ATTRIBUTES } from '@/store/constants';
import { getAttrLevel } from '@/lib/xp';
import type { AttributeKey } from '@/store/types';

const ABBR: Record<AttributeKey, string> = {
  forca: 'FOR', inteligencia: 'INT', sabedoria: 'SAB', disciplina: 'DIS',
  foco: 'FOC', vitalidade: 'VIT', resiliencia: 'RES', equilibrio: 'EQU',
};

const SIZE = 196;
const C = SIZE / 2;
const MAX_R = 70;
const RINGS = 4;

function pt(angleDeg: number, r: number) {
  const a = (angleDeg * Math.PI) / 180;
  return { x: C + r * Math.cos(a), y: C + r * Math.sin(a) };
}

function polygon(points: { x: number; y: number }[]) {
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') + ' Z';
}

interface Props {
  attrXp: Record<AttributeKey, number>;
}

export function RadarChart({ attrXp }: Props) {
  const n = ATTRIBUTES.length;
  // start from top (-90°), clockwise
  const angles = ATTRIBUTES.map((_, i) => -90 + (360 / n) * i);

  // Background rings
  const rings = Array.from({ length: RINGS }, (_, i) => {
    const r = MAX_R * ((i + 1) / RINGS);
    return polygon(angles.map((a) => pt(a, r)));
  });

  // Spoke lines (center → vertex)
  const spokes = angles.map((a) => {
    const outer = pt(a, MAX_R);
    return `M${C},${C} L${outer.x.toFixed(1)},${outer.y.toFixed(1)}`;
  });

  // Data polygon: ratio = level / 15, min 0.06
  const dataPolygon = polygon(
    ATTRIBUTES.map((attr, i) => {
      const { level } = getAttrLevel(attrXp[attr.key as AttributeKey] ?? 0);
      const ratio = Math.max(0.06, Math.min(1, level / 15));
      return pt(angles[i], MAX_R * ratio);
    })
  );

  // Labels just outside each vertex
  const labels = ATTRIBUTES.map((attr, i) => {
    const pos = pt(angles[i], MAX_R + 16);
    return { ...pos, abbr: ABBR[attr.key as AttributeKey], color: attr.color };
  });

  return (
    <svg
      width={SIZE} height={SIZE}
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      style={{ display: 'block', margin: '0 auto' }}
      aria-label="Gráfico de atributos RPG"
    >
      {rings.map((d, i) => (
        <path key={i} d={d} fill="none" stroke="rgba(139,111,71,0.18)" strokeWidth={1} />
      ))}
      {spokes.map((d, i) => (
        <path key={i} d={d} fill="none" stroke="rgba(139,111,71,0.18)" strokeWidth={1} />
      ))}
      <path d={dataPolygon} fill="rgba(139,111,71,0.3)" stroke="#8B6F47" strokeWidth={1.5} />
      {/* Vertex dots */}
      {ATTRIBUTES.map((attr, i) => {
        const { level } = getAttrLevel(attrXp[attr.key as AttributeKey] ?? 0);
        const ratio = Math.max(0.06, Math.min(1, level / 15));
        const pos = pt(angles[i], MAX_R * ratio);
        return <circle key={i} cx={pos.x} cy={pos.y} r={3} fill={attr.color} />;
      })}
      {labels.map((l, i) => (
        <text
          key={i} x={l.x} y={l.y}
          textAnchor="middle" dominantBaseline="middle"
          fontSize={9} fontWeight="700" fill={l.color}
        >
          {l.abbr}
        </text>
      ))}
    </svg>
  );
}
