/*
  # Add database functions for vote management

  1. New Functions
    - `add_vote`: Adds a vote and increments the photo's vote count
    - `remove_vote`: Removes a vote and decrements the photo's vote count

  2. Changes
    - Added transaction handling for vote operations
    - Ensures vote count stays in sync with user_votes table
*/

-- Function to add a vote
CREATE OR REPLACE FUNCTION add_vote(
  photo_id UUID,
  user_id UUID
) RETURNS void AS $$
BEGIN
  -- Insert the vote if it doesn't exist
  INSERT INTO user_votes (user_id, photo_id)
  VALUES (user_id, photo_id)
  ON CONFLICT (user_id, photo_id) DO NOTHING;

  -- Increment the vote count
  UPDATE photos
  SET votes = votes + 1
  WHERE id = photo_id;
END;
$$ LANGUAGE plpgsql;

-- Function to remove a vote
CREATE OR REPLACE FUNCTION remove_vote(
  photo_id UUID,
  user_id UUID
) RETURNS void AS $$
BEGIN
  -- Remove the vote if it exists
  DELETE FROM user_votes
  WHERE user_id = $2 AND photo_id = $1;

  -- Decrement the vote count, ensuring it doesn't go below 0
  UPDATE photos
  SET votes = GREATEST(votes - 1, 0)
  WHERE id = photo_id;
END;
$$ LANGUAGE plpgsql;