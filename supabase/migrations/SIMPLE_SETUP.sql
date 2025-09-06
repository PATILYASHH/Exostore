-- Simple setup script - Run this if COMPLETE_SETUP.sql has issues
-- This creates only the essential tables needed for screenshots

-- 1. Create item_screenshots table
CREATE TABLE IF NOT EXISTS item_screenshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL,
  item_type text NOT NULL CHECK (item_type IN ('store_item', 'uploaded_file')),
  screenshot_url text NOT NULL,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  uploaded_by uuid REFERENCES auth.users(id)
);

-- 2. Enable RLS on screenshots
ALTER TABLE item_screenshots ENABLE ROW LEVEL SECURITY;

-- 3. Create policies for screenshots
DROP POLICY IF EXISTS "Anyone can view screenshots" ON item_screenshots;
CREATE POLICY "Anyone can view screenshots" ON item_screenshots
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage screenshots" ON item_screenshots;
CREATE POLICY "Admins can manage screenshots" ON item_screenshots
  FOR ALL USING (
    auth.email() = 'yashpatil575757@gmail.com'
  );

-- 4. Create user_ratings table (to fix 406 errors)
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

-- 5. Enable RLS on user_ratings
ALTER TABLE user_ratings ENABLE ROW LEVEL SECURITY;

-- 6. Create policies for user_ratings
DROP POLICY IF EXISTS "Anyone can view ratings" ON user_ratings;
CREATE POLICY "Anyone can view ratings" ON user_ratings
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can add ratings" ON user_ratings;
CREATE POLICY "Users can add ratings" ON user_ratings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own ratings" ON user_ratings;
CREATE POLICY "Users can update their own ratings" ON user_ratings
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admin can manage all ratings" ON user_ratings;
CREATE POLICY "Admin can manage all ratings" ON user_ratings
  FOR ALL USING (auth.email() = 'yashpatil575757@gmail.com');

-- 7. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_item_screenshots_item ON item_screenshots(item_id, item_type);
CREATE INDEX IF NOT EXISTS idx_item_screenshots_order ON item_screenshots(item_id, display_order);
CREATE INDEX IF NOT EXISTS idx_user_ratings_item ON user_ratings(item_id, rating_type);
CREATE INDEX IF NOT EXISTS idx_user_ratings_user ON user_ratings(user_id);

-- 8. Verification
SELECT 'Tables created successfully!' as message;

-- Check if tables exist
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'item_screenshots') 
    THEN '✅ item_screenshots table created' 
    ELSE '❌ item_screenshots table failed'
  END as screenshot_status,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_ratings') 
    THEN '✅ user_ratings table created' 
    ELSE '❌ user_ratings table failed'
  END as ratings_status;
