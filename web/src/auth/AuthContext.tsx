import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { auth } from '@/firebase/config';
import { User } from '@core/types';
import { getUserById, createUser } from '@/services/userService';
import { identifyUser, resetUser } from '@/services/analytics';
import { setErrorTrackingUser, clearErrorTrackingUser } from '@/services/errorTracking';
import { rateLimiter } from '@/utils/rateLimiter';



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
      setFirebaseUser(user);

      if (!user) {
        setCurrentUser(null);
        setLoading(false);
        resetUser(); // Reset analytics on logout
        return;
      }

      try {
        let userData = await getUserById(user.uid);

        if (!userData) {
          userData = await createUser({
            id: user.uid,
            email: user.email || '',
            displayName: user.displayName,
            photoURL: user.photoURL,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }

        setCurrentUser(userData);
        
        // Identify user in analytics
        identifyUser(userData.id, {
          email: userData.email,
          displayName: userData.displayName || undefined,
          hasPro: userData.hasPro,
          avatarId: userData.avatarId || undefined,
        });

        setErrorTrackingUser(
  userData.id,
  userData.email,
  userData.displayName || undefined
);
        
      } catch (error) {
        console.error('Error fetching/creating user:', error);
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const signOut = async () => {
    await firebaseSignOut(auth);
    resetUser(); // Reset analytics on sign out
    clearErrorTrackingUser(); 

  // Clear rate limits
  if (currentUser) {
    rateLimiter.clearUser(currentUser.id);
  }

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