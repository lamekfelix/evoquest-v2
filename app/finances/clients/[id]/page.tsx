'use client';

import { use, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Text, Button, Badge, Card,
  Dialog, DialogSurface, DialogTitle, DialogBody,
  makeStyles, tokens,
} from '@fluentui/react-components';
import { ArrowLeftRegular, EditRegular } from '@fluentui/react-icons';
import { useAppStore } from '@/store/useAppStore';
import { ClientForm } from '@/components/finances/ClientForm';
import { InvoiceStatusBadge } from '@/components/finances/InvoiceStatusBadge';
import { formatCurrency, calcInvoiceTotals } from '@/lib/utils';
import type { Client } from '@/store/types';

const useStyles = makeStyles({
  page: { display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '860px' },
  infoGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' },
  infoRow: { display: 'flex', flexDirection: 'column', gap: '2px' },
  card: { padding: '20px', borderRadius: '10px', border: `1px solid ${tokens.colorNeutralStroke2}` },
  invRow: {
    display: 'grid', gridTemplateColumns: '100px 1fr 120px 120px 100px 110px',
    gap: '12px', alignItems: 'center', padding: '10px 0',
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
  },
});

interface PageProps { params: Promise<{ id: string }> }

export default function ClientDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const styles = useStyles();
  const router = useRouter();

  const clients = useAppStore((s) => s.clients);
  const invoices = useAppStore((s) => s.invoices);
  const updateClient = useAppStore((s) => s.updateClient);

  const client = useMemo(() => clients.find((c) => c.id === id), [clients, id]);
  const clientInvoices = useMemo(() => invoices.filter((inv) => inv.clientId === id), [invoices, id]);

  const [editOpen, setEditOpen] = useState(false);

  if (!client) {
    return (
      <div style={{ padding: '24px' }}>
        <Button appearance="subtle" icon={<ArrowLeftRegular />} onClick={() => router.push('/finances/clients')}>Voltar</Button>
        <Text block style={{ marginTop: '12px' }}>Cliente não encontrado.</Text>
      </div>
    );
  }

  const totals = clientInvoices.reduce((acc, inv) => {
    const t = calcInvoiceTotals(inv);
    return { billed: acc.billed + t.grandTotal, paid: acc.paid + t.paidTotal };
  }, { billed: 0, paid: 0 });

  function Field({ label, value }: { label: string; value?: string }) {
    return (
      <div className={styles.infoRow}>
        <Text size={100} style={{ color: tokens.colorNeutralForeground2 }}>{label}</Text>
        <Text size={300}>{value || '—'}</Text>
      </div>
    );
  }

  const addr = client.address;
  const addrStr = [addr.street, addr.number, addr.complement, addr.neighborhood, addr.city, addr.state, addr.zip]
    .filter(Boolean).join(', ');

  return (
    <div className={styles.page}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Button appearance="subtle" icon={<ArrowLeftRegular />} onClick={() => router.push('/finances/clients')}>
          Voltar a Clientes
        </Button>
      </div>

      <Card className={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <Text size={500} weight="bold" block>{client.name}</Text>
            <Badge appearance="filled" style={{ background: client.status === 'ativo' ? '#55B96B20' : '#4A445020', color: client.status === 'ativo' ? '#55B96B' : '#4A4450' }}>
              {client.status === 'ativo' ? 'Ativo' : 'Inativo'}
            </Badge>
          </div>
          <Button appearance="secondary" icon={<EditRegular />} onClick={() => setEditOpen(true)}>Editar</Button>
        </div>
        <div className={styles.infoGrid}>
          <Field label="E-mail" value={client.email} />
          <Field label="Telefone" value={client.phone} />
          <Field label="CPF / CNPJ" value={client.document} />
          <Field label="Endereço" value={addrStr || undefined} />
          {client.notes && <Field label="Observações" value={client.notes} />}
        </div>
      </Card>

      {/* Resumo financeiro */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
        {[
          { label: 'Total Faturado', value: totals.billed, color: '#5B8DD9' },
          { label: 'Total Pago', value: totals.paid, color: '#55B96B' },
          { label: 'Em Aberto', value: totals.billed - totals.paid, color: '#F4A261' },
        ].map(({ label, value, color }) => (
          <Card key={label} style={{ padding: '16px', borderRadius: '10px', border: `1px solid ${tokens.colorNeutralStroke2}` }}>
            <Text size={100} style={{ color: tokens.colorNeutralForeground2 }} block>{label}</Text>
            <Text size={500} weight="bold" style={{ color }}>{formatCurrency(value)}</Text>
          </Card>
        ))}
      </div>

      {/* Faturas */}
      <Card className={styles.card}>
        <Text size={300} weight="semibold" block style={{ marginBottom: '12px' }}>
          Faturas ({clientInvoices.length})
        </Text>
        {clientInvoices.length === 0 ? (
          <Text size={200} style={{ color: tokens.colorNeutralForeground2 }}>Nenhuma fatura para este cliente.</Text>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr 120px 120px 100px 110px', gap: '12px', paddingBottom: '8px', borderBottom: `1px solid ${tokens.colorNeutralStroke2}` }}>
              {['Número', 'Emissão / Venc.', 'Total', 'Pago', 'Status', ''].map((h) => (
                <Text key={h} size={200} weight="semibold" style={{ color: tokens.colorNeutralForeground2 }}>{h}</Text>
              ))}
            </div>
            {clientInvoices.map((inv) => {
              const t = calcInvoiceTotals(inv);
              return (
                <div key={inv.id} className={styles.invRow}>
                  <Text size={200} weight="semibold" style={{ color: tokens.colorBrandBackground }}>{inv.number}</Text>
                  <div>
                    <Text size={200} block>{inv.issueDate}</Text>
                    {inv.dueDate && <Text size={100} style={{ color: tokens.colorNeutralForeground2 }}>Vence: {inv.dueDate}</Text>}
                  </div>
                  <Text size={200} weight="semibold">{formatCurrency(t.grandTotal)}</Text>
                  <Text size={200} style={{ color: '#55B96B' }}>{formatCurrency(t.paidTotal)}</Text>
                  <InvoiceStatusBadge status={inv.status} />
                  <Button appearance="subtle" size="small" onClick={() => router.push(`/finances/invoices/${inv.id}`)}>
                    Ver
                  </Button>
                </div>
              );
            })}
          </>
        )}
      </Card>

      <Dialog open={editOpen} onOpenChange={(_, d) => { if (!d.open) setEditOpen(false); }}>
        <DialogSurface style={{ maxWidth: '600px' }}>
          <DialogTitle>Editar Cliente</DialogTitle>
          <DialogBody>
            <ClientForm
              initial={client}
              onSubmit={(data) => { updateClient(id, data); setEditOpen(false); }}
              onCancel={() => setEditOpen(false)}
            />
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </div>
  );
}
