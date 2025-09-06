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
  // Admin editable fields
  version?: string;
  file_size?: string;
  last_updated?: string;
  // Open source fields
  is_opensource?: boolean;
  github_url?: string;
  // New fields for user interactions (from database)
  download_count: number;
  average_rating: number;
  rating_count: number;
  // Cross-platform support fields (from database)
  has_web_version?: boolean;
  has_app_version?: boolean;
  web_version_url?: string;
  app_version_url?: string;
  cross_platform_notes?: string;
  // Fields for uploaded files
  tags?: string[];
  downloadUrl?: string;
  isUploadedFile?: boolean;
  uploadedFileData?: any;
  // Fields for cross-platform cards
  is_cross_platform_card?: boolean;
  original_category?: string;
  cross_platform_type?: 'web' | 'app';
  web_platform_url?: string;
  app_platform_url?: string;
};

export type UserDownload = {
  id: string;
  user_id: string;
  item_id: string;
  download_type: 'store_item' | 'uploaded_file';
  downloaded_at: string;
  ip_address?: string;
  user_agent?: string;
};

export type UserRating = {
  id: string;
  user_id: string;
  item_id: string;
  rating: number;
  comment?: string;
  rating_type: 'store_item' | 'uploaded_file';
  created_at: string;
  updated_at: string;
};

export type UploadedFile = {
  id: string;
  filename: string;
  original_filename: string;
  file_type: string;
  file_size: number;
  file_url?: string;
  mime_type?: string;
  storage_path?: string;
  uploaded_by?: string;
  uploaded_at: string;
  download_count: number;
  rating_count: number;
  average_rating: number;
  // Cross-platform support
  has_web_version?: boolean;
  has_app_version?: boolean;
  web_version_url?: string;
  app_version_url?: string;
};