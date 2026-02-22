export function calculateWaterlooScore(stats: {
  stars: number;
  prs: number;
  commits: number;
}) {
  const STAR_WEIGHT = 10;
  const PR_WEIGHT = 5;
  const COMMIT_WEIGHT = 1;

  return stats.stars * STAR_WEIGHT + stats.prs * PR_WEIGHT + stats.commits * COMMIT_WEIGHT;
}
