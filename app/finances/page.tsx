'use client';

import { useMemo, useEffect, useState } from 'react';
import { Text, Card, Button, Input, makeStyles, tokens } from '@fluentui/react-components';
import { AddRegular } from '@fluentui/react-icons';
import Link from 'next/link';
import { useAppStore } from '@/store/useAppStore';
import { StatCard } from '@/components/shared/StatCard';
import { FinanceBarChart } from '@/components/finances/FinanceBarChart';
import { formatCurrency, dateISO } from '@/lib/utils';

const useStyles = makeStyles({
  page: { display: 'flex', flexDirection: 'column', gap: '24px' },
  grid4: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' },
  card: { padding: '20px', borderRadius: '10px', border: `1px solid ${tokens.colorNeutralStroke2}` },
  row: { display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: `1px solid ${tokens.colorNeutralStroke2}` },
  progressWrap: { height: '10px', borderRadius: '5px', background: tokens.colorNeutralBackground3, overflow: 'hidden', marginTop: '8px' },
});

export default function FinanceDashboardPage() {
  const styles = useStyles();
  const invoices = useAppStore((s) => s.invoices);
  const expenses = useAppStore((s) => s.expenses);
  const savingsGoal = useAppStore((s) => s.savingsGoal);
  const savingsGoalMetMonth = useAppStore((s) => s.savingsGoalMetMonth);
  const checkSavingsGoalMet = useAppStore((s) => s.checkSavingsGoalMet);
  const setSavingsGoal = useAppStore((s) => s.setSavingsGoal);
  const [goalInput, setGoalInput] = useState(savingsGoal > 0 ? String(savingsGoal) : '');

  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const monthRevenue = useMemo(() =>
    invoices.reduce((sum, inv) =>
      sum + inv.payments.filter((p) => p.date.startsWith(currentMonth)).reduce((s, p) => s + p.amount, 0), 0),
    [invoices, currentMonth]);

  const monthExpenses = useMemo(() =>
    expenses.filter((e) => e.date.startsWith(currentMonth)).reduce((s, e) => s + e.amount, 0),
    [expenses, currentMonth]);

  const balance = monthRevenue - monthExpenses;
  const pendingInvoices = invoices.filter((inv) => inv.status === 'enviada' || inv.status === 'vencida').length;

  useEffect(() => { checkSavingsGoalMet(balance); }, [balance, checkSavingsGoalMet]);

  const chartData = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('pt-BR', { month: 'short' });
      const revenue = invoices.reduce((sum, inv) =>
        sum + inv.payments.filter((p) => p.date.startsWith(key)).reduce((s, p) => s + p.amount, 0), 0);
      const exp = expenses.filter((e) => e.date.startsWith(key)).reduce((s, e) => s + e.amount, 0);
      months.push({ label, revenue, expenses: exp });
    }
    return months;
  }, [invoices, expenses]);

  const recentActivities = useMemo(() => {
    const inv = [...invoices].reverse().slice(0, 5).map((i) => ({
      id: i.id, date: i.createdAt,
      label: `Fatura ${i.number} — ${i.clientName}`,
      amount: i.items.reduce((s, it) => s + it.quantity * it.unitPrice, 0),
      type: 'invoice' as const,
    }));
    const exp = [...expenses].reverse().slice(0, 5).map((e) => ({
      id: e.id, date: e.createdAt,
      label: e.description || e.category,
      amount: e.amount, type: 'expense' as const,
    }));
    return [...inv, ...exp].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8);
  }, [invoices, expenses]);

  const savingsProgress = savingsGoal > 0 ? Math.min(1, Math.max(0, balance) / savingsGoal) : 0;
  const goalMetThisMonth = savingsGoal > 0 && savingsGoalMetMonth === currentMonth;

  function applyGoal() {
    const v = parseFloat(goalInput.replace(',', '.'));
    if (v > 0) setSavingsGoal(v);
    else setSavingsGoal(0);
  }

  return (
    <div className={styles.page}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <Text size={600} weight="bold">Dashboard Financeiro</Text>
          <Text block size={300} style={{ color: tokens.colorNeutralForeground2 }}>Visão geral das suas finanças</Text>
        </div>
        <Link href="/finances/invoices/new">
          <Button appearance="primary" icon={<AddRegular />}>Nova Fatura</Button>
        </Link>
      </div>

      <div className={styles.grid4}>
        <StatCard icon="📈" label="Receita Mensal" value={formatCurrency(monthRevenue)} color="#55B96B" />
        <StatCard icon="📉" label="Despesas" value={formatCurrency(monthExpenses)} color="#E05C5C" />
        <StatCard icon="💰" label="Saldo" value={formatCurrency(balance)} color={balance >= 0 ? '#55B96B' : '#E05C5C'} />
        <StatCard icon="📋" label="Faturas Pendentes" value={pendingInvoices} color="#F4A261" sub="enviadas / vencidas" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
        <Card className={styles.card}>
          <Text size={300} weight="semibold" block style={{ marginBottom: '12px' }}>
            Receitas vs Despesas — Últimos 6 meses
          </Text>
          <FinanceBarChart data={chartData} />
        </Card>

        <Card className={styles.card}>
          <Text size={300} weight="semibold" block style={{ marginBottom: '12px' }}>Meta de Economia</Text>
          {savingsGoal > 0 ? (
            <>
              <Text size={400} weight="bold" block style={{ color: savingsProgress >= 1 ? '#55B96B' : tokens.colorBrandBackground }}>
                {formatCurrency(Math.max(0, balance))}
              </Text>
              <Text size={100} style={{ color: tokens.colorNeutralForeground2 }}>
                de {formatCurrency(savingsGoal)} — {Math.round(savingsProgress * 100)}%
              </Text>
              <div className={styles.progressWrap}>
                <div style={{
                  height: '100%', borderRadius: '5px', transition: 'width 0.4s ease',
                  width: `${savingsProgress * 100}%`,
                  background: savingsProgress >= 1 ? '#55B96B' : tokens.colorBrandBackground,
                }} />
              </div>
              {goalMetThisMonth && (
                <Text size={200} style={{ color: '#55B96B', marginTop: '10px', display: 'block' }}>
                  🏆 Meta atingida! +30 XP Resiliência
                </Text>
              )}
            </>
          ) : (
            <Text size={200} style={{ color: tokens.colorNeutralForeground2, display: 'block', marginBottom: '8px' }}>
              Nenhuma meta definida.
            </Text>
          )}
          <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
            <Input
              placeholder="R$ meta mensal"
              value={goalInput}
              onChange={(_, d) => setGoalInput(d.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') applyGoal(); }}
              style={{ flex: 1 }}
              contentBefore={<Text size={100}>R$</Text>}
            />
            <Button appearance="primary" size="small" onClick={applyGoal}>Definir</Button>
          </div>
        </Card>
      </div>

      <Card className={styles.card}>
        <Text size={300} weight="semibold" block style={{ marginBottom: '4px' }}>Atividades Recentes</Text>
        {recentActivities.length === 0 ? (
          <Text size={200} style={{ color: tokens.colorNeutralForeground2 }}>Nenhuma atividade recente.</Text>
        ) : (
          recentActivities.map((a, idx) => (
            <div key={a.id} className={styles.row} style={idx === recentActivities.length - 1 ? { borderBottom: 'none' } : {}}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0, fontSize: '16px',
                background: a.type === 'invoice' ? '#55B96B20' : '#E05C5C20',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {a.type === 'invoice' ? '📋' : '💸'}
              </div>
              <div style={{ flex: 1 }}>
                <Text size={300} block>{a.label}</Text>
                <Text size={100} style={{ color: tokens.colorNeutralForeground2 }}>{a.date}</Text>
              </div>
              <Text size={300} weight="semibold" style={{ color: a.type === 'invoice' ? '#55B96B' : '#E05C5C' }}>
                {a.type === 'invoice' ? '+' : '-'}{formatCurrency(a.amount)}
              </Text>
            </div>
          ))
        )}
      </Card>
    </div>
  );
}
