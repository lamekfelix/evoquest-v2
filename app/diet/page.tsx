'use client';

import { useState, useMemo } from 'react';
import { Button, Text, makeStyles, tokens } from '@fluentui/react-components';
import { ChevronLeftRegular, ChevronRightRegular } from '@fluentui/react-icons';
import { useAppStore } from '@/store/useAppStore';
import { dateISO } from '@/lib/utils';
import { MealSection } from '@/components/diet/MealSection';
import { AddFoodModal } from '@/components/diet/AddFoodModal';
import type { MealItem, Meal } from '@/store/types';

const GOALS = { calories: 2000, protein: 150, carbs: 250, fat: 65 };

const MEAL_DEFS: { type: Meal['type']; label: string; icon: string }[] = [
  { type: 'breakfast', label: 'Café da Manhã', icon: '🌅' },
  { type: 'lunch', label: 'Almoço', icon: '☀️' },
  { type: 'snack', label: 'Lanche', icon: '🍎' },
  { type: 'dinner', label: 'Jantar', icon: '🌙' },
];

const useStyles = makeStyles({
  page: { display: 'flex', flexDirection: 'column', gap: '24px' },
  macroCard: {
    backgroundColor: tokens.colorNeutralBackground2,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: '10px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  macroRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' },
  macroItem: { display: 'flex', flexDirection: 'column', gap: '4px' },
  progressBar: {
    height: '6px',
    borderRadius: '3px',
    overflow: 'hidden',
    backgroundColor: tokens.colorNeutralBackground3,
  },
  waterCard: {
    backgroundColor: tokens.colorNeutralBackground2,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: '10px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
});

function addDays(date: string, n: number): string {
  const d = new Date(date + 'T12:00:00');
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

function MacroBar({ label, value, goal, color }: { label: string; value: number; goal: number; color: string }) {
  const styles = useStyles();
  const pct = Math.min(100, (value / goal) * 100);
  return (
    <div className={styles.macroItem}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Text size={200} weight="medium">{label}</Text>
        <Text size={200} style={{ color: tokens.colorNeutralForeground2 }}>{Math.round(value)}/{goal}</Text>
      </div>
      <div className={styles.progressBar}>
        <div style={{ width: `${pct}%`, height: '100%', backgroundColor: color, borderRadius: 3 }} />
      </div>
    </div>
  );
}

export default function DietPage() {
  const styles = useStyles();
  const meals = useAppStore((s) => s.meals);
  const addMeal = useAppStore((s) => s.addMeal);
  const deleteMeal = useAppStore((s) => s.deleteMeal);
  const waterToday = useAppStore((s) => s.waterToday);
  const setWaterToday = useAppStore((s) => s.setWaterToday);

  const [date, setDate] = useState(dateISO());
  const [addModal, setAddModal] = useState<{ mealType: Meal['type'] } | null>(null);

  const dayMeals = useMemo(() => meals.filter((m) => m.date === date), [meals, date]);

  const totals = useMemo(() => {
    const items = dayMeals.flatMap((m) => m.items);
    return {
      calories: items.reduce((s, i) => s + (i.calories ?? 0), 0),
      protein: items.reduce((s, i) => s + (i.protein ?? 0), 0),
      carbs: items.reduce((s, i) => s + (i.carbs ?? 0), 0),
      fat: items.reduce((s, i) => s + (i.fat ?? 0), 0),
    };
  }, [dayMeals]);

  function getItems(type: Meal['type']): MealItem[] {
    return dayMeals.find((m) => m.type === type)?.items ?? [];
  }

  function handleAddFood(item: MealItem) {
    if (!addModal) return;
    const existing = dayMeals.find((m) => m.type === addModal.mealType);
    if (existing) {
      deleteMeal(existing.id);
      addMeal({ date, type: addModal.mealType, items: [...existing.items, item] });
    } else {
      addMeal({ date, type: addModal.mealType, items: [item] });
    }
  }

  function handleRemoveItem(mealType: Meal['type'], idx: number) {
    const existing = dayMeals.find((m) => m.type === mealType);
    if (!existing) return;
    const newItems = existing.items.filter((_, i) => i !== idx);
    deleteMeal(existing.id);
    if (newItems.length > 0) addMeal({ date, type: mealType, items: newItems });
  }

  const waterPct = Math.min(100, (waterToday / 2000) * 100);

  return (
    <div className={styles.page}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <Text size={600} weight="bold">Dieta</Text>
          <Text size={300} block style={{ color: tokens.colorNeutralForeground2, marginTop: 4 }}>
            Acompanhe refeições e macros
          </Text>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Button size="small" appearance="subtle" icon={<ChevronLeftRegular />} onClick={() => setDate((d) => addDays(d, -1))} />
          <Text size={300} weight="semibold">{date === dateISO() ? 'Hoje' : date}</Text>
          <Button size="small" appearance="subtle" icon={<ChevronRightRegular />} onClick={() => setDate((d) => addDays(d, 1))} disabled={date >= dateISO()} />
        </div>
      </div>

      <div className={styles.macroCard}>
        <Text size={400} weight="semibold">Macros do dia</Text>
        <div className={styles.macroRow}>
          <MacroBar label="Calorias" value={totals.calories} goal={GOALS.calories} color="#E05C5C" />
          <MacroBar label="Proteína" value={totals.protein} goal={GOALS.protein} color="#5B8DD9" />
          <MacroBar label="Carboidratos" value={totals.carbs} goal={GOALS.carbs} color="#F5A623" />
          <MacroBar label="Gordura" value={totals.fat} goal={GOALS.fat} color="#55B96B" />
        </div>
      </div>

      <div className={styles.waterCard}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text size={400} weight="semibold">💧 Hidratação</Text>
          <Text size={300} style={{ color: tokens.colorNeutralForeground2 }}>{waterToday}ml / 2000ml</Text>
        </div>
        <div style={{ height: 8, borderRadius: 4, backgroundColor: tokens.colorNeutralBackground3, overflow: 'hidden' }}>
          <div style={{ width: `${waterPct}%`, height: '100%', backgroundColor: '#5B8DD9', borderRadius: 4 }} />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button size="small" appearance="secondary" onClick={() => setWaterToday(waterToday + 250)}>+250ml</Button>
          <Button size="small" appearance="secondary" onClick={() => setWaterToday(waterToday + 500)}>+500ml</Button>
          <Button size="small" appearance="subtle" onClick={() => setWaterToday(0)}>Zerar</Button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {MEAL_DEFS.map((def) => (
          <MealSection
            key={def.type}
            label={def.label}
            icon={def.icon}
            items={getItems(def.type)}
            onAddFood={() => setAddModal({ mealType: def.type })}
            onRemoveItem={(idx) => handleRemoveItem(def.type, idx)}
          />
        ))}
      </div>

      {addModal && (
        <AddFoodModal
          open
          onClose={() => setAddModal(null)}
          onAdd={handleAddFood}
        />
      )}
    </div>
  );
}
