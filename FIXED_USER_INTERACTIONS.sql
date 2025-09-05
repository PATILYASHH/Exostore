-- Fixed User Interactions Migration (Safe trigger creation)
-- Run this in Supabase SQL Editor

-- Drop all existing triggers first to avoid conflicts
DROP TRIGGER IF EXISTS update_download_count_trigger ON user_downloads;
DROP TRIGGER IF EXISTS update_rating_stats_trigger ON user_ratings;
DROP TRIGGER IF EXISTS update_rating_stats_update_trigger ON user_ratings;

-- Drop and recreate functions to ensure they're current
DROP FUNCTION IF EXISTS update_download_count();
DROP FUNCTION IF EXISTS update_rating_stats();

-- Create download count update function
CREATE OR REPLACE FUNCTION update_download_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Update store items download count
  IF NEW.download_type = 'store_item' THEN
    UPDATE store_items 
    SET download_count = download_count + 1 
    WHERE id = NEW.item_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create rating stats update function
CREATE OR REPLACE FUNCTION update_rating_stats()
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
  
  -- Update store items rating stats
  IF target_rating_type = 'store_item' THEN
    UPDATE store_items 
    SET 
      average_rating = (
        SELECT COALESCE(AVG(rating)::numeric(3,2), 0)
        FROM user_ratings 
        WHERE item_id = target_item_id AND rating_type = 'store_item'
      ),
      rating_count = (
        SELECT COUNT(*) 
        FROM user_ratings 
        WHERE item_id = target_item_id AND rating_type = 'store_item'
      )
    WHERE id = target_item_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers with safe names
CREATE TRIGGER user_downloads_count_trigger
  AFTER INSERT ON user_downloads
  FOR EACH ROW
  EXECUTE FUNCTION update_download_count();

CREATE TRIGGER user_ratings_stats_trigger
  AFTER INSERT OR UPDATE OR DELETE ON user_ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_rating_stats();
