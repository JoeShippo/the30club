import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import { COLLECTIONS } from '@/firebase/collections';
import { AllTimeStats, WeeklySummary } from '@core/types';
import { calculateAllTimeStats } from '@core/stats';

export async function getAllTimeStats(userId: string): Promise<AllTimeStats | null> {
  const docRef = doc(db, COLLECTIONS.ALL_TIME_STATS, userId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) return null;

  const data = docSnap.data();
  return {
    ...data,
    updatedAt: data.updatedAt?.toDate() || new Date(),
  } as AllTimeStats;
}

export async function updateAllTimeStats(userId: string): Promise<AllTimeStats> {
  // Get all weekly summaries for this user
  const q = query(
    collection(db, COLLECTIONS.WEEKLY_SUMMARIES),
    where('userId', '==', userId)
  );

  const querySnapshot = await getDocs(q);
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
  const stats = calculateAllTimeStats(userId, weeklySummaries);

  // Save to Firestore
  const docRef = doc(db, COLLECTIONS.ALL_TIME_STATS, userId);
  await setDoc(docRef, {
    ...stats,
    updatedAt: serverTimestamp(),
  }, { merge: true });

  return stats;
}