/*
  # Fix RLS policies for photos table

  1. Changes
    - Drop existing RLS policies on photos table
    - Create new policies that correctly handle both anon and authenticated roles
    - Enable proper access for SELECT and INSERT operations
  
  2. Security
    - Allow both anon and authenticated roles to read photos
    - Allow both anon and authenticated roles to insert photos with validation
    - Maintain data integrity with proper validation checks
*/

-- First, drop existing policies
DROP POLICY IF EXISTS "Allow authenticated users to insert photos" ON photos;
DROP POLICY IF EXISTS "Allow reading photos for all users" ON photos;

-- Create new SELECT policy for both anon and authenticated roles
CREATE POLICY "Anyone can read photos"
  ON photos
  FOR SELECT
  USING (true);

-- Create new INSERT policy for both anon and authenticated roles
CREATE POLICY "Anyone can insert photos"
  ON photos
  FOR INSERT
  WITH CHECK (
    external_id IS NOT NULL AND
    url IS NOT NULL AND
    url ~ '^https?://' AND
    title IS NOT NULL AND
    photographer IS NOT NULL
  );