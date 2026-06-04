-- Add birthday column to client_profiles
ALTER TABLE client_profiles ADD COLUMN birthday DATE;

-- Add 'prefer_not' to gender enum
ALTER TYPE gender ADD VALUE 'prefer_not';

-- Change nationality from enum to TEXT for free-text input
ALTER TABLE client_profiles
  ALTER COLUMN nationality TYPE TEXT
  USING nationality::text;

-- Add direct FK from applications.client_id to client_profiles.user_id
-- so Supabase FK joins (client_profiles!inner) work
ALTER TABLE applications
  ADD CONSTRAINT fk_applications_client_profiles
  FOREIGN KEY (client_id) REFERENCES client_profiles(user_id);

-- Add direct FK from applications.client_id to users.id if not exists
-- (already exists from the initial migration)
