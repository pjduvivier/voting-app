/*
  # Fix Photos Table RLS Policies

  1. Changes
    - Remove existing policies using incorrect 'public' role
    - Add new policies for both authenticated and anonymous users
    - Enable proper SELECT access for all users
    - Allow authenticated users to insert photos
    - Allow authenticated users to update votes

  2. Security
    - Enable RLS on photos table (if not already enabled)
    - Add policies for:
      - SELECT: Available to both authenticated and anonymous users
      - INSERT: Only available to authenticated users
      - UPDATE: Only available to authenticated users (for votes)
*/

-- Drop existing policies to clean up
DROP POLICY IF EXISTS "Anyone can read photos" ON photos;
DROP POLICY IF EXISTS "Authenticated users can insert photos" ON photos;
DROP POLICY IF EXISTS "Authenticated users can update votes" ON photos;

-- Enable RLS (if not already enabled)
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- Add new SELECT policy for all users (both authenticated and anonymous)
CREATE POLICY "Allow reading photos for all users"
  ON photos
  FOR SELECT
  USING (true);

-- Add new INSERT policy for authenticated users
CREATE POLICY "Allow authenticated users to insert photos"
  ON photos
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (external_id IS NOT NULL) AND 
    (url IS NOT NULL) AND 
    (title IS NOT NULL) AND 
    (photographer IS NOT NULL) AND 
    (url ~ '^https?://'::text)
  );

-- Add new UPDATE policy for authenticated users (for votes)
CREATE POLICY "Allow authenticated users to update votes"
  ON photos
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (
    CASE
      WHEN ((votes IS NOT NULL) AND (votes >= 0)) THEN true
      ELSE false
    END
  );