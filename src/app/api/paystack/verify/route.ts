
import { NextResponse } from 'next/server';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { customInitApp } from '@/firebase/admin';
import crypto from 'crypto';

// Initialize Firebase Admin SDK
customInitApp();
const db = getFirestore();

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

export async function POST(request: Request) {
  if (!PAYSTACK_SECRET_KEY) {
    console.error('Paystack secret key is not configured.');
    return NextResponse.json({ error: 'Internal server error: Payment gateway not configured.' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { reference, orderId, buyerId } = body;

    if (!reference || !orderId || !buyerId) {
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
    const paymentRef = db.collection('payments').doc(); // Create a new payment doc

    await db.runTransaction(async (transaction) => {
      const orderDoc = await transaction.get(orderRef);
      if (!orderDoc.exists) {
        throw new Error('Order not found.');
      }
      const orderData = orderDoc.data();
      
      // Ensure this payment hasn't already been processed
      if (orderData?.status !== 'Pending Payment') {
        // This might happen if the user refreshes the success page.
        // It's not an error, just an indication it's already done.
        console.log(`Order ${orderId} already processed. Current status: ${orderData?.status}`);
        return;
      }

      // 1. Create Payment Record
      transaction.set(paymentRef, {
        orderId: orderId,
        buyerId: buyerId,
        paymentDate: Timestamp.now(),
        amount: data.data.amount / 100, // Paystack returns amount in kobo
        paymentMethod: `Paystack - ${data.data.channel}`,
        transactionId: data.data.id,
        reference: reference,
        status: 'Completed',
      });

      // 2. Update Order Status
      transaction.update(orderRef, { status: 'Processing' });
    });

    return NextResponse.json({ success: true, message: 'Payment verified and order updated.' });

  } catch (error: any) {
    console.error('Error in Paystack verification webhook:', error);
    return NextResponse.json({ error: 'Internal server error.', details: error.message }, { status: 500 });
  }
}
