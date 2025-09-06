-- Add cross-platform support to store_items table
-- Run this in Supabase SQL Editor

-- Add new columns for cross-platform functionality
ALTER TABLE store_items 
ADD COLUMN IF NOT EXISTS has_web_version boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS has_app_version boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS web_version_url text,
ADD COLUMN IF NOT EXISTS app_version_url text,
ADD COLUMN IF NOT EXISTS cross_platform_notes text;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_store_items_web_version ON store_items(has_web_version);
CREATE INDEX IF NOT EXISTS idx_store_items_app_version ON store_items(has_app_version);

-- Example: Update existing items to demonstrate the feature
-- Uncomment and modify these if you want to test with existing items
/*
UPDATE store_items 
SET 
  has_web_version = true,
  web_version_url = 'https://example.com/web-version',
  cross_platform_notes = 'Also available as a web application'
WHERE type = 'apps' AND title ILIKE '%calculator%';

UPDATE store_items 
SET 
  has_app_version = true,
  app_version_url = 'https://example.com/app-download',
  cross_platform_notes = 'Also available as a mobile/desktop app'
WHERE type = 'websites' AND title ILIKE '%portfolio%';
*/

-- Show current schema
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'store_items' 
AND column_name IN ('has_web_version', 'has_app_version', 'web_version_url', 'app_version_url', 'cross_platform_notes')
ORDER BY column_name;
