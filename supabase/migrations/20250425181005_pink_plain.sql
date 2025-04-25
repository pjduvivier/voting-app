/*
  # Fix RLS policies for photos table

  1. Changes
    - Drop all existing policies on the photos table
    - Create new policies with proper permissions:
      - Public read access for everyone
      - Insert access for authenticated users
      - Update access for authenticated users (for votes)
    - Ensure RLS is enabled

  2. Security
    - Maintains data security while allowing necessary operations
    - Ensures authenticated users can perform required actions
    - Keeps public read access for photo discovery
*/

-- First, drop all existing policies to start fresh
DROP POLICY IF EXISTS "Anyone can read photos" ON photos;
DROP POLICY IF EXISTS "Authenticated users can insert photos" ON photos;
DROP POLICY IF EXISTS "Authenticated users can update votes" ON photos;

-- Ensure RLS is enabled
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

-- Create policy for authenticated users to update photos (for votes)
CREATE POLICY "Authenticated users can update votes"
ON photos
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);