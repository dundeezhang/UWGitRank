import { createClient } from "@/utils/supabase/server";
import { Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { signOut } from "@/app/auth/actions";
import { LeaderboardTable } from "./leaderboard-table";
import type { LeaderboardEntry } from "@/lib/leaderboard";
import { Github } from "lucide-react";

export default async function LeaderboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("leaderboard")
    .select(
      "username, is_verified, program, stars, commits_all, prs_all, score_all, commits_7d, prs_7d, score_7d, commits_30d, prs_30d, score_30d, commits_1y, prs_1y, score_1y"
    );

  const entries: LeaderboardEntry[] = (data ?? []).map((row) => ({
    username: row.username as string,
    is_verified: row.is_verified as boolean,
    program: row.program as string | null,
    stars: (row.stars as number) ?? 0,
    commits_all: (row.commits_all as number) ?? 0,
    prs_all: (row.prs_all as number) ?? 0,
    score_all: (row.score_all as number) ?? 0,
    commits_7d: (row.commits_7d as number) ?? 0,
    prs_7d: (row.prs_7d as number) ?? 0,
    score_7d: (row.score_7d as number) ?? 0,
    commits_30d: (row.commits_30d as number) ?? 0,
    prs_30d: (row.prs_30d as number) ?? 0,
    score_30d: (row.score_30d as number) ?? 0,
    commits_1y: (row.commits_1y as number) ?? 0,
    prs_1y: (row.prs_1y as number) ?? 0,
    score_1y: (row.score_1y as number) ?? 0,
  }));

  // Track this user as a viewer if they're authenticated but not on the leaderboard
  if (user) {
    const githubUsername = user.user_metadata?.user_name as string | undefined;
    const isOnLeaderboard = githubUsername
      ? entries.some((e) => e.username === githubUsername)
      : false;

    if (githubUsername && !isOnLeaderboard) {
      const now = new Date().toISOString();
      const { error: insertError } = await supabase
        .from("leaderboard_viewers")
        .insert({
          github_username: githubUsername,
          avatar_url: user.user_metadata?.avatar_url ?? null,
          first_seen_at: now,
          last_seen_at: now,
        });

      if (insertError?.code === "23505") {
        await supabase
          .from("leaderboard_viewers")
          .update({
            last_seen_at: now,
            avatar_url: user.user_metadata?.avatar_url ?? null,
          })
          .eq("github_username", githubUsername);
      }
    }
  }

  const isVerified = user
    ? (
        await supabase
          .from("profiles")
          .select("is_verified")
          .eq("id", user.id)
          .single()
      ).data?.is_verified ?? false
    : false;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-zinc-800 bg-card/50 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="font-bold text-xl tracking-tight flex items-center gap-2.5"
          >
            <div className="w-9 h-9 bg-black rounded-full flex items-center justify-center">
              <Github className="w-5 h-5 text-[#EAB308]" />
            </div>
            <span>GitRank</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link href="/about">
              <Button size="sm" variant="ghost" className="text-zinc-600">
                How Rankings Work
              </Button>
            </Link>
            {user && !isVerified && (
              <Link href="/verify">
                <Button size="sm" className="bg-[#EAB308] text-black hover:bg-[#D9A307] flex items-center gap-2">
                  Join Rankings
                </Button>
              </Link>
            )}
            {user && (
              <form action={signOut}>
                <button className="text-xs text-zinc-400 hover:text-zinc-900 underline underline-offset-4 transition-colors">
                  Sign out
                </button>
              </form>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-10 space-y-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Trophy className="w-7 h-7 text-[#EAB308]" />
            Rankings
          </h1>
          <p className="text-muted-foreground text-sm">
            Waterloo student GitHub rankings · scored by stars, PRs &amp; commits
          </p>
        </div>

        <LeaderboardTable data={entries} />
      </main>
    </div>
  );
}
