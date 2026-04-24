'use client';

import { useState } from 'react';
import {
  Text, Button, Tab, TabList,
  makeStyles, tokens,
} from '@fluentui/react-components';
import {
  AddRegular, DeleteRegular, CopyRegular, SendRegular, CheckmarkCircleRegular,
  DismissRegular,
} from '@fluentui/react-icons';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { InvoiceStatusBadge } from '@/components/finances/InvoiceStatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { formatCurrency, calcInvoiceTotals } from '@/lib/utils';
import type { InvoiceStatus } from '@/store/types';

const useStyles = makeStyles({
  page: { display: 'flex', flexDirection: 'column', gap: '24px' },
  row: {
    display: 'grid',
    gridTemplateColumns: '100px 1fr 120px 120px 130px 110px auto',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    borderRadius: '8px',
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground1,
  },
});

type FilterStatus = 'todas' | InvoiceStatus;

export default function InvoicesPage() {
  const styles = useStyles();
  const router = useRouter();
  const invoices = useAppStore((s) => s.invoices);
  const deleteInvoice = useAppStore((s) => s.deleteInvoice);
  const updateInvoiceStatus = useAppStore((s) => s.updateInvoiceStatus);
  const duplicateInvoice = useAppStore((s) => s.duplicateInvoice);

  const [filter, setFilter] = useState<FilterStatus>('todas');

  const filtered = filter === 'todas' ? invoices : invoices.filter((inv) => inv.status === filter);
  const sorted = [...filtered].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <div className={styles.page}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <Text size={600} weight="bold">Faturas</Text>
          <Text block size={300} style={{ color: tokens.colorNeutralForeground2 }}>
            {invoices.length} fatura{invoices.length !== 1 ? 's' : ''} no total
          </Text>
        </div>
        <Link href="/finances/invoices/new">
          <Button appearance="primary" icon={<AddRegular />}>Nova Fatura</Button>
        </Link>
      </div>

      <TabList
        selectedValue={filter}
        onTabSelect={(_, d) => setFilter(d.value as FilterStatus)}
        size="small"
      >
        <Tab value="todas">Todas ({invoices.length})</Tab>
        <Tab value="rascunho">Rascunho</Tab>
        <Tab value="enviada">Enviada</Tab>
        <Tab value="paga">Paga</Tab>
        <Tab value="vencida">Vencida</Tab>
        <Tab value="cancelada">Cancelada</Tab>
      </TabList>

      {sorted.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr 120px 120px 130px 110px auto', gap: '12px', padding: '4px 16px' }}>
          {['Número', 'Cliente', 'Emissão', 'Vencimento', 'Total', 'Status', ''].map((h) => (
            <Text key={h} size={200} weight="semibold" style={{ color: tokens.colorNeutralForeground2 }}>{h}</Text>
          ))}
        </div>
      )}

      {sorted.length === 0 ? (
        <EmptyState icon="🧾" title="Nenhuma fatura" description="Crie sua primeira fatura para um cliente." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {sorted.map((inv) => {
            const { grandTotal, paidTotal } = calcInvoiceTotals(inv);
            return (
              <div key={inv.id} className={styles.row}>
                <Text
                  size={200} weight="semibold"
                  style={{ color: tokens.colorBrandBackground, cursor: 'pointer' }}
                  onClick={() => router.push(`/finances/invoices/${inv.id}`)}
                >
                  {inv.number}
                </Text>
                <div>
                  <Text size={300} weight="semibold" block>{inv.clientName}</Text>
                  {paidTotal > 0 && paidTotal < grandTotal && (
                    <Text size={100} style={{ color: '#F4A261' }}>Parcial: {formatCurrency(paidTotal)}</Text>
                  )}
                </div>
                <Text size={200}>{inv.issueDate}</Text>
                <Text size={200} style={{ color: inv.status === 'vencida' ? '#E05C5C' : undefined }}>
                  {inv.dueDate || '—'}
                </Text>
                <Text size={300} weight="bold">{formatCurrency(grandTotal)}</Text>
                <InvoiceStatusBadge status={inv.status} />
                <div style={{ display: 'flex', gap: '2px' }}>
                  {inv.status !== 'paga' && inv.status !== 'cancelada' && (
                    <Button
                      appearance="subtle" size="small" title="Marcar como paga"
                      icon={<CheckmarkCircleRegular />}
                      onClick={() => updateInvoiceStatus(inv.id, 'paga')}
                    />
                  )}
                  {inv.status === 'rascunho' && (
                    <Button
                      appearance="subtle" size="small" title="Enviar"
                      icon={<SendRegular />}
                      onClick={() => updateInvoiceStatus(inv.id, 'enviada')}
                    />
                  )}
                  {inv.status !== 'cancelada' && inv.status !== 'paga' && (
                    <Button
                      appearance="subtle" size="small" title="Cancelar"
                      icon={<DismissRegular />}
                      onClick={() => updateInvoiceStatus(inv.id, 'cancelada')}
                    />
                  )}
                  <Button
                    appearance="subtle" size="small" title="Duplicar"
                    icon={<CopyRegular />}
                    onClick={() => duplicateInvoice(inv.id)}
                  />
                  <Button
                    appearance="subtle" size="small" title="Excluir"
                    icon={<DeleteRegular />}
                    onClick={() => deleteInvoice(inv.id)}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
