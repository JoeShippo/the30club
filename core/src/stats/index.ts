import type { WeeklySummary, AllTimeStats } from '../types/index.js';

import { getWeekId } from '../scoring/index.js';
import { subWeeks, parseISO } from 'date-fns';

/**
 * Calculate current streak (consecutive weeks with at least 1 plant)
 */
export function calculateStreak(weeklySummaries: WeeklySummary[]): {
  currentStreak: number;
  longestStreak: number;
} {
  if (weeklySummaries.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  // Sort by week ID descending (most recent first)
  const sorted = [...weeklySummaries]
    .filter(s => s.score > 0)
    .sort((a, b) => b.weekId.localeCompare(a.weekId));

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  // Calculate current streak from most recent week
  const currentWeekId = getWeekId(new Date());
  let expectedWeek = currentWeekId;

  for (const summary of sorted) {
    if (summary.weekId === expectedWeek) {
      currentStreak++;
      tempStreak++;
      
      // Move to previous week
      const weekDate = parseISO(expectedWeek + '-1');
      expectedWeek = getWeekId(subWeeks(weekDate, 1));
    } else {
      break;
    }
  }

  // Calculate longest streak
  tempStreak = 0;
  for (let i = 0; i < sorted.length; i++) {
    if (i === 0) {
      tempStreak = 1;
    } else {
      const currentDate = parseISO(sorted[i].weekId + '-1');
      const expectedPrevious = getWeekId(subWeeks(currentDate, -1));
      
      if (sorted[i - 1].weekId === expectedPrevious) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak);

  return { currentStreak, longestStreak };
}

/**
 * Check which achievements should be unlocked
 */
export function checkAchievements(
  userStats: any,
  weeklySummaries: WeeklySummary[],
  existingAchievements: string[]
): string[] {
  const newAchievements: string[] = [];

  // First plant
  if (!existingAchievements.includes('first_plant') && userStats.totalLogs > 0) {
    newAchievements.push('first_plant');
  }

  // Milestone achievements
  const bestScore = userStats.bestWeekScore;
  if (!existingAchievements.includes('reached_10') && bestScore >= 10) {
    newAchievements.push('reached_10');
  }
  if (!existingAchievements.includes('reached_20') && bestScore >= 20) {
    newAchievements.push('reached_20');
  }
  if (!existingAchievements.includes('reached_30') && bestScore >= 30) {
    newAchievements.push('reached_30');
  }
  if (!existingAchievements.includes('reached_40') && bestScore >= 40) {
    newAchievements.push('reached_40');
  }

  // Streak achievements
  const { currentStreak, longestStreak } = calculateStreak(weeklySummaries);
  const maxStreak = Math.max(currentStreak, longestStreak);
  
  if (!existingAchievements.includes('streak_3') && maxStreak >= 3) {
    newAchievements.push('streak_3');
  }
  if (!existingAchievements.includes('streak_5') && maxStreak >= 5) {
    newAchievements.push('streak_5');
  }
  if (!existingAchievements.includes('streak_10') && maxStreak >= 10) {
    newAchievements.push('streak_10');
  }

  // Total unique plants
  if (!existingAchievements.includes('total_100') && userStats.totalUniquePlants >= 100) {
    newAchievements.push('total_100');
  }

  return newAchievements;
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
 * Get streak count (consecutive weeks with at least 1 plant)
 */
