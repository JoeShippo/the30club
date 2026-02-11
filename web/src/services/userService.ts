import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { COLLECTIONS } from '@/firebase/collections';
import { User } from '@core/types';

export async function getUserById(userId: string): Promise<User | null> {
  const docRef = doc(db, COLLECTIONS.USERS, userId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }

  const data = docSnap.data();
  return {
    ...data,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  } as User;
}

export async function createUser(user: User): Promise<User> {
  const docRef = doc(db, COLLECTIONS.USERS, user.id);
  const userData = {
    ...user,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(docRef, userData);

  return {
    ...user,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export async function updateUser(
  userId: string,
  updates: Partial<User>
): Promise<void> {
  const docRef = doc(db, COLLECTIONS.USERS, userId);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}