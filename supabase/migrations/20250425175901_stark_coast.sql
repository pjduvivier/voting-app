/*
  # Create user_votes table for tracking individual votes

  1. New Tables
    - `user_votes`
      - `id` (uuid, primary key)
      - `user_id` (uuid) - Reference to auth.users
      - `photo_id` (uuid) - Reference to photos
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `user_votes` table
    - Add policies for:
      - Users can read their own votes
      - Users can create their own votes
      - Users can delete their own votes
*/

CREATE TABLE IF NOT EXISTS user_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  photo_id uuid REFERENCES photos NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, photo_id)
);

ALTER TABLE user_votes ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own votes
CREATE POLICY "Users can read own votes"
  ON user_votes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow users to create their own votes
CREATE POLICY "Users can create own votes"
  ON user_votes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own votes
CREATE POLICY "Users can delete own votes"
  ON user_votes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);