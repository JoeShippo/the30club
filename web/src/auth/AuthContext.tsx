import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { auth } from '@/firebase/config';
import { User } from '@core/types';
import { getUserById, createUser } from '@/services/userService';

interface AuthContextType {
  currentUser: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  firebaseUser: null,
  loading: true,
  signOut: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    console.log('Auth state changed:', user?.uid);
    setFirebaseUser(user);

    if (!user) {
      setCurrentUser(null);
      setLoading(false);
      return;
    }

    try {
      let userData = await getUserById(user.uid);

      if (!userData) {
        console.log('Creating new user:', user.uid);
        userData = await createUser({
          id: user.uid,
          email: user.email || '',
          displayName: user.displayName,
          photoURL: user.photoURL,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      console.log('User data loaded:', userData);
      setCurrentUser(userData);
    } catch (error) {
      console.error('Error fetching/creating user:', error);
      setCurrentUser(null);
    } finally {
      // 🔑 THIS is the key line
      setLoading(false);
    }
  });

  return unsubscribe;
}, []);


  const signOut = async () => {
    await firebaseSignOut(auth);
    setCurrentUser(null);
    setFirebaseUser(null);
  };

  const value: AuthContextType = {
    currentUser,
    firebaseUser,
    loading,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}