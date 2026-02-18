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
import { getPlantById } from '@30plants/core';


export async function getUserStats(userId: string): Promise<UserStats | null> {
  const docRef = doc(db, COLLECTIONS.ALL_TIME_STATS, userId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) return null;

  const data = docSnap.data();
  
    return {
    userId: data.userId,
    currentStreak: data.currentStreak || 0,
    longestStreak: data.longestStreak || 0,
    totalWeeksActive: data.totalWeeksActive || 0,
    totalUniquePlants: data.totalUniquePlants || 0,
    totalLogs: data.totalLogs || 0,
    bestWeekScore: data.bestWeekScore || 0,
    bestWeekId: data.bestWeekId || null,
    averageWeeklyScore: data.averageWeeklyScore || 0,
    categoriesExplored: new Set(data.categoriesExplored || []),
    challengeWins: data.challengeWins || 0,
    referralCount: data.referralCount || 0, // ← Add this
    referredBy: data.referredBy || null, // ← Add this
    achievements: data.achievements?.map((a: any) => ({
      ...a,
      unlockedAt: a.unlockedAt?.toDate?.() || new Date(a.unlockedAt),
    })) || [],
    updatedAt: data.updatedAt?.toDate?.() || new Date(),
  } as UserStats;

}

export async function updateUserStats(userId: string): Promise<UserStats> {
  // Get all weekly summaries
  const summariesQuery = query(
    collection(db, COLLECTIONS.WEEKLY_SUMMARIES),
    where('userId', '==', userId),
  );

    const referralsQuery = query(
    collection(db, COLLECTIONS.ALL_TIME_STATS),
    where('referredBy', '==', userId)
  );
  const referralsSnapshot = await getDocs(referralsQuery);
  const referralCount = referralsSnapshot.size;

  const summariesSnapshot = await getDocs(summariesQuery);
  const weeklySummaries: WeeklySummary[] = summariesSnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      ...data,
      startDate: data.startDate?.toDate() || new Date(),
      endDate: data.endDate?.toDate() || new Date(),
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as WeeklySummary;
  });

  // Get all plant logs to track categories (NEW)
  const logsQuery = query(
    collection(db, COLLECTIONS.PLANT_LOGS),
    where('userId', '==', userId)
  );
  const logsSnapshot = await getDocs(logsQuery);
  const categoriesExplored = new Set<string>();
  
  logsSnapshot.docs.forEach(doc => {
    const log = doc.data();
    const plant = getPlantById(log.plantId);
    if (plant) {
      categoriesExplored.add(plant.category);
    }
  });

// Get challenge wins - Query by challengerId and opponentId instead of winnerId
const challengesAsChallenger = query(
  collection(db, COLLECTIONS.CHALLENGES),
  where('challengerId', '==', userId),
  where('status', '==', 'completed')
);

const challengesAsOpponent = query(
  collection(db, COLLECTIONS.CHALLENGES),
  where('opponentId', '==', userId),
  where('status', '==', 'completed')
);

const [challengerSnapshot, opponentSnapshot] = await Promise.all([
  getDocs(challengesAsChallenger),
  getDocs(challengesAsOpponent),
]);

// Count wins by checking winnerId in the results
let challengeWins = 0;

challengerSnapshot.docs.forEach(doc => {
  const data = doc.data();
  if (data.winnerId === userId) challengeWins++;
});

opponentSnapshot.docs.forEach(doc => {
  const data = doc.data();
  if (data.winnerId === userId) challengeWins++;
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

  // Check for new achievements (with category and challenge data)
  const newAchievementIds = checkAchievements(
    {
      totalLogs,
      totalUniquePlants: allUniquePlants.size,
      bestWeekScore,
      categoriesExplored, // ← Added
      challengeWins, // ← Added
      referralCount
    },
    weeklySummaries,
    existingAchievementIds
  );

  // Convert to Achievement objects
  const newAchievements: Achievement[] = newAchievementIds.map(id => {
  console.log('Achievement ID:', id, 'Uppercase:', id.toUpperCase());
  const achievement = ACHIEVEMENTS[id.toUpperCase()];
  console.log('Found achievement:', achievement);
  
  if (!achievement) {
    console.error('MISSING ACHIEVEMENT:', id);
    return null;
  }
  
  return {
    ...achievement,
    unlockedAt: new Date(),
  };
}).filter(Boolean) as Achievement[];

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
    categoriesExplored, // ← Added
    challengeWins, // ← Added
     referralCount, // ← Add this
    referredBy: existing?.referredBy || null, // Keep existing referrer
    updatedAt: new Date(),
  };

  // Save to Firestore
  const docRef = doc(db, COLLECTIONS.ALL_TIME_STATS, userId);
  await setDoc(docRef, {
    ...stats,
    categoriesExplored: Array.from(categoriesExplored), // Convert Set to Array for Firestore
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