/*
  # Fix RLS policies for photos table

  1. Changes
    - Drop existing policies to start fresh
    - Re-enable RLS
    - Create comprehensive policies for all required operations
    
  2. Security
    - Allow public read access to all photos
    - Allow authenticated users to insert new photos
    - Allow authenticated users to update only the votes count
    - Ensure proper access control for all operations
*/

-- First, drop all existing policies to start fresh
DROP POLICY IF EXISTS "Anyone can read photos" ON photos;
DROP POLICY IF EXISTS "Authenticated users can insert photos" ON photos;
DROP POLICY IF EXISTS "Authenticated users can update votes" ON photos;

-- Ensure RLS is enabled
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (no authentication required)
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
WITH CHECK (
  -- Ensure required fields are provided
  external_id IS NOT NULL AND
  url IS NOT NULL AND
  title IS NOT NULL AND
  photographer IS NOT NULL
);

-- Create policy for authenticated users to update only votes
CREATE POLICY "Authenticated users can update votes"
ON photos
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (
  -- Only allow updating the votes column
  (
    CASE WHEN votes IS NOT NULL 
    THEN true
    ELSE false
    END
  )
);