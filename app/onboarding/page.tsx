'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Button, Field, Input, Text, makeStyles, tokens,
} from '@fluentui/react-components';
import { supabase } from '@/lib/supabase';
import { useAppStore } from '@/store/useAppStore';
import { CLASSES } from '@/store/constants';
import { dateISO } from '@/lib/utils';

const useStyles = makeStyles({
  page: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    width: '100%',
    maxWidth: '420px',
    padding: '40px',
    borderRadius: tokens.borderRadiusXLarge,
    backgroundColor: tokens.colorNeutralBackground2,
    boxShadow: tokens.shadow16,
  },
  classGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '8px',
  },
  classBtn: {
    padding: '10px',
    borderRadius: tokens.borderRadiusMedium,
    border: `2px solid ${tokens.colorNeutralStroke1}`,
    cursor: 'pointer',
    textAlign: 'center' as const,
    background: tokens.colorNeutralBackground1,
    transition: 'border-color 0.15s',
  },
  error: {
    color: tokens.colorPaletteRedForeground1,
    fontSize: tokens.fontSizeBase200,
  },
});

const CLASS_ICONS: Record<string, string> = {
  Guerreiro: '⚔️', Mago: '🔮', Sábio: '📖', Monge: '🧘',
  Explorador: '🗺️', Paladino: '🛡️', Druida: '🌿', Arqueiro: '🏹',
};

export default function OnboardingPage() {
  const styles = useStyles();
  const router = useRouter();
  const setUser = useAppStore((s) => s.setUser);

  const [name, setName] = useState('');
  const [selectedClass, setSelectedClass] = useState(CLASSES[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redireciona para login se não autenticado
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.replace('/login');
    });
  }, [router]);

  async function handleCreate() {
    if (!name.trim()) return;
    setLoading(true);
    setError(null);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { router.replace('/login'); return; }

    const { error } = await supabase
      .from('users')
      .update({ name: name.trim(), character_class: selectedClass })
      .eq('id', session.user.id);

    if (error) { setError(error.message); setLoading(false); return; }

    setUser({
      id: session.user.id,
      name: name.trim(),
      email: session.user.email ?? '',
      level: 1,
      totalXp: 0,
      class: selectedClass,
      createdAt: dateISO(),
    });

    router.replace('/dashboard');
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div>
          <Text size={700} weight="bold" block>⚔️ Crie seu Personagem</Text>
          <Text size={300} style={{ color: tokens.colorNeutralForeground3 }}>
            Bem-vindo ao EvoQuest! Dê um nome ao seu herói e escolha sua classe.
          </Text>
        </div>

        <Field label="Nome do personagem">
          <Input
            value={name}
            onChange={(_, d) => setName(d.value)}
            placeholder="Como quer ser chamado?"
            autoFocus
          />
        </Field>

        <div>
          <Text size={300} weight="semibold" block style={{ marginBottom: 8 }}>
            Classe
          </Text>
          <div className={styles.classGrid}>
            {CLASSES.map((c) => (
              <button
                key={c}
                className={styles.classBtn}
                style={{
                  borderColor: selectedClass === c ? tokens.colorBrandBackground : tokens.colorNeutralStroke1,
                  background: selectedClass === c ? tokens.colorBrandBackground2 : tokens.colorNeutralBackground1,
                }}
                onClick={() => setSelectedClass(c)}
              >
                <Text size={400}>{CLASS_ICONS[c]}</Text>
                <Text size={200} block weight={selectedClass === c ? 'semibold' : 'regular'}>{c}</Text>
              </button>
            ))}
          </div>
        </div>

        {error && <span className={styles.error}>{error}</span>}

        <Button
          appearance="primary"
          size="large"
          onClick={handleCreate}
          disabled={loading || !name.trim()}
        >
          Começar a Jornada
        </Button>
      </div>
    </div>
  );
}
