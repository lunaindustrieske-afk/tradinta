
'use client';

import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';

// This file is for CLIENT-SIDE Firebase initialization ONLY.

type FirebaseClientServices = {
  firebaseApp: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
};

let firebaseClientServices: FirebaseClientServices | null = null;

/**
 * Initializes and returns the client-side Firebase SDKs.
 * Ensures that initialization only happens once on the client.
 */
export function getFirebaseClientServices(): FirebaseClientServices {
  if (firebaseClientServices) {
    return firebaseClientServices;
  }

  if (getApps().length > 0) {
    const app = getApp();
    firebaseClientServices = {
      firebaseApp: app,
      auth: getAuth(app),
      firestore: getFirestore(app),
    };
    return firebaseClientServices;
  }

  const firebaseApp = initializeApp(firebaseConfig);
  const auth = getAuth(firebaseApp);
  const firestore = getFirestore(firebaseApp);
  
  firebaseClientServices = {
    firebaseApp,
    auth,
    firestore,
  };

  return firebaseClientServices;
}
