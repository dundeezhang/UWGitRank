import { createClient } from "@supabase/supabase-js";
import { fetchGitHubData } from "@/lib/github";
import { calculateWaterlooScore } from "@/utils/ranking";
import { NextResponse } from "next/server";

// Use service role to bypass RLS — this route should be called
// by a cron job (Vercel Cron, GitHub Actions, or Inngest), not by users.
function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  return createClient(url, serviceKey);
}

export async function GET(request: Request) {
  // Protect with a shared secret so only your cron can call this
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getAdminClient();

  // 1. Get all verified users
  const { data: users, error: usersError } = await supabase
    .from("profiles")
    .select("id, github_username")
    .eq("is_verified", true);

  if (usersError) {
    return NextResponse.json({ error: usersError.message }, { status: 500 });
  }

  if (!users || users.length === 0) {
    return NextResponse.json({ message: "No verified users to sync", synced: 0 });
  }

  const CHUNK_SIZE = 50;
  const results: { username: string; status: string }[] = [];

  // 2. Process users in parallel chunks to avoid Vercel timeouts
  for (let i = 0; i < users.length; i += CHUNK_SIZE) {
    const chunk = users.slice(i, i + CHUNK_SIZE);

    const chunkResults = await Promise.allSettled(
      chunk.map(async (user) => {
        const data = await fetchGitHubData(user.github_username);

        const scoreAll = calculateWaterlooScore({
          stars: data.stars,
          prs: data.mergedPRsAll,
          commits: data.commitsAll,
        });
        const score7d = calculateWaterlooScore({
          stars: data.stars,
          prs: data.prs7d,
          commits: data.commits7d,
        });
        const score30d = calculateWaterlooScore({
          stars: data.stars,
          prs: data.prs30d,
          commits: data.commits30d,
        });
        const score1y = calculateWaterlooScore({
          stars: data.stars,
          prs: data.prs1y,
          commits: data.commits1y,
        });

        const { error: upsertError } = await supabase
          .from("github_metrics")
          .upsert(
            {
              user_id: user.id,
              stars: data.stars,
              commits: data.commitsAll,
              merged_prs: data.mergedPRsAll,
              rank_score: scoreAll,
              commits_7d: data.commits7d,
              commits_30d: data.commits30d,
              commits_1y: data.commits1y,
              prs_7d: data.prs7d,
              prs_30d: data.prs30d,
              prs_1y: data.prs1y,
              score_7d: score7d,
              score_30d: score30d,
              score_1y: score1y,
              last_synced: new Date().toISOString(),
            },
            { onConflict: "user_id" }
          );

        if (upsertError) throw new Error(`db error: ${upsertError.message}`);
        return user.github_username;
      })
    );

    for (let j = 0; j < chunkResults.length; j++) {
      const result = chunkResults[j];
      const username = chunk[j].github_username;
      if (result.status === "fulfilled") {
        results.push({ username, status: "ok" });
      } else {
        results.push({ username, status: result.reason?.message ?? "unknown error" });
      }
    }
  }

  const synced = results.filter((r) => r.status === "ok").length;

  // Refresh the materialized view so the leaderboard reflects updated scores
  const { error: refreshError } = await supabase.rpc("refresh_leaderboard");
  if (refreshError) {
    console.warn("Failed to refresh leaderboard materialized view:", refreshError.message);
  }

  return NextResponse.json({ synced, total: users.length, results });
}
