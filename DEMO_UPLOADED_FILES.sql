-- Demo uploaded files for testing Community Apps section
-- Run this in Supabase SQL Editor to add sample community apps

INSERT INTO uploaded_files (
  id,
  filename,
  original_filename,
  file_type,
  file_size,
  file_url,
  uploaded_at,
  uploaded_by,
  download_count,
  rating_count,
  average_rating,
  mime_type,
  storage_path
) VALUES 
(
  gen_random_uuid(),
  'demo-calculator.exe',
  'Calculator Pro',
  'application/exe',
  2048000,
  'https://example.com/demo-calculator.exe',
  NOW(),
  (SELECT id FROM auth.users WHERE email = 'yashpatil575757@gmail.com' LIMIT 1),
  25,
  5,
  4.2,
  'application/x-msdownload',
  'uploads/demo-calculator.exe'
),
(
  gen_random_uuid(),
  'demo-notepad.zip',
  'Advanced Notepad',
  'application/zip',
  1024000,
  'https://example.com/demo-notepad.zip',
  NOW() - INTERVAL '2 days',
  (SELECT id FROM auth.users WHERE email = 'yashpatil575757@gmail.com' LIMIT 1),
  18,
  3,
  4.7,
  'application/zip',
  'uploads/demo-notepad.zip'
),
(
  gen_random_uuid(),
  'demo-game.apk',
  'Puzzle Master Game',
  'application/apk',
  15728640,
  'https://example.com/demo-game.apk',
  NOW() - INTERVAL '1 week',
  (SELECT id FROM auth.users WHERE email = 'yashpatil575757@gmail.com' LIMIT 1),
  42,
  8,
  3.9,
  'application/vnd.android.package-archive',
  'uploads/demo-game.apk'
),
(
  gen_random_uuid(),
  'demo-utility.msi',
  'System Optimizer',
  'application/msi',
  5242880,
  'https://example.com/demo-utility.msi',
  NOW() - INTERVAL '3 days',
  (SELECT id FROM auth.users WHERE email = 'yashpatil575757@gmail.com' LIMIT 1),
  12,
  2,
  4.5,
  'application/x-msi',
  'uploads/demo-utility.msi'
);
