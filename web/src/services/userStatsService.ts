import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  arrayUnion,
  collection,
  query,
  where,
  getDocs,
  orderBy,
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import { COLLECTIONS } from '@/firebase/collections';
import { UserStats, Achievement, ACHIEVEMENTS, WeeklySummary, WeeklyProgress } from '@30plants/core';
import { calculateStreak, checkAchievements } from '@30plants/core';

export async function getUserStats(userId: string): Promise<UserStats | null> {
  const docRef = doc(db, COLLECTIONS.ALL_TIME_STATS, userId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) return null;

  const data = docSnap.data();
  return {
    ...data,
    updatedAt: data.updatedAt?.toDate() || new Date(),
    achievements: data.achievements || [],
  } as UserStats;
}

export async function updateUserStats(userId: string): Promise<UserStats> {
  //console.log('updateUserStats called for:', userId);


  // Get all weekly summaries
  const q = query(
    collection(db, COLLECTIONS.WEEKLY_SUMMARIES),
    where('userId', '==', userId),
  );

  const querySnapshot = await getDocs(q);
    //console.log('weeklySummaries found:', querySnapshot.docs.length);
  //console.log('docs:', querySnapshot.docs.map(d => d.data()));
  const weeklySummaries: WeeklySummary[] = querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      ...data,
      startDate: data.startDate?.toDate() || new Date(),
      endDate: data.endDate?.toDate() || new Date(),
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as WeeklySummary;
  });

  // Calculate stats
  const allUniquePlants = new Set<string>();
  let totalLogs = 0;
  let bestWeekScore = 0;
  let bestWeekId: string | null = null;

  weeklySummaries.forEach(summary => {
    summary.uniquePlantIds.forEach(id => allUniquePlants.add(id));
    totalLogs += summary.totalLogs;
    if (summary.score > bestWeekScore) {
      bestWeekScore = summary.score;
      bestWeekId = summary.weekId;
    }
  });

  const { currentStreak, longestStreak } = calculateStreak(weeklySummaries);
  
  const totalScores = weeklySummaries.reduce((sum, s) => sum + s.score, 0);
  const averageWeeklyScore = weeklySummaries.length > 0 
    ? Math.round((totalScores / weeklySummaries.length) * 10) / 10 
    : 0;

  // Get existing achievements
  const existing = await getUserStats(userId);
  const existingAchievementIds = existing?.achievements.map(a => a.id) || [];

  // Check for new achievements
  const newAchievementIds = checkAchievements(
    {
      totalLogs,
      totalUniquePlants: allUniquePlants.size,
      bestWeekScore,
    },
    weeklySummaries,
    existingAchievementIds
  );

  // Convert to Achievement objects
  const newAchievements: Achievement[] = newAchievementIds.map(id => ({
    ...ACHIEVEMENTS[id.toUpperCase()],
    unlockedAt: new Date(),
  }));

  const stats: UserStats = {
    userId,
    currentStreak,
    longestStreak,
    totalWeeksActive: weeklySummaries.length,
    totalUniquePlants: allUniquePlants.size,
    totalLogs,
    bestWeekScore,
    bestWeekId,
    averageWeeklyScore,
    achievements: [...(existing?.achievements || []), ...newAchievements],
    updatedAt: new Date(),
  };

  // Save to Firestore
  const docRef = doc(db, COLLECTIONS.ALL_TIME_STATS, userId);
  await setDoc(docRef, {
    ...stats,
    updatedAt: serverTimestamp(),
  }, { merge: true });

  return stats;
}

export async function unlockAchievement(userId: string, achievementId: string): Promise<void> {
  const achievement = ACHIEVEMENTS[achievementId.toUpperCase()];
  if (!achievement) return;

  const docRef = doc(db, COLLECTIONS.ALL_TIME_STATS, userId);
  await updateDoc(docRef, {
    achievements: arrayUnion({
      ...achievement,
      unlockedAt: new Date(),
    }),
    updatedAt: serverTimestamp(),
  });
}

export async function getWeeklyProgressHistory(
  userId: string,
  weeks: number = 12
): Promise<WeeklyProgress[]> {
  const q = query(
    collection(db, COLLECTIONS.WEEKLY_SUMMARIES),
    where('userId', '==', userId),
    orderBy('weekId', 'desc')
  );

  const querySnapshot = await getDocs(q);
  const progress: WeeklyProgress[] = querySnapshot.docs.slice(0, weeks).map(doc => {
  const data = doc.data();
  return {
    weekId: data.weekId,
    score: data.score,
    totalLogs: data.totalLogs ?? 0,   // ← add this
    startDate: data.startDate?.toDate() || new Date(),
    endDate: data.endDate?.toDate() || new Date(),
  };
});

  return progress.reverse(); // Oldest first for chart
}