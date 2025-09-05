/*
  # User Interactions and File Upload Schema

  1. New Tables
    - `user_downloads` - Track user downloads
    - `user_ratings` - Track user ratings
    - `uploaded_files` - Track uploaded files by admin

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

-- Add new columns to store_items
ALTER TABLE store_items 
ADD COLUMN IF NOT EXISTS download_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS average_rating numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS rating_count integer DEFAULT 0;

-- Enable RLS on new tables
ALTER TABLE user_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploaded_files ENABLE ROW LEVEL SECURITY;

-- Policies for user_downloads
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

-- Policies for user_ratings
CREATE POLICY "Anyone can read ratings"
  ON user_ratings
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can manage their own ratings"
  ON user_ratings
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin can manage all ratings"
  ON user_ratings
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'email' = 'yashpatil575757@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'yashpatil575757@gmail.com');

-- Policies for uploaded_files
CREATE POLICY "Admin can manage uploaded files"
  ON uploaded_files
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'email' = 'yashpatil575757@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'yashpatil575757@gmail.com');

CREATE POLICY "Anyone can read file info"
  ON uploaded_files
  FOR SELECT
  TO public
  USING (true);

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

-- Triggers for automatic count updates
CREATE TRIGGER update_download_count_trigger
  AFTER INSERT ON user_downloads
  FOR EACH ROW
  EXECUTE FUNCTION update_download_count();

CREATE TRIGGER update_average_rating_trigger
  AFTER INSERT OR UPDATE OR DELETE ON user_ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_average_rating();

-- Trigger for user_ratings updated_at
CREATE TRIGGER update_user_ratings_updated_at
  BEFORE UPDATE ON user_ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
