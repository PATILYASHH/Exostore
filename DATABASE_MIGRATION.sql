-- Run this SQL in your Supabase SQL editor

/*
  User Interactions and File Upload Schema

  1. New Tables
    - user_downloads - Track user downloads
    - user_ratings - Track user ratings
    - uploaded_files - Track uploaded files by admin

  2. Updates to store_items
    - Add download_count (integer) - actual count from user_downloads
    - Add average_rating (numeric) - calculated from user_ratings
    - Keep existing downloads (text) for display purposes
    - Keep existing rating (numeric) for backwards compatibility
*/

-- User Downloads Table
CREATE TABLE IF NOT EXISTS user_downloads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  item_id uuid REFERENCES store_items(id) ON DELETE CASCADE,
  downloaded_at timestamptz DEFAULT now(),
  ip_address inet,
  user_agent text,
  UNIQUE(user_id, item_id) -- Prevent duplicate downloads per user
);

-- User Ratings Table
CREATE TABLE IF NOT EXISTS user_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  item_id uuid REFERENCES store_items(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, item_id) -- One rating per user per item
);

-- Uploaded Files Table
CREATE TABLE IF NOT EXISTS uploaded_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid REFERENCES store_items(id) ON DELETE CASCADE,
  filename text NOT NULL,
  original_filename text NOT NULL,
  file_size bigint NOT NULL,
  mime_type text NOT NULL,
  storage_path text NOT NULL,
  uploaded_by uuid REFERENCES auth.users(id),
  uploaded_at timestamptz DEFAULT now()
);

-- Add new columns to store_items (only if they don't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'store_items' AND column_name = 'download_count') THEN
    ALTER TABLE store_items ADD COLUMN download_count integer DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'store_items' AND column_name = 'average_rating') THEN
    ALTER TABLE store_items ADD COLUMN average_rating numeric DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'store_items' AND column_name = 'rating_count') THEN
    ALTER TABLE store_items ADD COLUMN rating_count integer DEFAULT 0;
  END IF;
END $$;

-- Enable RLS on new tables
ALTER TABLE user_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploaded_files ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them
DO $$ 
BEGIN
  -- Policies for user_downloads
  DROP POLICY IF EXISTS "Users can view their own downloads" ON user_downloads;
  CREATE POLICY "Users can view their own downloads"
    ON user_downloads
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

  DROP POLICY IF EXISTS "Users can add downloads" ON user_downloads;
  CREATE POLICY "Users can add downloads"
    ON user_downloads
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

  DROP POLICY IF EXISTS "Admin can view all downloads" ON user_downloads;
  CREATE POLICY "Admin can view all downloads"
    ON user_downloads
    FOR SELECT
    TO authenticated
    USING (auth.jwt() ->> 'email' = 'yashpatil575757@gmail.com');

  -- Policies for user_ratings
  DROP POLICY IF EXISTS "Anyone can read ratings" ON user_ratings;
  CREATE POLICY "Anyone can read ratings"
    ON user_ratings
    FOR SELECT
    TO public
    USING (true);

  DROP POLICY IF EXISTS "Users can manage their own ratings" ON user_ratings;
  CREATE POLICY "Users can manage their own ratings"
    ON user_ratings
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

  DROP POLICY IF EXISTS "Admin can manage all ratings" ON user_ratings;
  CREATE POLICY "Admin can manage all ratings"
    ON user_ratings
    FOR ALL
    TO authenticated
    USING (auth.jwt() ->> 'email' = 'yashpatil575757@gmail.com')
    WITH CHECK (auth.jwt() ->> 'email' = 'yashpatil575757@gmail.com');

  -- Policies for uploaded_files
  DROP POLICY IF EXISTS "Admin can manage uploaded files" ON uploaded_files;
  CREATE POLICY "Admin can manage uploaded files"
    ON uploaded_files
    FOR ALL
    TO authenticated
    USING (auth.jwt() ->> 'email' = 'yashpatil575757@gmail.com')
    WITH CHECK (auth.jwt() ->> 'email' = 'yashpatil575757@gmail.com');

  DROP POLICY IF EXISTS "Anyone can read file info" ON uploaded_files;
  CREATE POLICY "Anyone can read file info"
    ON uploaded_files
    FOR SELECT
    TO public
    USING (true);
END $$;

-- Function to update download count
CREATE OR REPLACE FUNCTION update_download_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE store_items 
  SET download_count = (
    SELECT COUNT(*) FROM user_downloads WHERE item_id = NEW.item_id
  )
  WHERE id = NEW.item_id;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to update average rating
CREATE OR REPLACE FUNCTION update_average_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE store_items 
  SET 
    average_rating = (
      SELECT COALESCE(AVG(rating::numeric), 0) 
      FROM user_ratings 
      WHERE item_id = COALESCE(NEW.item_id, OLD.item_id)
    ),
    rating_count = (
      SELECT COUNT(*) 
      FROM user_ratings 
      WHERE item_id = COALESCE(NEW.item_id, OLD.item_id)
    )
  WHERE id = COALESCE(NEW.item_id, OLD.item_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Drop existing triggers if they exist and recreate them
DO $$ 
BEGIN
  DROP TRIGGER IF EXISTS update_download_count_trigger ON user_downloads;
  CREATE TRIGGER update_download_count_trigger
    AFTER INSERT ON user_downloads
    FOR EACH ROW
    EXECUTE FUNCTION update_download_count();

  DROP TRIGGER IF EXISTS update_average_rating_trigger ON user_ratings;
  CREATE TRIGGER update_average_rating_trigger
    AFTER INSERT OR UPDATE OR DELETE ON user_ratings
    FOR EACH ROW
    EXECUTE FUNCTION update_average_rating();

  DROP TRIGGER IF EXISTS update_user_ratings_updated_at ON user_ratings;
  CREATE TRIGGER update_user_ratings_updated_at
    BEFORE UPDATE ON user_ratings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
END $$;

-- Create storage bucket for files if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('store-files', 'store-files', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing storage policies if they exist and recreate them
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Admin can upload files" ON storage.objects;
  CREATE POLICY "Admin can upload files"
    ON storage.objects FOR INSERT
    WITH CHECK (
      bucket_id = 'store-files' AND
      auth.jwt() ->> 'email' = 'yashpatil575757@gmail.com'
    );

  DROP POLICY IF EXISTS "Admin can update files" ON storage.objects;
  CREATE POLICY "Admin can update files"
    ON storage.objects FOR UPDATE
    USING (
      bucket_id = 'store-files' AND
      auth.jwt() ->> 'email' = 'yashpatil575757@gmail.com'
    );

  DROP POLICY IF EXISTS "Admin can delete files" ON storage.objects;
  CREATE POLICY "Admin can delete files"
    ON storage.objects FOR DELETE
    USING (
      bucket_id = 'store-files' AND
      auth.jwt() ->> 'email' = 'yashpatil575757@gmail.com'
    );

  DROP POLICY IF EXISTS "Anyone can view files" ON storage.objects;
  CREATE POLICY "Anyone can view files"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'store-files');
END $$;
