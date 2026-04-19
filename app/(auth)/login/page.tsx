'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Field, Input, Text, makeStyles, tokens, Divider } from '@fluentui/react-components';
import { supabase } from '@/lib/supabase';

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
    gap: '16px',
    width: '100%',
    maxWidth: '360px',
    padding: '32px',
    borderRadius: tokens.borderRadiusXLarge,
    backgroundColor: tokens.colorNeutralBackground2,
    boxShadow: tokens.shadow16,
  },
  actions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginTop: '8px',
  },
  error: {
    color: tokens.colorPaletteRedForeground1,
    fontSize: tokens.fontSizeBase200,
  },
  info: {
    color: tokens.colorNeutralForeground2,
    fontSize: tokens.fontSizeBase200,
    textAlign: 'center' as const,
  },
});

async function resolveDestination(userId: string): Promise<'/onboarding' | '/dashboard'> {
  const { data } = await supabase
    .from('users')
    .select('name')
    .eq('id', userId)
    .single();
  return data?.name ? '/dashboard' : '/onboarding';
}

export default function LoginPage() {
  const styles = useStyles();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  async function handleLogin() {
    setLoading(true);
    setError(null);
    setInfo(null);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setError(error.message); setLoading(false); return; }
    router.push(await resolveDestination(data.user.id));
  }

  async function handleSignup() {
    setLoading(true);
    setError(null);
    setInfo(null);
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) { setError(error.message); setLoading(false); return; }
    if (data.session) {
      router.push('/onboarding');
    } else {
      setInfo('Verifique seu email para confirmar o cadastro.');
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) { setError(error.message); setLoading(false); }
  }

  const handleSubmit = mode === 'login' ? handleLogin : handleSignup;

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <Text size={600} weight="bold">EvoQuest</Text>
        <Text size={300} style={{ color: tokens.colorNeutralForeground3 }}>
          {mode === 'login' ? 'Entre na sua conta' : 'Crie sua conta'}
        </Text>

        <Field label="Email">
          <Input
            type="email"
            value={email}
            onChange={(_, d) => setEmail(d.value)}
            placeholder="seu@email.com"
          />
        </Field>

        <Field label="Senha">
          <Input
            type="password"
            value={password}
            onChange={(_, d) => setPassword(d.value)}
            placeholder="••••••••"
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
        </Field>

        {error && <span className={styles.error}>{error}</span>}
        {info && <span className={styles.info}>{info}</span>}

        <div className={styles.actions}>
          <Button appearance="primary" onClick={handleSubmit} disabled={loading || !email || !password}>
            {mode === 'login' ? 'Entrar' : 'Criar conta'}
          </Button>

          <Divider>ou</Divider>

          <Button appearance="outline" onClick={handleGoogle} disabled={loading}>
            Continuar com Google
          </Button>

          <Button
            appearance="transparent"
            size="small"
            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(null); setInfo(null); }}
          >
            {mode === 'login' ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Entre'}
          </Button>
        </div>
      </div>
    </div>
  );
}
