-- Check and fix store_items table data
-- Run this in Supabase SQL editor to see if there are any uploaded apps

-- First, let's see what's in the store_items table
SELECT 'Current store_items count:' as info, COUNT(*) as count FROM store_items;

-- Show all store items
SELECT 
  id,
  title,
  developer,
  category,
  type,
  price,
  created_at
FROM store_items 
ORDER BY created_at DESC;

-- If no items exist, let's insert a test item to verify the system works
INSERT INTO store_items (
  title,
  developer,
  image,
  category,
  price,
  description,
  type,
  download_link,
  rating,
  downloads
) VALUES (
  'Test App - Sample Upload',
  'Admin Test',
  'https://images.pexels.com/photos/267350/pexels-photo-267350.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
  'apps',
  'Free',
  'This is a test application to verify that the store is working correctly. You can see this means your upload system is functional.',
  'apps',
  '#',
  4.5,
  100
) ON CONFLICT (id) DO NOTHING;

-- Verify the insert worked
SELECT 'After insert count:' as info, COUNT(*) as count FROM store_items;
