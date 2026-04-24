'use client';

import { Button, Text, makeStyles, tokens } from '@fluentui/react-components';
import { AddRegular, DeleteRegular } from '@fluentui/react-icons';
import type { MealItem } from '@/store/types';

interface Props {
  label: string;
  icon: string;
  items: MealItem[];
  onAddFood: () => void;
  onRemoveItem: (index: number) => void;
}

const useStyles = makeStyles({
  section: {
    backgroundColor: tokens.colorNeutralBackground2,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: '10px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 0',
    borderBottom: `1px solid ${tokens.colorNeutralStroke3}`,
  },
  macroChip: {
    fontSize: '11px',
    padding: '1px 6px',
    borderRadius: '4px',
    backgroundColor: tokens.colorNeutralBackground3,
    color: tokens.colorNeutralForeground2,
  },
});

export function MealSection({ label, icon, items, onAddFood, onRemoveItem }: Props) {
  const styles = useStyles();
  const totalCal = items.reduce((s, i) => s + (i.calories ?? 0), 0);

  return (
    <div className={styles.section}>
      <div className={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 20 }}>{icon}</span>
          <Text size={400} weight="semibold">{label}</Text>
          {totalCal > 0 && (
            <Text size={200} style={{ color: tokens.colorNeutralForeground2 }}>{totalCal} kcal</Text>
          )}
        </div>
        <Button size="small" appearance="subtle" icon={<AddRegular />} onClick={onAddFood}>
          Adicionar
        </Button>
      </div>

      {items.length === 0 && (
        <Text size={200} style={{ color: tokens.colorNeutralForeground3, padding: '4px 0' }}>
          Nenhum alimento registrado
        </Text>
      )}

      {items.map((item, idx) => (
        <div key={idx} className={styles.itemRow}>
          <div style={{ flex: 1 }}>
            <Text size={300} weight="medium">{item.name}</Text>
            {item.portion && (
              <Text size={200} style={{ color: tokens.colorNeutralForeground2 }}> · {item.portion}</Text>
            )}
          </div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {item.calories != null && <span className={styles.macroChip}>{item.calories} kcal</span>}
            {item.protein != null && <span className={styles.macroChip}>{item.protein}g P</span>}
            {item.carbs != null && <span className={styles.macroChip}>{item.carbs}g C</span>}
            {item.fat != null && <span className={styles.macroChip}>{item.fat}g G</span>}
          </div>
          <Button
            size="small"
            appearance="subtle"
            icon={<DeleteRegular />}
            onClick={() => onRemoveItem(idx)}
          />
        </div>
      ))}
    </div>
  );
}
