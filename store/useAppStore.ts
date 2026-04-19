'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  AppState, User, Habit, Project, Area, Resource, Archive,
  AgendaItem, Workout, Meal, Transaction, AttributeKey,
  ProjectStatus, TodoItem,
} from './types';
import { INITIAL_ATTR_XP } from './constants';
import { calcTotalXp, getLevelFromXp } from '@/lib/xp';
import { generateId, dateISO } from '@/lib/utils';

interface AppActions {
  // Usuário
  setUser: (user: User) => void;
  updateUser: (partial: Partial<User>) => void;

  // XP
  addAttrXp: (attr: AttributeKey, amount: number) => void;

  // Hábitos
  addHabit: (habit: Omit<Habit, 'id' | 'streak' | 'logs' | 'createdAt'>) => void;
  toggleHabitToday: (id: string) => void;
  deleteHabit: (id: string) => void;

  // Projetos
  addProject: (project: Omit<Project, 'id' | 'todos' | 'createdAt'>) => void;
  updateProject: (id: string, partial: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  updateProjectStatus: (id: string, status: ProjectStatus) => void;
  addTodo: (projectId: string, text: string) => void;
  toggleTodo: (projectId: string, todoId: string) => void;
  deleteTodo: (projectId: string, todoId: string) => void;

  // Agenda
  addAgendaItem: (item: Omit<AgendaItem, 'id'>) => void;
  toggleAgendaItem: (id: string) => void;
  deleteAgendaItem: (id: string) => void;

  // Finanças
  addTransaction: (t: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;

  // Workout
  addWorkout: (w: Omit<Workout, 'id'>) => void;
  deleteWorkout: (id: string) => void;

  // Refeições
  addMeal: (m: Omit<Meal, 'id'>) => void;
  deleteMeal: (id: string) => void;

  // UI
  toggleDarkMode: () => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (v: boolean) => void;

  // Água
  setWaterToday: (ml: number) => void;
}

const initialState: AppState = {
  user: null,
  attrXp: { ...INITIAL_ATTR_XP },
  habits: [],
  projects: [],
  areas: [],
  resources: [],
  archives: [],
  agenda: [],
  workouts: [],
  meals: [],
  finances: [],
  waterToday: 0,
  xpGainedToday: 0,
  darkMode: false,
  sidebarCollapsed: false,
};

export const useAppStore = create<AppState & AppActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      setUser: (user) => set({ user }),

      updateUser: (partial) =>
        set((s) => ({ user: s.user ? { ...s.user, ...partial } : null })),

      addAttrXp: (attr, amount) =>
        set((s) => {
          const attrXp = { ...s.attrXp, [attr]: (s.attrXp[attr] ?? 0) + amount };
          const totalXp = calcTotalXp(attrXp);
          const { level } = getLevelFromXp(totalXp);
          const user = s.user ? { ...s.user, totalXp, level } : null;
          return { attrXp, user, xpGainedToday: s.xpGainedToday + amount };
        }),

      addHabit: (habit) =>
        set((s) => ({
          habits: [
            ...s.habits,
            { ...habit, id: generateId(), streak: 0, logs: [], createdAt: dateISO() },
          ],
        })),

      toggleHabitToday: (id) =>
        set((s) => {
          const today = dateISO();
          return {
            habits: s.habits.map((h) => {
              if (h.id !== id) return h;
              const existing = h.logs.find((l) => l.date === today);
              const wasDone = existing?.done ?? false;
              const logs = existing
                ? h.logs.map((l) => l.date === today ? { ...l, done: !l.done } : l)
                : [...h.logs, { date: today, done: true }];
              const streak = !wasDone ? h.streak + 1 : Math.max(0, h.streak - 1);
              return { ...h, logs, streak };
            }),
          };
        }),

      deleteHabit: (id) => set((s) => ({ habits: s.habits.filter((h) => h.id !== id) })),

      addProject: (project) =>
        set((s) => ({
          projects: [
            ...s.projects,
            { ...project, id: generateId(), todos: [], createdAt: dateISO() },
          ],
        })),

      updateProject: (id, partial) =>
        set((s) => ({
          projects: s.projects.map((p) => (p.id === id ? { ...p, ...partial } : p)),
        })),

      deleteProject: (id) =>
        set((s) => ({ projects: s.projects.filter((p) => p.id !== id) })),

      updateProjectStatus: (id, status) =>
        set((s) => ({
          projects: s.projects.map((p) => (p.id === id ? { ...p, status } : p)),
        })),

      addTodo: (projectId, text) =>
        set((s) => ({
          projects: s.projects.map((p) => {
            if (p.id !== projectId) return p;
            const todo: TodoItem = { id: generateId(), text, done: false, createdAt: dateISO() };
            return { ...p, todos: [...p.todos, todo] };
          }),
        })),

      toggleTodo: (projectId, todoId) =>
        set((s) => ({
          projects: s.projects.map((p) => {
            if (p.id !== projectId) return p;
            return {
              ...p,
              todos: p.todos.map((t) => (t.id === todoId ? { ...t, done: !t.done } : t)),
            };
          }),
        })),

      deleteTodo: (projectId, todoId) =>
        set((s) => ({
          projects: s.projects.map((p) => {
            if (p.id !== projectId) return p;
            return { ...p, todos: p.todos.filter((t) => t.id !== todoId) };
          }),
        })),

      addAgendaItem: (item) =>
        set((s) => ({ agenda: [...s.agenda, { ...item, id: generateId() }] })),

      toggleAgendaItem: (id) =>
        set((s) => ({
          agenda: s.agenda.map((a) => (a.id === id ? { ...a, done: !a.done } : a)),
        })),

      deleteAgendaItem: (id) =>
        set((s) => ({ agenda: s.agenda.filter((a) => a.id !== id) })),

      addTransaction: (t) =>
        set((s) => ({ finances: [...s.finances, { ...t, id: generateId() }] })),

      deleteTransaction: (id) =>
        set((s) => ({ finances: s.finances.filter((f) => f.id !== id) })),

      addWorkout: (w) =>
        set((s) => ({ workouts: [...s.workouts, { ...w, id: generateId() }] })),

      deleteWorkout: (id) =>
        set((s) => ({ workouts: s.workouts.filter((w) => w.id !== id) })),

      addMeal: (m) =>
        set((s) => ({ meals: [...s.meals, { ...m, id: generateId() }] })),

      deleteMeal: (id) =>
        set((s) => ({ meals: s.meals.filter((m) => m.id !== id) })),

      toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),

      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

      setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),

      setWaterToday: (ml) => set({ waterToday: ml }),
    }),
    {
      name: 'evoquest-v2-store',
    }
  )
);
