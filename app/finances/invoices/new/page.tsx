'use client';

import { Text, Card, tokens } from '@fluentui/react-components';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { InvoiceForm } from '@/components/finances/InvoiceForm';
import type { Invoice } from '@/store/types';

export default function NewInvoicePage() {
  const router = useRouter();
  const clients = useAppStore((s) => s.clients);
  const products = useAppStore((s) => s.products);
  const addInvoice = useAppStore((s) => s.addInvoice);

  function handleSubmit(data: Omit<Invoice, 'id' | 'number' | 'createdAt'>) {
    addInvoice(data);
    router.push('/finances/invoices');
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '900px' }}>
      <div>
        <Text size={600} weight="bold">Nova Fatura</Text>
        <Text block size={300} style={{ color: tokens.colorNeutralForeground2 }}>
          Preencha os dados abaixo para criar uma fatura
        </Text>
      </div>
      <Card style={{ padding: '24px', borderRadius: '10px', border: `1px solid ${tokens.colorNeutralStroke2}` }}>
        {clients.length === 0 ? (
          <Text size={300} style={{ color: tokens.colorNeutralForeground2 }}>
            Cadastre pelo menos um cliente em <strong>Finanças → Clientes</strong> antes de criar uma fatura.
          </Text>
        ) : (
          <InvoiceForm
            clients={clients}
            products={products}
            onSubmit={handleSubmit}
            onCancel={() => router.push('/finances/invoices')}
          />
        )}
      </Card>
    </div>
  );
}
