import type { WeeklySummary, AllTimeStats } from '../types/index.js';
import { getWeekId } from '../scoring/index.js';
import { subWeeks } from 'date-fns';

/**
 * Calculate current and longest streak (consecutive weeks with at least 1 plant)
 */
export function calculateStreak(weeklySummaries: WeeklySummary[]): {
  currentStreak: number;
  longestStreak: number;
} {
  if (weeklySummaries.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  // Only count weeks with at least 1 plant, sort descending
  const sorted = [...weeklySummaries]
    .filter(s => s.score > 0)
    .sort((a, b) => b.weekId.localeCompare(a.weekId));

  if (sorted.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  // --- Current streak ---
  // Walk backwards from the current week, counting consecutive active weeks
  let currentStreak = 0;
  let expectedWeekId = getWeekId(new Date());

  for (const summary of sorted) {
    if (summary.weekId === expectedWeekId) {
      currentStreak++;
      // Step back one week using a date we know is in that week (Monday)
      const mondayOfExpected = getMondayOfWeek(expectedWeekId);
      expectedWeekId = getWeekId(subWeeks(mondayOfExpected, 1));
    } else if (summary.weekId < expectedWeekId) {
      // There's a gap - streak is broken
      break;
    }
  }

  // --- Longest streak ---
  let longestStreak = 0;
  let tempStreak = 1;

  // sorted is descending, so sorted[0] is most recent
  for (let i = 1; i < sorted.length; i++) {
    const prevMonday = getMondayOfWeek(sorted[i - 1].weekId);
    const expectedPrevWeekId = getWeekId(subWeeks(prevMonday, 1));

    if (sorted[i].weekId === expectedPrevWeekId) {
      tempStreak++;
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak);

  return { currentStreak, longestStreak };
}

/**
 * Get the Monday Date object for a given weekId (e.g. "2026-W05")
 */
function getMondayOfWeek(weekId: string): Date {
  const [yearStr, weekStr] = weekId.split('-W');
  const year = parseInt(yearStr);
  const week = parseInt(weekStr);

  // Jan 4 is always in ISO week 1
  const jan4 = new Date(year, 0, 4);
  // Find the Monday of week 1
  const dayOfWeek = jan4.getDay() || 7; // Convert Sunday (0) to 7
  const monday = new Date(jan4);
  monday.setDate(jan4.getDate() - dayOfWeek + 1);

  // Add (week - 1) * 7 days to get to the right week's Monday
  monday.setDate(monday.getDate() + (week - 1) * 7);

  return monday;
}

/**
 * Calculate all-time stats from weekly summaries
 */
export function calculateAllTimeStats(
  userId: string,
  weeklySummaries: WeeklySummary[]
): AllTimeStats {
  const allUniquePlants = new Set<string>();
  let totalLogs = 0;
  let bestWeekScore = 0;
  let bestWeekId: string | null = null;

  weeklySummaries.forEach((summary) => {
    summary.uniquePlantIds.forEach((plantId) => allUniquePlants.add(plantId));
    totalLogs += summary.totalLogs;

    if (summary.score > bestWeekScore) {
      bestWeekScore = summary.score;
      bestWeekId = summary.weekId;
    }
  });

  const totalScores = weeklySummaries.reduce((sum, s) => sum + s.score, 0);
  const averageWeeklyScore =
    weeklySummaries.length > 0 ? totalScores / weeklySummaries.length : 0;

  return {
    userId,
    totalUniquePlants: allUniquePlants.size,
    totalLogs,
    weeksActive: weeklySummaries.length,
    bestWeekScore,
    bestWeekId,
    averageWeeklyScore: Math.round(averageWeeklyScore * 10) / 10,
    updatedAt: new Date(),
  };
}

/**
 * Check which achievements should be unlocked based on current stats
 */
export function checkAchievements(
  userStats: {
    totalLogs: number;
    totalUniquePlants: number;
    bestWeekScore: number;
  },
  weeklySummaries: WeeklySummary[],
  existingAchievements: string[]
): string[] {
  const newAchievements: string[] = [];

  const add = (id: string) => {
    if (!existingAchievements.includes(id)) {
      newAchievements.push(id);
    }
  };

  // First plant logged
  if (userStats.totalLogs > 0) add('first_plant');

  // Weekly score milestones
  if (userStats.bestWeekScore >= 10) add('reached_10');
  if (userStats.bestWeekScore >= 20) add('reached_20');
  if (userStats.bestWeekScore >= 30) add('reached_30');
  if (userStats.bestWeekScore >= 40) add('reached_40');

  // Streak milestones
  const { currentStreak, longestStreak } = calculateStreak(weeklySummaries);
  const maxStreak = Math.max(currentStreak, longestStreak);
  if (maxStreak >= 3) add('streak_3');
  if (maxStreak >= 5) add('streak_5');
  if (maxStreak >= 10) add('streak_10');

  // All-time unique plants
  if (userStats.totalUniquePlants >= 100) add('total_100');

  return newAchievements;
}