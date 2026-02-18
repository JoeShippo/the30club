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
  updatedAt: Date;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: Date;
  category: 'milestone' | 'streak' | 'variety' | 'social';
}

export interface WeeklyProgress {
  weekId: string;
  score: number;
  totalLogs: number;   // ← add this
  startDate: Date;
  endDate: Date;
}

export const ACHIEVEMENTS: Record<string, Omit<Achievement, 'unlockedAt'>> = {
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
    category: 'milestone',
  },
  REACHED_20: {
    id: 'reached_20',
    name: 'Plant Explorer',
    description: 'Reach 20 unique plants in a week',
    icon: '🍃',
    category: 'milestone',
  },
  REACHED_30: {
    id: 'reached_30',
    name: '30 Plants Champion!',
    description: 'Reach the goal of 30 unique plants in a week',
    icon: '🏆',
    category: 'milestone',
  },
  REACHED_40: {
    id: 'reached_40',
    name: 'Beyond Limits',
    description: 'Reach 40 unique plants in a week',
    icon: '⭐',
    category: 'milestone',
  },
  STREAK_3: {
    id: 'streak_3',
    name: 'Committed',
    description: 'Maintain a 3-week streak',
    icon: '🔥',
    category: 'streak',
  },
  STREAK_5: {
    id: 'streak_5',
    name: 'Dedicated',
    description: 'Maintain a 5-week streak',
    icon: '💪',
    category: 'streak',
  },
  STREAK_10: {
    id: 'streak_10',
    name: 'Unstoppable',
    description: 'Maintain a 10-week streak',
    icon: '🚀',
    category: 'streak',
  },
  ALL_CATEGORIES: {
    id: 'all_categories',
    name: 'Diverse Diet',
    description: 'Log plants from all 9 categories in one week',
    icon: '🌈',
    category: 'variety',
  },
  FIRST_LEAGUE: {
    id: 'first_league',
    name: 'Team Player',
    description: 'Join your first league',
    icon: '👥',
    category: 'social',
  },
  FIRST_CHALLENGE: {
    id: 'first_challenge',
    name: 'Competitor',
    description: 'Complete your first 1v1 challenge',
    icon: '⚔️',
    category: 'social',
  },
  CHALLENGE_WINNER: {
    id: 'challenge_winner',
    name: 'Victor',
    description: 'Win a 1v1 challenge',
    icon: '🥇',
    category: 'social',
  },
  TOTAL_100: {
    id: 'total_100',
    name: 'Century Club',
    description: 'Log 100 different plants all-time',
    icon: '💯',
    category: 'variety',
  },
};