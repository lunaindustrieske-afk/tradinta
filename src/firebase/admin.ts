import { initializeApp, getApps } from 'firebase-admin/app';
import { credential, ServiceAccount } from 'firebase-admin';

function getServiceAccount(): ServiceAccount {
  const serviceAccountB64 = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_B64;
  if (!serviceAccountB64) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY_B64 environment variable is not set.');
  }

  try {
    const decodedServiceAccount = Buffer.from(serviceAccountB64, 'base64').toString('utf8');
    return JSON.parse(decodedServiceAccount);
  } catch (error) {
    console.error('Failed to parse Firebase service account key:', error);
    throw new Error('The Firebase service account key is not a valid Base64 encoded JSON string.');
  }
}

export function customInitApp() {
  if (getApps().length === 0) {
    return initializeApp({
      credential: credential.cert(getServiceAccount()),
    });
  }
  return getApps()[0];
}
