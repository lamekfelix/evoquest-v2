'use client';

import { useEffect, useRef } from 'react';
import {
  Toaster, useToastController,
  Toast, ToastTitle, ToastBody,
} from '@fluentui/react-components';
import { useAppStore } from '@/store/useAppStore';
import { ATTRIBUTES } from '@/store/constants';

const TOASTER_ID = 'xp-toaster';

export function XPToastListener() {
  const { dispatchToast } = useToastController(TOASTER_ID);
  const notifications = useAppStore((s) => s.xpNotifications);
  const dismiss = useAppStore((s) => s.dismissXpNotification);
  const processedRef = useRef(new Set<string>());

  useEffect(() => {
    notifications.forEach((n) => {
      if (processedRef.current.has(n.id)) return;
      processedRef.current.add(n.id);

      const attr = ATTRIBUTES.find((a) => a.key === n.attr);
      const isLoss = n.amount < 0;

      dispatchToast(
        <Toast>
          <ToastTitle>
            {n.levelUp
              ? `⬆️ Level Up! ${attr?.label ?? n.attr}`
              : isLoss
                ? `${n.amount} XP ${attr?.label ?? n.attr}`
                : `+${n.amount} XP ${attr?.icon ?? '⚡'} ${attr?.label ?? n.attr}`}
          </ToastTitle>
          <ToastBody>{n.reason}</ToastBody>
        </Toast>,
        {
          intent: n.levelUp ? 'warning' : isLoss ? 'error' : 'success',
          timeout: n.levelUp ? 5000 : 3000,
        }
      );

      setTimeout(() => dismiss(n.id), 0);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notifications]);

  return <Toaster toasterId={TOASTER_ID} position="top-end" offset={{ vertical: 64 }} />;
}
