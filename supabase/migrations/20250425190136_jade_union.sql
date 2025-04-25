/*
  # Fix ambiguous user_id reference in vote functions

  1. Changes
    - Drop and recreate add_vote and remove_vote functions with explicit table references
    - Use qualified column names to avoid ambiguity
    - Maintain existing transaction safety and constraints

  2. Security
    - Functions remain accessible only to authenticated users
    - No changes to existing RLS policies
*/

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS add_vote;
DROP FUNCTION IF EXISTS remove_vote;

-- Recreate add_vote function with explicit table references
CREATE OR REPLACE FUNCTION add_vote(
  photo_id UUID,
  user_id UUID
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert vote record
  INSERT INTO user_votes (photo_id, user_id)
  VALUES (photo_id, user_id);

  -- Update vote count
  UPDATE photos
  SET votes = votes + 1
  WHERE id = photo_id;
END;
$$;

-- Recreate remove_vote function with explicit table references
CREATE OR REPLACE FUNCTION remove_vote(
  photo_id UUID,
  user_id UUID
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete vote record
  DELETE FROM user_votes
  WHERE user_votes.photo_id = $1
  AND user_votes.user_id = $2;

  -- Update vote count
  UPDATE photos
  SET votes = votes - 1
  WHERE id = photo_id;
END;
$$;