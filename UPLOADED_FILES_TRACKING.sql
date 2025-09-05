-- Add tracking columns to uploaded_files table
-- Run this in your Supabase SQL editor

-- Add columns for download and rating tracking
ALTER TABLE uploaded_files 
ADD COLUMN IF NOT EXISTS download_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS rating_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS average_rating numeric DEFAULT 0;

-- Update existing triggers to also handle uploaded_files
-- Function to update download count for uploaded files
CREATE OR REPLACE FUNCTION update_uploaded_file_download_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE uploaded_files
  SET download_count = (
    SELECT COUNT(*)
    FROM user_downloads
    WHERE item_id = NEW.item_id 
    AND download_type = 'uploaded_file'
  )
  WHERE id = NEW.item_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update rating for uploaded files
CREATE OR REPLACE FUNCTION update_uploaded_file_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE uploaded_files
  SET 
    rating_count = (
      SELECT COUNT(*)
      FROM user_ratings
      WHERE item_id = COALESCE(NEW.item_id, OLD.item_id)
      AND rating_type = 'uploaded_file'
    ),
    average_rating = (
      SELECT COALESCE(AVG(rating::numeric), 0)
      FROM user_ratings
      WHERE item_id = COALESCE(NEW.item_id, OLD.item_id)
      AND rating_type = 'uploaded_file'
    )
  WHERE id = COALESCE(NEW.item_id, OLD.item_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers for uploaded files download tracking
DROP TRIGGER IF EXISTS update_uploaded_file_download_trigger ON user_downloads;
CREATE TRIGGER update_uploaded_file_download_trigger
  AFTER INSERT ON user_downloads
  FOR EACH ROW
  WHEN (NEW.download_type = 'uploaded_file')
  EXECUTE FUNCTION update_uploaded_file_download_count();

-- Create triggers for uploaded files rating tracking
DROP TRIGGER IF EXISTS update_uploaded_file_rating_trigger ON user_ratings;
CREATE TRIGGER update_uploaded_file_rating_trigger
  AFTER INSERT OR UPDATE OR DELETE ON user_ratings
  FOR EACH ROW
  WHEN (COALESCE(NEW.rating_type, OLD.rating_type) = 'uploaded_file')
  EXECUTE FUNCTION update_uploaded_file_rating();
