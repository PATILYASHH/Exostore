-- Enable review editing and enforce one review per user per software
-- This migration adds constraints and functionality for editable user reviews

-- Add updated_at column to user_ratings if it doesn't exist
DO $$ 
BEGIN
  -- Check if updated_at column exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_ratings' 
    AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE user_ratings 
    ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Add unique constraint to ensure one review per user per item
-- Drop existing constraint if it exists to avoid conflicts
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'unique_user_item_rating'
    AND table_name = 'user_ratings'
  ) THEN
    ALTER TABLE user_ratings DROP CONSTRAINT unique_user_item_rating;
  END IF;
END $$;

-- Add the unique constraint
ALTER TABLE user_ratings 
ADD CONSTRAINT unique_user_item_rating 
UNIQUE (user_id, item_id, rating_type);

-- Create or replace function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at when rating is modified
DROP TRIGGER IF EXISTS update_user_ratings_updated_at ON user_ratings;
CREATE TRIGGER update_user_ratings_updated_at
  BEFORE UPDATE ON user_ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update RLS policies for user_ratings to allow users to edit their own reviews
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view all ratings" ON user_ratings;
DROP POLICY IF EXISTS "Users can insert their own ratings" ON user_ratings;
DROP POLICY IF EXISTS "Users can update their own ratings" ON user_ratings;
DROP POLICY IF EXISTS "Users can delete their own ratings" ON user_ratings;

-- Create comprehensive policies
CREATE POLICY "Users can view all ratings" ON user_ratings
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own ratings" ON user_ratings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ratings" ON user_ratings
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ratings" ON user_ratings
  FOR DELETE USING (auth.uid() = user_id);

-- Create index for better performance on user-item lookups
DROP INDEX IF EXISTS idx_user_ratings_user_item;
CREATE INDEX idx_user_ratings_user_item ON user_ratings(user_id, item_id, rating_type);

-- Create index for better performance on item rating queries
DROP INDEX IF EXISTS idx_user_ratings_item;
CREATE INDEX idx_user_ratings_item ON user_ratings(item_id, rating_type);
