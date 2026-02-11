import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  deleteDoc,
  doc,
  serverTimestamp,
  Timestamp,
  QueryDocumentSnapshot,
  DocumentData,
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import { COLLECTIONS } from '@/firebase/collections';
import { PlantLog, getWeekId } from '@30plants/core';
import { updateWeeklySummary } from './weeklySummaryService';
import { updateUserStats } from './userStatsService';

export async function createPlantLog(
  userId: string,
  plantId: string,
  plantName: string,
  loggedAt: Date = new Date()
): Promise<PlantLog> {
  const weekId = getWeekId(loggedAt);

  const logData = {
    userId,
    plantId,
    plantName,
    loggedAt: Timestamp.fromDate(loggedAt),
    weekId,
    createdAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, COLLECTIONS.PLANT_LOGS), logData);

  const log: PlantLog = {
    id: docRef.id,
    userId,
    plantId,
    plantName,
    loggedAt,
    weekId,
    createdAt: new Date(),
  };

  // Update weekly summary and user stats in background
  updateWeeklySummary(userId, weekId).catch(console.error);
  updateUserStats(userId).catch(console.error);

  return log;
}

export async function getPlantLogsByUserAndWeek(
  userId: string,
  weekId: string
): Promise<PlantLog[]> {
  const q = query(
    collection(db, COLLECTIONS.PLANT_LOGS),
    where('userId', '==', userId),
    where('weekId', '==', weekId),
    orderBy('loggedAt', 'desc')
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      loggedAt: data.loggedAt?.toDate() || new Date(),
      createdAt: data.createdAt?.toDate() || new Date(),
    } as PlantLog;
  });
}

export async function getRecentPlantLogs(
  userId: string,
  limitCount: number = 50
): Promise<PlantLog[]> {
  const q = query(
    collection(db, COLLECTIONS.PLANT_LOGS),
    where('userId', '==', userId),
    orderBy('loggedAt', 'desc'),
    limit(limitCount)
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      loggedAt: data.loggedAt?.toDate() || new Date(),
      createdAt: data.createdAt?.toDate() || new Date(),
    } as PlantLog;
  });
}

export async function deletePlantLog(logId: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTIONS.PLANT_LOGS, logId));
}