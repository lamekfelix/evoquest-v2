'use client';

import type { InvoiceStatus } from '@/store/types';

const STATUS: Record<InvoiceStatus, { label: string; bg: string; color: string }> = {
  rascunho: { label: 'Rascunho', bg: '#9B8EA820', color: '#9B8EA8' },
  enviada:  { label: 'Enviada',  bg: '#5B8DD920', color: '#5B8DD9' },
  paga:     { label: 'Paga',     bg: '#55B96B20', color: '#55B96B' },
  vencida:  { label: 'Vencida',  bg: '#E05C5C20', color: '#E05C5C' },
  cancelada:{ label: 'Cancelada',bg: '#4A445020', color: '#4A4450' },
};

export function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  const { label, bg, color } = STATUS[status];
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 10px',
      borderRadius: '12px',
      background: bg,
      color,
      fontSize: '12px',
      fontWeight: 600,
      whiteSpace: 'nowrap',
    }}>
      {label}
    </span>
  );
}
