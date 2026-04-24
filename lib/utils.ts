// Helpers gerais

export function dateISO(date: Date = new Date()): string {
  return date.toISOString().split('T')[0];
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export function getStartOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d;
}

export function calcInvoiceTotals(invoice: import('@/store/types').Invoice) {
  const subtotal = invoice.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const taxTotal = invoice.items.reduce((s, i) => s + i.quantity * i.unitPrice * (i.taxRate / 100), 0);
  const grandTotal = subtotal + taxTotal - invoice.discount;
  const paidTotal = invoice.payments.reduce((s, p) => s + p.amount, 0);
  return { subtotal, taxTotal, grandTotal, paidTotal, balance: grandTotal - paidTotal };
}
