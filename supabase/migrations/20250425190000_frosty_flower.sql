/*
  # Fix ambiguous user_id references in vote functions

  1. Changes
    - Update add_vote function to use explicit table references
    - Update remove_vote function to use explicit table references
    - No schema changes, only function updates

  2. Security
    - Functions remain security definer
    - No changes to RLS policies
*/

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS add_vote;
DROP FUNCTION IF EXISTS remove_vote;

-- Recreate add_vote function with explicit table references
CREATE OR REPLACE FUNCTION add_vote(photo_id UUID, user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert the vote if it doesn't exist
  INSERT INTO user_votes (photo_id, user_id)
  VALUES (photo_id, user_id)
  ON CONFLICT (user_id, photo_id) DO NOTHING;

  -- Update the vote count
  UPDATE photos
  SET votes = votes + 1
  WHERE photos.id = photo_id
  AND NOT EXISTS (
    SELECT 1 
    FROM user_votes 
    WHERE user_votes.photo_id = photos.id 
    AND user_votes.user_id = add_vote.user_id
  );
END;
$$;

-- Recreate remove_vote function with explicit table references
CREATE OR REPLACE FUNCTION remove_vote(photo_id UUID, user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete the vote if it exists
  DELETE FROM user_votes
  WHERE user_votes.photo_id = remove_vote.photo_id
  AND user_votes.user_id = remove_vote.user_id;

  -- Update the vote count
  UPDATE photos
  SET votes = votes - 1
  WHERE photos.id = photo_id
  AND EXISTS (
    SELECT 1 
    FROM user_votes 
    WHERE user_votes.photo_id = photos.id 
    AND user_votes.user_id = remove_vote.user_id
  );
END;
$$;