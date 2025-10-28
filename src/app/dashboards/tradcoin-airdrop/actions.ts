
'use server';

import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { customInitApp } from '@/firebase/admin';
import { nanoid } from 'nanoid';

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
            createdAt: FieldValue.serverTimestamp(),
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

export async function findUserAndTheirPoints(identifier: string): Promise<{ success: boolean; message?: string; user?: any }> {
    try {
        let userQuery;
        if (identifier.includes('@')) {
             const emailDocRef = db.collection('emails').doc(identifier);
             const emailDoc = await emailDocRef.get();
             if (!emailDoc.exists) throw new Error('User with this email not found.');
             const userId = emailDoc.data()!.userId;
             userQuery = db.collection('users').doc(userId);
        } else {
            const usersRef = db.collection('users');
            const q = usersRef.where('tradintaId', '==', identifier).limit(1);
            const snapshot = await q.get();
            if (snapshot.empty) throw new Error('User with this Tradinta ID not found.');
            userQuery = snapshot.docs[0].ref;
        }
        
        const userDoc = await userQuery.get();
        if (!userDoc.exists) throw new Error('User profile not found.');

        const userData = userDoc.data();
        
        const ledgerQuery = db.collection('pointsLedgerEvents').where('user_id', '==', userDoc.id).orderBy('created_at', 'desc');
        const ledgerSnapshot = await ledgerQuery.get();
        
        const ledger = ledgerSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const totalPoints = ledger.reduce((sum, event) => sum + event.points, 0);

        return {
            success: true,
            user: {
                id: userDoc.id,
                fullName: userData?.fullName,
                totalPoints,
                ledger
            }
        };

    } catch (error: any) {
        return { success: false, message: error.message };
    }
}
