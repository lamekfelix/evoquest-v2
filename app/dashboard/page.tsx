'use client';

import { useEffect, useState } from 'react';
import {
  Text, Button, Card, Dialog, DialogSurface, DialogTitle,
  DialogBody, DialogActions, Input, Select, makeStyles, tokens,
} from '@fluentui/react-components';
import {
  CheckmarkCircleRegular, HeartPulseRegular,
  TaskListSquareLtrRegular, WaterRegular,
} from '@fluentui/react-icons';
import { useAppStore } from '@/store/useAppStore';
import { AttributeCard } from '@/components/rpg/AttributeCard';
import { StatCard } from '@/components/shared/StatCard';
import { LevelBadge } from '@/components/rpg/LevelBadge';
import { XPBar } from '@/components/rpg/XPBar';
import { getLevelFromXp, calcTotalXp } from '@/lib/xp';
import { ATTRIBUTES, CLASSES } from '@/store/constants';
import { dateISO } from '@/lib/utils';
import type { AttributeKey } from '@/store/types';

const useStyles = makeStyles({
  page: { display: 'flex', flexDirection: 'column', gap: '24px' },
  pageTitle: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  heroCard: {
    padding: '24px',
    borderRadius: '12px',
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    background: `linear-gradient(135deg, ${tokens.colorNeutralBackground2} 0%, ${tokens.colorNeutralBackground1} 100%)`,
  },
  avatar: {
    width: '64px', height: '64px', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '28px', fontWeight: '700', color: '#fff', flexShrink: '0',
  },
  heroInfo: { flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' },
  attrGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' },
  section: { display: 'flex', flexDirection: 'column', gap: '12px' },
  todayTasks: { display: 'flex', flexDirection: 'column', gap: '8px' },
  taskItem: {
    display: 'flex', alignItems: 'center', gap: '8px',
    padding: '8px 12px', borderRadius: '8px',
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground1,
  },
  waterRow: { display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' },
  waterBtn: { width: '36px', height: '36px', borderRadius: '50%', border: `2px solid ${tokens.colorNeutralStroke1}` },
});

const WATER_STEPS = [250, 500, 750, 1000, 1250, 1500, 1750, 2000];

export default function DashboardPage() {
  const styles = useStyles();
  const user = useAppStore((s) => s.user);
  const attrXp = useAppStore((s) => s.attrXp);
  const habits = useAppStore((s) => s.habits);
  const projects = useAppStore((s) => s.projects);
  const agenda = useAppStore((s) => s.agenda);
  const waterToday = useAppStore((s) => s.waterToday);
  const setWaterToday = useAppStore((s) => s.setWaterToday);
  const setUser = useAppStore((s) => s.setUser);
  const toggleHabitToday = useAppStore((s) => s.toggleHabitToday);
  const toggleAgendaItem = useAppStore((s) => s.toggleAgendaItem);

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [name, setName] = useState('');
  const [charClass, setCharClass] = useState(CLASSES[0]);

  useEffect(() => {
    if (!user) setShowOnboarding(true);
  }, [user]);

  const totalXp = calcTotalXp(attrXp);
  const { level, currentXp, xpForNextLevel, progressPercent } = getLevelFromXp(totalXp);

  const today = dateISO();
  const todayHabits = habits.filter((h) => h.frequency === 'daily');
  const todayAgenda = agenda.filter((a) => a.date === today);
  const inProgressProjects = projects.filter((p) => p.status === 'in-progress');
  const habitsCompletedToday = todayHabits.filter((h) => h.logs.find((l) => l.date === today && l.done)).length;

  function handleCreateCharacter() {
    if (!name.trim()) return;
    setUser({
      id: '1',
      name: name.trim(),
      email: '',
      level: 1,
      totalXp: 0,
      class: charClass,
      createdAt: today,
    });
    setShowOnboarding(false);
  }

  return (
    <div className={styles.page}>
      {/* Onboarding */}
      <Dialog open={showOnboarding}>
        <DialogSurface>
          <DialogTitle>⚔️ Crie seu Personagem</DialogTitle>
          <DialogBody>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Text>Bem-vindo ao EvoQuest v2! Dê um nome ao seu herói e escolha sua classe.</Text>
              <Input
                placeholder="Nome do personagem"
                value={name}
                onChange={(_, d) => setName(d.value)}
              />
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

      {/* Título */}
      <div className={styles.pageTitle}>
        <div>
          <Text size={600} weight="bold">Dashboard</Text>
          <Text block size={300} style={{ color: tokens.colorNeutralForeground2 }}>
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </Text>
        </div>
      </div>

      {/* Hero Card */}
      {user && (
        <Card className={styles.heroCard}>
          <div
            className={styles.avatar}
            style={{ background: tokens.colorBrandBackground }}
          >
            {user.name[0]?.toUpperCase()}
          </div>
          <div className={styles.heroInfo}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Text size={500} weight="bold">{user.name}</Text>
              <LevelBadge level={level} />
              <Text size={200} style={{ color: tokens.colorNeutralForeground2 }}>{user.class}</Text>
            </div>
            <XPBar currentXp={currentXp} maxXp={xpForNextLevel} height={8} showLabel />
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <Text size={100} style={{ color: tokens.colorNeutralForeground2 }}>XP Total</Text>
            <Text size={400} weight="bold" block>{totalXp.toLocaleString('pt-BR')}</Text>
          </div>
        </Card>
      )}

      {/* Stats rápidos */}
      <div className={styles.statsGrid}>
        <StatCard
          icon={<HeartPulseRegular />}
          label="Hábitos hoje"
          value={`${habitsCompletedToday}/${todayHabits.length}`}
          sub="concluídos"
          color="#55B96B"
        />
        <StatCard
          icon={<TaskListSquareLtrRegular />}
          label="Projetos ativos"
          value={inProgressProjects.length}
          sub="em andamento"
          color="#5B8DD9"
        />
        <StatCard
          icon={<CheckmarkCircleRegular />}
          label="Tarefas hoje"
          value={`${todayAgenda.filter((a) => a.done).length}/${todayAgenda.length}`}
          sub="concluídas"
          color="#8B6F47"
        />
        <StatCard
          icon={<WaterRegular />}
          label="Água"
          value={`${waterToday} ml`}
          sub="de 2000 ml"
          color="#4ECDC4"
        />
      </div>

      {/* Água tracker */}
      <Card style={{ padding: 16, borderRadius: 10, border: `1px solid ${tokens.colorNeutralStroke2}` }}>
        <Text size={300} weight="semibold" block style={{ marginBottom: 10 }}>💧 Hidratação</Text>
        <div className={styles.waterRow}>
          {WATER_STEPS.map((ml) => (
            <button
              key={ml}
              className={styles.waterBtn}
              onClick={() => setWaterToday(ml)}
              title={`${ml} ml`}
              style={{
                background: waterToday >= ml ? '#4ECDC4' : tokens.colorNeutralBackground2,
                cursor: 'pointer',
              }}
            >
              💧
            </button>
          ))}
          <Text size={200} style={{ color: tokens.colorNeutralForeground2 }}>
            {waterToday} / 2000 ml
          </Text>
        </div>
      </Card>

      {/* Hábitos do dia */}
      {todayHabits.length > 0 && (
        <div className={styles.section}>
          <Text size={400} weight="semibold">🔄 Hábitos de Hoje</Text>
          <div className={styles.todayTasks}>
            {todayHabits.map((h) => {
              const done = !!h.logs.find((l) => l.date === today && l.done);
              const attr = ATTRIBUTES.find((a) => a.key === h.attribute);
              return (
                <div key={h.id} className={styles.taskItem} style={{ opacity: done ? 0.65 : 1 }}>
                  <button
                    onClick={() => toggleHabitToday(h.id)}
                    style={{
                      width: 20, height: 20, borderRadius: '50%', border: `2px solid ${attr?.color ?? tokens.colorBrandBackground}`,
                      background: done ? (attr?.color ?? tokens.colorBrandBackground) : 'transparent',
                      cursor: 'pointer', flexShrink: 0,
                    }}
                  />
                  <Text size={300} style={{ flex: 1, textDecoration: done ? 'line-through' : 'none' }}>{h.name}</Text>
                  <Text size={100} style={{ color: attr?.color }}>🔥 {h.streak}</Text>
                  <Text size={100} style={{ color: tokens.colorNeutralForeground2 }}>
                    {attr?.icon} {attr?.label}
                  </Text>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Agenda do dia */}
      {todayAgenda.length > 0 && (
        <div className={styles.section}>
          <Text size={400} weight="semibold">📅 Agenda de Hoje</Text>
          <div className={styles.todayTasks}>
            {todayAgenda.map((item) => (
              <div key={item.id} className={styles.taskItem} style={{ opacity: item.done ? 0.65 : 1 }}>
                <button
                  onClick={() => toggleAgendaItem(item.id)}
                  style={{
                    width: 20, height: 20, borderRadius: 4,
                    border: `2px solid ${tokens.colorBrandBackground}`,
                    background: item.done ? tokens.colorBrandBackground : 'transparent',
                    cursor: 'pointer', flexShrink: 0,
                  }}
                />
                <Text size={300} style={{ flex: 1, textDecoration: item.done ? 'line-through' : 'none' }}>
                  {item.title}
                </Text>
                {item.startTime && (
                  <Text size={100} style={{ color: tokens.colorNeutralForeground2 }}>{item.startTime}</Text>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Atributos RPG */}
      <div className={styles.section}>
        <Text size={400} weight="semibold">⚔️ Atributos RPG</Text>
        <div className={styles.attrGrid}>
          {ATTRIBUTES.map((attr) => (
            <AttributeCard key={attr.key} attrKey={attr.key as AttributeKey} xp={attrXp[attr.key as AttributeKey] ?? 0} />
          ))}
        </div>
      </div>
    </div>
  );
}
