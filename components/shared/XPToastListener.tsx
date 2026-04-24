'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useAppStore } from '@/store/useAppStore';
import { ATTRIBUTES } from '@/store/constants';

interface ToastItem {
  id: string;
  title: string;
  body: string;
  isLoss: boolean;
  isLevelUp: boolean;
  phase: 'in' | 'visible' | 'out';
}

const VISIBLE_MS = 3000;
const ANIM_MS = 320;

function XPToastStack({ items, onDone }: { items: ToastItem[]; onDone: (id: string) => void }) {
  return createPortal(
    <div
      style={{
        position: 'fixed',
        top: 72,
        right: 20,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        pointerEvents: 'none',
      }}
    >
      {items.map((t) => {
        const bg = t.isLevelUp ? '#c8952a' : t.isLoss ? '#B94040' : '#8B6F47';
        const opacity = t.phase === 'out' ? 0 : 1;
        const translateX = t.phase === 'in' ? 40 : 0;

        return (
          <div
            key={t.id}
            style={{
              background: bg,
              color: '#fff',
              borderRadius: 10,
              padding: '10px 14px',
              minWidth: 220,
              maxWidth: 300,
              boxShadow: '0 4px 16px rgba(0,0,0,0.28)',
              opacity,
              transform: `translateX(${translateX}px)`,
              transition: `opacity ${ANIM_MS}ms ease, transform ${ANIM_MS}ms ease`,
              pointerEvents: 'none',
            }}
          >
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{t.title}</div>
            <div style={{ fontSize: 12, opacity: 0.88 }}>{t.body}</div>
          </div>
        );
      })}
    </div>,
    document.body
  );
}

export function XPToastListener() {
  const notifications = useAppStore((s) => s.xpNotifications);
  const dismiss = useAppStore((s) => s.dismissXpNotification);
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => {
    notifications.forEach((n) => {
      setItems((prev) => {
        if (prev.some((t) => t.id === n.id)) return prev;
        const attr = ATTRIBUTES.find((a) => a.key === n.attr);
        const isLoss = n.amount < 0;
        const title = n.levelUp
          ? `⬆️ Level Up! ${attr?.label ?? n.attr}`
          : isLoss
            ? `${n.amount} XP ${attr?.icon ?? ''} ${attr?.label ?? n.attr}`
            : `+${n.amount} XP ${attr?.icon ?? '⚡'} ${attr?.label ?? n.attr}`;

        const item: ToastItem = { id: n.id, title, body: n.reason, isLoss, isLevelUp: !!n.levelUp, phase: 'in' };
        dismiss(n.id);
        return [...prev, item];
      });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notifications.length]);

  // Animate in → visible → out → remove
  useEffect(() => {
    items.forEach((t) => {
      if (t.phase !== 'in') return;

      // Slide in
      setTimeout(() => setItems((prev) => prev.map((x) => x.id === t.id ? { ...x, phase: 'visible' } : x)), 16);

      // Fade out
      const visibleDuration = t.isLevelUp ? 5000 : VISIBLE_MS;
      setTimeout(
        () => setItems((prev) => prev.map((x) => x.id === t.id ? { ...x, phase: 'out' } : x)),
        16 + visibleDuration
      );

      // Remove
      setTimeout(
        () => setItems((prev) => prev.filter((x) => x.id !== t.id)),
        16 + visibleDuration + ANIM_MS
      );
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  if (items.length === 0) return null;
  return <XPToastStack items={items} onDone={(id) => setItems((p) => p.filter((x) => x.id !== id))} />;
}
