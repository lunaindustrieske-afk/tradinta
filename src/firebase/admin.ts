
import { initializeApp, getApp, getApps } from 'firebase-admin/app';
import { credential } from 'firebase-admin';

const adminConfig = {
  // We can leave these empty, as they will be populated by the
  // GOOGLE_APPLICATION_CREDENTIALS env var.
  // We can also add these to a service account file.
};

export function customInitApp() {
  if (getApps().length === 0) {
    initializeApp({
      credential: credential.applicationDefault(),
    });
  }
}
