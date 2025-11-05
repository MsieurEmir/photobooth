/*
  # Create Admin User - Emir

  ## Description
  This migration creates an admin user account for Emir with full administrative privileges.

  ## Changes
  1. New User Account
    - Email: emir@pixbooth.fr
    - Password: admin123
    - Role: admin
    - Full Name: Emir

  ## Security
  - User is created in auth.users table with encrypted password
  - User profile is linked via user_profiles table with admin role
  - Admin role grants full access to all administrative functions

  ## Notes
  - If the user already exists, this migration will skip the creation
  - The password is properly hashed using Supabase's crypt function
*/

DO $$
DECLARE
  admin_user_id uuid;
  encrypted_password text;
  identity_id uuid;
BEGIN
  -- Check if user already exists
  SELECT id INTO admin_user_id FROM auth.users WHERE email = 'emir@pixbooth.fr';
  
  IF admin_user_id IS NULL THEN
    -- Generate UUID for the new user
    admin_user_id := gen_random_uuid();
    identity_id := gen_random_uuid();
    
    -- Hash the password using pgcrypto extension
    encrypted_password := crypt('admin123', gen_salt('bf'));
    
    -- Insert into auth.users table
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_app_meta_data,
      raw_user_meta_data,
      aud,
      role,
      confirmation_token,
      recovery_token,
      email_change_token_new,
      email_change
    ) VALUES (
      admin_user_id,
      '00000000-0000-0000-0000-000000000000',
      'emir@pixbooth.fr',
      encrypted_password,
      now(),
      now(),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Emir"}'::jsonb,
      'authenticated',
      'authenticated',
      '',
      '',
      '',
      ''
    );
    
    -- Insert into auth.identities table (email is a generated column)
    INSERT INTO auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      provider_id,
      last_sign_in_at,
      created_at,
      updated_at
    ) VALUES (
      identity_id,
      admin_user_id,
      jsonb_build_object(
        'sub', admin_user_id::text,
        'email', 'emir@pixbooth.fr',
        'email_verified', true,
        'provider', 'email'
      ),
      'email',
      admin_user_id::text,
      now(),
      now(),
      now()
    );
    
    -- Create user profile with admin role
    INSERT INTO user_profiles (id, email, full_name, role, created_at)
    VALUES (
      admin_user_id,
      'emir@pixbooth.fr',
      'Emir',
      'admin',
      now()
    );
    
    RAISE NOTICE 'Admin user created successfully!';
    RAISE NOTICE 'Email: emir@pixbooth.fr';
    RAISE NOTICE 'Password: admin123';
    RAISE NOTICE 'User ID: %', admin_user_id;
  ELSE
    RAISE NOTICE 'User already exists for emir@pixbooth.fr';
  END IF;
END $$;