
'use server';

import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

// This is a simplified placeholder for a real Cloud Function trigger.
// In a real Firebase app, you would use functions.firestore.document('reviews/{reviewId}').onCreate()
// to trigger this logic automatically and securely.
// For the purpose of this prototype, we'll simulate it with an API route that would need to be called.

export async function POST(request: NextRequest) {
  const { reviewId, productId, manufacturerId, rating } = await request.json();
  const db = getDb();

  if (!reviewId || !productId || !manufacturerId || rating === undefined) {
    return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
  }

  const productRef = db.collection('manufacturers').doc(manufacturerId).collection('products').doc(productId);
  const manufacturerRef = db.collection('manufacturers').doc(manufacturerId);

  try {
    // ---- Part 1: Update Product's Average Rating ----
    // In a transaction to ensure atomicity
    await db.runTransaction(async (transaction) => {
      const productDoc = await transaction.get(productRef);
      if (!productDoc.exists) {
        throw new Error('Product not found!');
      }

      const productData = productDoc.data();
      const currentReviewCount = productData?.reviewCount || 0;
      const currentAvgRating = productData?.rating || 0;

      const newReviewCount = currentReviewCount + 1;
      const newAvgRating = (currentAvgRating * currentReviewCount + rating) / newReviewCount;
      
      transaction.update(productRef, {
        reviewCount: newReviewCount,
        rating: newAvgRating
      });
    });
    console.log(`Updated product ${productId} rating to ${await (await productRef.get()).data()?.rating}`);


    // ---- Part 2: Update Manufacturer's Overall Average Rating ----
    // This is more complex and can be expensive. In a real app, this might be a separate, less frequent job.
    const allProductsSnapshot = await db.collection('manufacturers').doc(manufacturerId).collection('products').get();
    
    let totalRating = 0;
    let productsWithRatings = 0;

    allProductsSnapshot.forEach(doc => {
      const product = doc.data();
      if (product.rating > 0) {
        totalRating += product.rating;
        productsWithRatings++;
      }
    });

    const newManufacturerAvgRating = productsWithRatings > 0 ? totalRating / productsWithRatings : 0;
    
    await manufacturerRef.update({
        rating: newManufacturerAvgRating
    });
    console.log(`Updated manufacturer ${manufacturerId} rating to ${newManufacturerAvgRating}`);


    return NextResponse.json({ success: true, message: 'Ratings updated successfully.' });

  } catch (error: any) {
    console.error('Error updating ratings:', error);
    return NextResponse.json({ error: 'Failed to update ratings.', details: error.message }, { status: 500 });
  }
}

    