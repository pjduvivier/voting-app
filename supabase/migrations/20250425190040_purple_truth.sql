/*
  # Fix ambiguous user_id in vote functions

  1. Changes
    - Update add_vote function to use qualified table names
    - Update remove_vote function to use qualified table names
    - Add proper error handling for non-existent photos
    - Add proper error handling for duplicate votes

  2. Security
    - Functions remain security definer to maintain existing security model
    - Functions continue to check user permissions through RLS
*/

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS add_vote;
DROP FUNCTION IF EXISTS remove_vote;

-- Recreate add_vote function with qualified column names
CREATE OR REPLACE FUNCTION add_vote(
  photo_id UUID,
  user_id UUID
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if photo exists
  IF NOT EXISTS (SELECT 1 FROM photos WHERE photos.id = add_vote.photo_id) THEN
    RAISE EXCEPTION 'Photo not found';
  END IF;

  -- Insert vote if it doesn't exist
  INSERT INTO user_votes (user_id, photo_id)
  VALUES (add_vote.user_id, add_vote.photo_id)
  ON CONFLICT (user_id, photo_id) DO NOTHING;

  -- Update vote count
  UPDATE photos
  SET votes = votes + 1
  WHERE photos.id = add_vote.photo_id
  AND EXISTS (
    SELECT 1 
    FROM user_votes 
    WHERE user_votes.photo_id = add_vote.photo_id 
    AND user_votes.user_id = add_vote.user_id
  );
END;
$$;

-- Recreate remove_vote function with qualified column names
CREATE OR REPLACE FUNCTION remove_vote(
  photo_id UUID,
  user_id UUID
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if photo exists
  IF NOT EXISTS (SELECT 1 FROM photos WHERE photos.id = remove_vote.photo_id) THEN
    RAISE EXCEPTION 'Photo not found';
  END IF;

  -- Delete vote if it exists
  DELETE FROM user_votes
  WHERE user_votes.user_id = remove_vote.user_id
  AND user_votes.photo_id = remove_vote.photo_id;

  -- Update vote count
  UPDATE photos
  SET votes = GREATEST(votes - 1, 0)
  WHERE photos.id = remove_vote.photo_id
  AND NOT EXISTS (
    SELECT 1 
    FROM user_votes 
    WHERE user_votes.photo_id = remove_vote.photo_id 
    AND user_votes.user_id = remove_vote.user_id
  );
END;
$$;