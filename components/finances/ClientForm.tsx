'use client';

import { useState } from 'react';
import { Button, Input, Select, Text, tokens } from '@fluentui/react-components';
import type { Client, ClientStatus } from '@/store/types';

interface ClientFormProps {
  initial?: Partial<Client>;
  onSubmit: (data: Omit<Client, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

function maskDoc(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 14);
  if (d.length <= 11)
    return d.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  return d.replace(/(\d{2})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1/$2').replace(/(\d{4})(\d{1,2})$/, '$1-$2');
}
function maskPhone(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 11);
  return d.length <= 10
    ? d.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3')
    : d.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
}
function maskZip(v: string) {
  return v.replace(/\D/g, '').slice(0, 8).replace(/(\d{5})(\d{0,3})/, '$1-$2');
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <Text size={200}>{label}</Text>
      {children}
    </div>
  );
}

export function ClientForm({ initial, onSubmit, onCancel }: ClientFormProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [email, setEmail] = useState(initial?.email ?? '');
  const [phone, setPhone] = useState(initial?.phone ?? '');
  const [document, setDocument] = useState(initial?.document ?? '');
  const [status, setStatus] = useState<ClientStatus>(initial?.status ?? 'ativo');
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [street, setStreet] = useState(initial?.address?.street ?? '');
  const [number, setNumber] = useState(initial?.address?.number ?? '');
  const [complement, setComplement] = useState(initial?.address?.complement ?? '');
  const [neighborhood, setNeighborhood] = useState(initial?.address?.neighborhood ?? '');
  const [city, setCity] = useState(initial?.address?.city ?? '');
  const [state, setState] = useState(initial?.address?.state ?? '');
  const [zip, setZip] = useState(initial?.address?.zip ?? '');

  function handleSubmit() {
    if (!name.trim()) return;
    onSubmit({
      name: name.trim(), email: email.trim(), phone, document, status,
      notes: notes.trim(),
      address: { street, number, complement, neighborhood, city, state, zip },
    });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '8px' }}>
        <Field label="Nome *">
          <Input value={name} onChange={(_, d) => setName(d.value)} placeholder="Nome ou razão social" />
        </Field>
        <Field label="Status">
          <Select value={status} onChange={(_, d) => setStatus(d.value as ClientStatus)}>
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
          </Select>
        </Field>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        <Field label="E-mail">
          <Input type="email" value={email} onChange={(_, d) => setEmail(d.value)} placeholder="email@exemplo.com" />
        </Field>
        <Field label="Telefone">
          <Input value={phone} onChange={(_, d) => setPhone(maskPhone(d.value))} placeholder="(00) 00000-0000" />
        </Field>
      </div>
      <Field label="CPF / CNPJ">
        <Input value={document} onChange={(_, d) => setDocument(maskDoc(d.value))} placeholder="000.000.000-00" />
      </Field>
      <Text size={200} weight="semibold" style={{ color: tokens.colorNeutralForeground2, marginTop: '4px' }}>
        Endereço
      </Text>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '8px' }}>
        <Field label="Logradouro">
          <Input value={street} onChange={(_, d) => setStreet(d.value)} placeholder="Rua, Av." />
        </Field>
        <Field label="Número">
          <Input value={number} onChange={(_, d) => setNumber(d.value)} placeholder="123" />
        </Field>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        <Field label="Complemento">
          <Input value={complement} onChange={(_, d) => setComplement(d.value)} placeholder="Apto, Sala..." />
        </Field>
        <Field label="Bairro">
          <Input value={neighborhood} onChange={(_, d) => setNeighborhood(d.value)} placeholder="Bairro" />
        </Field>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '8px' }}>
        <Field label="Cidade">
          <Input value={city} onChange={(_, d) => setCity(d.value)} placeholder="Cidade" />
        </Field>
        <Field label="UF">
          <Input value={state} onChange={(_, d) => setState(d.value.slice(0, 2).toUpperCase())} placeholder="SP" maxLength={2} />
        </Field>
        <Field label="CEP">
          <Input value={zip} onChange={(_, d) => setZip(maskZip(d.value))} placeholder="00000-000" />
        </Field>
      </div>
      <Field label="Observações">
        <Input value={notes} onChange={(_, d) => setNotes(d.value)} placeholder="Notas internas..." />
      </Field>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '4px' }}>
        <Button appearance="secondary" onClick={onCancel}>Cancelar</Button>
        <Button appearance="primary" onClick={handleSubmit} disabled={!name.trim()}>
          {initial?.id ? 'Salvar' : 'Criar Cliente'}
        </Button>
      </div>
    </div>
  );
}
