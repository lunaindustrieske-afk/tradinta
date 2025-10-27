
'use client';

import * as React from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { type Review } from '@/lib/definitions';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { Star } from 'lucide-react';
import { LeaveReviewForm } from '@/components/leave-review-form';
import { Separator } from './ui/separator';

interface ProductReviewsProps {
    productId: string;
}

export function ProductReviews({ productId }: ProductReviewsProps) {
    const firestore = useFirestore();

    const reviewsQuery = useMemoFirebase(() => {
        if (!firestore || !productId) return null;
        return query(
            collection(firestore, 'reviews'),
            where('productId', '==', productId),
            where('status', '==', 'approved'),
            orderBy('createdAt', 'desc')
        );
    }, [firestore, productId]);

    const { data: reviews, isLoading, forceRefetch } = useCollection<Review>(reviewsQuery);
    
    // We get the product from the review data itself to avoid an extra fetch, or use a fallback.
    const product = reviews && reviews.length > 0 && reviews[0] 
      ? { id: reviews[0].productId, name: (reviews[0] as any).productName, manufacturerId: (reviews[0] as any).manufacturerId } 
      : { id: productId, name: 'this product', manufacturerId: '' };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold mb-4">Leave a Review</h3>
                <LeaveReviewForm product={product} onReviewSubmit={forceRefetch} />
            </div>
            <Separator />
            <div>
                <h3 className="text-lg font-semibold mb-4">Customer Reviews ({reviews?.length || 0})</h3>
                <div className="space-y-4">
                    {isLoading ? (
                        <div className="space-y-4">
                            <Skeleton className="h-20 w-full" />
                            <Skeleton className="h-20 w-full" />
                        </div>
                    ) : reviews && reviews.length > 0 ? (
                        reviews.map(review => (
                            <div key={review.id} className="p-4 border rounded-lg space-y-2">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <Avatar>
                                            <AvatarImage src={review.buyerAvatar} />
                                            <AvatarFallback>{review.buyerName?.charAt(0) || 'U'}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-semibold">{review.buyerName}</p>
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                <p>{review.createdAt ? formatDistanceToNow(review.createdAt.toDate()) : ''} ago</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}/>
                                        ))}
                                    </div>
                                </div>
                                <p className="text-sm text-muted-foreground pl-11">"{review.comment}"</p>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-10 text-muted-foreground">
                            <p>No reviews for this product yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
