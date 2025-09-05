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
  downloads: string | number;
  image: string;
  category: string;
  price: string;
  description: string;
  type?: 'games' | 'apps' | 'websites';
  download_link?: string;
  file_path?: string;
  created_at: string;
  updated_at?: string;
  created_by?: string;
  // New fields for user interactions
  download_count: number;
  average_rating: number;
  rating_count: number;
  // Fields for uploaded files
  tags?: string[];
  downloadUrl?: string;
  isUploadedFile?: boolean;
  uploadedFileData?: any;
};

export type UserDownload = {
  id: string;
  user_id: string;
  item_id: string;
  downloaded_at: string;
  ip_address?: string;
  user_agent?: string;
};

export type UserRating = {
  id: string;
  user_id: string;
  item_id: string;
  rating: number;
  review?: string;
  created_at: string;
  updated_at: string;
};

export type UploadedFile = {
  id: string;
  item_id: string;
  filename: string;
  original_filename: string;
  file_size: number;
  mime_type: string;
  storage_path: string;
  uploaded_by: string;
  uploaded_at: string;
};