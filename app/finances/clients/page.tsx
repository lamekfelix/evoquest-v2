'use client';

import { useState } from 'react';
import {
  Text, Button, Badge, Input,
  Dialog, DialogSurface, DialogTitle, DialogBody,
  makeStyles, tokens,
} from '@fluentui/react-components';
import { AddRegular, DeleteRegular, EditRegular, PersonRegular } from '@fluentui/react-icons';
import Link from 'next/link';
import { useAppStore } from '@/store/useAppStore';
import { ClientForm } from '@/components/finances/ClientForm';
import { EmptyState } from '@/components/shared/EmptyState';
import type { Client } from '@/store/types';

const useStyles = makeStyles({
  page: { display: 'flex', flexDirection: 'column', gap: '24px' },
  row: {
    display: 'grid',
    gridTemplateColumns: '1fr 160px 140px 120px 90px auto',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    borderRadius: '8px',
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground1,
  },
});

export default function ClientsPage() {
  const styles = useStyles();
  const clients = useAppStore((s) => s.clients);
  const addClient = useAppStore((s) => s.addClient);
  const updateClient = useAppStore((s) => s.updateClient);
  const deleteClient = useAppStore((s) => s.deleteClient);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [search, setSearch] = useState('');

  const filtered = clients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.document.includes(search)
  );

  function handleSubmit(data: Omit<Client, 'id' | 'createdAt'>) {
    if (editing) {
      updateClient(editing.id, data);
    } else {
      addClient(data);
    }
    setOpen(false);
    setEditing(null);
  }

  function openEdit(client: Client) {
    setEditing(client);
    setOpen(true);
  }

  function openAdd() {
    setEditing(null);
    setOpen(true);
  }

  return (
    <div className={styles.page}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <Text size={600} weight="bold">Clientes</Text>
          <Text block size={300} style={{ color: tokens.colorNeutralForeground2 }}>
            {clients.length} cliente{clients.length !== 1 ? 's' : ''} cadastrado{clients.length !== 1 ? 's' : ''}
          </Text>
        </div>
        <Button appearance="primary" icon={<AddRegular />} onClick={openAdd}>Novo Cliente</Button>
      </div>

      <Input
        placeholder="Buscar por nome, e-mail ou documento..."
        value={search}
        onChange={(_, d) => setSearch(d.value)}
        style={{ maxWidth: '400px' }}
        contentBefore={<PersonRegular />}
      />

      {/* Table header */}
      {filtered.length > 0 && (
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 160px 140px 120px 90px auto',
          gap: '12px', padding: '6px 16px',
        }}>
          {['Nome', 'E-mail', 'Telefone', 'Documento', 'Status', ''].map((h) => (
            <Text key={h} size={200} weight="semibold" style={{ color: tokens.colorNeutralForeground2 }}>{h}</Text>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState icon="👥" title="Nenhum cliente" description="Cadastre clientes para criar faturas." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filtered.map((client) => (
            <div key={client.id} className={styles.row}>
              <div>
                <Link href={`/finances/clients/${client.id}`} style={{ textDecoration: 'none' }}>
                  <Text size={300} weight="semibold" style={{ color: tokens.colorBrandBackground }}>{client.name}</Text>
                </Link>
                {client.notes && (
                  <Text size={100} block style={{ color: tokens.colorNeutralForeground2 }}>{client.notes}</Text>
                )}
              </div>
              <Text size={200} truncate>{client.email || '—'}</Text>
              <Text size={200}>{client.phone || '—'}</Text>
              <Text size={200}>{client.document || '—'}</Text>
              <Badge
                appearance="filled"
                style={{ background: client.status === 'ativo' ? '#55B96B20' : '#4A445020', color: client.status === 'ativo' ? '#55B96B' : '#4A4450' }}
              >
                {client.status === 'ativo' ? 'Ativo' : 'Inativo'}
              </Badge>
              <div style={{ display: 'flex', gap: '2px' }}>
                <Button appearance="subtle" size="small" icon={<EditRegular />} onClick={() => openEdit(client)} />
                <Button appearance="subtle" size="small" icon={<DeleteRegular />} onClick={() => deleteClient(client.id)} />
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={(_, d) => { if (!d.open) { setOpen(false); setEditing(null); } }}>
        <DialogSurface style={{ maxWidth: '600px' }}>
          <DialogTitle>{editing ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle>
          <DialogBody>
            <ClientForm
              initial={editing ?? undefined}
              onSubmit={handleSubmit}
              onCancel={() => { setOpen(false); setEditing(null); }}
            />
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </div>
  );
}
