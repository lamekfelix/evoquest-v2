'use client';

import { useState } from 'react';
import {
  Text, Button, Badge, Input, Select, Checkbox,
  Dialog, DialogSurface, DialogTitle, DialogBody, DialogActions,
  Tab, TabList, makeStyles, tokens,
} from '@fluentui/react-components';
import { AddRegular, DeleteRegular, EditRegular } from '@fluentui/react-icons';
import { useAppStore } from '@/store/useAppStore';
import { EmptyState } from '@/components/shared/EmptyState';
import { formatCurrency, dateISO } from '@/lib/utils';
import type { Expense, ExpenseCategory } from '@/store/types';

const CATEGORIES: ExpenseCategory[] = [
  'Aluguel', 'Alimentação', 'Transporte', 'Software',
  'Marketing', 'Equipamentos', 'Impostos', 'Salários', 'Outros',
];

const CAT_COLORS: Record<ExpenseCategory, string> = {
  'Aluguel': '#8B6F47', 'Alimentação': '#55B96B', 'Transporte': '#5B8DD9',
  'Software': '#7B68EE', 'Marketing': '#F4A261', 'Equipamentos': '#4ECDC4',
  'Impostos': '#E05C5C', 'Salários': '#9B8EA8', 'Outros': '#4A4450',
};

const EMPTY_FORM = {
  date: dateISO(), description: '', amount: '', category: 'Outros' as ExpenseCategory,
  vendor: '', recurring: false,
};

const useStyles = makeStyles({
  page: { display: 'flex', flexDirection: 'column', gap: '24px' },
  row: {
    display: 'grid',
    gridTemplateColumns: '110px 1fr 130px 140px 120px 80px auto',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 16px',
    borderRadius: '8px',
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground1,
  },
  field: { display: 'flex', flexDirection: 'column', gap: '4px' },
});

export default function ExpensesPage() {
  const styles = useStyles();
  const expenses = useAppStore((s) => s.expenses);
  const addExpense = useAppStore((s) => s.addExpense);
  const updateExpense = useAppStore((s) => s.updateExpense);
  const deleteExpense = useAppStore((s) => s.deleteExpense);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [catFilter, setCatFilter] = useState<'todas' | ExpenseCategory>('todas');

  const filtered = catFilter === 'todas' ? expenses : expenses.filter((e) => e.category === catFilter);
  const sorted = [...filtered].sort((a, b) => b.date.localeCompare(a.date));

  const totalMonth = (() => {
    const m = new Date().toISOString().slice(0, 7);
    return expenses.filter((e) => e.date.startsWith(m)).reduce((s, e) => s + e.amount, 0);
  })();

  function openAdd() { setEditing(null); setForm(EMPTY_FORM); setOpen(true); }
  function openEdit(e: Expense) {
    setEditing(e);
    setForm({ date: e.date, description: e.description, amount: String(e.amount), category: e.category, vendor: e.vendor ?? '', recurring: e.recurring });
    setOpen(true);
  }

  function handleSubmit() {
    if (!form.description.trim()) return;
    const amount = parseFloat(form.amount.replace(',', '.')) || 0;
    if (amount <= 0) return;
    const data = { date: form.date, description: form.description.trim(), amount, category: form.category, vendor: form.vendor.trim() || undefined, recurring: form.recurring };
    if (editing) updateExpense(editing.id, data);
    else addExpense(data);
    setOpen(false);
  }

  const setF = (k: keyof typeof form) => (_: unknown, d: { value: string }) =>
    setForm((f) => ({ ...f, [k]: d.value }));

  return (
    <div className={styles.page}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <Text size={600} weight="bold">Despesas</Text>
          <Text block size={300} style={{ color: tokens.colorNeutralForeground2 }}>
            {expenses.length} registro{expenses.length !== 1 ? 's' : ''} · Este mês: {formatCurrency(totalMonth)}
          </Text>
        </div>
        <Button appearance="primary" icon={<AddRegular />} onClick={openAdd}>Nova Despesa</Button>
      </div>

      <TabList
        selectedValue={catFilter}
        onTabSelect={(_, d) => setCatFilter(d.value as typeof catFilter)}
        size="small"
      >
        <Tab value="todas">Todas</Tab>
        {CATEGORIES.map((c) => <Tab key={c} value={c}>{c}</Tab>)}
      </TabList>

      {sorted.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr 130px 140px 120px 80px auto', gap: '10px', padding: '4px 16px' }}>
          {['Data', 'Descrição', 'Valor', 'Categoria', 'Fornecedor', 'Recorr.', ''].map((h) => (
            <Text key={h} size={200} weight="semibold" style={{ color: tokens.colorNeutralForeground2 }}>{h}</Text>
          ))}
        </div>
      )}

      {sorted.length === 0 ? (
        <EmptyState icon="💸" title="Nenhuma despesa" description="Registre suas despesas para acompanhar os gastos." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {sorted.map((e) => (
            <div key={e.id} className={styles.row}>
              <Text size={200}>{e.date}</Text>
              <Text size={300} weight="semibold">{e.description}</Text>
              <Text size={300} weight="bold" style={{ color: '#E05C5C' }}>
                {formatCurrency(e.amount)}
              </Text>
              <Badge appearance="filled" style={{ background: `${CAT_COLORS[e.category]}20`, color: CAT_COLORS[e.category] }}>
                {e.category}
              </Badge>
              <Text size={200}>{e.vendor || '—'}</Text>
              <Text size={200} style={{ color: e.recurring ? '#55B96B' : tokens.colorNeutralForeground2 }}>
                {e.recurring ? '✓ Sim' : 'Não'}
              </Text>
              <div style={{ display: 'flex', gap: '2px' }}>
                <Button appearance="subtle" size="small" icon={<EditRegular />} onClick={() => openEdit(e)} />
                <Button appearance="subtle" size="small" icon={<DeleteRegular />} onClick={() => deleteExpense(e.id)} />
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={(_, d) => { if (!d.open) setOpen(false); }}>
        <DialogSurface style={{ maxWidth: '480px' }}>
          <DialogTitle>{editing ? 'Editar Despesa' : 'Nova Despesa'}</DialogTitle>
          <DialogBody>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div className={styles.field}>
                  <Text size={200}>Data *</Text>
                  <Input type="date" value={form.date} onChange={setF('date')} />
                </div>
                <div className={styles.field}>
                  <Text size={200}>Valor R$ *</Text>
                  <Input value={form.amount} onChange={setF('amount')} placeholder="0,00" contentBefore={<Text size={100}>R$</Text>} />
                </div>
              </div>
              <div className={styles.field}>
                <Text size={200}>Descrição *</Text>
                <Input value={form.description} onChange={setF('description')} placeholder="Ex: Assinatura Adobe, Aluguel..." />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div className={styles.field}>
                  <Text size={200}>Categoria</Text>
                  <Select value={form.category} onChange={setF('category')}>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </Select>
                </div>
                <div className={styles.field}>
                  <Text size={200}>Fornecedor</Text>
                  <Input value={form.vendor} onChange={setF('vendor')} placeholder="Nome do fornecedor" />
                </div>
              </div>
              <Checkbox
                label="Despesa recorrente"
                checked={form.recurring}
                onChange={(_, d) => setForm((f) => ({ ...f, recurring: !!d.checked }))}
              />
            </div>
          </DialogBody>
          <DialogActions>
            <Button appearance="secondary" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button
              appearance="primary" onClick={handleSubmit}
              disabled={!form.description.trim() || !form.amount}
            >
              {editing ? 'Salvar' : 'Registrar (+5 XP)'}
            </Button>
          </DialogActions>
        </DialogSurface>
      </Dialog>
    </div>
  );
}
