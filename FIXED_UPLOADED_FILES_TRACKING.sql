-- Fixed Uploaded Files Tracking (No WHEN conditions on DELETE triggers)
-- Run this in your Supabase SQL editor

-- Add columns for download and rating tracking
ALTER TABLE uploaded_files 
ADD COLUMN IF NOT EXISTS download_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS rating_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS average_rating numeric DEFAULT 0;

-- Function to update download count for uploaded files
CREATE OR REPLACE FUNCTION update_uploaded_file_download_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Only process uploads for uploaded files
  IF NEW.download_type = 'uploaded_file' THEN
    UPDATE uploaded_files
    SET download_count = (
      SELECT COUNT(*)
      FROM user_downloads
      WHERE item_id = NEW.item_id 
      AND download_type = 'uploaded_file'
    )
    WHERE id = NEW.item_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update rating for uploaded files
CREATE OR REPLACE FUNCTION update_uploaded_file_rating()
RETURNS TRIGGER AS $$
DECLARE
  target_item_id UUID;
  target_rating_type TEXT;
BEGIN
  -- Determine which item and type we're working with
  IF TG_OP = 'DELETE' THEN
    target_item_id := OLD.item_id;
    target_rating_type := OLD.rating_type;
  ELSE
    target_item_id := NEW.item_id;
    target_rating_type := NEW.rating_type;
  END IF;
  
  -- Only process ratings for uploaded files
  IF target_rating_type = 'uploaded_file' THEN
    UPDATE uploaded_files
    SET 
      rating_count = (
        SELECT COUNT(*)
        FROM user_ratings
        WHERE item_id = target_item_id
        AND rating_type = 'uploaded_file'
      ),
      average_rating = (
        SELECT COALESCE(AVG(rating::numeric), 0)
        FROM user_ratings
        WHERE item_id = target_item_id
        AND rating_type = 'uploaded_file'
      )
    WHERE id = target_item_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_uploaded_file_download_trigger ON user_downloads;
DROP TRIGGER IF EXISTS update_uploaded_file_rating_trigger ON user_ratings;

-- Create triggers for uploaded files download tracking (no WHEN condition)
CREATE TRIGGER update_uploaded_file_download_trigger
  AFTER INSERT ON user_downloads
  FOR EACH ROW
  EXECUTE FUNCTION update_uploaded_file_download_count();

-- Create triggers for uploaded files rating tracking (no WHEN condition)  
CREATE TRIGGER update_uploaded_file_rating_trigger
  AFTER INSERT OR UPDATE OR DELETE ON user_ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_uploaded_file_rating();
