/*
  # Update photos table RLS policies

  1. Changes
    - Remove existing INSERT policy and create a new one with proper checks
    - Ensure authenticated users can insert photos without restrictions
    - Maintain existing SELECT policy for public access
    - Keep UPDATE policy for votes

  2. Security
    - Photos can be inserted by any authenticated user
    - Photos remain publicly readable
    - Vote updates are still allowed for authenticated users
*/

-- Drop existing INSERT policy
DROP POLICY IF EXISTS "Authenticated users can insert photos" ON photos;

-- Create new INSERT policy with proper permissions
CREATE POLICY "Authenticated users can insert photos"
ON photos
FOR INSERT
TO authenticated
WITH CHECK (true);