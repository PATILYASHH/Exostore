-- Complete setup script for YashStore with Screenshots
-- Run this entire script in Supabase SQL Editor

-- 1. First, let's check what tables exist
SELECT 'Existing tables:' as info;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- 2. Check if store_items table has data
SELECT 'Store items count:' as info, COUNT(*) as count FROM store_items;

-- 3. Show current store items (if any)
SELECT 
  id,
  title,
  developer,
  category,
  type,
  created_at
FROM store_items 
ORDER BY created_at DESC
LIMIT 10;

-- 4. Create item_screenshots table for demo images/screenshots
CREATE TABLE IF NOT EXISTS item_screenshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL,
  item_type text NOT NULL CHECK (item_type IN ('store_item', 'uploaded_file')),
  screenshot_url text NOT NULL,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  uploaded_by uuid REFERENCES auth.users(id)
);

-- Enable RLS on screenshots
ALTER TABLE item_screenshots ENABLE ROW LEVEL SECURITY;

-- Create policies for screenshots
DROP POLICY IF EXISTS "Anyone can view screenshots" ON item_screenshots;
CREATE POLICY "Anyone can view screenshots" ON item_screenshots
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage screenshots" ON item_screenshots;
CREATE POLICY "Admins can manage screenshots" ON item_screenshots
  FOR ALL USING (
    auth.email() = 'yashpatil575757@gmail.com'
  );

-- Create indexes for screenshots
CREATE INDEX IF NOT EXISTS idx_item_screenshots_item ON item_screenshots(item_id, item_type);
CREATE INDEX IF NOT EXISTS idx_item_screenshots_order ON item_screenshots(item_id, display_order);
CREATE INDEX IF NOT EXISTS idx_item_screenshots_created_at ON item_screenshots(created_at DESC);

-- 5. Create hero_banners table (if not exists)
CREATE TABLE IF NOT EXISTS hero_banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subtitle text,
  description text,
  image_url text NOT NULL,
  link_url text,
  link_text text DEFAULT 'Learn More',
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  banner_type text DEFAULT 'app' CHECK (banner_type IN ('app', 'sponsor', 'promotion')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- 6. Enable RLS on hero_banners
ALTER TABLE hero_banners ENABLE ROW LEVEL SECURITY;

-- 7. Create policies for hero_banners
DROP POLICY IF EXISTS "Anyone can view active hero banners" ON hero_banners;
CREATE POLICY "Anyone can view active hero banners" ON hero_banners
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage hero banners" ON hero_banners;
CREATE POLICY "Admins can manage hero banners" ON hero_banners
  FOR ALL USING (
    auth.email() = 'yashpatil575757@gmail.com'
  );

-- 8. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_hero_banners_active ON hero_banners(is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_hero_banners_created_at ON hero_banners(created_at DESC);

-- 9. Create user_ratings table for rating functionality
CREATE TABLE IF NOT EXISTS user_ratings (
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

-- Enable RLS on user_ratings
ALTER TABLE user_ratings ENABLE ROW LEVEL SECURITY;

-- Create policies for user_ratings
DROP POLICY IF EXISTS "Anyone can view ratings" ON user_ratings;
CREATE POLICY "Anyone can view ratings" ON user_ratings
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can add ratings" ON user_ratings;
CREATE POLICY "Users can add ratings" ON user_ratings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own ratings" ON user_ratings;
CREATE POLICY "Users can update their own ratings" ON user_ratings
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own ratings" ON user_ratings;
CREATE POLICY "Users can delete their own ratings" ON user_ratings
  FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admin can manage all ratings" ON user_ratings;
CREATE POLICY "Admin can manage all ratings" ON user_ratings
  FOR ALL USING (auth.email() = 'yashpatil575757@gmail.com');

-- Create indexes for user_ratings
CREATE INDEX IF NOT EXISTS idx_user_ratings_item ON user_ratings(item_id, rating_type);
CREATE INDEX IF NOT EXISTS idx_user_ratings_user ON user_ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_ratings_created_at ON user_ratings(created_at DESC);

-- 10. Insert sample data if tables are empty
-- Sample hero banner
INSERT INTO hero_banners (
  title,
  subtitle,
  description,
  image_url,
  link_url,
  link_text,
  banner_type,
  display_order
) VALUES (
  'Welcome to YashStore',
  'Discover Amazing Apps & Games',
  'Upload your own applications and games to share with the community. Join thousands of developers and users today!',
  'https://images.pexels.com/photos/267350/pexels-photo-267350.jpeg?auto=compress&cs=tinysrgb&w=1200&h=400&fit=crop',
  '#',
  'Start Uploading',
  'promotion',
  1
) ON CONFLICT (id) DO NOTHING;

-- Sample store item (only if none exist)
DO $$
DECLARE
    sample_item_id uuid;
BEGIN
    -- Insert sample item if none exist
    INSERT INTO store_items (
      title,
      developer,
      image,
      category,
      price,
      description,
      type,
      download_link,
      rating,
      downloads
    ) 
    SELECT 
      'Sample App - Getting Started',
      'YashStore Team',
      'https://images.pexels.com/photos/267350/pexels-photo-267350.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
      'apps',
      'Free',
      'This is a sample application to show how your store works. You can delete this once you upload your own apps.',
      'apps',
      '#',
      4.5,
      0
    WHERE NOT EXISTS (SELECT 1 FROM store_items LIMIT 1)
    RETURNING id INTO sample_item_id;

    -- Add sample screenshots for the sample item
    IF sample_item_id IS NOT NULL THEN
        INSERT INTO item_screenshots (item_id, item_type, screenshot_url, display_order) VALUES
        (sample_item_id, 'store_item', 'https://images.pexels.com/photos/267350/pexels-photo-267350.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop', 0),
        (sample_item_id, 'store_item', 'https://images.pexels.com/photos/574070/pexels-photo-574070.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop', 1),
        (sample_item_id, 'store_item', 'https://images.pexels.com/photos/699122/pexels-photo-699122.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop', 2);
    END IF;
END $$;

-- 11. Final verification
SELECT 'Final counts:' as info;
SELECT 'Store items:' as type, COUNT(*) as count FROM store_items
UNION ALL
SELECT 'Hero banners:' as type, COUNT(*) as count FROM hero_banners
UNION ALL
SELECT 'Screenshots:' as type, COUNT(*) as count FROM item_screenshots
UNION ALL
SELECT 'User ratings:' as type, COUNT(*) as count FROM user_ratings;

-- 12. Show what we now have
SELECT 'Current store items:' as info;
SELECT title, developer, category, created_at FROM store_items ORDER BY created_at DESC LIMIT 5;

SELECT 'Current hero banners:' as info;
SELECT title, banner_type, is_active, created_at FROM hero_banners ORDER BY display_order, created_at DESC;

SELECT 'Sample screenshots:' as info;
SELECT 
  s.item_id,
  i.title,
  COUNT(*) as screenshot_count,
  MIN(i.created_at) as created_at
FROM item_screenshots s
JOIN store_items i ON s.item_id = i.id
GROUP BY s.item_id, i.title
ORDER BY MIN(i.created_at) DESC;