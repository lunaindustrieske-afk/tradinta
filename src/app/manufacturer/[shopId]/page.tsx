
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import {
  Star,
  ShieldCheck,
  Building,
  Calendar,
  CheckCircle,
  Truck,
  Banknote,
  Globe,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { RequestQuoteModal } from '@/components/request-quote-modal';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, limit, getDocs } from 'firebase/firestore';
import { type Product, type Manufacturer } from '@/app/lib/definitions';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';

export default function ManufacturerPage() {
  const shopId = useParams().shopId as string;
  const firestore = useFirestore();

  const [manufacturer, setManufacturer] = React.useState<Manufacturer | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (!firestore || !shopId) return;
    const fetchManufacturer = async () => {
      setIsLoading(true);
      const manufQuery = query(collection(firestore, 'manufacturers'), where('shopId', '==', shopId), limit(1));
      const querySnapshot = await getDocs(manufQuery);
      if (querySnapshot.empty) {
        setManufacturer(null);
      } else {
        const doc = querySnapshot.docs[0];
        setManufacturer({ id: doc.id, ...doc.data() } as Manufacturer);
      }
      setIsLoading(false);
    };
    fetchManufacturer();
  }, [firestore, shopId]);

  const productsQuery = useMemoFirebase(() => {
    if (!firestore || !manufacturer) return null;
    return query(collection(firestore, 'manufacturers', manufacturer.id, 'products'), where('status', '==', 'published'));
  }, [firestore, manufacturer]);

  const { data: manufacturerProducts, isLoading: isLoadingProducts } = useCollection<Product>(productsQuery);

   const reviewsQuery = useMemoFirebase(() => {
    if (!firestore || !manufacturer) return null;
    return query(collection(firestore, 'reviews'), where('manufacturerId', '==', manufacturer.id), where('status', '==', 'approved'));
  }, [firestore, manufacturer]);
  const { data: reviews, isLoading: isLoadingReviews } = useCollection(reviewsQuery);


  if (isLoading) {
    return (
        <div className="bg-background">
            <div className="container mx-auto px-4 py-12">
                <Skeleton className="h-6 w-1/3 mb-12" />
                <div className="relative bg-muted/30 rounded-lg p-8 md:p-12 mb-12">
                    <div className="grid md:grid-cols-3 items-center gap-8">
                         <div className="md:col-span-2 space-y-4">
                            <Skeleton className="h-12 w-3/4" />
                            <Skeleton className="h-6 w-full" />
                            <Skeleton className="h-6 w-1/2" />
                         </div>
                         <div className="flex justify-center md:justify-end">
                            <Skeleton className="h-32 w-32 rounded-full" />
                         </div>
                    </div>
                </div>
                <Skeleton className="h-96 w-full" />
            </div>
        </div>
    )
  }

  if (!manufacturer) {
    notFound();
  }

  return (
    <div className="bg-background">
        <div className="container mx-auto px-4 py-8">
             <Breadcrumb className="mb-6">
                <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink asChild><Link href="/">Home</Link></BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                    <BreadcrumbPage>{manufacturer.name}</BreadcrumbPage>
                </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
            
            {/* --- Hero Section --- */}
            <div className="relative bg-muted/30 rounded-lg p-8 md:p-12 mb-12 overflow-hidden">
                <div className="absolute -top-1/4 -right-1/4 w-1/2 h-[150%] bg-primary/5 rounded-full blur-3xl -z-10"></div>
                <div className="grid md:grid-cols-3 items-center gap-8">
                     <div className="md:col-span-2">
                        <div className="flex items-center gap-3 mb-4">
                            <h1 className="text-4xl font-bold font-headline">{manufacturer.name}</h1>
                             {manufacturer.isVerified && <ShieldCheck className="h-8 w-8 text-green-500" />}
                        </div>
                        <p className="text-lg text-muted-foreground mb-6 max-w-2xl">{manufacturer.overview}</p>
                         <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                <span><span className="font-bold text-foreground">{manufacturer.rating || 'N/A'}</span> / 5 Rating</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Building className="w-4 h-4" />
                                <span>{manufacturer.industry || 'N/A'}</span>
                            </div>
                             <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>Member since {manufacturer.memberSince || 'N/A'}</span>
                            </div>
                        </div>
                     </div>
                     <div className="hidden md:flex justify-end items-center">
                        <Image
                          src={manufacturer.logoUrl || 'https://picsum.photos/seed/mfg-logo/200/200'}
                          alt={`${manufacturer.name} logo`}
                          width={160}
                          height={160}
                          className="rounded-full border-4 border-background bg-background shadow-lg"
                        />
                     </div>
                </div>
            </div>

            {/* --- Product Catalog --- */}
            <section id="products" className="mb-16">
                 <div className="flex items-center justify-between mb-8">
                     <h2 className="text-3xl font-bold font-headline">Product Catalog</h2>
                     <Button variant="outline" asChild><Link href="/products">View All Products</Link></Button>
                 </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {isLoadingProducts ? Array.from({length: 4}).map((_, i) => <Skeleton key={i} className="h-80 w-full" />) :
                    manufacturerProducts && manufacturerProducts.length > 0 ? (
                        manufacturerProducts.map((product) => (
                        <Card key={product.id} className="overflow-hidden group flex flex-col hover:shadow-xl transition-shadow duration-300">
                            <div className="flex-grow">
                            <Link href={`/products/${shopId}/${product.slug}`}>
                            <CardContent className="p-0">
                            <div className="relative aspect-video overflow-hidden">
                                <Image
                                src={product.imageUrl || 'https://picsum.photos/seed/product/600/400'}
                                alt={product.name}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform"
                                data-ai-hint={product.imageHint || 'product photo'}
                                />
                            </div>
                            <div className="p-4 space-y-1">
                                <h3 className="font-semibold leading-tight h-10 truncate">{product.name}</h3>
                                <p className="text-primary font-bold text-lg">KES {product.price.toLocaleString()}</p>
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                    <span>{product.rating || 'N/A'}</span>
                                    <span>({product.reviewCount || 0})</span>
                                </div>
                            </div>
                            </CardContent>
                            </Link>
                            </div>
                            <CardFooter className="p-4 pt-0">
                                <RequestQuoteModal product={product}>
                                <Button className="w-full">Request Quotation</Button>
                                </RequestQuoteModal>
                            </CardFooter>
                        </Card>
                    ))) : (
                        <div className="col-span-full text-center py-12 text-muted-foreground">
                            <p>This manufacturer has not published any products yet.</p>
                        </div>
                    )}
                </div>
            </section>

             <Separator className="my-16" />

            {/* --- Trade & Logistics --- */}
            <section id="trade" className="mb-16">
                 <h2 className="text-3xl font-bold font-headline mb-8 text-center">Trade & Logistics Information</h2>
                 <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
                    <Card className="hover:bg-muted/50 transition-colors">
                        <CardHeader className="flex-row items-center gap-4 space-y-0">
                            <div className="p-3 bg-primary/10 rounded-full"><Banknote className="h-6 w-6 text-primary"/></div>
                            <CardTitle className="text-lg">Payment Methods</CardTitle>
                        </CardHeader>
                        <CardContent>{manufacturer.paymentMethods?.join(', ') || 'Not specified'}</CardContent>
                    </Card>
                    <Card className="hover:bg-muted/50 transition-colors">
                        <CardHeader className="flex-row items-center gap-4 space-y-0">
                            <div className="p-3 bg-primary/10 rounded-full"><Truck className="h-6 w-6 text-primary"/></div>
                            <CardTitle className="text-lg">Delivery Terms</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p>{manufacturer.deliveryTerms?.join(', ') || 'Not specified'}</p>
                            <p className="text-sm text-muted-foreground">Lead time: {manufacturer.leadTime || 'Not specified'}</p>
                        </CardContent>
                    </Card>
                    <Card className="hover:bg-muted/50 transition-colors">
                        <CardHeader className="flex-row items-center gap-4 space-y-0">
                           <div className="p-3 bg-primary/10 rounded-full"> <Globe className="h-6 w-6 text-primary"/></div>
                            <CardTitle className="text-lg">Production</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p>Capacity: {manufacturer.productionCapacity || 'Not specified'}</p>
                            <p className="text-sm text-muted-foreground">Min. Order: {manufacturer.moq || 'Not specified'} units</p>
                        </CardContent>
                    </Card>
                 </div>
            </section>

             <Separator className="my-16" />

            {/* --- Reviews Section --- */}
            <section id="reviews" className="mb-16">
                <h2 className="text-3xl font-bold font-headline mb-8 text-center">What Buyers Are Saying</h2>
                <div className="max-w-4xl mx-auto space-y-6">
                    {isLoadingReviews ? Array.from({length: 2}).map((_, i) => <Skeleton key={i} className="h-32 w-full" />) :
                     reviews && reviews.length > 0 ? (
                        reviews.map((review: any) => (
                             <Card key={review.id} className="p-6">
                                <div className="flex items-start gap-4">
                                    <Avatar>
                                        <AvatarImage src={review.buyerAvatar || ''} />
                                        <AvatarFallback>{review.buyerName?.charAt(0) || 'U'}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-grow">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-semibold">{review.buyerName}</p>
                                                <p className="text-xs text-muted-foreground">{review.createdAt ? formatDistanceToNow(review.createdAt.toDate()) : ''} ago</p>
                                            </div>
                                            <div className="flex items-center">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} className={`h-5 w-5 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}/>
                                                ))}
                                            </div>
                                        </div>
                                        <p className="text-muted-foreground mt-2 text-sm italic">"{review.comment}"</p>
                                    </div>
                                </div>
                            </Card>
                        ))
                    ) : (
                        <div className="text-center text-muted-foreground py-8">
                            <p>No reviews yet for this manufacturer.</p>
                        </div>
                    )}
                </div>
            </section>

        </div>
    </div>
  );
}
