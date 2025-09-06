-- Quick diagnostic script to check screenshot functionality
-- Run this in Supabase SQL Editor to troubleshoot

-- 1. Check if item_screenshots table exists
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'item_screenshots') 
    THEN '✅ item_screenshots table EXISTS' 
    ELSE '❌ item_screenshots table MISSING - RUN COMPLETE_SETUP.sql'
  END as screenshot_table_status;

-- 2. Check if user_ratings table exists (for the 406 errors)
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_ratings') 
    THEN '✅ user_ratings table EXISTS' 
    ELSE '❌ user_ratings table MISSING - RUN COMPLETE_SETUP.sql'
  END as ratings_table_status;

-- 3. Show all tables in the database
SELECT 'Current tables in database:' as info;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;

-- 4. Check if there are any store items
SELECT 'Store items check:' as info;
SELECT COUNT(*) as total_items FROM store_items;

-- 5. Check if there are any screenshots
SELECT 'Screenshots check:' as info;
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'item_screenshots') 
    THEN (SELECT COUNT(*)::text FROM item_screenshots)
    ELSE 'Table does not exist'
  END as total_screenshots;

-- 6. If tables exist, show sample data
-- Show first few store items
SELECT 'Sample store items:' as info;
SELECT id, title, developer FROM store_items LIMIT 3;

-- Show any existing screenshots (only if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'item_screenshots') THEN
    RAISE NOTICE 'Screenshots in database:';
    PERFORM * FROM item_screenshots LIMIT 5;
  END IF;
END $$;

-- 7. Check RLS policies
SELECT 'RLS policies check:' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('item_screenshots', 'user_ratings', 'store_items')
ORDER BY tablename, policyname;
