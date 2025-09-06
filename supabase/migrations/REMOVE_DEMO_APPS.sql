-- Remove All Demo/Pseudo Apps - Clean Database
-- This script removes all fake/demo content and leaves only real admin-uploaded items
-- Run this in Supabase SQL Editor

-- =====================================================
-- 1. REMOVE ALL DEMO/TEST STORE ITEMS
-- =====================================================

-- Delete specific demo items by title patterns
DELETE FROM store_items WHERE 
  title ILIKE '%test%' OR
  title ILIKE '%sample%' OR
  title ILIKE '%demo%' OR
  title ILIKE '%getting started%' OR
  title ILIKE '%example%' OR
  developer = 'YashStore Team' OR
  developer = 'Admin Test' OR
  developer = 'Community Upload' OR
  download_link = '#' OR
  download_link = '' OR
  download_link IS NULL;

-- =====================================================
-- 2. REMOVE DEMO SCREENSHOTS
-- =====================================================

-- Delete all screenshots for non-existent items
DELETE FROM item_screenshots WHERE 
  item_id NOT IN (SELECT id FROM store_items) OR
  screenshot_url ILIKE '%pexels%' OR
  screenshot_url ILIKE '%placeholder%' OR
  screenshot_url ILIKE '%demo%';

-- =====================================================
-- 3. REMOVE DEMO UPLOADED FILES
-- =====================================================

-- Delete any demo uploaded files (if they exist)
DELETE FROM uploaded_files WHERE 
  filename ILIKE '%demo%' OR
  filename ILIKE '%test%' OR
  filename ILIKE '%sample%' OR
  original_filename ILIKE '%demo%' OR
  original_filename ILIKE '%test%' OR
  original_filename ILIKE '%sample%' OR
  file_url ILIKE '%example.com%' OR
  file_url IS NULL;

-- =====================================================
-- 4. REMOVE DEMO HERO BANNERS
-- =====================================================

-- Delete demo hero banners
DELETE FROM hero_banners WHERE 
  title ILIKE '%demo%' OR
  title ILIKE '%sample%' OR
  title ILIKE '%test%' OR
  image_url ILIKE '%pexels%' OR
  link_url = '#' OR
  link_url IS NULL;

-- =====================================================
-- 5. CLEAN UP ORPHANED USER INTERACTIONS
-- =====================================================

-- Remove downloads for non-existent items
DELETE FROM user_downloads WHERE 
  item_id NOT IN (
    SELECT id FROM store_items 
    UNION 
    SELECT id FROM uploaded_files
  );

-- Remove ratings for non-existent items
DELETE FROM user_ratings WHERE 
  item_id NOT IN (
    SELECT id FROM store_items 
    UNION 
    SELECT id FROM uploaded_files
  );

-- =====================================================
-- 6. RESET AUTO-INCREMENT COUNTERS
-- =====================================================

-- Reset download and rating counts for remaining items
UPDATE store_items SET 
  download_count = (
    SELECT COUNT(*) FROM user_downloads 
    WHERE item_id = store_items.id AND download_type = 'store_item'
  ),
  rating_count = (
    SELECT COUNT(*) FROM user_ratings 
    WHERE item_id = store_items.id AND rating_type = 'store_item'
  ),
  average_rating = (
    SELECT COALESCE(AVG(rating), 0) FROM user_ratings 
    WHERE item_id = store_items.id AND rating_type = 'store_item'
  );

UPDATE uploaded_files SET 
  download_count = (
    SELECT COUNT(*) FROM user_downloads 
    WHERE item_id = uploaded_files.id AND download_type = 'uploaded_file'
  ),
  rating_count = (
    SELECT COUNT(*) FROM user_ratings 
    WHERE item_id = uploaded_files.id AND rating_type = 'uploaded_file'
  ),
  average_rating = (
    SELECT COALESCE(AVG(rating), 0) FROM user_ratings 
    WHERE item_id = uploaded_files.id AND rating_type = 'uploaded_file'
  );

-- =====================================================
-- 7. VERIFICATION - SHOW REMAINING CONTENT
-- =====================================================

SELECT 'CLEANUP COMPLETE - Remaining content:' as status;

SELECT 'Store Items:' as table_name, COUNT(*) as count FROM store_items;
SELECT 'Uploaded Files:' as table_name, COUNT(*) as count FROM uploaded_files;
SELECT 'Screenshots:' as table_name, COUNT(*) as count FROM item_screenshots;
SELECT 'Hero Banners:' as table_name, COUNT(*) as count FROM hero_banners;
SELECT 'User Downloads:' as table_name, COUNT(*) as count FROM user_downloads;
SELECT 'User Ratings:' as table_name, COUNT(*) as count FROM user_ratings;

-- Show remaining store items (should only be real admin uploads)
SELECT 
  'Remaining Store Items:' as info,
  id,
  title,
  developer,
  category,
  created_at
FROM store_items 
ORDER BY created_at DESC;

-- Show remaining uploaded files (should only be real uploads)
SELECT 
  'Remaining Uploaded Files:' as info,
  id,
  original_filename,
  file_type,
  uploaded_at
FROM uploaded_files 
ORDER BY uploaded_at DESC;

SELECT 'All demo/pseudo apps removed successfully!' as final_status;
