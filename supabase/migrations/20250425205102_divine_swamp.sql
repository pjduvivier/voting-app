-- Reset all vote counts to 0 and remove all user votes
BEGIN;
  -- First, remove all user votes
  DELETE FROM user_votes;

  -- Then reset all photo vote counts to 0
  UPDATE photos SET votes = 0;
COMMIT;