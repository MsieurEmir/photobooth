/*
  # Fix customers table schema - Make name nullable and add NOT NULL to first_name, last_name

  ## Description
  This migration fixes the inconsistency between the database schema and the application code.
  The application now uses first_name and last_name instead of the legacy name column.

  ## Modifications
  
  ### Table `customers`
    - Make `name` column nullable (to support legacy data)
    - Add NOT NULL constraint to `first_name` (if not already present)
    - Add NOT NULL constraint to `last_name` (if not already present)
    - Add NOT NULL constraint to `address` (as it's required in the booking form)

  ## Migration Strategy
  1. First, populate any NULL first_name/last_name from the name column (if data exists)
  2. Make name nullable
  3. Add NOT NULL constraints to first_name and last_name

  ## Notes
  - This ensures compatibility with the booking form that requires first_name, last_name, and address
  - The name column is kept for backward compatibility but is no longer required
*/

-- Step 1: For any existing customers that have 'name' but no first_name/last_name, 
-- populate first_name and last_name by splitting the name
DO $$
DECLARE
  customer_record RECORD;
  name_parts TEXT[];
BEGIN
  FOR customer_record IN 
    SELECT id, name 
    FROM customers 
    WHERE (first_name IS NULL OR last_name IS NULL) AND name IS NOT NULL
  LOOP
    -- Split the name by space
    name_parts := string_to_array(customer_record.name, ' ');
    
    -- If only one word, use it for both first and last name
    IF array_length(name_parts, 1) = 1 THEN
      UPDATE customers 
      SET first_name = name_parts[1],
          last_name = name_parts[1]
      WHERE id = customer_record.id;
    ELSE
      -- First word as first_name, rest as last_name
      UPDATE customers 
      SET first_name = name_parts[1],
          last_name = array_to_string(name_parts[2:array_length(name_parts, 1)], ' ')
      WHERE id = customer_record.id;
    END IF;
  END LOOP;
END $$;

-- Step 2: Make the 'name' column nullable
ALTER TABLE customers ALTER COLUMN name DROP NOT NULL;

-- Step 3: Set default empty string for first_name and last_name where NULL
UPDATE customers SET first_name = '' WHERE first_name IS NULL;
UPDATE customers SET last_name = '' WHERE last_name IS NULL;

-- Step 4: Add NOT NULL constraints to first_name and last_name
ALTER TABLE customers ALTER COLUMN first_name SET NOT NULL;
ALTER TABLE customers ALTER COLUMN last_name SET NOT NULL;

-- Step 5: Make address NOT NULL (as it's required in booking form)
-- First set a default for any existing NULL addresses
UPDATE customers SET address = '' WHERE address IS NULL;
ALTER TABLE customers ALTER COLUMN address SET NOT NULL;