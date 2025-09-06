-- =====================================================
-- EXOSTORE COMPLETE DATABASE SETUP
-- Run this ENTIRE script in your Supabase SQL Editor
-- =====================================================

-- Display current status
SELECT 'STARTING EXOSTORE DATABASE SETUP...' as status;

-- =====================================================
-- 1. CREATE OR UPDATE CORE TABLES
-- =====================================================

-- Create store_items table with all necessary columns
CREATE TABLE IF NOT EXISTS store_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  developer text NOT NULL,
  rating numeric DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  downloads text DEFAULT '0',
  image text NOT NULL,
  category text NOT NULL,
  price text DEFAULT 'Free',
  description text NOT NULL,
  type text NOT NULL CHECK (type IN ('games', 'apps', 'websites')),
  download_link text,
  file_path text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  -- User interaction tracking
  download_count integer DEFAULT 0,
  average_rating numeric DEFAULT 0,
  rating_count integer DEFAULT 0,
  -- Cross-platform support
  has_web_version boolean DEFAULT false,
  has_app_version boolean DEFAULT false,
  web_version_url text,
  app_version_url text,
  cross_platform_notes text
);

-- Add missing columns to existing store_items table
DO $$ 
BEGIN
  -- Add download tracking columns
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'store_items' AND column_name = 'download_count') THEN
    ALTER TABLE store_items ADD COLUMN download_count integer DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'store_items' AND column_name = 'average_rating') THEN
    ALTER TABLE store_items ADD COLUMN average_rating numeric DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'store_items' AND column_name = 'rating_count') THEN
    ALTER TABLE store_items ADD COLUMN rating_count integer DEFAULT 0;
  END IF;
  
  -- Add cross-platform columns
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'store_items' AND column_name = 'has_web_version') THEN
    ALTER TABLE store_items ADD COLUMN has_web_version boolean DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'store_items' AND column_name = 'has_app_version') THEN
    ALTER TABLE store_items ADD COLUMN has_app_version boolean DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'store_items' AND column_name = 'web_version_url') THEN
    ALTER TABLE store_items ADD COLUMN web_version_url text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'store_items' AND column_name = 'app_version_url') THEN
    ALTER TABLE store_items ADD COLUMN app_version_url text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'store_items' AND column_name = 'cross_platform_notes') THEN
    ALTER TABLE store_items ADD COLUMN cross_platform_notes text;
  END IF;
END $$;

-- =====================================================
-- 2. CREATE USER INTERACTION TABLES
-- =====================================================

-- Drop existing tables to ensure clean setup
DROP TABLE IF EXISTS user_downloads CASCADE;
DROP TABLE IF EXISTS user_ratings CASCADE;
DROP TABLE IF EXISTS uploaded_files CASCADE;

-- Create user_downloads table
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

-- Create user_ratings table
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

-- Create uploaded_files table
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
-- 3. ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE store_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploaded_files ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 4. DROP ALL EXISTING POLICIES
-- =====================================================

-- Clean slate for policies
DO $$ 
DECLARE
    pol_name TEXT;
BEGIN
    -- Drop store_items policies
    FOR pol_name IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'store_items'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(pol_name) || ' ON store_items';
    END LOOP;
    
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
-- 5. CREATE COMPREHENSIVE POLICIES
-- =====================================================

-- STORE_ITEMS POLICIES
CREATE POLICY "anyone_can_view_store_items" ON store_items
  FOR SELECT USING (true);

CREATE POLICY "admin_can_manage_store_items" ON store_items
  FOR ALL USING (auth.jwt() ->> 'email' = 'yashpatil575757@gmail.com');

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
-- 6. CREATE PERFORMANCE INDEXES
-- =====================================================

-- Store Items Indexes
CREATE INDEX IF NOT EXISTS idx_store_items_category ON store_items(category);
CREATE INDEX IF NOT EXISTS idx_store_items_type ON store_items(type);
CREATE INDEX IF NOT EXISTS idx_store_items_created_at ON store_items(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_store_items_rating ON store_items(average_rating DESC);
CREATE INDEX IF NOT EXISTS idx_store_items_downloads ON store_items(download_count DESC);
CREATE INDEX IF NOT EXISTS idx_store_items_web_version ON store_items(has_web_version);
CREATE INDEX IF NOT EXISTS idx_store_items_app_version ON store_items(has_app_version);

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
CREATE INDEX IF NOT EXISTS idx_uploaded_files_rating ON uploaded_files(average_rating DESC);
CREATE INDEX IF NOT EXISTS idx_uploaded_files_downloads ON uploaded_files(download_count DESC);

-- =====================================================
-- 7. CREATE TRIGGER FUNCTIONS
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

-- Function to update rating statistics
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
-- 8. CREATE TRIGGERS
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
-- 9. CREATE STORAGE BUCKET
-- =====================================================

-- Create storage bucket for file uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('store-files', 'store-files', true, 104857600, ARRAY['image/*', 'application/*', 'text/*', 'video/*'])
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 104857600,
  allowed_mime_types = ARRAY['image/*', 'application/*', 'text/*', 'video/*'];

-- Create storage policies
DROP POLICY IF EXISTS "Public can view files" ON storage.objects;
CREATE POLICY "Public can view files" ON storage.objects
  FOR SELECT USING (bucket_id = 'store-files');

DROP POLICY IF EXISTS "Authenticated users can upload files" ON storage.objects;
CREATE POLICY "Authenticated users can upload files" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'store-files' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update own files" ON storage.objects;
CREATE POLICY "Users can update own files" ON storage.objects
  FOR UPDATE USING (bucket_id = 'store-files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- =====================================================
-- 10. INSERT DEMO DATA (OPTIONAL)
-- =====================================================

-- Insert some demo store items for testing
INSERT INTO store_items (
  title, developer, rating, downloads, image, category, price, description, type, download_link,
  download_count, average_rating, rating_count
) VALUES 
(
  'Sample Calculator',
  'Exostore Team',
  4.5,
  '1.2K',
  'https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
  'apps',
  'Free',
  'A simple and elegant calculator app for all your mathematical needs.',
  'apps',
  'https://example.com/calculator.exe',
  1200,
  4.5,
  150
),
(
  'Puzzle Game Pro',
  'Exostore Team',
  4.8,
  '2.5K',
  'https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
  'games',
  'Free',
  'Challenging puzzle game that will test your problem-solving skills.',
  'games',
  'https://example.com/puzzle-game.zip',
  2500,
  4.8,
  320
),
(
  'Portfolio Website',
  'Exostore Team',
  4.2,
  '800',
  'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
  'websites',
  'Free',
  'Beautiful portfolio website template for showcasing your work.',
  'websites',
  'https://example.com/portfolio-demo',
  800,
  4.2,
  95
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 11. VERIFICATION AND STATUS
-- =====================================================

-- Show table counts
SELECT 'TABLE COUNTS:' as status;
SELECT 'store_items' as table_name, COUNT(*) as row_count FROM store_items
UNION ALL
SELECT 'user_downloads' as table_name, COUNT(*) as row_count FROM user_downloads
UNION ALL
SELECT 'user_ratings' as table_name, COUNT(*) as row_count FROM user_ratings
UNION ALL
SELECT 'uploaded_files' as table_name, COUNT(*) as row_count FROM uploaded_files;

-- Show policies count
SELECT 'SECURITY POLICIES:' as status;
SELECT tablename, COUNT(*) as policy_count 
FROM pg_policies 
WHERE tablename IN ('store_items', 'user_downloads', 'user_ratings', 'uploaded_files')
GROUP BY tablename;

-- Show triggers
SELECT 'TRIGGERS:' as status;
SELECT event_object_table, COUNT(*) as trigger_count
FROM information_schema.triggers 
WHERE event_object_table IN ('user_downloads', 'user_ratings')
GROUP BY event_object_table;

-- Show indexes
SELECT 'INDEXES:' as status;
SELECT tablename, COUNT(*) as index_count
FROM pg_indexes 
WHERE tablename IN ('store_items', 'user_downloads', 'user_ratings', 'uploaded_files')
GROUP BY tablename;

-- Final confirmation
SELECT '🎉 EXOSTORE DATABASE SETUP COMPLETE! 🎉' as final_status;
SELECT 'All tables, policies, triggers, and indexes have been created successfully.' as details;
SELECT 'Your app should now work perfectly with downloads, ratings, and comments!' as ready;
