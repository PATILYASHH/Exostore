-- Simple Demo Uploaded Files (No Auth User Dependencies)
-- Run this in Supabase SQL Editor to add sample community apps

-- Insert demo files without auth user dependency
INSERT INTO uploaded_files (
  id,
  filename,
  original_filename,
  file_type,
  file_size,
  file_url,
  uploaded_at,
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
  12,
  2,
  4.5,
  'application/x-msi',
  'uploads/demo-utility.msi'
),
(
  gen_random_uuid(),
  'photo-editor.dmg',
  'Photo Editor Pro',
  'application/dmg',
  8388608,
  'https://example.com/photo-editor.dmg',
  NOW() - INTERVAL '5 days',
  31,
  7,
  4.1,
  'application/x-apple-diskimage',
  'uploads/photo-editor.dmg'
);
