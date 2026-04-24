'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  AppState, User, Habit, Project, Task, Area, Resource, Archive,
  AgendaItem, Workout, Meal, Transaction, AttributeKey,
  ProjectStatus, TaskStatus, TodoItem, XPEvent, XPNotification,
  JournalEntry, Client, Product, Invoice, Payment,
  Expense, InvoiceStatus,
} from './types';
import { INITIAL_ATTR_XP } from './constants';
import { calcTotalXp, getLevelFromXp } from '@/lib/xp';
import { generateId, dateISO } from '@/lib/utils';
import { XP_REWARDS, streakBonus, workoutAttr } from '@/lib/xp-rewards';
import type { XpGrant } from '@/lib/xp-rewards';

// Applies XP grants to state, returns the state delta
function applyXp(s: AppState, grants: XpGrant[]): Partial<AppState> {
  const active = grants.filter((g) => g.amount !== 0);
  if (active.length === 0) return {};

  let attrXp = { ...s.attrXp };
  let xpGainedToday = s.xpGainedToday;
  const notifications: XPNotification[] = [];
  const events: XPEvent[] = [];

  for (const { attr, amount, reason } of active) {
    attrXp = { ...attrXp, [attr]: Math.max(0, (attrXp[attr] ?? 0) + amount) };
    xpGainedToday = Math.max(0, xpGainedToday + amount);
    const id = generateId();
    notifications.push({ id, attr, amount, reason });
    events.push({ id, date: dateISO(), attr, amount, reason, timestamp: Date.now() });
  }

  const oldLevel = getLevelFromXp(calcTotalXp(s.attrXp)).level;
  const totalXp = calcTotalXp(attrXp);
  const { level: newLevel } = getLevelFromXp(totalXp);
  if (newLevel > oldLevel && notifications.length > 0) {
    notifications[notifications.length - 1].levelUp = true;
  }
  const user = s.user ? { ...s.user, totalXp, level: newLevel } : null;

  return {
    attrXp,
    user,
    xpGainedToday,
    xpNotifications: [...s.xpNotifications, ...notifications],
    xpEvents: [...s.xpEvents, ...events],
    xpHistory: [...s.xpHistory, ...events],
  };
}

interface AppActions {
  setUser: (user: User) => void;
  updateUser: (partial: Partial<User>) => void;
  addAttrXp: (attr: AttributeKey, amount: number) => void;

  addHabit: (habit: Omit<Habit, 'id' | 'streak' | 'logs' | 'createdAt'>) => void;
  toggleHabitToday: (id: string) => void;
  deleteHabit: (id: string) => void;

  addProject: (project: Omit<Project, 'id' | 'todos' | 'createdAt'>) => void;
  updateProject: (id: string, partial: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  updateProjectStatus: (id: string, status: ProjectStatus) => void;
  addTodo: (projectId: string, text: string) => void;
  toggleTodo: (projectId: string, todoId: string) => void;
  deleteTodo: (projectId: string, todoId: string) => void;

  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, partial: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  moveTaskStatus: (id: string, status: TaskStatus) => void;
  updateProjectIcon: (id: string, icon: string) => void;

  addArea: (area: Omit<Area, 'id'>) => void;
  updateArea: (id: string, partial: Partial<Area>) => void;
  deleteArea: (id: string) => void;

  addResource: (resource: Omit<Resource, 'id' | 'createdAt'>) => void;
  updateResource: (id: string, partial: Partial<Resource>) => void;
  deleteResource: (id: string) => void;

  archiveProject: (id: string) => void;
  archiveArea: (id: string) => void;
  archiveResource: (id: string) => void;
  restoreFromArchive: (id: string) => void;
  deleteFromArchive: (id: string) => void;

  addAgendaItem: (item: Omit<AgendaItem, 'id'>) => void;
  updateAgendaItem: (id: string, partial: Partial<AgendaItem>) => void;
  toggleAgendaItem: (id: string) => void;
  deleteAgendaItem: (id: string) => void;

  addTransaction: (t: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;

  addWorkout: (w: Omit<Workout, 'id'>) => void;
  deleteWorkout: (id: string) => void;
  completeWorkout: (id: string) => void;
  addJournalEntry: (entry: Omit<JournalEntry, 'id' | 'createdAt'>) => void;
  updateJournalEntry: (id: string, partial: Partial<JournalEntry>) => void;

  addMeal: (m: Omit<Meal, 'id'>) => void;
  deleteMeal: (id: string) => void;

  toggleDarkMode: () => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (v: boolean) => void;
  setWaterToday: (ml: number) => void;

  dismissXpNotification: (id: string) => void;

  addClient: (client: Omit<Client, 'id' | 'createdAt'>) => void;
  updateClient: (id: string, partial: Partial<Client>) => void;
  deleteClient: (id: string) => void;

  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  updateProduct: (id: string, partial: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  addInvoice: (invoice: Omit<Invoice, 'id' | 'number' | 'createdAt'>) => void;
  updateInvoice: (id: string, partial: Partial<Invoice>) => void;
  deleteInvoice: (id: string) => void;
  updateInvoiceStatus: (id: string, status: InvoiceStatus) => void;
  addInvoicePayment: (invoiceId: string, payment: Omit<Payment, 'id'>) => void;
  duplicateInvoice: (id: string) => void;

  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => void;
  updateExpense: (id: string, partial: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;

  setSavingsGoal: (amount: number) => void;
  checkSavingsGoalMet: (currentBalance: number) => void;
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
  clients: [],
  products: [],
  invoices: [],
  expenses: [],
  savingsGoal: 0,
  savingsGoalMetMonth: '',
  waterToday: 0,
  xpGainedToday: 0,
  xpEvents: [],
  xpHistory: [],
  xpNotifications: [],
  journalEntries: [],
  darkMode: false,
  sidebarCollapsed: false,
};

export const useAppStore = create<AppState & AppActions>()(
  persist(
    (set) => ({
      ...initialState,

      setUser: (user) => set({ user }),

      updateUser: (partial) =>
        set((s) => ({ user: s.user ? { ...s.user, ...partial } : null })),

      addAttrXp: (attr, amount) =>
        set((s) => applyXp(s, [{ attr, amount, reason: 'XP manual' }])),

      // ── Hábitos ───────────────────────────────────────────────────────────

      addHabit: (habit) =>
        set((s) => ({
          habits: [...s.habits, { ...habit, id: generateId(), streak: 0, logs: [], createdAt: dateISO() }],
        })),

      toggleHabitToday: (id) =>
        set((s) => {
          const today = dateISO();
          const habit = s.habits.find((h) => h.id === id);
          if (!habit) return s;
          const existing = habit.logs.find((l) => l.date === today);
          const wasDone = existing?.done ?? false;
          const logs = existing
            ? habit.logs.map((l) => l.date === today ? { ...l, done: !l.done } : l)
            : [...habit.logs, { date: today, done: true }];
          const newStreak = !wasDone ? habit.streak + 1 : Math.max(0, habit.streak - 1);
          const newHabits = s.habits.map((h) => h.id === id ? { ...h, logs, streak: newStreak } : h);
          const grants: XpGrant[] = [];
          if (!wasDone) {
            grants.push({ attr: habit.attribute, amount: XP_REWARDS.HABIT_COMPLETE, reason: `Hábito: ${habit.name}` });
            const bonus = streakBonus(newStreak, habit.attribute);
            if (bonus) grants.push(bonus);
          } else {
            grants.push({ attr: habit.attribute, amount: XP_REWARDS.HABIT_LOSE_STREAK, reason: `Hábito desmarcado: ${habit.name}` });
          }
          return { habits: newHabits, ...applyXp(s, grants) };
        }),

      deleteHabit: (id) => set((s) => ({ habits: s.habits.filter((h) => h.id !== id) })),

      // ── Projetos ──────────────────────────────────────────────────────────

      addProject: (project) =>
        set((s) => {
          const newProject: Project = { ...project, id: generateId(), todos: [], createdAt: dateISO() };
          return {
            projects: [...s.projects, newProject],
            ...applyXp(s, [{ attr: 'disciplina', amount: XP_REWARDS.PROJECT_CREATE, reason: `Projeto criado: ${project.name}` }]),
          };
        }),

      updateProject: (id, partial) =>
        set((s) => ({ projects: s.projects.map((p) => (p.id === id ? { ...p, ...partial } : p)) })),

      deleteProject: (id) =>
        set((s) => ({ projects: s.projects.filter((p) => p.id !== id) })),

      updateProjectStatus: (id, status) =>
        set((s) => {
          const project = s.projects.find((p) => p.id === id);
          if (!project) return s;
          const newProjects = s.projects.map((p) => (p.id === id ? { ...p, status } : p));
          const grants: XpGrant[] = [];
          if (status === 'in-progress' && project.status !== 'in-progress')
            grants.push({ attr: 'foco', amount: XP_REWARDS.PROJECT_START, reason: `Projeto iniciado: ${project.name}` });
          if (status === 'done' && project.status !== 'done')
            grants.push({ attr: project.attribute, amount: XP_REWARDS.PROJECT_DONE, reason: `Projeto concluído: ${project.name}` });
          return { projects: newProjects, ...applyXp(s, grants) };
        }),

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
            return { ...p, todos: p.todos.map((t) => (t.id === todoId ? { ...t, done: !t.done } : t)) };
          }),
        })),

      deleteTodo: (projectId, todoId) =>
        set((s) => ({
          projects: s.projects.map((p) => {
            if (p.id !== projectId) return p;
            return { ...p, todos: p.todos.filter((t) => t.id !== todoId) };
          }),
        })),

      // ── Tasks ─────────────────────────────────────────────────────────────

      addTask: (task) =>
        set((s) => ({ tasks: [...s.tasks, { ...task, id: generateId(), createdAt: dateISO() }] })),

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
          const grants: XpGrant[] = [];
          if (status === 'done' && !wasDone) {
            const project = s.projects.find((p) => p.id === task.projectId);
            if (project) {
              const today = dateISO();
              const onTime = !task.endDate || task.endDate >= today;
              grants.push({
                attr: project.attribute,
                amount: onTime ? XP_REWARDS.PROJECT_TASK_ON_TIME : XP_REWARDS.PROJECT_TASK_COMPLETE,
                reason: onTime ? `Task no prazo: ${task.title}` : `Task concluída: ${task.title}`,
              });
              const projectTasks = newTasks.filter((t) => t.projectId === project.id);
              if (projectTasks.length > 0 && projectTasks.every((t) => t.status === 'done')) {
                grants.push({ attr: project.attribute, amount: XP_REWARDS.PROJECT_ALL_TASKS_DONE, reason: `100% das tasks: ${project.name}!` });
              }
            }
          }
          return { tasks: newTasks, ...applyXp(s, grants) };
        }),

      updateProjectIcon: (id, icon) =>
        set((s) => ({ projects: s.projects.map((p) => (p.id === id ? { ...p, icon } : p)) })),

      // ── Áreas ─────────────────────────────────────────────────────────────

      addArea: (area) =>
        set((s) => ({
          areas: [...s.areas, { ...area, id: generateId() }],
          ...applyXp(s, [{ attr: 'disciplina', amount: XP_REWARDS.AREA_CREATE, reason: `Área criada: ${area.name}` }]),
        })),

      updateArea: (id, partial) =>
        set((s) => ({ areas: s.areas.map((a) => (a.id === id ? { ...a, ...partial } : a)) })),

      deleteArea: (id) =>
        set((s) => ({ areas: s.areas.filter((a) => a.id !== id) })),

      // ── Resources ─────────────────────────────────────────────────────────

      addResource: (resource) =>
        set((s) => {
          const grants: XpGrant[] = [
            { attr: 'sabedoria', amount: XP_REWARDS.RESOURCE_CREATE, reason: `Resource: ${resource.name}` },
          ];
          if (resource.projectIds?.length > 0)
            grants.push({ attr: 'inteligencia', amount: XP_REWARDS.RESOURCE_LINK_PROJECT, reason: 'Resource vinculado a projeto' });
          return {
            resources: [...s.resources, { ...resource, id: generateId(), createdAt: dateISO() }],
            ...applyXp(s, grants),
          };
        }),

      updateResource: (id, partial) =>
        set((s) => {
          const existing = s.resources.find((r) => r.id === id);
          const grants: XpGrant[] = [];
          if (existing && partial.projectIds && partial.projectIds.length > existing.projectIds.length)
            grants.push({ attr: 'inteligencia', amount: XP_REWARDS.RESOURCE_LINK_PROJECT, reason: 'Resource vinculado a projeto' });
          return {
            resources: s.resources.map((r) => (r.id === id ? { ...r, ...partial } : r)),
            ...applyXp(s, grants),
          };
        }),

      deleteResource: (id) =>
        set((s) => ({ resources: s.resources.filter((r) => r.id !== id) })),

      // ── Arquivo ───────────────────────────────────────────────────────────

      archiveProject: (id) =>
        set((s) => {
          const item = s.projects.find((p) => p.id === id);
          if (!item) return s;
          const archive: Archive = { id: generateId(), name: item.name, originalType: 'project', originalData: item, archivedAt: dateISO() };
          return {
            projects: s.projects.filter((p) => p.id !== id),
            archives: [...s.archives, archive],
            ...applyXp(s, [
              { attr: 'sabedoria', amount: XP_REWARDS.PROJECT_ARCHIVE, reason: `Projeto arquivado: ${item.name}` },
            ]),
          };
        }),

      archiveArea: (id) =>
        set((s) => {
          const item = s.areas.find((a) => a.id === id);
          if (!item) return s;
          const archive: Archive = { id: generateId(), name: item.name, originalType: 'area', originalData: item, archivedAt: dateISO() };
          return {
            areas: s.areas.filter((a) => a.id !== id),
            archives: [...s.archives, archive],
            ...applyXp(s, [{ attr: 'sabedoria', amount: XP_REWARDS.ARCHIVE_ITEM, reason: `Área arquivada: ${item.name}` }]),
          };
        }),

      archiveResource: (id) =>
        set((s) => {
          const item = s.resources.find((r) => r.id === id);
          if (!item) return s;
          const archive: Archive = { id: generateId(), name: item.name, originalType: 'resource', originalData: item, archivedAt: dateISO() };
          return {
            resources: s.resources.filter((r) => r.id !== id),
            archives: [...s.archives, archive],
            ...applyXp(s, [{ attr: 'sabedoria', amount: XP_REWARDS.ARCHIVE_ITEM, reason: `Resource arquivado: ${item.name}` }]),
          };
        }),

      restoreFromArchive: (id) =>
        set((s) => {
          const entry = s.archives.find((a) => a.id === id);
          if (!entry) return s;
          const base = { archives: s.archives.filter((a) => a.id !== id) };
          if (entry.originalType === 'project') return { ...base, projects: [...s.projects, entry.originalData as Project] };
          if (entry.originalType === 'area') return { ...base, areas: [...s.areas, entry.originalData as Area] };
          return { ...base, resources: [...s.resources, entry.originalData as Resource] };
        }),

      deleteFromArchive: (id) =>
        set((s) => ({ archives: s.archives.filter((a) => a.id !== id) })),

      // ── Agenda ────────────────────────────────────────────────────────────

      addAgendaItem: (item) =>
        set((s) => ({ agenda: [...s.agenda, { ...item, id: generateId() }] })),

      updateAgendaItem: (id, partial) =>
        set((s) => ({ agenda: s.agenda.map((a) => (a.id === id ? { ...a, ...partial } : a)) })),

      toggleAgendaItem: (id) =>
        set((s) => {
          const item = s.agenda.find((a) => a.id === id);
          if (!item) return s;
          const newAgenda = s.agenda.map((a) => (a.id === id ? { ...a, done: !a.done } : a));
          const grants: XpGrant[] = [];
          if (!item.done && item.type === 'task') {
            const today = dateISO();
            const onTime = item.date >= today;
            const attrKey: AttributeKey = item.attribute
              ?? s.projects.find((p) => p.id === item.projectId)?.attribute
              ?? 'disciplina';
            grants.push({
              attr: attrKey,
              amount: onTime ? XP_REWARDS.AGENDA_TASK_ON_TIME : XP_REWARDS.AGENDA_TASK_LATE,
              reason: onTime ? `Tarefa concluída: ${item.title}` : `Tarefa atrasada: ${item.title}`,
            });
            // Daily clear bonus
            const todayTasks = newAgenda.filter((a) => a.date === today && a.type === 'task');
            if (todayTasks.length > 0 && todayTasks.every((a) => a.done)) {
              grants.push({ attr: 'disciplina', amount: XP_REWARDS.AGENDA_DAILY_CLEAR, reason: 'Daily clear! Todas as tarefas do dia!' });
            }
          }
          return { agenda: newAgenda, ...applyXp(s, grants) };
        }),

      deleteAgendaItem: (id) =>
        set((s) => ({ agenda: s.agenda.filter((a) => a.id !== id) })),

      // ── Finanças ──────────────────────────────────────────────────────────

      addTransaction: (t) =>
        set((s) => ({
          finances: [...s.finances, { ...t, id: generateId() }],
          ...applyXp(s, [{ attr: 'disciplina', amount: XP_REWARDS.TRANSACTION_LOG, reason: 'Transação registrada' }]),
        })),

      deleteTransaction: (id) =>
        set((s) => ({ finances: s.finances.filter((f) => f.id !== id) })),

      // ── Workout ───────────────────────────────────────────────────────────

      addWorkout: (w) =>
        set((s) => {
          const attr = workoutAttr((w as Workout).type);
          return {
            workouts: [...s.workouts, { ...w, id: generateId() }],
            ...applyXp(s, [{ attr, amount: XP_REWARDS.WORKOUT_LOG, reason: `Treino: ${w.name}` }]),
          };
        }),

      deleteWorkout: (id) =>
        set((s) => ({ workouts: s.workouts.filter((w) => w.id !== id) })),

      completeWorkout: (id) =>
        set((s) => {
          const w = s.workouts.find((x) => x.id === id);
          if (!w || w.done) return s;
          const attr = workoutAttr(w.type);
          return {
            workouts: s.workouts.map((x) => (x.id === id ? { ...x, done: true } : x)),
            ...applyXp(s, [{ attr, amount: XP_REWARDS.WORKOUT_COMPLETE, reason: `Treino concluído: ${w.name}` }]),
          };
        }),

      addJournalEntry: (entry) =>
        set((s) => ({
          journalEntries: [...s.journalEntries, { ...entry, id: generateId(), createdAt: dateISO() }],
          ...applyXp(s, [{ attr: 'sabedoria', amount: XP_REWARDS.JOURNAL_ENTRY, reason: 'Reflexão diária escrita!' }]),
        })),

      updateJournalEntry: (id, partial) =>
        set((s) => ({
          journalEntries: s.journalEntries.map((e) => (e.id === id ? { ...e, ...partial } : e)),
        })),

      // ── Refeições ─────────────────────────────────────────────────────────

      addMeal: (m) =>
        set((s) => {
          const newMeals = [...s.meals, { ...m, id: generateId() }];
          const grants: XpGrant[] = [{ attr: 'vitalidade', amount: XP_REWARDS.MEAL_LOG, reason: 'Refeição registrada' }];
          const todayMeals = newMeals.filter((meal) => meal.date === dateISO());
          if (todayMeals.length === 3)
            grants.push({ attr: 'disciplina', amount: XP_REWARDS.THREE_MEALS_DAY, reason: '3 refeições hoje!' });
          return { meals: newMeals, ...applyXp(s, grants) };
        }),

      deleteMeal: (id) =>
        set((s) => ({ meals: s.meals.filter((m) => m.id !== id) })),

      // ── Clientes ──────────────────────────────────────────────────────────

      addClient: (client) =>
        set((s) => ({ clients: [...s.clients, { ...client, id: generateId(), createdAt: dateISO() }] })),

      updateClient: (id, partial) =>
        set((s) => ({ clients: s.clients.map((c) => (c.id === id ? { ...c, ...partial } : c)) })),

      deleteClient: (id) =>
        set((s) => ({ clients: s.clients.filter((c) => c.id !== id) })),

      // ── Produtos ──────────────────────────────────────────────────────────

      addProduct: (product) =>
        set((s) => ({ products: [...s.products, { ...product, id: generateId(), createdAt: dateISO() }] })),

      updateProduct: (id, partial) =>
        set((s) => ({ products: s.products.map((p) => (p.id === id ? { ...p, ...partial } : p)) })),

      deleteProduct: (id) =>
        set((s) => ({ products: s.products.filter((p) => p.id !== id) })),

      // ── Faturas ───────────────────────────────────────────────────────────

      addInvoice: (invoice) =>
        set((s) => {
          const number = `INV-${String(s.invoices.length + 1).padStart(3, '0')}`;
          return { invoices: [...s.invoices, { ...invoice, id: generateId(), number, createdAt: dateISO() }] };
        }),

      updateInvoice: (id, partial) =>
        set((s) => ({ invoices: s.invoices.map((inv) => (inv.id === id ? { ...inv, ...partial } : inv)) })),

      deleteInvoice: (id) =>
        set((s) => ({ invoices: s.invoices.filter((inv) => inv.id !== id) })),

      updateInvoiceStatus: (id, status) =>
        set((s) => {
          const inv = s.invoices.find((i) => i.id === id);
          if (!inv) return s;
          const wasPaid = inv.status === 'paga';
          const newInvoices = s.invoices.map((i) => (i.id === id ? { ...i, status } : i));
          const grants: XpGrant[] = [];
          if (status === 'paga' && !wasPaid)
            grants.push({ attr: 'disciplina', amount: XP_REWARDS.INVOICE_PAID, reason: `Fatura ${inv.number} paga! +20 XP` });
          return { invoices: newInvoices, ...applyXp(s, grants) };
        }),

      addInvoicePayment: (invoiceId, payment) =>
        set((s) => ({
          invoices: s.invoices.map((inv) =>
            inv.id === invoiceId
              ? { ...inv, payments: [...inv.payments, { ...payment, id: generateId() }] }
              : inv
          ),
        })),

      duplicateInvoice: (id) =>
        set((s) => {
          const inv = s.invoices.find((i) => i.id === id);
          if (!inv) return s;
          const number = `INV-${String(s.invoices.length + 1).padStart(3, '0')}`;
          return {
            invoices: [
              ...s.invoices,
              { ...inv, id: generateId(), number, status: 'rascunho' as const, payments: [], issueDate: dateISO(), createdAt: dateISO() },
            ],
          };
        }),

      // ── Despesas ──────────────────────────────────────────────────────────

      addExpense: (expense) =>
        set((s) => ({
          expenses: [...s.expenses, { ...expense, id: generateId(), createdAt: dateISO() }],
          ...applyXp(s, [{ attr: 'disciplina', amount: XP_REWARDS.EXPENSE_LOG, reason: `Despesa: ${expense.description}` }]),
        })),

      updateExpense: (id, partial) =>
        set((s) => ({ expenses: s.expenses.map((e) => (e.id === id ? { ...e, ...partial } : e)) })),

      deleteExpense: (id) =>
        set((s) => ({ expenses: s.expenses.filter((e) => e.id !== id) })),

      // ── Meta de Economia ──────────────────────────────────────────────────

      setSavingsGoal: (amount) => set({ savingsGoal: amount }),

      checkSavingsGoalMet: (currentBalance) =>
        set((s) => {
          const currentMonth = dateISO().slice(0, 7);
          if (s.savingsGoal <= 0 || currentBalance < s.savingsGoal || s.savingsGoalMetMonth === currentMonth) return s;
          return {
            savingsGoalMetMonth: currentMonth,
            ...applyXp(s, [{ attr: 'resiliencia', amount: XP_REWARDS.SAVINGS_GOAL_MET, reason: 'Meta de economia atingida! +30 XP' }]),
          };
        }),

      // ── UI ────────────────────────────────────────────────────────────────

      toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),

      setWaterToday: (ml) =>
        set((s) => {
          const grants: XpGrant[] = [];
          if (s.waterToday < 2000 && ml >= 2000)
            grants.push({ attr: 'vitalidade', amount: XP_REWARDS.WATER_GOAL, reason: 'Meta de hidratação atingida!' });
          return { waterToday: ml, ...applyXp(s, grants) };
        }),

      dismissXpNotification: (id) =>
        set((s) => ({ xpNotifications: s.xpNotifications.filter((n) => n.id !== id) })),
    }),
    {
      name: 'evoquest-v2-store',
      onRehydrateStorage: () => (state) => {
        if (state) state.xpNotifications = [];
      },
    }
  )
);
