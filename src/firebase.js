/**
 * Firebase configuration for SnapVault
 *
 * SETUP INSTRUCTIONS:
 * 1. Create a Firebase project at https://console.firebase.google.com
 * 2. Enable Authentication → Sign-in method → Anonymous (turn it on)
 * 3. Create a Firestore database (Start in test mode for dev, then lock down)
 * 4. Enable Storage
 * 5. Get your config: Project Settings → General → Your apps → Add web app
 * 6. Copy the firebaseConfig object here (or use env vars for production)
 *
 * SECURITY RULES (set these manually in Firebase Console after setup):
 *
 * Firestore rules - restrict to event paths:
 *   rules_version = '2';
 *   service cloud.firestore {
 *     match /databases/{database}/documents {
 *       match /events/{eventCode}/photos/{photoId} {
 *         allow read, write: if request.auth != null;
 *       }
 *     }
 *   }
 *
 * Storage rules - restrict to event paths:
 *   rules_version = '2';
 *   service firebase.storage {
 *     match /b/{bucket}/o {
 *       match /events/{eventCode}/{allPaths=**} {
 *         allow read, write: if request.auth != null;
 *       }
 *     }
 *   }
 */

import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'YOUR_API_KEY',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'YOUR_PROJECT.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'YOUR_PROJECT_ID',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'YOUR_PROJECT.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || 'YOUR_SENDER_ID',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || 'YOUR_APP_ID',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

/**
 * Sign in anonymously - required for uploads. Call after user enters valid event code.
 */
export async function signInAnon() {
  const user = auth.currentUser;
  if (user) return user;
  const { user: newUser } = await signInAnonymously(auth);
  return newUser;
}
