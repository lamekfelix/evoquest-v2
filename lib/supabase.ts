import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null as any;

export type Database = {
  public: {
    Tables: {
      users: {
        Row: { id: string; email: string; name: string | null; character_class: string | null; avatar: string | null; created_at: string };
        Insert: { id: string; email: string; name?: string; character_class?: string; avatar?: string };
        Update: { name?: string; character_class?: string; avatar?: string };
      };
      attributes: {
        Row: { id: string; user_id: string; attribute_id: string; xp: number; updated_at: string };
        Insert: { user_id: string; attribute_id: string; xp?: number };
        Update: { xp?: number; updated_at?: string };
      };
      habits: {
        Row: { id: string; user_id: string; name: string; attr: string | null; xp_reward: number; streak: number; done_dates: string[]; created_at: string };
        Insert: { user_id: string; name: string; attr?: string; xp_reward?: number };
        Update: { name?: string; attr?: string; xp_reward?: number; streak?: number; done_dates?: string[] };
      };
      areas: {
        Row: { id: string; user_id: string; name: string; color: string | null; icon: string | null; created_at: string };
        Insert: { user_id: string; name: string; color?: string; icon?: string };
        Update: { name?: string; color?: string; icon?: string };
      };
      projects: {
        Row: { id: string; user_id: string; name: string; description: string | null; status: string; start_date: string | null; end_date: string | null; area_id: string | null; attr: string | null; resource_ids: string[]; created_at: string };
        Insert: { user_id: string; name: string; description?: string; status?: string; start_date?: string; end_date?: string; area_id?: string; attr?: string; resource_ids?: string[] };
        Update: { name?: string; description?: string; status?: string; start_date?: string; end_date?: string; area_id?: string; attr?: string; resource_ids?: string[] };
      };
      project_todos: {
        Row: { id: string; project_id: string; title: string; done: boolean; created_at: string };
        Insert: { project_id: string; title: string; done?: boolean };
        Update: { title?: string; done?: boolean };
      };
      agenda: {
        Row: { id: string; user_id: string; title: string; date: string; time_start: string | null; time_end: string | null; area_id: string | null; project_id: string | null; done: boolean; created_at: string };
        Insert: { user_id: string; title: string; date: string; time_start?: string; time_end?: string; area_id?: string; project_id?: string; done?: boolean };
        Update: { title?: string; date?: string; time_start?: string; time_end?: string; area_id?: string; project_id?: string; done?: boolean };
      };
      resources: {
        Row: { id: string; user_id: string; name: string; description: string | null; link: string | null; area_id: string | null; created_at: string };
        Insert: { user_id: string; name: string; description?: string; link?: string; area_id?: string };
        Update: { name?: string; description?: string; link?: string; area_id?: string };
      };
      archives: {
        Row: { id: string; user_id: string; name: string; original_type: string | null; archived_at: string };
        Insert: { user_id: string; name: string; original_type?: string };
        Update: never;
      };
      workouts: {
        Row: { id: string; user_id: string; name: string; date: string | null; exercises: unknown[]; created_at: string };
        Insert: { user_id: string; name: string; date?: string; exercises?: unknown[] };
        Update: { name?: string; date?: string; exercises?: unknown[] };
      };
      meals: {
        Row: { id: string; user_id: string; name: string; date: string | null; time: string | null; items: unknown[]; created_at: string };
        Insert: { user_id: string; name: string; date?: string; time?: string; items?: unknown[] };
        Update: { name?: string; date?: string; time?: string; items?: unknown[] };
      };
      transactions: {
        Row: { id: string; user_id: string; type: 'income' | 'expense'; category: string | null; amount: number; description: string | null; date: string; created_at: string };
        Insert: { user_id: string; type: 'income' | 'expense'; category?: string; amount: number; description?: string; date: string };
        Update: { type?: 'income' | 'expense'; category?: string; amount?: number; description?: string; date?: string };
      };
      achievements: {
        Row: { id: string; user_id: string; achievement_id: string; unlocked_at: string };
        Insert: { user_id: string; achievement_id: string };
        Update: never;
      };
    };
  };
};
