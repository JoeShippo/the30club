import {
  doc,
  getDoc,
  setDoc,
  query,
  collection,
  where,
  orderBy,
  limit,
  getDocs,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import { COLLECTIONS } from '@/firebase/collections';
import { WeeklySummary, LeaderboardEntry } from '@core/types';
import { generateWeeklySummary } from '@core/scoring';
import { getPlantLogsByUserAndWeek } from './plantLogService';
import { getUserById } from './userService';

export async function updateWeeklySummary(
  userId: string,
  weekId: string
): Promise<WeeklySummary> {
  const logs = await getPlantLogsByUserAndWeek(userId, weekId);
  const summary = generateWeeklySummary(userId, weekId, logs);

  const docRef = doc(db, COLLECTIONS.WEEKLY_SUMMARIES, summary.id);

  await setDoc(docRef, {
    ...summary,
    startDate: Timestamp.fromDate(summary.startDate),
    endDate: Timestamp.fromDate(summary.endDate),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return summary;
}

export async function getWeeklySummary(
  userId: string,
  weekId: string
): Promise<WeeklySummary | null> {
  const docRef = doc(db, COLLECTIONS.WEEKLY_SUMMARIES, `${userId}_${weekId}`);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }

  const data = docSnap.data();
  return {
    ...data,
    startDate: data.startDate?.toDate() || new Date(),
    endDate: data.endDate?.toDate() || new Date(),
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  } as WeeklySummary;
}

export async function getWeeklyLeaderboard(
  weekId: string,
  limitCount: number = 50
): Promise<LeaderboardEntry[]> {
  const q = query(
    collection(db, COLLECTIONS.WEEKLY_SUMMARIES),
    where('weekId', '==', weekId),
    orderBy('score', 'desc'),
    limit(limitCount)
  );

  const querySnapshot = await getDocs(q);

  const entries: LeaderboardEntry[] = [];

  for (const docSnap of querySnapshot.docs) {
    const data = docSnap.data();
    const user = await getUserById(data.userId);

    entries.push({
      userId: data.userId,
      displayName: user?.displayName || 'Anonymous',
      photoURL: user?.photoURL || null,
      score: data.score,
      weekId: data.weekId,
    });
  }

  // Add ranks
  return entries.map((entry, index) => ({
    ...entry,
    rank: index + 1,
  }));
}

export async function getAllTimeLeaderboard(
  limitCount: number = 50
): Promise<LeaderboardEntry[]> {
  const q = query(
    collection(db, COLLECTIONS.ALL_TIME_STATS),
    orderBy('totalUniquePlants', 'desc'),
    limit(limitCount)
  );

  const querySnapshot = await getDocs(q);

  const entries: LeaderboardEntry[] = [];

  for (const docSnap of querySnapshot.docs) {
    const data = docSnap.data();
    const user = await getUserById(data.userId);

    entries.push({
      userId: data.userId,
      displayName: user?.displayName || 'Anonymous',
      photoURL: user?.photoURL || null,
      score: data.totalUniquePlants,
      weekId: 'all-time',
    });
  }

  return entries.map((entry, index) => ({
    ...entry,
    rank: index + 1,
  }));
}