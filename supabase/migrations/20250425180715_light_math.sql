/*
  # Fix RLS policies for photos table

  1. Changes
    - Drop existing INSERT policy that's not working correctly
    - Create new INSERT policy with proper conditions
    - Ensure authenticated users can insert photos
    - Keep existing SELECT and UPDATE policies

  2. Security
    - Maintain public read access
    - Allow authenticated users to insert new photos
    - Keep existing update policy for votes
*/

-- First remove the problematic INSERT policy
DROP POLICY IF EXISTS "Authenticated users can insert photos" ON photos;

-- Create new INSERT policy with proper conditions
CREATE POLICY "Authenticated users can insert photos"
ON photos
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Note: We're keeping the existing policies:
-- - "Anyone can read photos" (SELECT)
-- - "Authenticated users can update votes" (UPDATE)