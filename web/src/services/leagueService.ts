import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  getDocs,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import { COLLECTIONS } from '@/firebase/collections';
import { League, LeagueLeaderboardEntry } from '@30plants/core';
import { generateInviteCode } from '@30plants/core';
import { getWeeklySummary } from './weeklySummaryService';
import { getUserById } from './userService';
import { unlockAchievement } from './userStatsService';

export async function createLeague(
  name: string,
  description: string,
  createdBy: string,
  isPrivate: boolean = true
): Promise<League> {
  const inviteCode = generateInviteCode();
  const leagueRef = doc(collection(db, COLLECTIONS.LEAGUES));
  
  const league: League = {
    id: leagueRef.id,
    name,
    description,
    createdBy,
    memberIds: [createdBy],
    inviteCode,
    isPrivate,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await setDoc(leagueRef, {
    ...league,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // Create membership for creator
  await createLeagueMembership(league.id, createdBy, 'owner');
  
  // Unlock achievement for creating first league
  unlockAchievement(createdBy, 'first_league').catch(console.error);

  return league;
}

export async function getLeagueById(leagueId: string): Promise<League | null> {
  const docRef = doc(db, COLLECTIONS.LEAGUES, leagueId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) return null;

  const data = docSnap.data();
  return {
    ...data,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  } as League;
}

export async function getLeagueByInviteCode(inviteCode: string): Promise<League | null> {
  const q = query(
    collection(db, COLLECTIONS.LEAGUES),
    where('inviteCode', '==', inviteCode.toUpperCase())
  );

  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) return null;

  const data = querySnapshot.docs[0].data();
  return {
    id: querySnapshot.docs[0].id,
    ...data,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  } as League;
}

export async function getUserLeagues(userId: string): Promise<League[]> {
  const q = query(
    collection(db, COLLECTIONS.LEAGUE_MEMBERSHIPS),
    where('userId', '==', userId)
  );

  const querySnapshot = await getDocs(q);
  const leagueIds = querySnapshot.docs.map(doc => doc.data().leagueId);

  if (leagueIds.length === 0) return [];

  const leagues: League[] = [];
  for (const leagueId of leagueIds) {
    const league = await getLeagueById(leagueId);
    if (league) leagues.push(league);
  }

  return leagues;
}

export async function joinLeague(leagueId: string, userId: string): Promise<void> {
  const leagueRef = doc(db, COLLECTIONS.LEAGUES, leagueId);
  
  await updateDoc(leagueRef, {
    memberIds: arrayUnion(userId),
    updatedAt: serverTimestamp(),
  });

  await createLeagueMembership(leagueId, userId, 'member');
  
  // Unlock achievement for joining first league
  unlockAchievement(userId, 'first_league').catch(console.error);
}

export async function joinLeagueByCode(inviteCode: string, userId: string): Promise<League> {
  const league = await getLeagueByInviteCode(inviteCode);
  
  if (!league) {
    throw new Error('League not found');
  }

  if (league.memberIds.includes(userId)) {
    throw new Error('Already a member of this league');
  }

  await joinLeague(league.id, userId);
  
  return league;
}

export async function leaveLeague(leagueId: string, userId: string): Promise<void> {
  const leagueRef = doc(db, COLLECTIONS.LEAGUES, leagueId);
  
  await updateDoc(leagueRef, {
    memberIds: arrayRemove(userId),
    updatedAt: serverTimestamp(),
  });

  const membershipRef = doc(db, COLLECTIONS.LEAGUE_MEMBERSHIPS, `${leagueId}_${userId}`);
  await deleteDoc(membershipRef);
}

async function createLeagueMembership(
  leagueId: string,
  userId: string,
  role: 'owner' | 'admin' | 'member'
): Promise<void> {
  const membershipRef = doc(db, COLLECTIONS.LEAGUE_MEMBERSHIPS, `${leagueId}_${userId}`);
  
  await setDoc(membershipRef, {
    id: `${leagueId}_${userId}`,
    leagueId,
    userId,
    role,
    joinedAt: serverTimestamp(),
  });
}

export async function getLeagueLeaderboard(
  leagueId: string,
  weekId: string
): Promise<LeagueLeaderboardEntry[]> {
  const league = await getLeagueById(leagueId);
  if (!league) return [];

  const entries: LeagueLeaderboardEntry[] = [];

  for (const userId of league.memberIds) {
    const summary = await getWeeklySummary(userId, weekId);
    const user = await getUserById(userId);

    if (summary && user) {
      entries.push({
        leagueId,
        userId,
        displayName: user.displayName,
        photoURL: user.photoURL,
        score: summary.score,
        weekId,
      });
    }
  }

  // Sort by score descending
  entries.sort((a, b) => b.score - a.score);

  // Add ranks
  return entries.map((entry, index) => ({
    ...entry,
    rank: index + 1,
  }));
}