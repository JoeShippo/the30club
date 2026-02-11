import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  writeBatch,
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import { COLLECTIONS } from '@/firebase/collections';
import { getAuth, deleteUser } from 'firebase/auth';

async function deleteCollection(collectionName: string, userId: string, field: string = 'userId') {
  const q = query(
    collection(db, collectionName),
    where(field, '==', userId)
  );
  const snapshot = await getDocs(q);
  
  // Firestore batch max is 500 ops
  const batches: Promise<void>[] = [];
  let batch = writeBatch(db);
  let opCount = 0;

  snapshot.docs.forEach(document => {
    batch.delete(document.ref);
    opCount++;
    if (opCount === 499) {
      batches.push(batch.commit());
      batch = writeBatch(db);
      opCount = 0;
    }
  });

  if (opCount > 0) batches.push(batch.commit());
  await Promise.all(batches);
  //console.log(`✅ Deleted ${snapshot.docs.length} docs from ${collectionName}`);
}

export async function deleteAccount(userId: string): Promise<void> {
  // 1. Delete all user data from Firestore
  await deleteCollection(COLLECTIONS.PLANT_LOGS, userId);
  await deleteCollection(COLLECTIONS.WEEKLY_SUMMARIES, userId);
  await deleteCollection(COLLECTIONS.ALL_TIME_STATS, userId);

  // 2. Remove user from any leagues they're in
  await deleteCollection(COLLECTIONS.LEAGUE_MEMBERSHIPS, userId);

  // 3. Delete challenges where user is challenger or opponent
  await deleteCollection(COLLECTIONS.CHALLENGES, userId, 'challengerId');
  await deleteCollection(COLLECTIONS.CHALLENGES, userId, 'opponentId');

  // 4. Delete user profile doc
  await deleteDoc(doc(db, COLLECTIONS.USERS, userId));

  // 5. Delete Firebase Auth account (must be last)
  const auth = getAuth();
  if (auth.currentUser) {
    await deleteUser(auth.currentUser);
  }
}