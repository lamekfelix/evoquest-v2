'use client';

import { useState, useMemo } from 'react';
import { Button, Text, Textarea, makeStyles, tokens } from '@fluentui/react-components';
import { useAppStore } from '@/store/useAppStore';
import { dateISO } from '@/lib/utils';
import type { MoodEmoji } from '@/store/types';

const MOODS: MoodEmoji[] = ['😄', '😊', '😐', '😔', '😢'];
const PROMPTS = [
  'O que foi bom hoje?',
  'O que aprendi?',
  'O que quero melhorar amanhã?',
];

const useStyles = makeStyles({
  page: { display: 'flex', flexDirection: 'column', gap: '24px' },
  card: {
    backgroundColor: tokens.colorNeutralBackground2,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: '10px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  moodRow: { display: 'flex', gap: '8px' },
  moodBtn: {
    fontSize: '28px',
    cursor: 'pointer',
    background: 'none',
    border: '2px solid transparent',
    borderRadius: '8px',
    padding: '4px 8px',
    transition: 'border-color 0.15s',
  },
  promptChip: {
    padding: '4px 12px',
    borderRadius: '16px',
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    background: 'none',
    cursor: 'pointer',
    fontSize: '13px',
    color: tokens.colorNeutralForeground1,
    ':hover': { backgroundColor: tokens.colorNeutralBackground3 },
  },
  historyItem: {
    backgroundColor: tokens.colorNeutralBackground2,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: '8px',
    padding: '14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  streakBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: tokens.colorBrandBackground,
    color: '#fff',
    borderRadius: '16px',
    padding: '4px 12px',
    fontSize: '14px',
    fontWeight: 600,
  },
});

function calcStreak(entries: { date: string }[]): number {
  const today = dateISO();
  const dates = new Set(entries.map((e) => e.date));
  let streak = 0;
  let d = new Date(today);
  while (dates.has(d.toISOString().slice(0, 10))) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

export default function JournalPage() {
  const styles = useStyles();
  const journalEntries = useAppStore((s) => s.journalEntries);
  const addJournalEntry = useAppStore((s) => s.addJournalEntry);
  const updateJournalEntry = useAppStore((s) => s.updateJournalEntry);

  const today = dateISO();
  const todayEntry = journalEntries.find((e) => e.date === today);

  const [content, setContent] = useState(todayEntry?.content ?? '');
  const [mood, setMood] = useState<MoodEmoji | undefined>(todayEntry?.mood);
  const [saved, setSaved] = useState(!!todayEntry);

  const streak = useMemo(() => calcStreak(journalEntries), [journalEntries]);

  const past = useMemo(
    () => [...journalEntries].filter((e) => e.date !== today).sort((a, b) => b.date.localeCompare(a.date)),
    [journalEntries, today],
  );

  function handleSave() {
    if (!content.trim()) return;
    if (todayEntry) {
      updateJournalEntry(todayEntry.id, { content: content.trim(), mood });
    } else {
      addJournalEntry({ date: today, content: content.trim(), mood });
    }
    setSaved(true);
  }

  function appendPrompt(prompt: string) {
    setContent((c) => c ? `${c}\n\n${prompt}\n` : `${prompt}\n`);
    setSaved(false);
  }

  return (
    <div className={styles.page}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <Text size={600} weight="bold">Diário</Text>
          <Text size={300} block style={{ color: tokens.colorNeutralForeground2, marginTop: 4 }}>
            Reflexões diárias · ganhe XP em Sabedoria
          </Text>
        </div>
        {streak > 0 && (
          <span className={styles.streakBadge}>🔥 {streak} dia{streak > 1 ? 's' : ''} seguido{streak > 1 ? 's' : ''}</span>
        )}
      </div>

      <div className={styles.card}>
        <Text size={400} weight="semibold">{saved ? '✏️ Editar entrada de hoje' : '📝 Entrada de hoje'}</Text>

        <div>
          <Text size={200} style={{ color: tokens.colorNeutralForeground2 }}>Como você está?</Text>
          <div className={styles.moodRow} style={{ marginTop: 6 }}>
            {MOODS.map((m) => (
              <button
                key={m}
                className={styles.moodBtn}
                style={{ borderColor: mood === m ? tokens.colorBrandBackground : 'transparent' }}
                onClick={() => { setMood(m); setSaved(false); }}
                type="button"
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {PROMPTS.map((p) => (
            <button key={p} className={styles.promptChip} onClick={() => appendPrompt(p)} type="button">
              {p}
            </button>
          ))}
        </div>

        <Textarea
          value={content}
          onChange={(_, d) => { setContent(d.value); setSaved(false); }}
          placeholder="Escreva seus pensamentos..."
          resize="vertical"
          style={{ minHeight: 140 }}
        />

        <Button
          appearance="primary"
          onClick={handleSave}
          disabled={!content.trim()}
          style={{ alignSelf: 'flex-end' }}
        >
          {saved ? 'Atualizar' : 'Salvar +15 XP'}
        </Button>
      </div>

      {past.length > 0 && (
        <div>
          <Text size={400} weight="semibold">Histórico</Text>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
            {past.map((entry) => (
              <div key={entry.id} className={styles.historyItem}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {entry.mood && <span style={{ fontSize: 20 }}>{entry.mood}</span>}
                  <Text size={200} style={{ color: tokens.colorNeutralForeground2 }}>{entry.date}</Text>
                </div>
                <Text size={300} style={{ whiteSpace: 'pre-wrap', color: tokens.colorNeutralForeground1 }}>
                  {entry.content.length > 200 ? `${entry.content.slice(0, 200)}…` : entry.content}
                </Text>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
