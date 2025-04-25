/*
  # Add INSERT policy for photos table

  1. Security Changes
    - Add policy to allow authenticated users to insert new photos
    - This policy is required to fix the RLS violation error when creating new photos

  Note: This maintains existing policies while adding the necessary INSERT permission
*/

CREATE POLICY "Authenticated users can insert photos"
  ON public.photos
  FOR INSERT
  TO authenticated
  WITH CHECK (true);