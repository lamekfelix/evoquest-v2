// Tipos centrais do EvoQuest v2

export type AttributeKey =
  | 'forca'
  | 'inteligencia'
  | 'sabedoria'
  | 'disciplina'
  | 'foco'
  | 'vitalidade'
  | 'resiliencia'
  | 'equilibrio';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  level: number;
  totalXp: number;
  class: string;
  createdAt: string;
}

export type ProjectStatus = 'inbox' | 'planned' | 'in-progress' | 'done';

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface TodoItem {
  id: string;
  text: string;
  done: boolean;
  createdAt: string;
}

export type TaskStatus = 'todo' | 'in_progress' | 'done';

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status: TaskStatus;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  icon?: string;
  area?: string;
  areaId?: string;
  attribute: AttributeKey;
  startDate?: string;
  endDate?: string;
  todos: TodoItem[];
  createdAt: string;
}

export type HabitFrequency = 'daily' | 'weekly';

export interface HabitLog {
  date: string;
  done: boolean;
}

export interface Habit {
  id: string;
  name: string;
  description?: string;
  attribute: AttributeKey;
  frequency: HabitFrequency;
  xpReward: number;
  streak: number;
  logs: HabitLog[];
  createdAt: string;
}

export type AgendaItemType = 'task' | 'event' | 'reminder';

export interface AgendaItem {
  id: string;
  title: string;
  description?: string;
  type: AgendaItemType;
  date: string;
  startTime?: string;
  endTime?: string;
  done: boolean;
  icon?: string;
  attribute?: AttributeKey;
  projectId?: string;
  areaId?: string;
}

export interface Area {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
}

export interface Resource {
  id: string;
  name: string;
  description?: string;
  link?: string;
  areaId?: string;
  projectIds: string[];
  tags: Tag[];
  createdAt: string;
}

export interface Archive {
  id: string;
  name: string;
  originalType: 'project' | 'area' | 'resource';
  originalData: unknown;
  archivedAt: string;
}

export interface WorkoutSet {
  reps?: number;
  weight?: number;
  duration?: number;
}

export interface WorkoutExercise {
  id: string;
  name: string;
  sets: WorkoutSet[];
}

export interface Workout {
  id: string;
  date: string;
  name: string;
  exercises: WorkoutExercise[];
  duration?: number;
  notes?: string;
}

export interface MealItem {
  name: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

export interface Meal {
  id: string;
  date: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  items: MealItem[];
  totalCalories?: number;
}

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  date: string;
}

export interface XPEvent {
  id: string;
  date: string;
  attr: AttributeKey;
  amount: number;
  reason: string;
  timestamp: number;
  levelUp?: boolean;
}

export interface XPNotification {
  id: string;
  attr: AttributeKey;
  amount: number;
  reason: string;
  levelUp?: boolean;
}

export interface AppState {
  user: User | null;
  attrXp: Record<AttributeKey, number>;
  habits: Habit[];
  projects: Project[];
  tasks: Task[];
  areas: Area[];
  resources: Resource[];
  archives: Archive[];
  agenda: AgendaItem[];
  workouts: Workout[];
  meals: Meal[];
  finances: Transaction[];
  waterToday: number;
  xpGainedToday: number;
  xpEvents: XPEvent[];
  xpHistory: XPEvent[];
  xpNotifications: XPNotification[];
  darkMode: boolean;
  sidebarCollapsed: boolean;
}
