-- Add admin-editable metadata fields to store_items table
-- This migration adds version, file_size, and last_updated fields for comprehensive admin control

-- Add the new columns to store_items table
ALTER TABLE store_items 
ADD COLUMN IF NOT EXISTS version TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS file_size TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS last_updated DATE DEFAULT CURRENT_DATE;

-- Create index for better performance on date queries
CREATE INDEX IF NOT EXISTS idx_store_items_last_updated ON store_items(last_updated);

-- Update any existing items with default values if needed
UPDATE store_items 
SET 
    version = COALESCE(version, '1.0'),
    file_size = COALESCE(file_size, 'Unknown'),
    last_updated = COALESCE(last_updated, CURRENT_DATE)
WHERE version IS NULL OR file_size IS NULL OR last_updated IS NULL;

-- Add comments for documentation
COMMENT ON COLUMN store_items.version IS 'Software version (e.g., 1.0.0, v2.1)';
COMMENT ON COLUMN store_items.file_size IS 'File size in human readable format (e.g., 25 MB, 1.2 GB)';
COMMENT ON COLUMN store_items.last_updated IS 'Date when the item was last updated';

-- Verify the changes
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default 
FROM information_schema.columns 
WHERE table_name = 'store_items' 
    AND column_name IN ('version', 'file_size', 'last_updated')
ORDER BY column_name;

-- Show sample of updated data
SELECT 
    id, 
    title, 
    version, 
    file_size, 
    last_updated 
FROM store_items 
LIMIT 5;
