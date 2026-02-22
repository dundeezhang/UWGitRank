-- leaderboard_viewers
-- Tracks GitHub-authenticated users who view the rankings but are not
-- verified Waterloo contributors (i.e. not on the leaderboard).
--
-- Run this in the Supabase SQL Editor:
--   https://supabase.com/dashboard/project/<your-project-id>/sql

CREATE TABLE IF NOT EXISTS public.leaderboard_viewers (
  github_username  TEXT PRIMARY KEY,
  avatar_url       TEXT,
  first_seen_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Allow the server (anon key) to INSERT and UPDATE rows.
-- SELECT is intentionally restricted to service-role only (admin use).
ALTER TABLE public.leaderboard_viewers ENABLE ROW LEVEL SECURITY;

-- Anon/authenticated users can insert their own row
CREATE POLICY "Allow insert for authenticated users"
  ON public.leaderboard_viewers
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Anon/authenticated users can update their own row
CREATE POLICY "Allow update own row"
  ON public.leaderboard_viewers
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
