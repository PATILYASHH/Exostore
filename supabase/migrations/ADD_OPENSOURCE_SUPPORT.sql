-- Add open source project support to store_items table
-- This migration adds is_opensource and github_url fields for open source project tracking

-- Add the new columns to store_items table
ALTER TABLE store_items 
ADD COLUMN IF NOT EXISTS is_opensource BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS github_url TEXT DEFAULT '';

-- Create index for better performance on open source queries
CREATE INDEX IF NOT EXISTS idx_store_items_opensource ON store_items(is_opensource) WHERE is_opensource = true;

-- Update any existing items with default values if needed
UPDATE store_items 
SET 
    is_opensource = COALESCE(is_opensource, false),
    github_url = COALESCE(github_url, '')
WHERE is_opensource IS NULL OR github_url IS NULL;

-- Add comments for documentation
COMMENT ON COLUMN store_items.is_opensource IS 'Whether this project is open source and should show GitHub badge';
COMMENT ON COLUMN store_items.github_url IS 'GitHub repository URL for open source projects';

-- Add URL validation constraint for github_url
ALTER TABLE store_items 
ADD CONSTRAINT check_github_url_format 
CHECK (
    github_url = '' OR 
    github_url ~ '^https://github\.com/[^/]+/[^/]+/?$'
);

-- Verify the changes
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default 
FROM information_schema.columns 
WHERE table_name = 'store_items' 
    AND column_name IN ('is_opensource', 'github_url')
ORDER BY column_name;

-- Show sample of updated data
SELECT 
    id, 
    title, 
    is_opensource, 
    github_url 
FROM store_items 
LIMIT 5;
