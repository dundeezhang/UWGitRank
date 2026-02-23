import { prisma } from "@/lib/prisma";
import type { LeaderboardEntry } from "./leaderboard-shared";

export type {
  TimeWindow,
  LeaderboardEntry,
  RankedEntry,
  Faculty,
} from "./leaderboard-shared";

export {
  getWindowScore,
  getWindowStats,
  TIME_WINDOW_LABELS,
  getFaculty,
} from "./leaderboard-shared";

/**
 * Fetch all rows from the `leaderboard` materialized view.
 * Prisma doesn't support materialized views natively, so we use $queryRaw.
 */
export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  return prisma.$queryRaw<LeaderboardEntry[]>`
    SELECT
      username, is_verified, program, stars,
      commits_all, prs_all, score_all,
      commits_7d, prs_7d, score_7d,
      commits_30d, prs_30d, score_30d,
      commits_1y, prs_1y, score_1y
    FROM public.leaderboard
  `;
}

/**
 * Refresh the `leaderboard` materialized view concurrently.
 */
export async function refreshLeaderboard(): Promise<void> {
  await prisma.$executeRaw`SELECT refresh_leaderboard()`;
}
