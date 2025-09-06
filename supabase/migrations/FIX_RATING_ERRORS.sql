-- Quick fix for 406 rating errors
-- This addresses the immediate user_ratings table issues

-- 1. Check if user_ratings table exists
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_ratings') 
    THEN 'user_ratings table EXISTS' 
    ELSE 'user_ratings table MISSING - will create it'
  END as status;

-- 2. Create user_ratings table if it doesn't exist
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

-- 3. Enable RLS
ALTER TABLE user_ratings ENABLE ROW LEVEL SECURITY;

-- 4. Drop existing policies (if any)
DROP POLICY IF EXISTS "Anyone can view ratings" ON user_ratings;
DROP POLICY IF EXISTS "Users can add ratings" ON user_ratings;
DROP POLICY IF EXISTS "Users can update their own ratings" ON user_ratings;
DROP POLICY IF EXISTS "Users can delete their own ratings" ON user_ratings;
DROP POLICY IF EXISTS "Admin can manage all ratings" ON user_ratings;

-- 5. Create new policies
CREATE POLICY "Anyone can view ratings" ON user_ratings
  FOR SELECT USING (true);

CREATE POLICY "Users can add ratings" ON user_ratings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ratings" ON user_ratings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ratings" ON user_ratings
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Admin can manage all ratings" ON user_ratings
  FOR ALL USING (auth.email() = 'yashpatil575757@gmail.com');

-- 6. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_ratings_item ON user_ratings(item_id, rating_type);
CREATE INDEX IF NOT EXISTS idx_user_ratings_user ON user_ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_ratings_created_at ON user_ratings(created_at DESC);

-- 7. Verify the fix
SELECT 'Verification:' as info;
SELECT 
  'user_ratings table' as table_name,
  COUNT(*) as row_count
FROM user_ratings;

-- 8. Show table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'user_ratings'
ORDER BY ordinal_position;
