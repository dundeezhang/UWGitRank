import { fetchGitHubData } from "@/lib/github";
import { prisma } from "@/lib/prisma";
import { refreshLeaderboard } from "@/lib/leaderboard";
import { calculateWaterlooScore } from "@/utils/ranking";

/**
 * Fetch GitHub data for a single user, upsert their metrics,
 * and refresh the leaderboard materialized view.
 * Used for immediate sync after verification so users appear
 * on the leaderboard right away.
 */
export async function syncSingleUser(userId: string, githubUsername: string): Promise<void> {
  const data = await fetchGitHubData(githubUsername);

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

  const metricsData = {
    stars: data.stars,
    commits: data.commitsAll,
    mergedPrs: data.mergedPRsAll,
    rankScore: scoreAll,
    commits7d: data.commits7d,
    commits30d: data.commits30d,
    commits1y: data.commits1y,
    prs7d: data.prs7d,
    prs30d: data.prs30d,
    prs1y: data.prs1y,
    score7d,
    score30d,
    score1y,
    lastSynced: new Date(),
  };

  await prisma.githubMetrics.upsert({
    where: { userId },
    create: { userId, ...metricsData },
    update: metricsData,
  });

  await refreshLeaderboard();
}
