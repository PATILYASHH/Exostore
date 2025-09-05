-- CLEAN ALL DEMO/FAKE DATA FROM DATABASE
-- Run this in your Supabase SQL Editor to remove all fake uploaded files

-- 1. Delete all demo uploaded files (these are the fake ones you're seeing)
DELETE FROM uploaded_files 
WHERE original_filename IN (
  'Calculator Pro',
  'Shopsynk.apk', 
  'Advanced Notepad',
  'System Optimizer',
  'Photo Editor Pro',
  'Puzzle Master Game'
);

-- 2. Delete any demo store items (if any remain)
DELETE FROM store_items 
WHERE title IN (
  'Calculator Pro',
  'Shopsynk.apk', 
  'Advanced Notepad',
  'System Optimizer',
  'Photo Editor Pro',
  'Puzzle Master Game',
  'Epic Adventure Quest',
  'Racing Thunder',
  'Mystic Legends',
  'Puzzle Master',
  'PhotoEdit Pro',
  'TaskManager Plus',
  'FitTracker',
  'BudgetMaster',
  'DevPortfolio',
  'E-Commerce Starter',
  'Blog Platform',
  'Restaurant Menu'
);

-- 3. Clean up any related data (downloads, ratings, screenshots)
-- Delete fake download records
DELETE FROM user_downloads 
WHERE item_id NOT IN (
  SELECT id FROM uploaded_files 
  UNION 
  SELECT id FROM store_items
);

-- Delete fake rating records  
DELETE FROM user_ratings 
WHERE item_id NOT IN (
  SELECT id FROM uploaded_files 
  UNION 
  SELECT id FROM store_items
);

-- Delete fake screenshot records
DELETE FROM item_screenshots 
WHERE item_id NOT IN (
  SELECT id FROM uploaded_files 
  UNION 
  SELECT id FROM store_items
);

-- 4. Show what's left (should be empty or only your real uploads)
SELECT 'Remaining uploaded files:' as table_name, COUNT(*) as count FROM uploaded_files
UNION ALL
SELECT 'Remaining store items:', COUNT(*) FROM store_items
UNION ALL  
SELECT 'Remaining downloads:', COUNT(*) FROM user_downloads
UNION ALL
SELECT 'Remaining ratings:', COUNT(*) FROM user_ratings;

-- 5. List any remaining files to verify they're yours
SELECT 'UPLOADED FILES' as type, original_filename, file_size, uploaded_at 
FROM uploaded_files 
ORDER BY uploaded_at DESC;

SELECT 'STORE ITEMS' as type, title, developer, created_at 
FROM store_items 
ORDER BY created_at DESC;
