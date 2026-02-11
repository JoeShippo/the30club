import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  OAuthProvider,
  UserCredential,
} from 'firebase/auth';
import { auth } from '@/firebase/config';
import { trackEvent } from '@/services/analytics';

const googleProvider = new GoogleAuthProvider();
const appleProvider = new OAuthProvider('apple.com');

// Configure Apple provider
appleProvider.addScope('email');
appleProvider.addScope('name');

export async function signUpWithEmail(
  email: string,
  password: string
): Promise<UserCredential> {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  
  trackEvent('user_signed_up', {
    method: 'email',
  });
  
  return result;
}

export async function signInWithEmail(
  email: string,
  password: string
): Promise<UserCredential> {
  const result = await signInWithEmailAndPassword(auth, email, password);
  
  trackEvent('user_logged_in', {
    method: 'email',
  });
  
  return result;
}

export async function signInWithGoogle(): Promise<UserCredential> {
  const result = await signInWithPopup(auth, googleProvider);
  
  // Track signup vs login (Google can be either)
  const isNewUser = result.user.metadata.creationTime === result.user.metadata.lastSignInTime;
  
  trackEvent(isNewUser ? 'user_signed_up' : 'user_logged_in', {
    method: 'google',
  });
  
  return result;
}

export async function signInWithApple(): Promise<UserCredential> {
  const result = await signInWithPopup(auth, appleProvider);
  
  // Track signup vs login (Apple can be either)
  const isNewUser = result.user.metadata.creationTime === result.user.metadata.lastSignInTime;
  
  trackEvent(isNewUser ? 'user_signed_up' : 'user_logged_in', {
    method: 'apple',
  });
  
  return result;
}