/*
  # Update photos table RLS policies

  1. Changes
    - Drop existing policies to start fresh
    - Create comprehensive RLS policies for photos table
    - Enable public read access
    - Allow authenticated users to insert and update photos
    
  2. Security
    - Public users can read all photos
    - Authenticated users can insert new photos
    - Authenticated users can update votes on photos
*/

-- First, drop existing policies to start fresh
DROP POLICY IF EXISTS "Anyone can read photos" ON photos;
DROP POLICY IF EXISTS "Authenticated users can insert photos" ON photos;
DROP POLICY IF EXISTS "Authenticated users can update votes" ON photos;

-- Enable RLS on photos table (in case it wasn't enabled)
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Anyone can read photos"
ON photos
FOR SELECT
TO public
USING (true);

-- Create policy for authenticated users to insert photos
CREATE POLICY "Authenticated users can insert photos"
ON photos
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Create policy for authenticated users to update photos (votes)
CREATE POLICY "Authenticated users can update votes"
ON photos
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);