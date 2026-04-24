'use client';

import { use, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Text, Button, Card, Input,
  Dialog, DialogSurface, DialogTitle, DialogBody, DialogActions,
  makeStyles, tokens,
} from '@fluentui/react-components';
import {
  ArrowLeftRegular, CheckmarkCircleRegular, SendRegular,
  DismissRegular, CopyRegular, DeleteRegular, AddRegular,
} from '@fluentui/react-icons';
import { useAppStore } from '@/store/useAppStore';
import { InvoiceStatusBadge } from '@/components/finances/InvoiceStatusBadge';
import { formatCurrency, calcInvoiceTotals, dateISO } from '@/lib/utils';

const useStyles = makeStyles({
  page: { display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '900px' },
  card: { padding: '20px', borderRadius: '10px', border: `1px solid ${tokens.colorNeutralStroke2}` },
  itemRow: {
    display: 'grid',
    gridTemplateColumns: '2fr 70px 120px 80px 120px',
    gap: '12px', alignItems: 'center', padding: '10px 0',
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  infoGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' },
  totalsRow: { display: 'flex', justifyContent: 'space-between', padding: '4px 0' },
});

interface PageProps { params: Promise<{ id: string }> }

export default function InvoiceDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const styles = useStyles();
  const router = useRouter();

  const invoices = useAppStore((s) => s.invoices);
  const updateInvoiceStatus = useAppStore((s) => s.updateInvoiceStatus);
  const addInvoicePayment = useAppStore((s) => s.addInvoicePayment);
  const duplicateInvoice = useAppStore((s) => s.duplicateInvoice);
  const deleteInvoice = useAppStore((s) => s.deleteInvoice);

  const invoice = useMemo(() => invoices.find((i) => i.id === id), [invoices, id]);
  const [payOpen, setPayOpen] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [payDate, setPayDate] = useState(dateISO());
  const [payNotes, setPayNotes] = useState('');

  if (!invoice) {
    return (
      <div style={{ padding: '24px' }}>
        <Button appearance="subtle" icon={<ArrowLeftRegular />} onClick={() => router.push('/finances/invoices')}>Voltar</Button>
        <Text block style={{ marginTop: '12px' }}>Fatura não encontrada.</Text>
      </div>
    );
  }

  const { subtotal, taxTotal, grandTotal, paidTotal, balance } = calcInvoiceTotals(invoice);

  function handleAddPayment() {
    const amount = parseFloat(payAmount.replace(',', '.'));
    if (!amount || amount <= 0) return;
    addInvoicePayment(id, { date: payDate, amount, notes: payNotes.trim() || undefined });
    setPayOpen(false);
    setPayAmount('');
    setPayNotes('');
  }

  function handleDuplicate() {
    duplicateInvoice(id);
    router.push('/finances/invoices');
  }

  function handleDelete() {
    deleteInvoice(id);
    router.push('/finances/invoices');
  }

  return (
    <div className={styles.page}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Button appearance="subtle" icon={<ArrowLeftRegular />} onClick={() => router.push('/finances/invoices')}>
          Voltar a Faturas
        </Button>
        <div style={{ display: 'flex', gap: '8px' }}>
          {invoice.status !== 'paga' && invoice.status !== 'cancelada' && (
            <>
              {invoice.status === 'rascunho' && (
                <Button appearance="secondary" icon={<SendRegular />} onClick={() => updateInvoiceStatus(id, 'enviada')}>
                  Enviar
                </Button>
              )}
              <Button appearance="secondary" icon={<AddRegular />} onClick={() => setPayOpen(true)}>
                Registrar Pagamento
              </Button>
              <Button appearance="primary" icon={<CheckmarkCircleRegular />} onClick={() => updateInvoiceStatus(id, 'paga')}>
                Marcar como Paga
              </Button>
            </>
          )}
          {invoice.status !== 'cancelada' && invoice.status !== 'paga' && (
            <Button appearance="subtle" icon={<DismissRegular />} onClick={() => updateInvoiceStatus(id, 'cancelada')}>
              Cancelar
            </Button>
          )}
          <Button appearance="subtle" icon={<CopyRegular />} onClick={handleDuplicate}>Duplicar</Button>
          <Button appearance="subtle" icon={<DeleteRegular />} onClick={handleDelete} />
        </div>
      </div>

      {/* Header */}
      <Card className={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <Text size={500} weight="bold" block>{invoice.number}</Text>
            <Text size={300} style={{ color: tokens.colorNeutralForeground2 }}>{invoice.clientName}</Text>
          </div>
          <InvoiceStatusBadge status={invoice.status} />
        </div>
        <div className={styles.infoGrid}>
          <div>
            <Text size={100} style={{ color: tokens.colorNeutralForeground2 }} block>Data de Emissão</Text>
            <Text size={300}>{invoice.issueDate}</Text>
          </div>
          <div>
            <Text size={100} style={{ color: tokens.colorNeutralForeground2 }} block>Data de Vencimento</Text>
            <Text size={300} style={{ color: invoice.status === 'vencida' ? '#E05C5C' : undefined }}>
              {invoice.dueDate || '—'}
            </Text>
          </div>
          <div>
            <Text size={100} style={{ color: tokens.colorNeutralForeground2 }} block>Saldo em Aberto</Text>
            <Text size={300} weight="bold" style={{ color: balance > 0 ? '#F4A261' : '#55B96B' }}>
              {formatCurrency(balance)}
            </Text>
          </div>
        </div>
        {invoice.notes && (
          <div style={{ marginTop: '12px', padding: '10px 14px', background: tokens.colorNeutralBackground2, borderRadius: '8px' }}>
            <Text size={200} style={{ color: tokens.colorNeutralForeground2 }}>{invoice.notes}</Text>
          </div>
        )}
      </Card>

      {/* Items */}
      <Card className={styles.card}>
        <Text size={300} weight="semibold" block style={{ marginBottom: '12px' }}>Itens</Text>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 70px 120px 80px 120px', gap: '12px', paddingBottom: '8px', borderBottom: `1px solid ${tokens.colorNeutralStroke2}` }}>
          {['Descrição', 'Qtd', 'Preço Unit.', 'Imposto', 'Total'].map((h) => (
            <Text key={h} size={200} weight="semibold" style={{ color: tokens.colorNeutralForeground2 }}>{h}</Text>
          ))}
        </div>
        {invoice.items.map((item) => {
          const itemSubtotal = item.quantity * item.unitPrice;
          const itemTax = itemSubtotal * (item.taxRate / 100);
          return (
            <div key={item.id} className={styles.itemRow}>
              <Text size={300}>{item.description}</Text>
              <Text size={200}>{item.quantity}</Text>
              <Text size={200}>{formatCurrency(item.unitPrice)}</Text>
              <Text size={200}>{item.taxRate}%</Text>
              <Text size={300} weight="semibold">{formatCurrency(itemSubtotal + itemTax)}</Text>
            </div>
          );
        })}
        <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end' }}>
          <div className={styles.totalsRow} style={{ width: '280px' }}>
            <Text size={200}>Subtotal</Text><Text size={200}>{formatCurrency(subtotal)}</Text>
          </div>
          <div className={styles.totalsRow} style={{ width: '280px' }}>
            <Text size={200}>Impostos</Text><Text size={200}>{formatCurrency(taxTotal)}</Text>
          </div>
          {invoice.discount > 0 && (
            <div className={styles.totalsRow} style={{ width: '280px' }}>
              <Text size={200}>Desconto</Text><Text size={200} style={{ color: '#55B96B' }}>-{formatCurrency(invoice.discount)}</Text>
            </div>
          )}
          <div className={styles.totalsRow} style={{ width: '280px', borderTop: `1px solid ${tokens.colorNeutralStroke2}`, paddingTop: '8px' }}>
            <Text size={300} weight="bold">Total</Text>
            <Text size={300} weight="bold" style={{ color: tokens.colorBrandBackground }}>{formatCurrency(grandTotal)}</Text>
          </div>
        </div>
      </Card>

      {/* Pagamentos */}
      <Card className={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <Text size={300} weight="semibold">
            Pagamentos ({formatCurrency(paidTotal)} de {formatCurrency(grandTotal)})
          </Text>
          {invoice.status !== 'cancelada' && (
            <Button appearance="secondary" size="small" icon={<AddRegular />} onClick={() => setPayOpen(true)}>
              Registrar
            </Button>
          )}
        </div>
        {invoice.payments.length === 0 ? (
          <Text size={200} style={{ color: tokens.colorNeutralForeground2 }}>Nenhum pagamento registrado.</Text>
        ) : (
          invoice.payments.map((pay) => (
            <div key={pay.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: `1px solid ${tokens.colorNeutralStroke2}` }}>
              <div>
                <Text size={300} weight="semibold" block style={{ color: '#55B96B' }}>{formatCurrency(pay.amount)}</Text>
                {pay.notes && <Text size={100} style={{ color: tokens.colorNeutralForeground2 }}>{pay.notes}</Text>}
              </div>
              <Text size={200} style={{ color: tokens.colorNeutralForeground2 }}>{pay.date}</Text>
            </div>
          ))
        )}
      </Card>

      {/* Dialog pagamento */}
      <Dialog open={payOpen} onOpenChange={(_, d) => { if (!d.open) setPayOpen(false); }}>
        <DialogSurface style={{ maxWidth: '400px' }}>
          <DialogTitle>Registrar Pagamento</DialogTitle>
          <DialogBody>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <Text size={200}>Valor R$ *</Text>
                <Input value={payAmount} onChange={(_, d) => setPayAmount(d.value)}
                  placeholder={formatCurrency(balance)} contentBefore={<Text size={100}>R$</Text>} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <Text size={200}>Data</Text>
                <Input type="date" value={payDate} onChange={(_, d) => setPayDate(d.value)} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <Text size={200}>Observações</Text>
                <Input value={payNotes} onChange={(_, d) => setPayNotes(d.value)} placeholder="Método, referência..." />
              </div>
            </div>
          </DialogBody>
          <DialogActions>
            <Button appearance="secondary" onClick={() => setPayOpen(false)}>Cancelar</Button>
            <Button appearance="primary" onClick={handleAddPayment} disabled={!payAmount}>Registrar</Button>
          </DialogActions>
        </DialogSurface>
      </Dialog>
    </div>
  );
}
