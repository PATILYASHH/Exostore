-- Simple storage bucket setup for Supabase
-- Run this in your Supabase SQL editor

-- Create storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('store-files', 'store-files', true, 104857600, ARRAY['image/*', 'application/*', 'text/*'])
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 104857600,
  allowed_mime_types = ARRAY['image/*', 'application/*', 'text/*'];
