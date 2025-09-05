-- Fix for database migration errors
-- Run this in Supabase SQL Editor to fix all issues

-- First, let's fix the uploaded_files table structure
DO $$ 
BEGIN
  -- Add missing columns to uploaded_files if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'uploaded_files' AND column_name = 'file_type') THEN
    ALTER TABLE uploaded_files ADD COLUMN file_type text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'uploaded_files' AND column_name = 'file_url') THEN
    ALTER TABLE uploaded_files ADD COLUMN file_url text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'uploaded_files' AND column_name = 'download_count') THEN
    ALTER TABLE uploaded_files ADD COLUMN download_count integer DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'uploaded_files' AND column_name = 'average_rating') THEN
    ALTER TABLE uploaded_files ADD COLUMN average_rating numeric DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'uploaded_files' AND column_name = 'rating_count') THEN
    ALTER TABLE uploaded_files ADD COLUMN rating_count integer DEFAULT 0;
  END IF;
END $$;

-- Add missing column to user_downloads if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_downloads' AND column_name = 'download_type') THEN
    ALTER TABLE user_downloads ADD COLUMN download_type varchar(20) DEFAULT 'store_item' CHECK (download_type IN ('store_item', 'uploaded_file'));
  END IF;
END $$;

-- Add missing column to user_ratings if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_ratings' AND column_name = 'rating_type') THEN
    ALTER TABLE user_ratings ADD COLUMN rating_type varchar(20) DEFAULT 'store_item' CHECK (rating_type IN ('store_item', 'uploaded_file'));
  END IF;
  
  -- Rename review to comment if needed
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_ratings' AND column_name = 'review') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_ratings' AND column_name = 'comment') THEN
      ALTER TABLE user_ratings RENAME COLUMN review TO comment;
    END IF;
  END IF;
END $$;

-- Fix the uploaded_files table structure to remove item_id reference since uploaded files are independent
DO $$ 
BEGIN
  -- Remove item_id constraint if it exists (uploaded files should be independent)
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'uploaded_files' AND column_name = 'item_id') THEN
    ALTER TABLE uploaded_files DROP CONSTRAINT IF EXISTS uploaded_files_item_id_fkey;
    ALTER TABLE uploaded_files DROP COLUMN IF EXISTS item_id;
  END IF;
END $$;

-- Update existing data in uploaded_files if any exists
UPDATE uploaded_files SET 
  file_type = COALESCE(file_type, mime_type),
  file_url = COALESCE(file_url, storage_path)
WHERE file_type IS NULL OR file_url IS NULL;

-- Drop and recreate policies safely
DO $$ 
BEGIN
  -- Drop existing policies
  DROP POLICY IF EXISTS "Users can view their own downloads" ON user_downloads;
  DROP POLICY IF EXISTS "Users can add downloads" ON user_downloads;
  DROP POLICY IF EXISTS "Admin can view all downloads" ON user_downloads;
  DROP POLICY IF EXISTS "Users can view their own ratings" ON user_ratings;
  DROP POLICY IF EXISTS "Users can add ratings" ON user_ratings;
  DROP POLICY IF EXISTS "Users can update their own ratings" ON user_ratings;
  DROP POLICY IF EXISTS "Admin can view all ratings" ON user_ratings;
  DROP POLICY IF EXISTS "Admin can manage uploaded files" ON uploaded_files;
  DROP POLICY IF EXISTS "Everyone can view uploaded files" ON uploaded_files;
END $$;

-- Enable RLS on tables
ALTER TABLE user_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploaded_files ENABLE ROW LEVEL SECURITY;

-- Create policies for user_downloads
CREATE POLICY "Users can view their own downloads"
  ON user_downloads
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add downloads"
  ON user_downloads
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin can view all downloads"
  ON user_downloads
  FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'email' = 'yashpatil575757@gmail.com');

-- Create policies for user_ratings
CREATE POLICY "Users can view their own ratings"
  ON user_ratings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Everyone can view all ratings"
  ON user_ratings
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Users can add ratings"
  ON user_ratings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ratings"
  ON user_ratings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin can view all ratings"
  ON user_ratings
  FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'email' = 'yashpatil575757@gmail.com');

-- Create policies for uploaded_files
CREATE POLICY "Admin can manage uploaded files"
  ON uploaded_files
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'email' = 'yashpatil575757@gmail.com');

CREATE POLICY "Everyone can view uploaded files"
  ON uploaded_files
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Create or replace functions for automatic counting
CREATE OR REPLACE FUNCTION update_download_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.download_type = 'store_item' THEN
    UPDATE store_items 
    SET download_count = download_count + 1 
    WHERE id = NEW.item_id;
  ELSIF NEW.download_type = 'uploaded_file' THEN
    UPDATE uploaded_files 
    SET download_count = download_count + 1 
    WHERE id = NEW.item_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_rating_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Handle INSERT and UPDATE for store items
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    IF NEW.rating_type = 'store_item' THEN
      UPDATE store_items 
      SET 
        average_rating = (
          SELECT AVG(rating)::numeric(3,2) 
          FROM user_ratings 
          WHERE item_id = NEW.item_id AND rating_type = 'store_item'
        ),
        rating_count = (
          SELECT COUNT(*) 
          FROM user_ratings 
          WHERE item_id = NEW.item_id AND rating_type = 'store_item'
        )
      WHERE id = NEW.item_id;
    ELSIF NEW.rating_type = 'uploaded_file' THEN
      UPDATE uploaded_files 
      SET 
        average_rating = (
          SELECT AVG(rating)::numeric(3,2) 
          FROM user_ratings 
          WHERE item_id = NEW.item_id AND rating_type = 'uploaded_file'
        ),
        rating_count = (
          SELECT COUNT(*) 
          FROM user_ratings 
          WHERE item_id = NEW.item_id AND rating_type = 'uploaded_file'
        )
      WHERE id = NEW.item_id;
    END IF;
    RETURN NEW;
  END IF;
  
  -- Handle DELETE
  IF TG_OP = 'DELETE' THEN
    IF OLD.rating_type = 'store_item' THEN
      UPDATE store_items 
      SET 
        average_rating = (
          SELECT COALESCE(AVG(rating)::numeric(3,2), 0)
          FROM user_ratings 
          WHERE item_id = OLD.item_id AND rating_type = 'store_item'
        ),
        rating_count = (
          SELECT COUNT(*) 
          FROM user_ratings 
          WHERE item_id = OLD.item_id AND rating_type = 'store_item'
        )
      WHERE id = OLD.item_id;
    ELSIF OLD.rating_type = 'uploaded_file' THEN
      UPDATE uploaded_files 
      SET 
        average_rating = (
          SELECT COALESCE(AVG(rating)::numeric(3,2), 0)
          FROM user_ratings 
          WHERE item_id = OLD.item_id AND rating_type = 'uploaded_file'
        ),
        rating_count = (
          SELECT COUNT(*) 
          FROM user_ratings 
          WHERE item_id = OLD.item_id AND rating_type = 'uploaded_file'
        )
      WHERE id = OLD.item_id;
    END IF;
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_download_count_trigger ON user_downloads;
DROP TRIGGER IF EXISTS update_rating_stats_trigger ON user_ratings;
DROP TRIGGER IF EXISTS update_rating_stats_update_trigger ON user_ratings;

-- Create triggers
CREATE TRIGGER update_download_count_trigger
  AFTER INSERT ON user_downloads
  FOR EACH ROW
  EXECUTE FUNCTION update_download_count();

CREATE TRIGGER update_rating_stats_trigger
  AFTER INSERT OR UPDATE OR DELETE ON user_ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_rating_stats();
