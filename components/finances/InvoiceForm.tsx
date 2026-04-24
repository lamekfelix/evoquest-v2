'use client';

import { useState } from 'react';
import {
  Button, Input, Select, Text, Textarea, makeStyles, tokens,
} from '@fluentui/react-components';
import { AddRegular, DeleteRegular } from '@fluentui/react-icons';
import type { Client, Product, Invoice, InvoiceItem } from '@/store/types';
import { formatCurrency, generateId, dateISO } from '@/lib/utils';

interface InvoiceFormProps {
  clients: Client[];
  products: Product[];
  initial?: Partial<Invoice>;
  onSubmit: (data: Omit<Invoice, 'id' | 'number' | 'createdAt'>, sendNow: boolean) => void;
  onCancel: () => void;
}

const useStyles = makeStyles({
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  tableHeader: {
    display: 'grid',
    gridTemplateColumns: '2fr 70px 110px 80px 110px 36px',
    gap: '6px',
    paddingBottom: '6px',
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  tableRow: {
    display: 'grid',
    gridTemplateColumns: '2fr 70px 110px 80px 110px 36px',
    gap: '6px',
    alignItems: 'start',
  },
  totals: {
    background: tokens.colorNeutralBackground2,
    borderRadius: '8px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
});

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <Text size={200}>{label}</Text>
      {children}
    </div>
  );
}

export function InvoiceForm({ clients, products, initial, onSubmit, onCancel }: InvoiceFormProps) {
  const styles = useStyles();
  const [clientId, setClientId] = useState(initial?.clientId ?? '');
  const [issueDate, setIssueDate] = useState(initial?.issueDate ?? dateISO());
  const [dueDate, setDueDate] = useState(initial?.dueDate ?? '');
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [discountStr, setDiscountStr] = useState(String(initial?.discount ?? 0));
  const [items, setItems] = useState<InvoiceItem[]>(
    initial?.items?.length
      ? initial.items
      : [{ id: generateId(), description: '', quantity: 1, unitPrice: 0, taxRate: 0 }]
  );

  const discount = parseFloat(discountStr.replace(',', '.')) || 0;
  const subtotal = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const taxTotal = items.reduce((s, i) => s + i.quantity * i.unitPrice * (i.taxRate / 100), 0);
  const grandTotal = subtotal + taxTotal - discount;

  function addItem() {
    setItems((p) => [...p, { id: generateId(), description: '', quantity: 1, unitPrice: 0, taxRate: 0 }]);
  }

  function removeItem(id: string) {
    setItems((p) => p.filter((i) => i.id !== id));
  }

  function updateItem(id: string, changes: Partial<InvoiceItem>) {
    setItems((p) => p.map((i) => (i.id === id ? { ...i, ...changes } : i)));
  }

  function selectProduct(itemId: string, productId: string) {
    const prod = products.find((p) => p.id === productId);
    if (!prod) { updateItem(itemId, { productId: undefined }); return; }
    updateItem(itemId, { productId, description: prod.name, unitPrice: prod.price, taxRate: prod.taxRate });
  }

  function handleSubmit(sendNow: boolean) {
    const client = clients.find((c) => c.id === clientId);
    if (!client || items.length === 0) return;
    onSubmit({
      clientId, clientName: client.name,
      issueDate, dueDate, items, discount, notes,
      status: sendNow ? 'enviada' : 'rascunho',
      payments: initial?.payments ?? [],
    }, sendNow);
  }

  const activeClients = clients.filter((c) => c.status === 'ativo');
  const activeProducts = products.filter((p) => p.status === 'ativo');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className={styles.grid2}>
        <Field label="Cliente *">
          <Select value={clientId} onChange={(_, d) => setClientId(d.value)}>
            <option value="">Selecione um cliente...</option>
            {activeClients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
        </Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <Field label="Emissão">
            <Input type="date" value={issueDate} onChange={(_, d) => setIssueDate(d.value)} />
          </Field>
          <Field label="Vencimento">
            <Input type="date" value={dueDate} onChange={(_, d) => setDueDate(d.value)} />
          </Field>
        </div>
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <Text size={300} weight="semibold">Itens</Text>
          <Button appearance="secondary" size="small" icon={<AddRegular />} onClick={addItem}>
            Adicionar Item
          </Button>
        </div>
        <div className={styles.tableHeader}>
          {['Descrição', 'Qtd', 'Preço Unit.', 'Imposto %', 'Total', ''].map((h) => (
            <Text key={h} size={200} weight="semibold">{h}</Text>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
          {items.map((item) => {
            const total = item.quantity * item.unitPrice * (1 + item.taxRate / 100);
            return (
              <div key={item.id} className={styles.tableRow}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  {activeProducts.length > 0 && (
                    <Select size="small" value={item.productId ?? ''} onChange={(_, d) => selectProduct(item.id, d.value)}>
                      <option value="">Produto...</option>
                      {activeProducts.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </Select>
                  )}
                  <Input size="small" placeholder="Descrição" value={item.description}
                    onChange={(_, d) => updateItem(item.id, { description: d.value })} />
                </div>
                <Input size="small" type="number" value={String(item.quantity)}
                  onChange={(_, d) => updateItem(item.id, { quantity: Math.max(1, parseFloat(d.value) || 1) })} />
                <Input size="small" type="number" value={String(item.unitPrice)}
                  onChange={(_, d) => updateItem(item.id, { unitPrice: parseFloat(d.value) || 0 })}
                  contentBefore={<Text size={100}>R$</Text>} />
                <Input size="small" type="number" value={String(item.taxRate)}
                  onChange={(_, d) => updateItem(item.id, { taxRate: parseFloat(d.value) || 0 })}
                  contentAfter={<Text size={100}>%</Text>} />
                <Text size={200} weight="semibold" style={{ paddingTop: '6px' }}>{formatCurrency(total)}</Text>
                <Button appearance="subtle" size="small" icon={<DeleteRegular />}
                  onClick={() => removeItem(item.id)} disabled={items.length === 1} />
              </div>
            );
          })}
        </div>
      </div>

      <div className={styles.grid2} style={{ alignItems: 'start' }}>
        <Field label="Observações">
          <Textarea value={notes} onChange={(_, d) => setNotes(d.value)} rows={4}
            placeholder="Condições de pagamento, notas..." />
        </Field>
        <div className={styles.totals}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Text size={200}>Subtotal</Text><Text size={200}>{formatCurrency(subtotal)}</Text>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Text size={200}>Impostos</Text><Text size={200}>{formatCurrency(taxTotal)}</Text>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text size={200}>Desconto</Text>
            <Input size="small" type="number" value={discountStr}
              onChange={(_, d) => setDiscountStr(d.value)}
              contentBefore={<Text size={100}>R$</Text>} style={{ width: '110px' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: `1px solid ${tokens.colorNeutralStroke2}`, paddingTop: '8px' }}>
            <Text size={300} weight="bold">Total</Text>
            <Text size={300} weight="bold" style={{ color: tokens.colorBrandBackground }}>{formatCurrency(grandTotal)}</Text>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
        <Button appearance="secondary" onClick={onCancel}>Cancelar</Button>
        <Button appearance="secondary" onClick={() => handleSubmit(false)} disabled={!clientId}>
          Salvar Rascunho
        </Button>
        <Button appearance="primary" onClick={() => handleSubmit(true)} disabled={!clientId}>
          Salvar e Enviar
        </Button>
      </div>
    </div>
  );
}
