/*
  # Add name column to gallery table

  1. Changes
    - Add `name` column to `gallery` table
      - Type: text
      - Not null
      - Default: empty string
      - Description: Unique identifying name for the photo, used in the database
    
  2. Notes
    - Existing photos will have an empty name by default
    - Admins can add names when uploading new photos
*/

-- Add name column to gallery table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'gallery' AND column_name = 'name'
  ) THEN
    ALTER TABLE gallery ADD COLUMN name text NOT NULL DEFAULT '';
  END IF;
END $$;

COMMENT ON COLUMN gallery.name IS 'Unique identifying name for the photo, displayed in the database and admin interface.';