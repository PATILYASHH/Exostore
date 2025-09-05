-- Create item_screenshots table for storing demo images/screenshots
-- This allows multiple screenshots per app/website for better showcasing

-- Create the item_screenshots table
CREATE TABLE IF NOT EXISTS item_screenshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL,
  item_type text NOT NULL CHECK (item_type IN ('store_item', 'uploaded_file')),
  screenshot_url text NOT NULL,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  uploaded_by uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE item_screenshots ENABLE ROW LEVEL SECURITY;

-- Create policies for item_screenshots
-- Anyone can view screenshots
CREATE POLICY "Anyone can view screenshots" ON item_screenshots
  FOR SELECT USING (true);

-- Only admins can manage screenshots
CREATE POLICY "Admins can manage screenshots" ON item_screenshots
  FOR ALL USING (
    auth.email() = 'yashpatil575757@gmail.com'
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_item_screenshots_item ON item_screenshots(item_id, item_type);
CREATE INDEX IF NOT EXISTS idx_item_screenshots_order ON item_screenshots(item_id, display_order);
CREATE INDEX IF NOT EXISTS idx_item_screenshots_created_at ON item_screenshots(created_at DESC);

-- Add some constraints
ALTER TABLE item_screenshots 
ADD CONSTRAINT unique_screenshot_order_per_item 
UNIQUE (item_id, item_type, display_order);
