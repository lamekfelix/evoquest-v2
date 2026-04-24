'use client';

import { useState } from 'react';
import {
  Text, Button, Badge, Input, Select, Textarea,
  Dialog, DialogSurface, DialogTitle, DialogBody, DialogActions,
  makeStyles, tokens,
} from '@fluentui/react-components';
import { AddRegular, DeleteRegular, EditRegular } from '@fluentui/react-icons';
import { useAppStore } from '@/store/useAppStore';
import { EmptyState } from '@/components/shared/EmptyState';
import { formatCurrency, generateId, dateISO } from '@/lib/utils';
import type { Product, ProductType, ProductUnit } from '@/store/types';

const UNITS: ProductUnit[] = ['un', 'hr', 'kg', 'm', 'pacote', 'mes'];
const UNIT_LABELS: Record<ProductUnit, string> = { un: 'Unidade', hr: 'Hora', kg: 'Quilo', m: 'Metro', pacote: 'Pacote', mes: 'Mês' };

const useStyles = makeStyles({
  page: { display: 'flex', flexDirection: 'column', gap: '24px' },
  row: {
    display: 'grid',
    gridTemplateColumns: '1fr 90px 110px 80px 80px 80px 80px auto',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 16px',
    borderRadius: '8px',
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground1,
  },
  field: { display: 'flex', flexDirection: 'column', gap: '4px' },
});

const EMPTY_PRODUCT = {
  name: '', type: 'servico' as ProductType, description: '', price: '',
  unit: 'un' as ProductUnit, taxRate: '', sku: '', status: 'ativo' as Product['status'],
};

export default function ProductsPage() {
  const styles = useStyles();
  const products = useAppStore((s) => s.products);
  const addProduct = useAppStore((s) => s.addProduct);
  const updateProduct = useAppStore((s) => s.updateProduct);
  const deleteProduct = useAppStore((s) => s.deleteProduct);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(EMPTY_PRODUCT);

  function openAdd() { setEditing(null); setForm(EMPTY_PRODUCT); setOpen(true); }
  function openEdit(p: Product) {
    setEditing(p);
    setForm({ name: p.name, type: p.type, description: p.description ?? '', price: String(p.price), unit: p.unit, taxRate: String(p.taxRate), sku: p.sku ?? '', status: p.status });
    setOpen(true);
  }

  function handleSubmit() {
    if (!form.name.trim()) return;
    const data = {
      name: form.name.trim(), type: form.type, description: form.description.trim() || undefined,
      price: parseFloat(form.price.replace(',', '.')) || 0,
      unit: form.unit, taxRate: parseFloat(form.taxRate.replace(',', '.')) || 0,
      sku: form.sku.trim() || undefined, status: form.status,
    };
    if (editing) updateProduct(editing.id, data);
    else addProduct(data);
    setOpen(false);
  }

  const set = (k: keyof typeof form) => (_: unknown, d: { value: string }) => setForm((f) => ({ ...f, [k]: d.value }));

  return (
    <div className={styles.page}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <Text size={600} weight="bold">Produtos & Serviços</Text>
          <Text block size={300} style={{ color: tokens.colorNeutralForeground2 }}>
            {products.length} item{products.length !== 1 ? 's' : ''} cadastrado{products.length !== 1 ? 's' : ''}
          </Text>
        </div>
        <Button appearance="primary" icon={<AddRegular />} onClick={openAdd}>Novo Item</Button>
      </div>

      {products.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 90px 110px 80px 80px 80px 80px auto', gap: '10px', padding: '4px 16px' }}>
          {['Nome', 'Tipo', 'Preço', 'Unidade', 'Imposto', 'SKU', 'Status', ''].map((h) => (
            <Text key={h} size={200} weight="semibold" style={{ color: tokens.colorNeutralForeground2 }}>{h}</Text>
          ))}
        </div>
      )}

      {products.length === 0 ? (
        <EmptyState icon="📦" title="Nenhum produto" description="Cadastre produtos e serviços para usar nas faturas." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {products.map((p) => (
            <div key={p.id} className={styles.row}>
              <div>
                <Text size={300} weight="semibold" block>{p.name}</Text>
                {p.description && <Text size={100} style={{ color: tokens.colorNeutralForeground2 }}>{p.description}</Text>}
              </div>
              <Badge appearance="filled" style={{ background: p.type === 'servico' ? '#5B8DD920' : '#8B6F4720', color: p.type === 'servico' ? '#5B8DD9' : '#8B6F47' }}>
                {p.type === 'servico' ? 'Serviço' : 'Produto'}
              </Badge>
              <Text size={200} weight="semibold">{formatCurrency(p.price)}</Text>
              <Text size={200}>{UNIT_LABELS[p.unit]}</Text>
              <Text size={200}>{p.taxRate}%</Text>
              <Text size={200}>{p.sku || '—'}</Text>
              <Badge appearance="filled" style={{ background: p.status === 'ativo' ? '#55B96B20' : '#4A445020', color: p.status === 'ativo' ? '#55B96B' : '#4A4450' }}>
                {p.status === 'ativo' ? 'Ativo' : 'Inativo'}
              </Badge>
              <div style={{ display: 'flex', gap: '2px' }}>
                <Button appearance="subtle" size="small" icon={<EditRegular />} onClick={() => openEdit(p)} />
                <Button appearance="subtle" size="small" icon={<DeleteRegular />} onClick={() => deleteProduct(p.id)} />
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={(_, d) => { if (!d.open) setOpen(false); }}>
        <DialogSurface style={{ maxWidth: '520px' }}>
          <DialogTitle>{editing ? 'Editar Item' : 'Novo Produto / Serviço'}</DialogTitle>
          <DialogBody>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '8px' }}>
                <div className={styles.field}>
                  <Text size={200}>Nome *</Text>
                  <Input value={form.name} onChange={set('name')} placeholder="Nome do produto ou serviço" />
                </div>
                <div className={styles.field}>
                  <Text size={200}>Tipo</Text>
                  <Select value={form.type} onChange={set('type')}>
                    <option value="servico">Serviço</option>
                    <option value="produto">Produto</option>
                  </Select>
                </div>
              </div>
              <div className={styles.field}>
                <Text size={200}>Descrição</Text>
                <Textarea value={form.description} onChange={set('description')} rows={2} placeholder="Descrição opcional" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                <div className={styles.field}>
                  <Text size={200}>Preço R$ *</Text>
                  <Input value={form.price} onChange={set('price')} placeholder="0,00" contentBefore={<Text size={100}>R$</Text>} />
                </div>
                <div className={styles.field}>
                  <Text size={200}>Unidade</Text>
                  <Select value={form.unit} onChange={set('unit')}>
                    {UNITS.map((u) => <option key={u} value={u}>{UNIT_LABELS[u]}</option>)}
                  </Select>
                </div>
                <div className={styles.field}>
                  <Text size={200}>Imposto %</Text>
                  <Input value={form.taxRate} onChange={set('taxRate')} placeholder="0" contentAfter={<Text size={100}>%</Text>} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div className={styles.field}>
                  <Text size={200}>SKU</Text>
                  <Input value={form.sku} onChange={set('sku')} placeholder="Código interno" />
                </div>
                <div className={styles.field}>
                  <Text size={200}>Status</Text>
                  <Select value={form.status} onChange={set('status')}>
                    <option value="ativo">Ativo</option>
                    <option value="inativo">Inativo</option>
                  </Select>
                </div>
              </div>
            </div>
          </DialogBody>
          <DialogActions>
            <Button appearance="secondary" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button appearance="primary" onClick={handleSubmit} disabled={!form.name.trim()}>
              {editing ? 'Salvar' : 'Criar'}
            </Button>
          </DialogActions>
        </DialogSurface>
      </Dialog>
    </div>
  );
}
