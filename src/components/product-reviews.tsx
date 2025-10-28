
'use client';

import * as React from 'react';
import { useFirestore, useCollection, useMemoFirebase, useUser, deleteDocumentNonBlocking } from '@/firebase';
import { collection, query, where, orderBy, doc } from 'firebase/firestore';
import { type Review } from '@/lib/definitions';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { Star, CheckCircle, Trash2, Flag } from 'lucide-react';
import { LeaveReviewForm } from '@/components/leave-review-form';
import { Separator } from './ui/separator';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { logFeatureUsage } from '@/lib/analytics';
import { ReportModal } from './report-modal';


interface ProductReviewsProps {
    productId: string;
}

export function ProductReviews({ productId }: ProductReviewsProps) {
    const firestore = useFirestore();
    const { user, role } = useUser();
    const { toast } = useToast();

    const reviewsQuery = useMemoFirebase(() => {
        if (!firestore || !productId) return null;
        return query(
            collection(firestore, 'reviews'),
            where('productId', '==', productId),
            orderBy('createdAt', 'desc')
        );
    }, [firestore, productId]);

    const { data: reviews, isLoading, forceRefetch } = useCollection<Review>(reviewsQuery);
    
    const product = reviews && reviews.length > 0
      ? { id: reviews[0].productId, name: reviews[0].productName, manufacturerId: (reviews[0] as any).manufacturerId } 
      : { id: productId, name: 'this product', manufacturerId: '' };

    const userHasReviewed = React.useMemo(() => {
        if (!user || !reviews) return false;
        return reviews.some(review => review.buyerId === user.uid);
    }, [user, reviews]);

    const handleDeleteReview = async (review: Review) => {
        if (!firestore || !user || !role) return;
        logFeatureUsage({ feature: 'reviews:delete', userId: user.uid, userRole: role, metadata: { reviewId: review.id, productId: review.productId } });
        const reviewRef = doc(firestore, 'reviews', review.id);
        try {
            await deleteDocumentNonBlocking(reviewRef);
            toast({
                title: 'Review Deleted',
                description: 'The review has been permanently removed.',
            });
            forceRefetch(); // Refresh the list
        } catch (error: any) {
            toast({
                title: 'Error',
                description: `Failed to delete review: ${error.message}`,
                variant: 'destructive',
            });
        }
    };
    
    const isAdmin = role === 'admin' || role === 'super-admin';

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold mb-4">Leave a Review</h3>
                {userHasReviewed ? (
                    <div className="text-center p-4 border rounded-lg bg-muted/50">
                        <CheckCircle className="mx-auto h-8 w-8 text-green-500 mb-2" />
                        <p className="font-semibold">Thank you for your review!</p>
                        <p className="text-sm text-muted-foreground">Your feedback is now live.</p>
                    </div>
                ) : (
                    <LeaveReviewForm product={product} onReviewSubmit={forceRefetch} />
                )}
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
                            <div key={review.id} className="p-4 border rounded-lg space-y-2 group">
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
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}/>
                                            ))}
                                        </div>
                                         <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                            <ReportModal reportType="Review" referenceId={review.id}>
                                                 <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive">
                                                     <Flag className="w-4 h-4"/>
                                                 </Button>
                                            </ReportModal>
                                            {isAdmin && (
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive">
                                                            <Trash2 className="w-4 h-4"/>
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                This action cannot be undone. This will permanently delete this review.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDeleteReview(review)}>
                                                                Delete
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            )}
                                        </div>
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
