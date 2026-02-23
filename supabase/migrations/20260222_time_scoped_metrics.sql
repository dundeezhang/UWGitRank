-- Migration: Add time-scoped metrics and update leaderboard view
-- Run this in Supabase SQL Editor

-- 1. Add windowed metric columns to github_metrics
ALTER TABLE public.github_metrics
  ADD COLUMN IF NOT EXISTS commits_7d  INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS commits_30d INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS commits_1y  INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS prs_7d      INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS prs_30d     INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS prs_1y      INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS score_7d    DOUBLE PRECISION NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS score_30d   DOUBLE PRECISION NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS score_1y    DOUBLE PRECISION NOT NULL DEFAULT 0;

-- 2. Drop and recreate leaderboard materialized view with new columns
DROP MATERIALIZED VIEW IF EXISTS public.leaderboard;

CREATE MATERIALIZED VIEW public.leaderboard AS
SELECT
  p.github_username AS username,
  p.is_verified,
  p.program,
  m.stars,
  m.commits       AS commits_all,
  m.merged_prs    AS prs_all,
  m.rank_score    AS score_all,
  m.commits_7d,
  m.prs_7d,
  m.score_7d,
  m.commits_30d,
  m.prs_30d,
  m.score_30d,
  m.commits_1y,
  m.prs_1y,
  m.score_1y
FROM public.profiles p
JOIN public.github_metrics m ON p.id = m.user_id
WHERE p.is_verified = true;

-- 3. Index for faster lookups
CREATE UNIQUE INDEX IF NOT EXISTS leaderboard_username_idx ON public.leaderboard (username);

-- 4. Allow anonymous (unauthenticated) reads on the leaderboard
GRANT SELECT ON public.leaderboard TO anon;

-- 5. Function to refresh the materialized view (called by cron sync via supabase.rpc)
CREATE OR REPLACE FUNCTION public.refresh_leaderboard()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.leaderboard;
$$;
