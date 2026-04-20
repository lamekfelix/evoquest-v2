'use client';

import { useEffect, useState } from 'react';
import {
  Text, Button, Card,
  Dialog, DialogSurface, DialogTitle, DialogBody, DialogActions,
  Input, Select, Badge, makeStyles, tokens,
} from '@fluentui/react-components';
import {
  CheckmarkCircleRegular, TaskListSquareLtrRegular,
} from '@fluentui/react-icons';
import { useAppStore } from '@/store/useAppStore';
import { StatCard } from '@/components/shared/StatCard';
import { LevelBadge } from '@/components/rpg/LevelBadge';
import { XPBar } from '@/components/rpg/XPBar';
import { RadarChart } from '@/components/dashboard/RadarChart';
import { HabitCard } from '@/components/dashboard/HabitCard';
import { WaterCard } from '@/components/dashboard/WaterCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { getLevelFromXp, calcTotalXp, getAttrLevel } from '@/lib/xp';
import { ATTRIBUTES, CLASSES } from '@/store/constants';
import { dateISO } from '@/lib/utils';
import type { AttributeKey } from '@/store/types';

const QUOTES = [
  'A disciplina é a ponte entre sonhos e realizações.',
  'Cada passo hoje é a fundação do amanhã que você quer construir.',
  'O crescimento começa onde o conforto termina.',
  'Não é sobre ter tempo — é sobre fazer o que importa agora.',
  'Consistência é a habilidade mais subestimada de todas.',
  'Cada esforço pequeno soma para uma grande transformação.',
  'Você não precisa ser perfeito, precisa ser constante.',
  'O foco de hoje é a vitória de amanhã.',
  'Evolução não é um destino, é um modo de vida.',
  'Grandes conquistas nascem de hábitos simples repetidos.',
  'A resiliência não evita as tempestades — ela te ensina a dançar na chuva.',
  'Conhecimento sem ação é apenas potencial desperdiçado.',
  'A jornada de mil milhas começa com um único passo consciente.',
  'Quem controla seu tempo controla seu destino.',
  'Investir em si mesmo é o retorno mais garantido.',
  'Cada desafio superado expande os seus limites.',
  'Equilíbrio não é imobilidade — é movimento intencional.',
  'Força não é ausência de fraqueza, é agir apesar dela.',
  'O melhor momento para começar já passou; o segundo melhor é agora.',
  'Você se torna aquilo que pratica todos os dias.',
];

const useStyles = makeStyles({
  page: { display: 'flex', flexDirection: 'column', gap: '20px' },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 2fr 1fr',
    gap: '20px',
    alignItems: 'flex-start',
    '@media (max-width: 900px)': { gridTemplateColumns: '1fr' },
  },
  col: { display: 'flex', flexDirection: 'column', gap: '12px' },
  charCard: {
    padding: '16px', borderRadius: '12px',
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    background: `linear-gradient(135deg, ${tokens.colorNeutralBackground2} 0%, ${tokens.colorNeutralBackground1} 100%)`,
    display: 'flex', flexDirection: 'column', gap: '10px',
  },
  attrRow: {
    display: 'flex', alignItems: 'center', gap: '8px',
    padding: '4px 0',
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  sectionTitle: { display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' },
  agendaItem: {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '10px 14px', borderRadius: '8px',
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground1,
    cursor: 'pointer',
  },
  questItem: {
    padding: '10px 12px', borderRadius: '8px',
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    background: tokens.colorNeutralBackground1,
    display: 'flex', flexDirection: 'column', gap: '4px',
  },
});

export default function DashboardPage() {
  const styles = useStyles();
  const user = useAppStore((s) => s.user);
  const attrXp = useAppStore((s) => s.attrXp);
  const habits = useAppStore((s) => s.habits);
  const projects = useAppStore((s) => s.projects);
  const tasks = useAppStore((s) => s.tasks);
  const agenda = useAppStore((s) => s.agenda);
  const waterToday = useAppStore((s) => s.waterToday);
  const setWaterToday = useAppStore((s) => s.setWaterToday);
  const setUser = useAppStore((s) => s.setUser);
  const toggleHabitToday = useAppStore((s) => s.toggleHabitToday);
  const toggleAgendaItem = useAppStore((s) => s.toggleAgendaItem);

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [name, setName] = useState('');
  const [charClass, setCharClass] = useState(CLASSES[0]);

  useEffect(() => { if (!user) setShowOnboarding(true); }, [user]);

  const totalXp = calcTotalXp(attrXp);
  const { level, currentXp, xpForNextLevel } = getLevelFromXp(totalXp);

  const today = dateISO();
  const todayHabits = habits.filter((h) => h.frequency === 'daily');
  const todayAgenda = agenda.filter((a) => a.date === today);
  const inProgressProjects = projects.filter((p) => p.status === 'in-progress');
  const doneTasks = tasks.filter((t) => t.status === 'done').length;

  // Active quests: up to 5 pending tasks from in-progress projects
  const activeQuests = tasks
    .filter((t) => t.status !== 'done' && inProgressProjects.some((p) => p.id === t.projectId))
    .slice(0, 5);

  const quote = QUOTES[new Date().getDate() % QUOTES.length];

  function handleCreateCharacter() {
    if (!name.trim()) return;
    setUser({ id: '1', name: name.trim(), email: '', level: 1, totalXp: 0, class: charClass, createdAt: today });
    setShowOnboarding(false);
  }

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Bom dia';
    if (h < 18) return 'Boa tarde';
    return 'Boa noite';
  })();

  return (
    <div className={styles.page}>
      {/* Onboarding */}
      <Dialog open={showOnboarding}>
        <DialogSurface>
          <DialogTitle>⚔️ Crie seu Personagem</DialogTitle>
          <DialogBody>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Text>Bem-vindo ao EvoQuest v2! Dê um nome ao seu herói e escolha sua classe.</Text>
              <Input placeholder="Nome do personagem" value={name} onChange={(_, d) => setName(d.value)} />
              <Select value={charClass} onChange={(_, d) => setCharClass(d.value)}>
                {CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
              </Select>
            </div>
          </DialogBody>
          <DialogActions>
            <Button appearance="primary" onClick={handleCreateCharacter} disabled={!name.trim()}>
              Começar a Jornada
            </Button>
          </DialogActions>
        </DialogSurface>
      </Dialog>

      {/* Page header */}
      <div>
        <Text size={600} weight="bold">Dashboard</Text>
        <Text block size={300} style={{ color: tokens.colorNeutralForeground2 }}>
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </Text>
      </div>

      {/* 3-column grid */}
      <div className={styles.grid}>

        {/* ═══════════════ COLUNA ESQUERDA ═══════════════ */}
        <div className={styles.col}>

          {/* Character card */}
          {user && (
            <div className={styles.charCard}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
                  background: tokens.colorBrandBackground,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22, fontWeight: 700, color: '#fff',
                }}>
                  {user.name[0]?.toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <Text size={400} weight="bold">{user.name}</Text>
                    <LevelBadge level={level} />
                  </div>
                  <Text size={100} style={{ color: tokens.colorNeutralForeground2 }}>{user.class}</Text>
                </div>
              </div>
              <XPBar currentXp={currentXp} maxXp={xpForNextLevel} height={6} showLabel />
              <Text size={100} style={{ color: tokens.colorNeutralForeground2, textAlign: 'right' }}>
                {totalXp.toLocaleString('pt-BR')} XP total
              </Text>
            </div>
          )}

          {/* Compact attribute list */}
          <Card style={{ padding: '12px 14px', borderRadius: 10, border: `1px solid ${tokens.colorNeutralStroke2}` }}>
            <Text size={200} weight="semibold" block style={{ marginBottom: 8 }}>⚔️ Atributos</Text>
            {ATTRIBUTES.map((attr) => {
              const { level: lvl } = getAttrLevel(attrXp[attr.key as AttributeKey] ?? 0);
              return (
                <div key={attr.key} className={styles.attrRow}>
                  <span style={{ fontSize: 14, flexShrink: 0 }}>{attr.icon}</span>
                  <Text size={100} style={{ flex: 1, color: tokens.colorNeutralForeground2 }}>{attr.label}</Text>
                  <Badge appearance="filled" size="small"
                    style={{ background: attr.color, color: '#fff', fontSize: '10px', padding: '1px 6px' }}>
                    Nv {lvl}
                  </Badge>
                </div>
              );
            })}
          </Card>

          {/* Radar chart */}
          <Card style={{ padding: '12px', borderRadius: 10, border: `1px solid ${tokens.colorNeutralStroke2}` }}>
            <Text size={200} weight="semibold" block style={{ marginBottom: 6, textAlign: 'center' }}>
              🕸️ Evolução
            </Text>
            <RadarChart attrXp={attrXp} />
          </Card>
        </div>

        {/* ═══════════════ COLUNA CENTRAL ═══════════════ */}
        <div className={styles.col}>

          {/* Greeting + quote */}
          <div>
            <Text size={500} weight="bold">
              {greeting}{user ? `, ${user.name}` : ''} 👋
            </Text>
            <Text block size={200} style={{ color: tokens.colorNeutralForeground2, fontStyle: 'italic', marginTop: 4 }}>
              &ldquo;{quote}&rdquo;
            </Text>
          </div>

          {/* Hábitos do dia */}
          <div>
            <div className={styles.sectionTitle}>
              <Text size={400} weight="semibold">🔄 Hábitos de Hoje</Text>
              {todayHabits.length > 0 && (
                <Badge appearance="filled" size="small"
                  style={{ background: '#55B96B', color: '#fff' }}>
                  {todayHabits.filter((h) => h.logs.find((l) => l.date === today && l.done)).length}/{todayHabits.length}
                </Badge>
              )}
            </div>
            {todayHabits.length === 0 ? (
              <EmptyState
                icon="🌱"
                title="Nenhum hábito diário"
                description="Crie hábitos para construir sua evolução todos os dias."
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {todayHabits.map((h) => {
                  const done = !!h.logs.find((l) => l.date === today && l.done);
                  return (
                    <HabitCard key={h.id} habit={h} doneToday={done} onToggle={toggleHabitToday} />
                  );
                })}
              </div>
            )}
          </div>

          {/* Agenda do dia */}
          <div>
            <div className={styles.sectionTitle}>
              <Text size={400} weight="semibold">📅 Agenda de Hoje</Text>
              {todayAgenda.length > 0 && (
                <Badge appearance="filled" size="small"
                  style={{ background: '#8B6F47', color: '#fff' }}>
                  {todayAgenda.filter((a) => a.done).length}/{todayAgenda.length}
                </Badge>
              )}
            </div>
            {todayAgenda.length === 0 ? (
              <EmptyState
                icon="📅"
                title="Agenda vazia hoje"
                description="Nenhum evento ou tarefa para hoje."
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {todayAgenda.map((item) => (
                  <div
                    key={item.id}
                    className={styles.agendaItem}
                    onClick={() => toggleAgendaItem(item.id)}
                    style={{ opacity: item.done ? 0.6 : 1 }}
                  >
                    <div style={{
                      width: 22, height: 22, borderRadius: item.type === 'task' ? 4 : '50%',
                      border: `2px solid ${tokens.colorBrandBackground}`,
                      background: item.done ? tokens.colorBrandBackground : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      {item.done && <span style={{ color: '#fff', fontSize: 11 }}>✓</span>}
                    </div>
                    <Text size={300} style={{ flex: 1, textDecoration: item.done ? 'line-through' : 'none' }}>
                      {item.title}
                    </Text>
                    {item.startTime && (
                      <Text size={100} style={{ color: tokens.colorNeutralForeground2, flexShrink: 0 }}>
                        {item.startTime}{item.endTime ? ` – ${item.endTime}` : ''}
                      </Text>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ═══════════════ COLUNA DIREITA ═══════════════ */}
        <div className={styles.col}>

          {/* Stat cards */}
          <StatCard
            icon={<TaskListSquareLtrRegular />}
            label="Projetos ativos"
            value={inProgressProjects.length}
            sub="em andamento"
            color="#5B8DD9"
          />
          <StatCard
            icon={<CheckmarkCircleRegular />}
            label="Tasks concluídas"
            value={doneTasks}
            sub="no total"
            color="#55B96B"
          />

          {/* Water card */}
          <WaterCard
            waterToday={waterToday}
            onAdd={(ml) => setWaterToday(Math.min(2000, waterToday + ml))}
          />

          {/* Quests ativas */}
          <div>
            <Text size={300} weight="semibold" block style={{ marginBottom: 8 }}>
              ⚡ Quests Ativas
            </Text>
            {activeQuests.length === 0 ? (
              <Text size={200} style={{ color: tokens.colorNeutralForeground2 }}>
                Nenhuma quest pendente. Bom trabalho!
              </Text>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {activeQuests.map((task) => {
                  const proj = projects.find((p) => p.id === task.projectId);
                  const attr = proj ? ATTRIBUTES.find((a) => a.key === proj.attribute) : undefined;
                  return (
                    <div key={task.id} className={styles.questItem}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 14, flexShrink: 0 }}>{proj?.icon ?? '📋'}</span>
                        <Text size={200} weight="semibold" style={{ flex: 1, minWidth: 0 }} truncate>
                          {task.title}
                        </Text>
                      </div>
                      {proj && (
                        <Text size={100} style={{ color: attr?.color ?? tokens.colorNeutralForeground2 }}>
                          {attr?.icon} {proj.name}
                        </Text>
                      )}
                      {task.endDate && (
                        <Text size={100} style={{ color: task.endDate < today ? '#E05C5C' : tokens.colorNeutralForeground3 }}>
                          📅 {task.endDate}
                        </Text>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
