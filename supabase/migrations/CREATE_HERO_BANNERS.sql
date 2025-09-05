-- Create hero banners table for promotional content
-- This allows admin to upload promotional posters for new apps and sponsors

-- Create the hero_banners table
CREATE TABLE IF NOT EXISTS hero_banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subtitle text,
  description text,
  image_url text NOT NULL,
  link_url text, -- Can link to an app, sponsor site, etc.
  link_text text DEFAULT 'Learn More',
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  banner_type text DEFAULT 'app' CHECK (banner_type IN ('app', 'sponsor', 'promotion')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE hero_banners ENABLE ROW LEVEL SECURITY;

-- Create policies for hero_banners
-- Anyone can view active banners
CREATE POLICY "Anyone can view active hero banners" ON hero_banners
  FOR SELECT USING (is_active = true);

-- Only admins can manage banners (yashpatil575757@gmail.com)
CREATE POLICY "Admins can manage hero banners" ON hero_banners
  FOR ALL USING (
    auth.email() = 'yashpatil575757@gmail.com'
  );

-- Create indexes for better performance
CREATE INDEX idx_hero_banners_active ON hero_banners(is_active, display_order);
CREATE INDEX idx_hero_banners_created_at ON hero_banners(created_at DESC);

-- Insert a sample hero banner to start with
INSERT INTO hero_banners (
  title,
  subtitle,
  description,
  image_url,
  link_url,
  link_text,
  banner_type,
  display_order
) VALUES (
  'Welcome to YashStore',
  'Discover Amazing Apps & Games',
  'Upload your own applications and games to share with the community. Join thousands of developers and users today!',
  'https://images.pexels.com/photos/267350/pexels-photo-267350.jpeg?auto=compress&cs=tinysrgb&w=1200&h=400&fit=crop',
  '#',
  'Start Uploading',
  'promotion',
  1
);
