-- Add signup form fields to profiles (first_name, last_name, linkedin_url).
-- Run this if your profiles table was created before these columns existed.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS first_name TEXT,
  ADD COLUMN IF NOT EXISTS last_name TEXT,
  ADD COLUMN IF NOT EXISTS linkedin_url TEXT;
