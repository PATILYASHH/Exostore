-- Comprehensive Data Connections Fix
-- This script fixes all issues with downloads, ratings, and comments
-- Run this in Supabase SQL Editor

-- =====================================================
-- 1. VERIFY AND FIX CORE TABLES
-- =====================================================

-- Fix store_items table to include all necessary columns
ALTER TABLE store_items 
ADD COLUMN IF NOT EXISTS download_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS average_rating numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS rating_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS has_web_version boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS has_app_version boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS web_version_url text,
ADD COLUMN IF NOT EXISTS app_version_url text,
ADD COLUMN IF NOT EXISTS cross_platform_notes text;

-- =====================================================
-- 2. CREATE/FIX USER_DOWNLOADS TABLE
-- =====================================================

-- Drop and recreate user_downloads table to ensure consistency
DROP TABLE IF EXISTS user_downloads CASCADE;

CREATE TABLE user_downloads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id uuid NOT NULL,
  download_type varchar(20) DEFAULT 'store_item' CHECK (download_type IN ('store_item', 'uploaded_file')),
  downloaded_at timestamptz DEFAULT now(),
  ip_address inet,
  user_agent text,
  UNIQUE(user_id, item_id, download_type)
);

-- =====================================================
-- 3. CREATE/FIX USER_RATINGS TABLE
-- =====================================================

-- Drop and recreate user_ratings table to ensure consistency
DROP TABLE IF EXISTS user_ratings CASCADE;

CREATE TABLE user_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id uuid NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  rating_type varchar(20) DEFAULT 'store_item' CHECK (rating_type IN ('store_item', 'uploaded_file')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, item_id, rating_type)
);

-- =====================================================
-- 4. CREATE/FIX UPLOADED_FILES TABLE
-- =====================================================

-- Drop and recreate uploaded_files table to match TypeScript interface
DROP TABLE IF EXISTS uploaded_files CASCADE;

CREATE TABLE uploaded_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  filename text NOT NULL,
  original_filename text NOT NULL,
  file_type text NOT NULL,
  file_size bigint NOT NULL,
  file_url text,
  mime_type text,
  storage_path text,
  uploaded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  uploaded_at timestamptz DEFAULT now(),
  download_count integer DEFAULT 0,
  rating_count integer DEFAULT 0,
  average_rating numeric DEFAULT 0,
  -- Cross-platform support
  has_web_version boolean DEFAULT false,
  has_app_version boolean DEFAULT false,
  web_version_url text,
  app_version_url text
);

-- =====================================================
-- 5. ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE user_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploaded_files ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 6. DROP ALL EXISTING POLICIES
-- =====================================================

-- Drop all existing policies to avoid conflicts
DO $$ 
DECLARE
    pol_name TEXT;
BEGIN
    -- Drop user_downloads policies
    FOR pol_name IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'user_downloads'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(pol_name) || ' ON user_downloads';
    END LOOP;
    
    -- Drop user_ratings policies
    FOR pol_name IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'user_ratings'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(pol_name) || ' ON user_ratings';
    END LOOP;
    
    -- Drop uploaded_files policies
    FOR pol_name IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'uploaded_files'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(pol_name) || ' ON uploaded_files';
    END LOOP;
END $$;

-- =====================================================
-- 7. CREATE FRESH POLICIES
-- =====================================================

-- USER_DOWNLOADS POLICIES
CREATE POLICY "users_can_view_own_downloads" ON user_downloads
  FOR SELECT TO authenticated 
  USING (auth.uid() = user_id);

CREATE POLICY "users_can_add_downloads" ON user_downloads
  FOR INSERT TO authenticated 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "admin_can_view_all_downloads" ON user_downloads
  FOR SELECT TO authenticated 
  USING (auth.jwt() ->> 'email' = 'yashpatil575757@gmail.com');

-- USER_RATINGS POLICIES
CREATE POLICY "anyone_can_view_ratings" ON user_ratings
  FOR SELECT USING (true);

CREATE POLICY "users_can_manage_own_ratings" ON user_ratings
  FOR ALL TO authenticated 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "admin_can_manage_all_ratings" ON user_ratings
  FOR ALL TO authenticated 
  USING (auth.jwt() ->> 'email' = 'yashpatil575757@gmail.com');

-- UPLOADED_FILES POLICIES
CREATE POLICY "anyone_can_view_uploaded_files" ON uploaded_files
  FOR SELECT USING (true);

CREATE POLICY "users_can_upload_files" ON uploaded_files
  FOR INSERT TO authenticated 
  WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "users_can_update_own_files" ON uploaded_files
  FOR UPDATE TO authenticated 
  USING (auth.uid() = uploaded_by);

CREATE POLICY "admin_can_manage_all_files" ON uploaded_files
  FOR ALL TO authenticated 
  USING (auth.jwt() ->> 'email' = 'yashpatil575757@gmail.com');

-- =====================================================
-- 8. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- User Downloads Indexes
CREATE INDEX IF NOT EXISTS idx_user_downloads_user ON user_downloads(user_id);
CREATE INDEX IF NOT EXISTS idx_user_downloads_item ON user_downloads(item_id, download_type);
CREATE INDEX IF NOT EXISTS idx_user_downloads_date ON user_downloads(downloaded_at DESC);

-- User Ratings Indexes
CREATE INDEX IF NOT EXISTS idx_user_ratings_user ON user_ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_ratings_item ON user_ratings(item_id, rating_type);
CREATE INDEX IF NOT EXISTS idx_user_ratings_date ON user_ratings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_ratings_rating ON user_ratings(rating);

-- Uploaded Files Indexes
CREATE INDEX IF NOT EXISTS idx_uploaded_files_user ON uploaded_files(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_uploaded_files_date ON uploaded_files(uploaded_at DESC);
CREATE INDEX IF NOT EXISTS idx_uploaded_files_type ON uploaded_files(file_type);

-- Store Items Indexes (for cross-platform features)
CREATE INDEX IF NOT EXISTS idx_store_items_web_version ON store_items(has_web_version);
CREATE INDEX IF NOT EXISTS idx_store_items_app_version ON store_items(has_app_version);
CREATE INDEX IF NOT EXISTS idx_store_items_category ON store_items(category);
CREATE INDEX IF NOT EXISTS idx_store_items_type ON store_items(type);

-- =====================================================
-- 9. CREATE TRIGGER FUNCTIONS FOR AUTO-UPDATES
-- =====================================================

-- Function to update download counts
CREATE OR REPLACE FUNCTION update_download_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Update store_items download count
  IF NEW.download_type = 'store_item' THEN
    UPDATE store_items 
    SET download_count = (
      SELECT COUNT(*) FROM user_downloads 
      WHERE item_id = NEW.item_id AND download_type = 'store_item'
    )
    WHERE id = NEW.item_id;
  END IF;
  
  -- Update uploaded_files download count
  IF NEW.download_type = 'uploaded_file' THEN
    UPDATE uploaded_files 
    SET download_count = (
      SELECT COUNT(*) FROM user_downloads 
      WHERE item_id = NEW.item_id AND download_type = 'uploaded_file'
    )
    WHERE id = NEW.item_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update rating stats
CREATE OR REPLACE FUNCTION update_rating_stats()
RETURNS TRIGGER AS $$
DECLARE
  item_id_val uuid;
  rating_type_val varchar(20);
  avg_rating numeric;
  rating_count_val integer;
BEGIN
  -- Get values from NEW or OLD record
  IF TG_OP = 'DELETE' THEN
    item_id_val := OLD.item_id;
    rating_type_val := OLD.rating_type;
  ELSE
    item_id_val := NEW.item_id;
    rating_type_val := NEW.rating_type;
  END IF;
  
  -- Calculate new averages
  SELECT 
    AVG(rating)::numeric, 
    COUNT(*)::integer
  INTO avg_rating, rating_count_val
  FROM user_ratings 
  WHERE item_id = item_id_val AND rating_type = rating_type_val;
  
  -- Update appropriate table
  IF rating_type_val = 'store_item' THEN
    UPDATE store_items 
    SET 
      average_rating = COALESCE(avg_rating, 0),
      rating_count = COALESCE(rating_count_val, 0)
    WHERE id = item_id_val;
  ELSIF rating_type_val = 'uploaded_file' THEN
    UPDATE uploaded_files 
    SET 
      average_rating = COALESCE(avg_rating, 0),
      rating_count = COALESCE(rating_count_val, 0)
    WHERE id = item_id_val;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 10. CREATE TRIGGERS
-- =====================================================

-- Drop existing triggers
DROP TRIGGER IF EXISTS update_download_count_trigger ON user_downloads;
DROP TRIGGER IF EXISTS update_rating_stats_insert_trigger ON user_ratings;
DROP TRIGGER IF EXISTS update_rating_stats_update_trigger ON user_ratings;
DROP TRIGGER IF EXISTS update_rating_stats_delete_trigger ON user_ratings;

-- Create new triggers
CREATE TRIGGER update_download_count_trigger
  AFTER INSERT ON user_downloads
  FOR EACH ROW
  EXECUTE FUNCTION update_download_count();

CREATE TRIGGER update_rating_stats_insert_trigger
  AFTER INSERT ON user_ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_rating_stats();

CREATE TRIGGER update_rating_stats_update_trigger
  AFTER UPDATE ON user_ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_rating_stats();

CREATE TRIGGER update_rating_stats_delete_trigger
  AFTER DELETE ON user_ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_rating_stats();

-- =====================================================
-- 11. CREATE STORAGE BUCKET
-- =====================================================

-- Create storage bucket for uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('store-files', 'store-files', true, 104857600, ARRAY['image/*', 'application/*', 'text/*', 'video/*'])
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 104857600,
  allowed_mime_types = ARRAY['image/*', 'application/*', 'text/*', 'video/*'];

-- =====================================================
-- 12. VERIFICATION QUERIES
-- =====================================================

-- Show table structures
SELECT 'TABLE VERIFICATION:' as status;

SELECT 'store_items columns:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'store_items' 
ORDER BY ordinal_position;

SELECT 'user_downloads columns:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_downloads' 
ORDER BY ordinal_position;

SELECT 'user_ratings columns:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_ratings' 
ORDER BY ordinal_position;

SELECT 'uploaded_files columns:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'uploaded_files' 
ORDER BY ordinal_position;

-- Show policies
SELECT 'POLICIES:' as status;
SELECT schemaname, tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename IN ('user_downloads', 'user_ratings', 'uploaded_files')
ORDER BY tablename, policyname;

-- Show triggers
SELECT 'TRIGGERS:' as status;
SELECT event_object_table, trigger_name, event_manipulation, action_timing
FROM information_schema.triggers 
WHERE event_object_table IN ('user_downloads', 'user_ratings')
ORDER BY event_object_table, trigger_name;

SELECT 'SETUP COMPLETE - All data connections fixed!' as final_status;
