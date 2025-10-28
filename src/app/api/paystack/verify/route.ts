
import { NextResponse } from 'next/server';
import { getFirestore, Timestamp, FieldValue } from 'firebase-admin/firestore';
import { customInitApp } from '@/firebase/admin';
import crypto from 'crypto';

// Initialize Firebase Admin SDK
customInitApp();
const db = getFirestore();

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

// Hashing function for points ledger
function createEventHash(payload: object): string {
    return crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex');
}

async function awardPoints(
    firestore: FirebaseFirestore.Firestore, 
    userId: string, 
    points: number, 
    reasonCode: string, 
    metadata: object = {}
) {
    if (points <= 0) return; // Do not award zero or negative points

    const eventRef = firestore.collection('pointsLedgerEvents').doc();
    
    const payload = {
        event_id: eventRef.id,
        user_id: userId,
        points: points,
        action: 'award',
        reason_code: reasonCode,
        metadata: metadata,
        timestamp: new Date().toISOString(),
    };

    const hash = createEventHash(payload);

    const eventData = {
        ...payload,
        created_at: FieldValue.serverTimestamp(),
        event_hash: hash,
    };
    
    // Non-blocking write
    eventRef.set(eventData).catch(err => console.error(`Failed to award points for ${reasonCode}:`, err));
}

export async function POST(request: Request) {
  if (!PAYSTACK_SECRET_KEY) {
    console.error('Paystack secret key is not configured.');
    return NextResponse.json({ error: 'Internal server error: Payment gateway not configured.' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { reference, orderId } = body;

    if (!reference || !orderId) {
      return NextResponse.json({ error: 'Missing required payment information.' }, { status: 400 });
    }

    // Verify transaction with Paystack
    const paystackResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      },
    });

    const data = await paystackResponse.json();

    if (!paystackResponse.ok || !data.status || data.data.status !== 'success') {
      console.error('Paystack verification failed:', data);
      return NextResponse.json({ error: 'Payment verification failed.', details: data.message }, { status: 400 });
    }

    // Transaction is successful, now update Firestore within a transaction
    const orderRef = db.collection('orders').doc(orderId);
    const paymentRef = db.collection('payments').doc();

    const { buyerId, sellerId } = await db.runTransaction(async (transaction) => {
      const orderDoc = await transaction.get(orderRef);
      if (!orderDoc.exists) {
        throw new Error('Order not found.');
      }
      const orderData = orderDoc.data()!;
      
      // Ensure this payment hasn't already been processed
      if (orderData.status !== 'Pending Payment') {
        console.log(`Order ${orderId} already processed. Current status: ${orderData.status}`);
        return { buyerId: null, sellerId: null };
      }

      // 1. Create Payment Record
      transaction.set(paymentRef, {
        orderId: orderId,
        buyerId: orderData.buyerId,
        paymentDate: Timestamp.now(),
        amount: data.data.amount / 100, // Paystack returns amount in kobo
        paymentMethod: `Paystack - ${data.data.channel}`,
        transactionId: data.data.id,
        reference: reference,
        status: 'Completed',
      });

      // 2. Update Order Status
      transaction.update(orderRef, { status: 'Processing' });
      
      return { buyerId: orderData.buyerId, sellerId: orderData.sellerId };
    });

    // If transaction was already processed, stop here.
    if (!buyerId || !sellerId) {
        return NextResponse.json({ success: true, message: 'Payment previously verified.' });
    }

    // 3. Award TradPoints (outside the main transaction)
    const pointsConfigSnap = await db.collection('platformSettings').doc('pointsConfig').get();
    const pointsConfig = pointsConfigSnap.data() || {};
    const orderAmount = data.data.amount / 100;

    // Award points to buyer
    const buyerPointsPer10Kes = pointsConfig.buyerPurchasePointsPer10 || 1;
    const buyerPoints = Math.floor((orderAmount / 10) * buyerPointsPer10Kes);
    await awardPoints(db, buyerId, buyerPoints, 'PURCHASE_COMPLETE', { orderId });
    
    // Award points to seller
    const sellerPointsPer10Kes = pointsConfig.sellerSalePointsPer10 || 1;
    const sellerPoints = Math.floor((orderAmount / 10) * sellerPointsPer10Kes);
    await awardPoints(db, sellerId, sellerPoints, 'SALE_COMPLETE', { orderId, buyerId });

    return NextResponse.json({ success: true, message: 'Payment verified and order updated.' });

  } catch (error: any) {
    console.error('Error in Paystack verification webhook:', error);
    return NextResponse.json({ error: 'Internal server error.', details: error.message }, { status: 500 });
  }
}
