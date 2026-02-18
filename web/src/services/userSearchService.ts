import {
  collection,
  query,
  where,
  getDocs,
  limit,
  orderBy,
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import { COLLECTIONS } from '@/firebase/collections';
//import { User } from '@core/types';

export interface UserSearchResult {
  id: string;
  displayName: string | null;
  avatarId: string | null;
  photoURL: string | null;
  weeklyScore?: number; // Current week's score
}

/**
 * Search users by display name or email
 */
export async function searchUsers(searchQuery: string): Promise<UserSearchResult[]> {
  if (!searchQuery || searchQuery.length < 2) return [];

  const q = query(
    collection(db, COLLECTIONS.USERS),
    where('displayName', '>=', searchQuery),
    where('displayName', '<=', searchQuery + '\uf8ff'),
    limit(20)
  );

  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      displayName: data.displayName,
      avatarId: data.avatarId,
      photoURL: data.photoURL,
    };
  });
}

/**
 * Get top users for discovery (leaderboard preview)
 */
export async function getTopUsers(limitCount: number = 10): Promise<UserSearchResult[]> {
  // We'll get users from the current week's leaderboard
 // const currentWeekId = new Date().toISOString().slice(0, 10); // Simple date-based week
  
  const q = query(
    collection(db, COLLECTIONS.WEEKLY_SUMMARIES),
    orderBy('score', 'desc'),
    limit(limitCount)
  );

  const snapshot = await getDocs(q);
  const userIds = new Set<string>();
  const results: UserSearchResult[] = [];

  for (const doc of snapshot.docs) {
    const data = doc.data();
    if (userIds.has(data.userId)) continue; // Skip duplicates
    
    userIds.add(data.userId);
    
    // Get user details
    const userDoc = await getDocs(
      query(
        collection(db, COLLECTIONS.USERS),
        where('__name__', '==', data.userId)
      )
    );

    if (!userDoc.empty) {
      const userData = userDoc.docs[0].data();
      results.push({
        id: data.userId,
        displayName: userData.displayName,
        avatarId: userData.avatarId,
        photoURL: userData.photoURL,
        weeklyScore: data.score,
      });
    }
  }

  return results;
}

/**
 * Generate a unique invite code for a user
 */
export function generateInviteLink(userId: string, displayName: string): string {
  const username = displayName?.toLowerCase().replace(/\s+/g, '') || userId.slice(0, 8);
  return `https://app.the30club.com/join/${username}`;
}