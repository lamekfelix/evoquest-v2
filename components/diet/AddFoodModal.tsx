'use client';

import { useState } from 'react';
import {
  Dialog, DialogSurface, DialogTitle, DialogBody, DialogActions,
  Button, Input, Text,
} from '@fluentui/react-components';
import type { MealItem } from '@/store/types';

interface Props {
  open: boolean;
  onClose: () => void;
  onAdd: (item: MealItem) => void;
}

export function AddFoodModal({ open, onClose, onAdd }: Props) {
  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [portion, setPortion] = useState('');

  function handleAdd() {
    if (!name.trim()) return;
    onAdd({
      name: name.trim(),
      calories: parseFloat(calories) || undefined,
      protein: parseFloat(protein) || undefined,
      carbs: parseFloat(carbs) || undefined,
      fat: parseFloat(fat) || undefined,
      portion: portion.trim() || undefined,
    });
    setName(''); setCalories(''); setProtein(''); setCarbs(''); setFat(''); setPortion('');
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(_, d) => !d.open && onClose()}>
      <DialogSurface style={{ maxWidth: 400 }}>
        <DialogTitle>Adicionar Alimento</DialogTitle>
        <DialogBody>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <Text size={200}>Nome *</Text>
              <Input value={name} onChange={(_, d) => setName(d.value)} placeholder="Ex: Frango grelhado" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <Text size={200}>Porção</Text>
              <Input value={portion} onChange={(_, d) => setPortion(d.value)} placeholder="Ex: 100g, 1 unid." />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <Text size={200}>Calorias (kcal)</Text>
                <Input type="number" value={calories} onChange={(_, d) => setCalories(d.value)} placeholder="0" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <Text size={200}>Proteína (g)</Text>
                <Input type="number" value={protein} onChange={(_, d) => setProtein(d.value)} placeholder="0" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <Text size={200}>Carboidratos (g)</Text>
                <Input type="number" value={carbs} onChange={(_, d) => setCarbs(d.value)} placeholder="0" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <Text size={200}>Gordura (g)</Text>
                <Input type="number" value={fat} onChange={(_, d) => setFat(d.value)} placeholder="0" />
              </div>
            </div>
          </div>
        </DialogBody>
        <DialogActions>
          <Button appearance="secondary" onClick={onClose}>Cancelar</Button>
          <Button appearance="primary" onClick={handleAdd} disabled={!name.trim()}>Adicionar</Button>
        </DialogActions>
      </DialogSurface>
    </Dialog>
  );
}
