export interface LevelInfo {
  level: number;
  name: string;
  emoji: string;
  minXP: number;
  maxXP: number; // Infinity for last level
}

export const LEVELS: LevelInfo[] = [
  { level: 1, name: "Filhote",  emoji: "🐾", minXP: 0,    maxXP: 199  },
  { level: 2, name: "Jovem",    emoji: "🌟", minXP: 200,  maxXP: 499  },
  { level: 3, name: "Adulto",   emoji: "🦴", minXP: 500,  maxXP: 1199 },
  { level: 4, name: "Alpha",    emoji: "👑", minXP: 1200, maxXP: 2999 },
  { level: 5, name: "Lenda",    emoji: "🏆", minXP: 3000, maxXP: Infinity },
];

export const XP_REWARDS = {
  post:    50,
  like:    5,
  comment: 10,
  match:   100,
  quiz_easy:   15,
  quiz_medium: 25,
  quiz_hard:   40,
  challenge:   150,
} as const;

export function getLevelInfo(xp: number): LevelInfo {
  return [...LEVELS].reverse().find((l) => xp >= l.minXP) ?? LEVELS[0];
}

export function getLevelProgress(xp: number): number {
  const info = getLevelInfo(xp);
  if (info.maxXP === Infinity) return 100;
  const range = info.maxXP - info.minXP + 1;
  return Math.min(100, Math.round(((xp - info.minXP) / range) * 100));
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  emoji: string;
  xp_reward: number;
  category: "social" | "post" | "level" | "quiz" | "challenge";
}

export interface ProfileAchievement {
  achievement_id: string;
  earned_at: string;
}

export interface RankingEntry {
  profile_id: string;
  dog_name: string;
  username: string;
  breed: string | null;
  avatar_url: string | null;
  is_verified: boolean;
  week_likes: number;
}

export interface DogOfDay extends Omit<RankingEntry, "week_likes"> {
  today_likes: number;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  emoji: string;
  xp_reward: number;
  week_start: string;
  week_end: string;
}

export interface ChallengeEntry {
  id: string;
  challenge_id: string;
  profile_id: string;
  post_id: string | null;
  xp_awarded: boolean;
  created_at: string;
}

export interface QuizQuestion {
  dogProfileId: string;
  imageUrl: string;
  correctBreed: string;
  options: string[]; // 4 shuffled options
}
