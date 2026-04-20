'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  AppState, User, Habit, Project, Task, Area, Resource, Archive,
  AgendaItem, Workout, Meal, Transaction, AttributeKey,
  ProjectStatus, TaskStatus, TodoItem,
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

  // Tasks
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, partial: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  moveTaskStatus: (id: string, status: TaskStatus) => void;
  updateProjectIcon: (id: string, icon: string) => void;

  // Áreas
  addArea: (area: Omit<Area, 'id'>) => void;
  updateArea: (id: string, partial: Partial<Area>) => void;
  deleteArea: (id: string) => void;

  // Resources
  addResource: (resource: Omit<Resource, 'id' | 'createdAt'>) => void;
  updateResource: (id: string, partial: Partial<Resource>) => void;
  deleteResource: (id: string) => void;

  // Archives
  archiveProject: (id: string) => void;
  archiveArea: (id: string) => void;
  archiveResource: (id: string) => void;
  restoreFromArchive: (id: string) => void;
  deleteFromArchive: (id: string) => void;

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
  tasks: [],
  areas: [],
  resources: [],
  archives: [],
  agenda: [],
  workouts: [],
  meals: [],
  finances: [],
  waterToday: 0,
  xpGainedToday: 0,
  xpEvents: [],
  xpHistory: [],
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

      addTask: (task) =>
        set((s) => ({
          tasks: [...s.tasks, { ...task, id: generateId(), createdAt: dateISO() }],
        })),

      updateTask: (id, partial) =>
        set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...partial } : t)) })),

      deleteTask: (id) =>
        set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),

      moveTaskStatus: (id, status) =>
        set((s) => {
          const task = s.tasks.find((t) => t.id === id);
          if (!task) return s;
          const wasDone = task.status === 'done';
          const newTasks = s.tasks.map((t) => (t.id === id ? { ...t, status } : t));
          if (status === 'done' && !wasDone) {
            const project = s.projects.find((p) => p.id === task.projectId);
            if (project) {
              const attrXp = { ...s.attrXp, [project.attribute]: (s.attrXp[project.attribute] ?? 0) + 15 };
              const totalXp = calcTotalXp(attrXp);
              const { level } = getLevelFromXp(totalXp);
              const user = s.user ? { ...s.user, totalXp, level } : null;
              return { tasks: newTasks, attrXp, user, xpGainedToday: s.xpGainedToday + 15 };
            }
          }
          return { tasks: newTasks };
        }),

      updateProjectIcon: (id, icon) =>
        set((s) => ({
          projects: s.projects.map((p) => (p.id === id ? { ...p, icon } : p)),
        })),

      addArea: (area) =>
        set((s) => ({ areas: [...s.areas, { ...area, id: generateId() }] })),

      updateArea: (id, partial) =>
        set((s) => ({ areas: s.areas.map((a) => (a.id === id ? { ...a, ...partial } : a)) })),

      deleteArea: (id) =>
        set((s) => ({ areas: s.areas.filter((a) => a.id !== id) })),

      addResource: (resource) =>
        set((s) => ({
          resources: [...s.resources, { ...resource, id: generateId(), createdAt: dateISO() }],
        })),

      updateResource: (id, partial) =>
        set((s) => ({
          resources: s.resources.map((r) => (r.id === id ? { ...r, ...partial } : r)),
        })),

      deleteResource: (id) =>
        set((s) => ({ resources: s.resources.filter((r) => r.id !== id) })),

      archiveProject: (id) =>
        set((s) => {
          const item = s.projects.find((p) => p.id === id);
          if (!item) return s;
          const archive: Archive = {
            id: generateId(), name: item.name,
            originalType: 'project', originalData: item, archivedAt: dateISO(),
          };
          return { projects: s.projects.filter((p) => p.id !== id), archives: [...s.archives, archive] };
        }),

      archiveArea: (id) =>
        set((s) => {
          const item = s.areas.find((a) => a.id === id);
          if (!item) return s;
          const archive: Archive = {
            id: generateId(), name: item.name,
            originalType: 'area', originalData: item, archivedAt: dateISO(),
          };
          return { areas: s.areas.filter((a) => a.id !== id), archives: [...s.archives, archive] };
        }),

      archiveResource: (id) =>
        set((s) => {
          const item = s.resources.find((r) => r.id === id);
          if (!item) return s;
          const archive: Archive = {
            id: generateId(), name: item.name,
            originalType: 'resource', originalData: item, archivedAt: dateISO(),
          };
          return { resources: s.resources.filter((r) => r.id !== id), archives: [...s.archives, archive] };
        }),

      restoreFromArchive: (id) =>
        set((s) => {
          const entry = s.archives.find((a) => a.id === id);
          if (!entry) return s;
          const base = { archives: s.archives.filter((a) => a.id !== id) };
          if (entry.originalType === 'project')
            return { ...base, projects: [...s.projects, entry.originalData as Project] };
          if (entry.originalType === 'area')
            return { ...base, areas: [...s.areas, entry.originalData as Area] };
          return { ...base, resources: [...s.resources, entry.originalData as Resource] };
        }),

      deleteFromArchive: (id) =>
        set((s) => ({ archives: s.archives.filter((a) => a.id !== id) })),

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
