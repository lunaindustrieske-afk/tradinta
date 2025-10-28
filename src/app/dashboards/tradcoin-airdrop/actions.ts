
'use server';

import { getFirestore } from 'firebase-admin/firestore';
import { customInitApp } from '@/firebase/admin';
import { nanoid } from 'nanoid';
import { serverTimestamp } from 'firebase/firestore';

customInitApp();
const db = getFirestore();

interface GenerateCodesParams {
  count: number;
  points: number;
  expiresAt?: Date;
}

export async function generateClaimCodes({
  count,
  points,
  expiresAt,
}: GenerateCodesParams): Promise<{ success: boolean; message: string; count: number }> {
  try {
    if (count > 1000) {
        throw new Error("Cannot generate more than 1000 codes at a time.");
    }
    const batch = db.batch();
    for (let i = 0; i < count; i++) {
        const code = nanoid(8).toUpperCase();
        const codeRef = db.collection('claimCodes').doc(code);
        batch.set(codeRef, {
            code,
            points,
            status: 'active',
            expiresAt: expiresAt || null,
            createdAt: serverTimestamp(),
        });
    }
    await batch.commit();
    return { success: true, message: 'Codes generated successfully.', count };
  } catch (error: any) {
    console.error("Error generating claim codes:", error);
    return { success: false, message: error.message, count: 0 };
  }
}

export async function voidClaimCode(codeId: string): Promise<{ success: boolean; message: string }> {
    try {
        const codeRef = db.collection('claimCodes').doc(codeId);
        await codeRef.update({ status: 'voided' });
        return { success: true, message: 'Code voided successfully.' };
    } catch(error: any) {
        console.error("Error voiding claim code:", error);
        return { success: false, message: error.message };
    }
}

    