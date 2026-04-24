'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import type { User } from '@/store/types';

const DEV_USER: User = {
  id: 'dev-user',
  name: 'Lamek',
  email: 'dev@test.com',
  level: 5,
  totalXp: 1250,
  class: 'Guerreiro',
  createdAt: '2024-01-01',
};

export function DevAutoLogin() {
  const user = useAppStore((s) => s.user);
  const setUser = useAppStore((s) => s.setUser);

  useEffect(() => {
    if (!user) setUser(DEV_USER);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
