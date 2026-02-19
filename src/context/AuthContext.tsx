/**
 * AuthContext - Firebase Authentication for React Native
 *
 * Uses Firebase JS SDK (not native) for simpler cross-platform auth.
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithCredential,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  User as FirebaseUser,
  // @ts-expect-error - getReactNativePersistence exists in RN bundle but not in default types
  getReactNativePersistence,
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { env } from '@/config/env';

// Firebase config from environment
const firebaseConfig = {
  apiKey: env.FIREBASE_API_KEY || 'AIzaSyXXXXXXXXXXXXXXXX',
  authDomain: env.FIREBASE_AUTH_DOMAIN || 'starter-app.firebaseapp.com',
  projectId: env.FIREBASE_PROJECT_ID || 'starter-app',
  storageBucket: env.FIREBASE_STORAGE_BUCKET || 'starter-app.appspot.com',
  messagingSenderId: env.FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: env.FIREBASE_APP_ID || '1:123456789:web:abcdef',
};

// Initialize Firebase (only once)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

// Enable persistence with AsyncStorage
try {
  // @ts-ignore - getReactNativePersistence exists but types may not match
  auth.setPersistence(getReactNativePersistence(AsyncStorage));
} catch (error) {
  console.warn('[Auth] Failed to set persistence:', error);
}

// Lazy-load Google Sign-In to avoid crash when native module isn't linked yet
let googleSignInConfigured = false;
async function getGoogleSignin() {
  const { GoogleSignin } = await import('@react-native-google-signin/google-signin');
  if (!googleSignInConfigured) {
    GoogleSignin.configure({
      iosClientId: '1008456982478-34s3dd4ndeveq56rt1n774q85pda5v3f.apps.googleusercontent.com',
      webClientId: '1008456982478-l6ai87gui758k3e0op384pfnp0ia6gi3.apps.googleusercontent.com',
    });
    googleSignInConfigured = true;
  }
  return GoogleSignin;
}

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isAnonymous: boolean;
}

export interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isReady: boolean;
  token: string | null;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
  refreshToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function toAuthUser(firebaseUser: FirebaseUser | null): AuthUser | null {
  if (!firebaseUser) return null;
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    photoURL: firebaseUser.photoURL,
    isAnonymous: firebaseUser.isAnonymous,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(toAuthUser(firebaseUser));

      if (firebaseUser) {
        try {
          const idToken = await firebaseUser.getIdToken();
          setToken(idToken);
        } catch (error) {
          console.error('[Auth] Error getting ID token:', error);
          setToken(null);
        }
      } else {
        setToken(null);
      }

      setIsLoading(false);
      setIsReady(true);
    });

    return unsubscribe;
  }, []);

  // Refresh token periodically (Firebase tokens expire after 1 hour)
  useEffect(() => {
    if (!user) return;

    const refreshInterval = setInterval(async () => {
      try {
        const currentUser = auth.currentUser;
        if (currentUser) {
          const newToken = await currentUser.getIdToken(true);
          setToken(newToken);
        }
      } catch (error) {
        console.error('Error refreshing token:', error);
      }
    }, 50 * 60 * 1000); // Refresh every 50 minutes

    return () => clearInterval(refreshInterval);
  }, [user]);

  const signInWithGoogle = useCallback(async () => {
    setIsLoading(true);
    try {
      const GoogleSignin = await getGoogleSignin();
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      const idToken = response.data?.idToken;
      if (!idToken) throw new Error('No ID token from Google');
      const credential = GoogleAuthProvider.credential(idToken);
      await signInWithCredential(auth, credential);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signUpWithEmail = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    setIsLoading(true);
    try {
      await firebaseSignOut(auth);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const sendPasswordResetEmail = useCallback(async (email: string) => {
    await firebaseSendPasswordResetEmail(auth, email);
  }, []);

  const refreshToken = useCallback(async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return null;

    try {
      const newToken = await currentUser.getIdToken(true);
      setToken(newToken);
      return newToken;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return null;
    }
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    isLoading,
    isReady,
    token,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    sendPasswordResetEmail,
    refreshToken,
  }), [
    user,
    isLoading,
    isReady,
    token,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    sendPasswordResetEmail,
    refreshToken,
  ]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
