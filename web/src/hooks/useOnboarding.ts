import { useState, useEffect } from 'react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { COLLECTIONS } from '@/firebase/collections';
import { trackEvent } from '@/services/analytics';
import { User } from '@core/types';

export function useOnboarding(user: User | null) {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!user) {
      setChecking(false);
      return;
    }

    // User data already loaded by AuthContext, just check the flag
    setShowOnboarding(!user.onboardingComplete);
    setChecking(false);
  }, [user]);

  const completeOnboarding = async (
    displayName: string,
    avatarId: string,
    userId: string
  ) => {
    // Save to Firestore
    await updateDoc(doc(db, COLLECTIONS.USERS, userId), {
      displayName,
      avatarId,
      onboardingComplete: true,
      updatedAt: serverTimestamp(),
    });

    // Track completion
    trackEvent('onboarding_completed', {
      avatarId,
      hasDisplayName: !!displayName,
    });
    
    setShowOnboarding(false);
  };

  return { showOnboarding, checking, completeOnboarding };
}