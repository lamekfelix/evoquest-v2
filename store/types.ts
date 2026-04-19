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

export interface TodoItem {
  id: string;
  text: string;
  done: boolean;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  area?: string;
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
  attribute?: AttributeKey;
  projectId?: string;
}

export interface Area {
  id: string;
  name: string;
  description?: string;
  icon?: string;
}

export interface Resource {
  id: string;
  name: string;
  url?: string;
  description?: string;
  areaId?: string;
  tags: string[];
  createdAt: string;
}

export interface Archive {
  id: string;
  name: string;
  content?: string;
  type: 'project' | 'resource' | 'note';
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

export interface AppState {
  user: User | null;
  attrXp: Record<AttributeKey, number>;
  habits: Habit[];
  projects: Project[];
  areas: Area[];
  resources: Resource[];
  archives: Archive[];
  agenda: AgendaItem[];
  workouts: Workout[];
  meals: Meal[];
  finances: Transaction[];
  waterToday: number;
  xpGainedToday: number;
  darkMode: boolean;
  sidebarCollapsed: boolean;
}
