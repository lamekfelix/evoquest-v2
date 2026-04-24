'use client';

import { Text } from '@fluentui/react-components';

export interface BarData {
  label: string;
  revenue: number;
  expenses: number;
}

export function FinanceBarChart({ data }: { data: BarData[] }) {
  const maxVal = Math.max(...data.flatMap((d) => [d.revenue, d.expenses]), 1);
  const h = 130;
  const bw = 14;
  const gap = 6;
  const groupW = 56;
  const svgW = data.length * groupW + 8;
  const leftPad = (groupW - bw * 2 - gap) / 2;

  return (
    <div>
      <div style={{ display: 'flex', gap: '16px', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{ width: '10px', height: '10px', background: '#55B96B', borderRadius: '2px' }} />
          <Text size={100}>Receitas</Text>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{ width: '10px', height: '10px', background: '#E05C5C', borderRadius: '2px' }} />
          <Text size={100}>Despesas</Text>
        </div>
      </div>
      <svg viewBox={`0 0 ${svgW} ${h + 24}`} style={{ width: '100%', overflow: 'visible' }}>
        {[0.25, 0.5, 0.75, 1].map((f) => (
          <line
            key={f}
            x1={0} y1={h - f * h}
            x2={svgW} y2={h - f * h}
            stroke="#E8E3DC" strokeWidth={1}
          />
        ))}
        {data.map((d, i) => {
          const gx = i * groupW + 4;
          const rx = gx + leftPad;
          const ex = rx + bw + gap;
          const rh = Math.max(2, (d.revenue / maxVal) * h);
          const eh = Math.max(d.expenses > 0 ? 2 : 0, (d.expenses / maxVal) * h);
          const cx = gx + groupW / 2;
          return (
            <g key={d.label}>
              <rect x={rx} y={h - rh} width={bw} height={rh} fill="#55B96B" rx={3} opacity={0.85} />
              <rect x={ex} y={h - eh} width={bw} height={eh} fill="#E05C5C" rx={3} opacity={0.85} />
              <text x={cx} y={h + 16} textAnchor="middle" fontSize={10} fill="#4A4450">
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
