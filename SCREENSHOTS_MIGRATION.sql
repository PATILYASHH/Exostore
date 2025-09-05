-- Add screenshots support to store items and uploaded files
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

-- Allow everyone to view screenshots
CREATE POLICY "Everyone can view screenshots" ON item_screenshots
  FOR SELECT USING (true);

-- Allow admin to manage screenshots
CREATE POLICY "Admin can manage screenshots" ON item_screenshots
  FOR ALL USING (auth.jwt() ->> 'email' = 'yashpatil575757@gmail.com');

-- Insert some demo screenshots for existing items
INSERT INTO item_screenshots (item_id, item_type, screenshot_url, caption, display_order) VALUES
-- These would be real item IDs from your store_items table
('00000000-0000-0000-0000-000000000001', 'store_item', '/api/placeholder/600/400', 'Main interface', 1),
('00000000-0000-0000-0000-000000000001', 'store_item', '/api/placeholder/600/400', 'Settings panel', 2),
('00000000-0000-0000-0000-000000000001', 'store_item', '/api/placeholder/600/400', 'Game play', 3);

-- You can add real screenshots by updating the uploaded_files with actual IDs
-- Example for uploaded files:
-- INSERT INTO item_screenshots (item_id, item_type, screenshot_url, caption, display_order)
-- SELECT id, 'uploaded_file', '/api/placeholder/600/400', 'Screenshot 1', 1
-- FROM uploaded_files LIMIT 1;
