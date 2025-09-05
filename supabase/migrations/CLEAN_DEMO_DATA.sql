-- Remove demo/pseudo data from store_items table
-- This will clean up any demo content that might be in the database

-- Delete any items that look like demo data (common demo patterns)
DELETE FROM store_items 
WHERE title IN (
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
) OR developer IN (
  'GameStudio Pro',
  'Speed Studios',
  'Fantasy Games Inc',
  'Brain Games Studio',
  'Creative Suite Inc',
  'Productivity Solutions',
  'HealthTech Solutions',
  'Financial Apps Co',
  'WebCrafters Studio',
  'Commerce Solutions',
  'Content Creators',
  'Hospitality Web',
  'MindGames Inc'
);

-- Optional: Remove any items that were created without a real user ID
-- (Keep this commented out unless you're sure about what you want to delete)
-- DELETE FROM store_items WHERE created_by IS NULL;

-- Show remaining items
SELECT COUNT(*) as remaining_items FROM store_items;
SELECT title, developer, created_at FROM store_items ORDER BY created_at DESC;
