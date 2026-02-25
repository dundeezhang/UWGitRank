-- Add battle token columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS last_battle_token VARCHAR(255),
ADD COLUMN IF NOT EXISTS last_battle_token_used_at TIMESTAMPTZ;
