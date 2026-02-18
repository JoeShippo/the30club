import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  serverTimestamp,
  orderBy,
  getDoc
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import { COLLECTIONS } from '@/firebase/collections';
import { Challenge, ChallengeStatus, getWeekId } from '@30plants/core';
import { rateLimiter, formatTimeRemaining } from '@/utils/rateLimiter';
import { trackEvent } from './analytics';
import { updateUserStats } from './userStatsService';


/**
 * Create a new challenge
 */
export async function createChallenge(
  challengerId: string,
  opponentId: string
): Promise<Challenge> {
  // Check rate limit
  if (!rateLimiter.checkLimit(challengerId, 'challenge_create')) {
    const resetTime = rateLimiter.getResetTime(challengerId, 'challenge_create');
    throw new Error(
      `You're creating challenges too quickly. Try again in ${formatTimeRemaining(resetTime)}`
    );
  }

  const weekId = getWeekId(new Date());

  const challengeData = {
    challengerId,
    opponentId,
    weekId,
    status: ChallengeStatus.PENDING,
    challengerScore: 0,
    opponentScore: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, COLLECTIONS.CHALLENGES), challengeData);

  trackEvent('challenge_created', {
    challengeId: docRef.id,
    opponentId,
    weekId,
  });

  return {
    id: docRef.id,
    ...challengeData,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Challenge;
}

/**
 * Accept a challenge
 */
export async function acceptChallenge(challengeId: string): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.CHALLENGES, challengeId), {
    status: ChallengeStatus.ACTIVE,
    updatedAt: serverTimestamp(),
  });

  trackEvent('challenge_accepted', { challengeId });
}

/**
 * Decline a challenge
 */
export async function declineChallenge(challengeId: string): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.CHALLENGES, challengeId), {
    status: ChallengeStatus.DECLINED,
    updatedAt: serverTimestamp(),
  });

  trackEvent('challenge_declined', { challengeId });
}

/**
 * Get all challenges for a user (as challenger or opponent)
 */
export async function getUserChallenges(userId: string): Promise<Challenge[]> {
  // Get challenges where user is challenger
  const q1 = query(
    collection(db, COLLECTIONS.CHALLENGES),
    where('challengerId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  // Get challenges where user is opponent
  const q2 = query(
    collection(db, COLLECTIONS.CHALLENGES),
    where('opponentId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  const [snapshot1, snapshot2] = await Promise.all([
    getDocs(q1),
    getDocs(q2),
  ]);

  const challenges = [
    ...snapshot1.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })),
    ...snapshot2.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })),
  ];

  // Sort by creation date
  return challenges.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()) as Challenge[];
}

/**
 * Get active challenges for current week
 */
export async function getActiveChallenges(userId: string): Promise<Challenge[]> {
  const weekId = getWeekId(new Date());
  
  // Get challenges where user is challenger
  const q1 = query(
    collection(db, COLLECTIONS.CHALLENGES),
    where('weekId', '==', weekId),
    where('status', '==', ChallengeStatus.ACTIVE),
    where('challengerId', '==', userId)
  );

  // Get challenges where user is opponent
  const q2 = query(
    collection(db, COLLECTIONS.CHALLENGES),
    where('weekId', '==', weekId),
    where('status', '==', ChallengeStatus.ACTIVE),
    where('opponentId', '==', userId)
  );

  const [snapshot1, snapshot2] = await Promise.all([
    getDocs(q1),
    getDocs(q2),
  ]);

  return [
    ...snapshot1.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })),
    ...snapshot2.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })),
  ] as Challenge[];
}

/**
 * Get pending challenges (where user is the opponent)
 */
export async function getPendingChallenges(userId: string): Promise<Challenge[]> {
  const q = query(
    collection(db, COLLECTIONS.CHALLENGES),
    where('opponentId', '==', userId),
    where('status', '==', ChallengeStatus.PENDING),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as Challenge;
  });
}


/**
 * Complete a challenge and determine winner
 */
export async function completeChallenge(challengeId: string): Promise<void> {
  const challengeDoc = await getDoc(doc(db, COLLECTIONS.CHALLENGES, challengeId));
  if (!challengeDoc.exists()) return;

  const challenge = challengeDoc.data();
  const winnerId = challenge.challengerScore > challenge.opponentScore 
    ? challenge.challengerId 
    : challenge.opponentId;

  await updateDoc(doc(db, COLLECTIONS.CHALLENGES, challengeId), {
    status: ChallengeStatus.COMPLETED,
    winnerId,
    updatedAt: serverTimestamp(),
  });

  // Update winner's stats to check for challenge achievements
  await updateUserStats(winnerId);

  trackEvent('challenge_completed', {
    challengeId,
    winnerId,
    finalScore: `${challenge.challengerScore}-${challenge.opponentScore}`,
  });
}