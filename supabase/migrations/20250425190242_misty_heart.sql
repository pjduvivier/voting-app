/*
  # Reset all votes

  1. Changes
    - Reset votes count to 0 for all photos
    - Remove all user votes
    - Maintain table structure and other data

  2. Security
    - No changes to RLS policies
    - No changes to table structure
*/

-- Reset all vote counts to 0
UPDATE photos
SET votes = 0;

-- Remove all user votes
DELETE FROM user_votes;