/*
  # Create photos table for storing votes

  1. New Tables
    - `photos`
      - `id` (uuid, primary key)
      - `external_id` (text, unique) - ID from the external photo service
      - `url` (text) - Photo URL
      - `title` (text) - Photo title
      - `photographer` (text) - Photographer name
      - `votes` (integer) - Vote count
      - `date_added` (timestamptz) - When the photo was added
      - `description` (text) - Photo description

  2. Security
    - Enable RLS on `photos` table
    - Add policies for:
      - Anyone can read photos
      - Authenticated users can update vote count
*/

CREATE TABLE IF NOT EXISTS photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id text UNIQUE NOT NULL,
  url text NOT NULL,
  title text NOT NULL,
  photographer text NOT NULL,
  votes integer DEFAULT 0,
  date_added timestamptz DEFAULT now(),
  description text
);

ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read photos
CREATE POLICY "Anyone can read photos"
  ON photos
  FOR SELECT
  TO public
  USING (true);

-- Allow authenticated users to update votes
CREATE POLICY "Authenticated users can update votes"
  ON photos
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);