/*
  # Store Database Schema

  1. New Tables
    - `store_items`
      - `id` (uuid, primary key)
      - `title` (text)
      - `developer` (text)
      - `rating` (numeric)
      - `downloads` (text)
      - `image` (text)
      - `category` (text)
      - `price` (text)
      - `description` (text)
      - `type` (text)
      - `download_link` (text, optional)
      - `file_path` (text, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `created_by` (uuid, foreign key to auth.users)

  2. Security
    - Enable RLS on `store_items` table
    - Add policies for public read access
    - Add policies for admin write access (only yashpatil575757@gmail.com)
*/

CREATE TABLE IF NOT EXISTS store_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  developer text NOT NULL,
  rating numeric DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  downloads text DEFAULT '0',
  image text NOT NULL,
  category text NOT NULL,
  price text DEFAULT 'Free',
  description text NOT NULL,
  type text NOT NULL CHECK (type IN ('games', 'apps', 'websites')),
  download_link text,
  file_path text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

ALTER TABLE store_items ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies to avoid conflicts
DO $$ 
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Anyone can read store items" ON store_items;
  DROP POLICY IF EXISTS "Admin can manage store items" ON store_items;
  
  -- Public can read all store items
  CREATE POLICY "Anyone can read store items"
    ON store_items
    FOR SELECT
    TO public
    USING (true);

  -- Only admin can insert/update/delete store items
  CREATE POLICY "Admin can manage store items"
    ON store_items
    FOR ALL
    TO authenticated
    USING (
      auth.jwt() ->> 'email' = 'yashpatil575757@gmail.com'
    )
    WITH CHECK (
      auth.jwt() ->> 'email' = 'yashpatil575757@gmail.com'
    );
END $$;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop and recreate trigger to avoid conflicts
DO $$ 
BEGIN
  DROP TRIGGER IF EXISTS update_store_items_updated_at ON store_items;
  CREATE TRIGGER update_store_items_updated_at
    BEFORE UPDATE ON store_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
END $$;