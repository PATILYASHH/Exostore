import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type StoreItem = {
  id: string;
  title: string;
  developer: string;
  rating: number;
  downloads: string;
  image: string;
  category: string;
  price: string;
  description: string;
  type: 'games' | 'apps' | 'websites';
  download_link?: string;
  file_path?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
};