'use client';

import { useState } from 'react';
import {
  Text, Button, Card, Tab, TabList, Badge,
  Dialog, DialogSurface, DialogTitle, DialogBody, DialogActions,
  Input, Select, makeStyles, tokens,
} from '@fluentui/react-components';
import { AddRegular, DeleteRegular, ArrowUpRegular, ArrowDownRegular } from '@fluentui/react-icons';
import { useAppStore } from '@/store/useAppStore';
import { StatCard } from '@/components/shared/StatCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { FINANCIAL_CATEGORIES_INCOME, FINANCIAL_CATEGORIES_EXPENSE } from '@/store/constants';
import { formatCurrency, dateISO } from '@/lib/utils';
import type { TransactionType } from '@/store/types';

const useStyles = makeStyles({
  page: { display: 'flex', flexDirection: 'column', gap: '24px' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' },
  txItem: {
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '12px 16px', borderRadius: '8px',
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground1,
  },
  formField: { display: 'flex', flexDirection: 'column', gap: '4px' },
});

export default function FinancesPage() {
  const styles = useStyles();
  const finances = useAppStore((s) => s.finances);
  const addTransaction = useAppStore((s) => s.addTransaction);
  const deleteTransaction = useAppStore((s) => s.deleteTransaction);
  const addAttrXp = useAppStore((s) => s.addAttrXp);

  const [open, setOpen] = useState(false);
  const [filterType, setFilterType] = useState<'all' | TransactionType>('all');
  const [txType, setTxType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(dateISO());

  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const monthTransactions = finances.filter((f) => f.date.startsWith(currentMonth));

  const totalIncome = monthTransactions.filter((f) => f.type === 'income').reduce((s, f) => s + f.amount, 0);
  const totalExpense = monthTransactions.filter((f) => f.type === 'expense').reduce((s, f) => s + f.amount, 0);
  const balance = totalIncome - totalExpense;

  const displayed = filterType === 'all' ? finances : finances.filter((f) => f.type === filterType);
  const categories = txType === 'income' ? FINANCIAL_CATEGORIES_INCOME : FINANCIAL_CATEGORIES_EXPENSE;

  function handleAdd() {
    const num = parseFloat(amount.replace(',', '.'));
    if (!num || num <= 0 || !category) return;
    addTransaction({ type: txType, amount: num, category, description: description.trim(), date });
    if (txType === 'income') addAttrXp('disciplina', 5);
    setAmount(''); setDescription(''); setOpen(false);
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <Text size={600} weight="bold">Finanças</Text>
          <Text block size={300} style={{ color: tokens.colorNeutralForeground2 }}>
            Controle de receitas e despesas
          </Text>
        </div>
        <Button appearance="primary" icon={<AddRegular />} onClick={() => setOpen(true)}>
          Nova Transação
        </Button>
      </div>

      {/* Resumo mensal */}
      <div className={styles.statsGrid}>
        <StatCard
          icon={<ArrowUpRegular />}
          label="Receitas (mês)"
          value={formatCurrency(totalIncome)}
          color="#55B96B"
        />
        <StatCard
          icon={<ArrowDownRegular />}
          label="Despesas (mês)"
          value={formatCurrency(totalExpense)}
          color="#E05C5C"
        />
        <StatCard
          icon="💰"
          label="Saldo (mês)"
          value={formatCurrency(balance)}
          color={balance >= 0 ? '#55B96B' : '#E05C5C'}
        />
      </div>

      {/* Barra de gastos vs receita */}
      {totalIncome > 0 && (
        <Card style={{ padding: 16, borderRadius: 10, border: `1px solid ${tokens.colorNeutralStroke2}` }}>
          <Text size={200} weight="semibold" block style={{ marginBottom: 8 }}>
            Proporção Receita × Despesa
          </Text>
          <div style={{ height: 12, borderRadius: 6, background: tokens.colorNeutralBackground3, overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${Math.min(100, (totalExpense / totalIncome) * 100)}%`,
              background: totalExpense > totalIncome ? '#E05C5C' : '#55B96B',
              transition: 'width 0.4s ease',
            }} />
          </div>
          <Text size={100} style={{ color: tokens.colorNeutralForeground2 }}>
            {totalIncome > 0 ? Math.floor((totalExpense / totalIncome) * 100) : 0}% gasto da receita
          </Text>
        </Card>
      )}

      {/* Dialog */}
      <Dialog open={open} onOpenChange={(_, d) => setOpen(d.open)}>
        <DialogSurface>
          <DialogTitle>Nova Transação</DialogTitle>
          <DialogBody>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <Button
                  appearance={txType === 'income' ? 'primary' : 'secondary'}
                  onClick={() => { setTxType('income'); setCategory(''); }}
                  style={{ flex: 1 }}
                >
                  ↑ Receita
                </Button>
                <Button
                  appearance={txType === 'expense' ? 'primary' : 'secondary'}
                  onClick={() => { setTxType('expense'); setCategory(''); }}
                  style={{ flex: 1 }}
                >
                  ↓ Despesa
                </Button>
              </div>
              <div className={styles.formField}>
                <Text size={200}>Valor (R$) *</Text>
                <Input
                  placeholder="0,00"
                  value={amount}
                  onChange={(_, d) => setAmount(d.value)}
                  contentBefore={<Text size={200}>R$</Text>}
                />
              </div>
              <div className={styles.formField}>
                <Text size={200}>Categoria *</Text>
                <Select value={category} onChange={(_, d) => setCategory(d.value)}>
                  <option value="">Selecione...</option>
                  {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </Select>
              </div>
              <div className={styles.formField}>
                <Text size={200}>Descrição</Text>
                <Input placeholder="Ex: Supermercado" value={description} onChange={(_, d) => setDescription(d.value)} />
              </div>
              <div className={styles.formField}>
                <Text size={200}>Data</Text>
                <Input type="date" value={date} onChange={(_, d) => setDate(d.value)} />
              </div>
            </div>
          </DialogBody>
          <DialogActions>
            <Button appearance="secondary" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button appearance="primary" onClick={handleAdd} disabled={!amount || !category}>
              Salvar
            </Button>
          </DialogActions>
        </DialogSurface>
      </Dialog>

      {/* Filtros */}
      <TabList selectedValue={filterType} onTabSelect={(_, d) => setFilterType(d.value as typeof filterType)} size="small">
        <Tab value="all">Todas</Tab>
        <Tab value="income">Receitas</Tab>
        <Tab value="expense">Despesas</Tab>
      </TabList>

      {/* Lista de transações */}
      {displayed.length === 0 ? (
        <EmptyState icon="💸" title="Nenhuma transação" description="Registre suas receitas e despesas para controlar suas finanças." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[...displayed].reverse().map((tx) => (
            <div key={tx.id} className={styles.txItem}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: tx.type === 'income' ? '#55B96B20' : '#E05C5C20',
                fontSize: 18,
              }}>
                {tx.type === 'income' ? '↑' : '↓'}
              </div>
              <div style={{ flex: 1 }}>
                <Text size={300} weight="semibold" block>{tx.description || tx.category}</Text>
                <Text size={100} style={{ color: tokens.colorNeutralForeground2 }}>
                  {tx.category} · {tx.date}
                </Text>
              </div>
              <Text
                size={400}
                weight="bold"
                style={{ color: tx.type === 'income' ? '#55B96B' : '#E05C5C' }}
              >
                {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
              </Text>
              <Button appearance="subtle" size="small" icon={<DeleteRegular />}
                onClick={() => deleteTransaction(tx.id)} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
