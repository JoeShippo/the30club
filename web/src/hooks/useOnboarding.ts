import { useState, useEffect } from 'react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { COLLECTIONS } from '@/firebase/collections';
import { trackEvent } from '@/services/analytics';


const ONBOARDING_KEY = 'onboarding_complete';

export function useOnboarding(userId: string | undefined) {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!userId) return;
    const done = localStorage.getItem(`${ONBOARDING_KEY}_${userId}`);
    setShowOnboarding(!done);
    setChecking(false);
  }, [userId]);

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

    // Mark locally so we don't show again
    localStorage.setItem(`${ONBOARDING_KEY}_${userId}`, 'true');

        // Track completion
    trackEvent('onboarding_completed', {
      avatarId,
      hasDisplayName: !!displayName,
    });
    
    setShowOnboarding(false);
  };

  return { showOnboarding, checking, completeOnboarding };
}