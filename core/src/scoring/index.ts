import { startOfISOWeek, endOfISOWeek, getISOWeek, getISOWeekYear } from 'date-fns';
import type { PlantLog, WeeklySummary } from '../types/index.js';

/**
 * Get ISO week ID from date (e.g., "2026-W05")
 */
export function getWeekId(date: Date): string {
  const year = getISOWeekYear(date);
  const week = getISOWeek(date);
  return `${year}-W${week.toString().padStart(2, '0')}`;
}

/**
 * Get start and end dates for a week ID
 */
export function getWeekDates(weekId: string): {
  startDate: Date;
  endDate: Date;
} {
  const [yearStr, weekStr] = weekId.split('-W');
  const year = parseInt(yearStr);
  const week = parseInt(weekStr);
  
  // Create a date in the middle of the year, then find the start of that ISO week
  const jan4 = new Date(year, 0, 4); // Jan 4 is always in week 1
  const weekStart = startOfISOWeek(jan4);
  
  // Add the number of weeks
  weekStart.setDate(weekStart.getDate() + (week - 1) * 7);
  
  return {
    startDate: startOfISOWeek(weekStart),
    endDate: endOfISOWeek(weekStart),
  };
}

/**
 * Calculate weekly score from plant logs
 */
export function calculateWeeklyScore(logs: PlantLog[]): number {
  const uniquePlants = new Set(logs.map((log) => log.plantId));
  return uniquePlants.size;
}

/**
 * Generate weekly summary from logs
 */
export function generateWeeklySummary(
  userId: string,
  weekId: string,
  logs: PlantLog[]
): WeeklySummary {
  const { startDate, endDate } = getWeekDates(weekId);
  const uniquePlantIds = Array.from(new Set(logs.map((log) => log.plantId)));

  return {
    id: `${userId}_${weekId}`,
    userId,
    weekId,
    uniquePlantIds,
    score: uniquePlantIds.length,
    totalLogs: logs.length,
    startDate,
    endDate,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Check if a plant has been logged this week
 */
export function isPlantLoggedThisWeek(
  plantId: string,
  logs: PlantLog[],
  weekId: string
): boolean {
  return logs.some((log) => log.plantId === plantId && log.weekId === weekId);
}

/**
 * Get progress percentage (capped at 100%)
 */
export function getProgressPercentage(score: number, target: number = 30): number {
  return Math.min(Math.round((score / target) * 100), 100);
}