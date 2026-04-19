'use client';

import { useState } from 'react';
import {
  Text, Button, Input, Select, Card, makeStyles, tokens,
} from '@fluentui/react-components';
import { useAppStore } from '@/store/useAppStore';
import { CLASSES } from '@/store/constants';

const useStyles = makeStyles({
  page: { display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '480px' },
  card: { padding: '24px', borderRadius: '12px', border: `1px solid ${tokens.colorNeutralStroke2}` },
  formField: { display: 'flex', flexDirection: 'column', gap: '6px' },
  section: { display: 'flex', flexDirection: 'column', gap: '16px' },
});

export default function ProfilePage() {
  const styles = useStyles();
  const user = useAppStore((s) => s.user);
  const updateUser = useAppStore((s) => s.updateUser);
  const toggleDarkMode = useAppStore((s) => s.toggleDarkMode);
  const darkMode = useAppStore((s) => s.darkMode);

  const [name, setName] = useState(user?.name ?? '');
  const [charClass, setCharClass] = useState(user?.class ?? CLASSES[0]);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    updateUser({ name: name.trim(), class: charClass });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (!user) {
    return <Text>Crie seu personagem no Dashboard primeiro.</Text>;
  }

  return (
    <div className={styles.page}>
      <Text size={600} weight="bold">Perfil & Configurações</Text>

      <Card className={styles.card}>
        <Text size={400} weight="semibold" block style={{ marginBottom: 16 }}>👤 Personagem</Text>
        <div className={styles.section}>
          <div className={styles.formField}>
            <Text size={200}>Nome</Text>
            <Input value={name} onChange={(_, d) => setName(d.value)} />
          </div>
          <div className={styles.formField}>
            <Text size={200}>Classe</Text>
            <Select value={charClass} onChange={(_, d) => setCharClass(d.value)}>
              {CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
            </Select>
          </div>
          <Button appearance="primary" onClick={handleSave} disabled={!name.trim()}>
            {saved ? '✓ Salvo!' : 'Salvar alterações'}
          </Button>
        </div>
      </Card>

      <Card className={styles.card}>
        <Text size={400} weight="semibold" block style={{ marginBottom: 16 }}>🎨 Aparência</Text>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <Text size={300} weight="semibold" block>Modo escuro</Text>
            <Text size={200} style={{ color: tokens.colorNeutralForeground2 }}>
              {darkMode ? 'Ativado' : 'Desativado'}
            </Text>
          </div>
          <Button appearance={darkMode ? 'primary' : 'secondary'} onClick={toggleDarkMode}>
            {darkMode ? '🌙 Escuro' : '☀️ Claro'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
