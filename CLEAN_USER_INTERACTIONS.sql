-- Clean User Interactions Migration
-- Run this in Supabase SQL Editor (this file replaces user_interactions.sql)

-- First, drop all existing policies to avoid conflicts
DO $$ 
DECLARE
    pol_name TEXT;
BEGIN
    -- Drop all policies for user_downloads
    FOR pol_name IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'user_downloads'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON user_downloads', pol_name);
    END LOOP;
    
    -- Drop all policies for user_ratings
    FOR pol_name IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'user_ratings'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON user_ratings', pol_name);
    END LOOP;
    
    -- Drop all policies for uploaded_files
    FOR pol_name IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'uploaded_files'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON uploaded_files', pol_name);
    END LOOP;
END $$;

-- Enable RLS on all tables
ALTER TABLE user_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploaded_files ENABLE ROW LEVEL SECURITY;

-- Create fresh policies for user_downloads
CREATE POLICY "user_downloads_select_own" ON user_downloads
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "user_downloads_insert_own" ON user_downloads
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_downloads_admin_all" ON user_downloads
  FOR ALL TO authenticated
  USING (auth.jwt() ->> 'email' = 'yashpatil575757@gmail.com');

-- Create fresh policies for user_ratings
CREATE POLICY "user_ratings_select_all" ON user_ratings
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "user_ratings_insert_own" ON user_ratings
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_ratings_update_own" ON user_ratings
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_ratings_delete_own" ON user_ratings
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "user_ratings_admin_all" ON user_ratings
  FOR ALL TO authenticated
  USING (auth.jwt() ->> 'email' = 'yashpatil575757@gmail.com');

-- Create fresh policies for uploaded_files
CREATE POLICY "uploaded_files_select_all" ON uploaded_files
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "uploaded_files_admin_all" ON uploaded_files
  FOR ALL TO authenticated
  USING (auth.jwt() ->> 'email' = 'yashpatil575757@gmail.com');
