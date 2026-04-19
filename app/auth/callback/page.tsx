'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Text, Spinner, makeStyles } from '@fluentui/react-components';
import { supabase } from '@/lib/supabase';

const useStyles = makeStyles({
  page: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    gap: '16px',
  },
});

export default function AuthCallbackPage() {
  const styles = useStyles();
  const router = useRouter();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session?.user) return;
      subscription.unsubscribe();
      const { data } = await supabase
        .from('users')
        .select('name')
        .eq('id', session.user.id)
        .single();
      router.replace(data?.name ? '/dashboard' : '/onboarding');
    });

    // Caso a sessão já exista ao montar (ex: reload)
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) return;
      subscription.unsubscribe();
      const { data } = await supabase
        .from('users')
        .select('name')
        .eq('id', session.user.id)
        .single();
      router.replace(data?.name ? '/dashboard' : '/onboarding');
    });

    return () => subscription.unsubscribe();
  }, [router]);

  return (
    <div className={styles.page}>
      <Spinner size="large" />
      <Text size={300}>Autenticando...</Text>
    </div>
  );
}
