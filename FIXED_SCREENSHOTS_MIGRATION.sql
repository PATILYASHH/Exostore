-- Fixed Screenshots Migration (Safe policy creation)
-- Run this in Supabase SQL Editor

-- Create screenshots table for store items
CREATE TABLE IF NOT EXISTS item_screenshots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id UUID NOT NULL,
  item_type VARCHAR(20) NOT NULL CHECK (item_type IN ('store_item', 'uploaded_file')),
  screenshot_url TEXT NOT NULL,
  caption TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_item_screenshots_item ON item_screenshots(item_id, item_type);

-- Enable RLS
ALTER TABLE item_screenshots ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
DECLARE
    pol_name TEXT;
BEGIN
    FOR pol_name IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'item_screenshots'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON item_screenshots', pol_name);
    END LOOP;
END $$;

-- Create fresh policies with unique names
CREATE POLICY "screenshots_select_all" ON item_screenshots
  FOR SELECT USING (true);

CREATE POLICY "screenshots_admin_all" ON item_screenshots
  FOR ALL TO authenticated
  USING (auth.jwt() ->> 'email' = 'yashpatil575757@gmail.com');

-- Insert some demo screenshots for testing (using placeholder IDs)
-- Note: Replace these UUIDs with actual item IDs from your database
INSERT INTO item_screenshots (item_id, item_type, screenshot_url, caption, display_order) 
SELECT 
  gen_random_uuid() as item_id,
  'store_item' as item_type,
  '/api/placeholder/600/400' as screenshot_url,
  'Demo Screenshot ' || generate_series as caption,
  generate_series as display_order
FROM generate_series(1, 3)
ON CONFLICT DO NOTHING;
