
'use server';

import {
  addDoc,
  collection,
  serverTimestamp,
  type Firestore,
} from 'firebase/firestore';
import type { Auth } from 'firebase/auth';
import { nanoid } from 'nanoid';

/**
 * Logs an administrative action to the activityLogs collection.
 *
 * @param firestore - The Firestore database instance.
 * @param auth - The Firebase Auth instance.
 * @param action - A machine-readable key for the action (e.g., 'VERIFICATION_APPROVED').
 * @param details - A human-readable description of what happened.
 */
export const logActivity = async (
  firestore: Firestore,
  auth: Auth,
  action: string,
  details: string
) => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    console.error('Cannot log activity: User not authenticated.');
    return;
  }

  try {
    const logData = {
      id: nanoid(),
      timestamp: serverTimestamp(),
      userId: currentUser.uid,
      userEmail: currentUser.email,
      action,
      details,
    };
    await addDoc(collection(firestore, 'activityLogs'), logData);
  } catch (error) {
    console.error('Failed to write activity log:', error);
  }
};
