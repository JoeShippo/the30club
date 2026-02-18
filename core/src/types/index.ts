export interface User {
  id: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  avatarId?: string | null;
  onboardingComplete?: boolean;
  hasPro?: boolean;          
  proUnlockedAt?: Date | null; 
  createdAt: Date;
  updatedAt: Date;
}

export interface Plant {
  id: string;
  name: string;
  category: PlantCategory;
  aliases?: string[];
  isCommon: boolean;
}

export enum PlantCategory {
  VEGETABLE = 'vegetable',
  FRUIT = 'fruit',
  GRAIN = 'grain',
  LEGUME = 'legume',
  NUT_SEED = 'nut_seed',
  HERB_SPICE = 'herb_spice',
  MUSHROOM = 'mushroom',
  SEAWEED = 'seaweed',
  PLANT_PRODUCT = 'plant_product',
  OTHER = 'other'
}

export interface PlantLog {
  id: string;
  userId: string;
  plantId: string;
  plantName: string;
  loggedAt: Date;
  weekId: string; // Format: "2026-W05"
  createdAt: Date;
}

export interface WeeklySummary {
  id: string; // Format: "userId_2026-W05"
  userId: string;
  weekId: string; // Format: "2026-W05"
  uniquePlantIds: string[];
  score: number; // Number of unique plants
  totalLogs: number;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface LeaderboardEntry {
  userId: string;
  displayName: string | null;
  photoURL: string | null;
  score: number;
  weekId: string;
  rank?: number;
}

export interface AllTimeStats {
  userId: string;
  totalUniquePlants: number;
  totalLogs: number;
  weeksActive: number;
  bestWeekScore: number;
  bestWeekId: string | null;
  averageWeeklyScore: number;
  updatedAt: Date;
}

export interface League {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  memberIds: string[];
  inviteCode: string;
  isPrivate: boolean;
}

export interface LeagueMembership {
  id: string; // Format: "leagueId_userId"
  leagueId: string;
  userId: string;
  joinedAt: Date;
  role: 'owner' | 'admin' | 'member';
}

export interface Challenge {
  id: string;
  challengerId: string;
  challengerName: string;
  challengerPhoto: string | null;
  opponentId: string;
  opponentName: string;
  opponentPhoto: string | null;
  weekId: string;
  status: ChallengeStatus;
  challengerScore: number;
  opponentScore: number;
  winnerId: string | null;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
}

export enum ChallengeStatus {
  PENDING = 'pending',
  ACTIVE = 'active', // ← Keep as ACTIVE and update DB values
  DECLINED = 'declined',
  COMPLETED = 'completed',
}

export interface LeagueLeaderboardEntry extends LeaderboardEntry {
  leagueId: string;
}

export interface UserStats {
  userId: string;
  currentStreak: number;
  longestStreak: number;
  totalWeeksActive: number;
  totalUniquePlants: number;
  totalLogs: number;
  bestWeekScore: number;
  bestWeekId: string | null;
  averageWeeklyScore: number;
  achievements: Achievement[];
    categoriesExplored: Set<string>; // ← Add this
  challengeWins: number; // ← Add this
    referralCount: number; // ← Add this
  referredBy: string | null; // ← Add this (userId of referrer)
  updatedAt: Date;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'milestone' | 'weekly' | 'streak' | 'variety' | 'social' | 'exploration';
  unlockedAt?: Date; // ← Make this optional
}

export interface WeeklyProgress {
  weekId: string;
  score: number;
  totalLogs: number;   // ← add this
  startDate: Date;
  endDate: Date;
}

export const ACHIEVEMENTS: Record<string, Achievement> = {
  FIRST_PLANT: {
    id: 'first_plant',
    name: 'First Steps',
    description: 'Log your first plant',
    icon: '🌱',
    category: 'milestone',
  },
  REACHED_10: {
    id: 'reached_10',
    name: 'Gaining Momentum',
    description: 'Reach 10 unique plants in a week',
    icon: '🌿',
    category: 'weekly',
  },
  REACHED_20: {
    id: 'reached_20',
    name: 'Plant Explorer',
    description: 'Reach 20 unique plants in a week',
    icon: '🍃',
    category: 'weekly',
  },
  REACHED_30: {
    id: 'reached_30',
    name: '30 Plants Champion!',
    description: 'Reach the goal of 30 unique plants in a week',
    icon: '🏆',
    category: 'weekly',
  },
  REACHED_40: {
    id: 'reached_40',
    name: 'Plant Master',
    description: 'Exceed 40 unique plants in a week',
    icon: '👑',
    category: 'weekly',
  },
  
  // Streak achievements - ADD THESE
  WEEK_STREAK_2: {
    id: 'week_streak_2',
    name: 'Getting Started',
    description: 'Maintain a 2-week streak',
    icon: '🔥',
    category: 'streak',
  },
  WEEK_STREAK_4: {
    id: 'week_streak_4',
    name: 'Committed',
    description: 'Maintain a 4-week streak',
    icon: '💪',
    category: 'streak',
  },
  WEEK_STREAK_8: {
    id: 'week_streak_8',
    name: 'Dedicated',
    description: 'Maintain an 8-week streak',
    icon: '🔥',
    category: 'streak',
  },
  WEEK_STREAK_12: {
    id: 'week_streak_12',
    name: 'Unstoppable',
    description: 'Maintain a 12-week streak',
    icon: '⚡',
    category: 'streak',
  },

  // Category exploration
  TRY_5_CATEGORIES: {
    id: 'try_5_categories',
    name: 'Category Explorer',
    description: 'Try plants from 5 different categories',
    icon: '🗺️',
    category: 'exploration',
  },
  TRY_10_CATEGORIES: {
    id: 'try_10_categories',
    name: 'Diversity Master',
    description: 'Try plants from all 10 categories',
    icon: '🌈',
    category: 'exploration',
  },

  // Challenge achievements
  FIRST_CHALLENGE_WIN: {
    id: 'first_challenge_win',
    name: 'First Victory',
    description: 'Win your first challenge',
    icon: '🏆',
    category: 'social',
  },
  WIN_5_CHALLENGES: {
    id: 'win_5_challenges',
    name: 'Challenge Champion',
    description: 'Win 5 challenges',
    icon: '🥇',
    category: 'social',
  },
  WIN_10_CHALLENGES: {
    id: 'win_10_challenges',
    name: 'Undefeated',
    description: 'Win 10 challenges',
    icon: '👑',
    category: 'social',
  },

  // All-time achievements
  TOTAL_100: {
    id: 'total_100',
    name: 'Century Club',
    description: 'Log 100 unique plants all-time',
    icon: '💯',
    category: 'milestone',
  },
  FIRST_REFERRAL: {
  id: 'first_referral',
  name: 'Spread the Word',
  description: 'Refer your first friend',
  icon: '🤝',
  category: 'social',
},
REFER_5_FRIENDS: {
  id: 'refer_5_friends',
  name: 'Community Builder',
  description: 'Refer 5 friends',
  icon: '👥',
  category: 'social',
},
REFER_10_FRIENDS: {
  id: 'refer_10_friends',
  name: 'Ambassador',
  description: 'Refer 10 friends',
  icon: '🌟',
  category: 'social',
},
};