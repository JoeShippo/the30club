import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  getDocs,
  orderBy,
  serverTimestamp,
  Timestamp,
  or,
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import { COLLECTIONS } from '@/firebase/collections';
import { Challenge } from '@30plants/core';
import { getWeekId } from '@30plants/core';
import { getWeeklySummary } from './weeklySummaryService';
import { getUserById } from './userService';
import { unlockAchievement } from './userStatsService';

export async function createChallenge(
  challengerId: string,
  opponentId: string,
  weekId?: string
): Promise<Challenge> {
  const challenger = await getUserById(challengerId);
  const opponent = await getUserById(opponentId);

  if (!challenger || !opponent) {
    throw new Error('User not found');
  }

  const currentWeekId = weekId || getWeekId(new Date());
  const challengeRef = doc(collection(db, COLLECTIONS.CHALLENGES));

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // Expires in 7 days

  const challenge: Challenge = {
    id: challengeRef.id,
    challengerId,
    challengerName: challenger.displayName || 'Anonymous',
    challengerPhoto: challenger.photoURL,
    opponentId,
    opponentName: opponent.displayName || 'Anonymous',
    opponentPhoto: opponent.photoURL,
    weekId: currentWeekId,
    status: 'pending',
    challengerScore: 0,
    opponentScore: 0,
    winnerId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    expiresAt,
  };

  await setDoc(challengeRef, {
    ...challenge,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    expiresAt: Timestamp.fromDate(expiresAt),
  });

  return challenge;
}

export async function getChallengeById(challengeId: string): Promise<Challenge | null> {
  const docRef = doc(db, COLLECTIONS.CHALLENGES, challengeId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) return null;

  const data = docSnap.data();
  return {
    ...data,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
    expiresAt: data.expiresAt?.toDate() || new Date(),
  } as Challenge;
}

export async function getUserChallenges(userId: string): Promise<Challenge[]> {
  const q = query(
    collection(db, COLLECTIONS.CHALLENGES),
    or(
      where('challengerId', '==', userId),
      where('opponentId', '==', userId)
    ),
    orderBy('createdAt', 'desc')
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      expiresAt: data.expiresAt?.toDate() || new Date(),
    } as Challenge;
  });
}

export async function getActiveChallenges(userId: string): Promise<Challenge[]> {
  const challenges = await getUserChallenges(userId);
  return challenges.filter(c => 
    c.status === 'pending' || c.status === 'accepted'
  );
}

export async function acceptChallenge(challengeId: string): Promise<void> {
  const challengeRef = doc(db, COLLECTIONS.CHALLENGES, challengeId);
  await updateDoc(challengeRef, {
    status: 'accepted',
    updatedAt: serverTimestamp(),
  });
}

export async function declineChallenge(challengeId: string): Promise<void> {
  const challengeRef = doc(db, COLLECTIONS.CHALLENGES, challengeId);
  await updateDoc(challengeRef, {
    status: 'declined',
    updatedAt: serverTimestamp(),
  });
}

export async function updateChallengeScores(challengeId: string): Promise<Challenge> {
  const challenge = await getChallengeById(challengeId);
  if (!challenge) throw new Error('Challenge not found');

  const challengerSummary = await getWeeklySummary(challenge.challengerId, challenge.weekId);
  const opponentSummary = await getWeeklySummary(challenge.opponentId, challenge.weekId);

  const challengerScore = challengerSummary?.score || 0;
  const opponentScore = opponentSummary?.score || 0;

  let winnerId: string | null = null;
  let status: Challenge['status'] = challenge.status;

  // Auto-complete if week is over
  const now = new Date();
  if (now > challenge.expiresAt && challenge.status === 'accepted') {
    status = 'completed';
    
    // Determine winner
    if (challengerScore > opponentScore) {
      winnerId = challenge.challengerId;
    } else if (opponentScore > challengerScore) {
      winnerId = challenge.opponentId;
    }
    // If tie, winnerId remains null
    
    // Unlock "first challenge" achievement for BOTH players (regardless of winner)
    unlockAchievement(challenge.challengerId, 'first_challenge').catch(console.error);
    unlockAchievement(challenge.opponentId, 'first_challenge').catch(console.error);
    
    // Unlock "challenge winner" achievement for the winner only
    if (winnerId) {
      unlockAchievement(winnerId, 'challenge_winner').catch(console.error);
    }
  }

  const challengeRef = doc(db, COLLECTIONS.CHALLENGES, challengeId);
  await updateDoc(challengeRef, {
    challengerScore,
    opponentScore,
    winnerId,
    status,
    updatedAt: serverTimestamp(),
  });

  return {
    ...challenge,
    challengerScore,
    opponentScore,
    winnerId,
    status,
  };
}