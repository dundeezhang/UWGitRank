import { ENDORSEMENT_WEIGHT, ELO_WEIGHT, ELO_BASELINE } from "@/utils/ranking";

export type TimeWindow = "7d" | "30d" | "1y" | "all";

export interface LeaderboardEntry {
  username: string;
  firstName: string | null;
  lastName: string | null;
  linkedinUrl: string | null;
  is_verified: boolean;
  program: string | null;
  stars: number;
  commits_all: number;
  prs_all: number;
  score_all: number;
  commits_7d: number;
  prs_7d: number;
  score_7d: number;
  commits_30d: number;
  prs_30d: number;
  score_30d: number;
  commits_1y: number;
  prs_1y: number;
  score_1y: number;
  endorsement_count: number;
  elo_rating: number;
}

export interface RankedEntry extends LeaderboardEntry {
  rank: number;
}

function getEloBonus(entry: LeaderboardEntry): number {
  const elo = Number(entry.elo_rating) || ELO_BASELINE;
  return Math.round((elo - ELO_BASELINE) * ELO_WEIGHT);
}

export function getWindowScore(
  entry: LeaderboardEntry,
  window: TimeWindow,
): number {
  const endorsements = Number(entry.endorsement_count) || 0;
  const endorsementBonus = endorsements * ENDORSEMENT_WEIGHT;
  const eloBonus = getEloBonus(entry);
  let raw: number;
  switch (window) {
    case "7d":
      raw = entry.score_7d + endorsementBonus + eloBonus;
      break;
    case "30d":
      raw = entry.score_30d + endorsementBonus + eloBonus;
      break;
    case "1y":
      raw = entry.score_1y + endorsementBonus + eloBonus;
      break;
    case "all":
      raw = entry.score_all + endorsementBonus + eloBonus;
      break;
  }
  return Math.max(0, raw);
}

export function getWindowStats(entry: LeaderboardEntry, window: TimeWindow) {
  const endorsements = Number(entry.endorsement_count) || 0;
  const endorsementBonus = endorsements * ENDORSEMENT_WEIGHT;
  const eloBonus = getEloBonus(entry);
  let rawScore: number;
  let stats: {
    commits: number;
    prs: number;
    endorsements: number;
    eloBonus: number;
    score: number;
  };
  switch (window) {
    case "7d":
      rawScore = entry.score_7d + endorsementBonus + eloBonus;
      stats = {
        commits: entry.commits_7d,
        prs: entry.prs_7d,
        endorsements,
        eloBonus,
        score: Math.max(0, rawScore),
      };
      break;
    case "30d":
      rawScore = entry.score_30d + endorsementBonus + eloBonus;
      stats = {
        commits: entry.commits_30d,
        prs: entry.prs_30d,
        endorsements,
        eloBonus,
        score: Math.max(0, rawScore),
      };
      break;
    case "1y":
      rawScore = entry.score_1y + endorsementBonus + eloBonus;
      stats = {
        commits: entry.commits_1y,
        prs: entry.prs_1y,
        endorsements,
        eloBonus,
        score: Math.max(0, rawScore),
      };
      break;
    case "all":
      rawScore = entry.score_all + endorsementBonus + eloBonus;
      stats = {
        commits: entry.commits_all,
        prs: entry.prs_all,
        endorsements,
        eloBonus,
        score: Math.max(0, rawScore),
      };
      break;
  }
  return stats;
}

export const TIME_WINDOW_LABELS: Record<TimeWindow, string> = {
  "7d": "7 days",
  "30d": "30 days",
  "1y": "1 year",
  all: "All time",
};

export type Faculty =
  | "Engineering"
  | "Math"
  | "Other";

  const FACULTY_MAP: Record<string, Faculty> = {
    // Faculty of Engineering
    "Software Engineering": "Engineering",
    "Computer Engineering": "Engineering",
    "Electrical Engineering": "Engineering",
    "Mechatronics Engineering": "Engineering",
    "Systems Design Engineering": "Engineering",
    "Management Engineering": "Engineering",
    "Biomedical Engineering": "Engineering",
    "Chemical Engineering": "Engineering",
    "Civil Engineering": "Engineering",
    "Environmental Engineering": "Engineering",
    "Geological Engineering": "Engineering",
    "Mechanical Engineering": "Engineering",
    "Nanotechnology Engineering": "Engineering",
    "Architectural Engineering": "Engineering",
  
    // Faculty of Mathematics (Filtered)
    "Computer Science": "Math",
    "Mathematics": "Math",
    "Computing and Financial Management": "Math",

    // Other
    "Other": "Other",
  };

/** Ordered list of program names for signup dropdown (Other last). */
export const PROGRAM_OPTIONS = Object.keys(FACULTY_MAP)
  .filter((p) => p !== 'Other')
  .sort()
  .concat('Other');

export function getFaculty(program: string | null): Faculty | null {
  if (!program) return null;
  if (FACULTY_MAP[program]) return FACULTY_MAP[program];
  const lower = program.toLowerCase();
  if (lower.includes("engineering")) return "Engineering";
  return "Other";
}
