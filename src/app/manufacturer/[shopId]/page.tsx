
'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  Star,
  ShieldCheck,
  Building,
  Calendar,
  CheckCircle,
  Truck,
  Banknote,
  Search,
  ListFilter,
  Globe,
  MessageSquare,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { RequestQuoteModal } from '@/components/request-quote-modal';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, limit, getDocs } from 'firebase/firestore';
import { type Product, type Manufacturer } from '@/app/lib/definitions';
import { Skeleton } from '@/components/ui/skeleton';

export default function ManufacturerPage({ params }: { params: { shopId: string } }) {
  const shopId = params.shopId;
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

  if (isLoading) {
    return (
        <div className="container mx-auto py-12">
            <div className="relative h-64 w-full rounded-lg overflow-hidden bg-muted"></div>
            <div className="container -mt-24 pb-12">
                 <div className="flex flex-col md:flex-row items-start gap-6">
                     <Skeleton className="h-32 w-32 rounded-full border-4 border-background bg-muted" />
                 </div>
            </div>
        </div>
    )
  }

  if (!manufacturer) {
    notFound();
  }

  return (
    <div className="bg-muted/20">
      {/* Hero Section */}
      <div className="relative h-48 md:h-64 w-full">
        <Image
          src={manufacturer.coverImageUrl || 'https://picsum.photos/seed/mfg-cover/1600/400'}
          alt={`${manufacturer.name} cover image`}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      </div>
      <div className="container -mt-16 md:-mt-24 pb-12">
        <div className="flex flex-col md:flex-row items-start gap-6">
          <div className="relative flex-shrink-0">
            <Image
              src={manufacturer.logoUrl || 'https://picsum.photos/seed/mfg-logo/128/128'}
              alt={`${manufacturer.name} logo`}
              width={128}
              height={128}
              className="rounded-full border-4 border-background bg-background"
            />
          </div>
          <div className="flex-grow pt-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-3xl font-bold font-headline text-background md:text-foreground">{manufacturer.name}</h1>
                        {manufacturer.isVerified && <ShieldCheck className="h-7 w-7 text-green-400" />}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground mt-1">
                        <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                            <span>{manufacturer.rating || 'N/A'} Seller Rating</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Building className="w-4 h-4" />
                            <span>{manufacturer.industry || 'N/A'}</span>
                        </div>
                         <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>Member since {manufacturer.memberSince || 'N/A'}</span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2 self-start sm:self-center">
                    <Button><MessageSquare className="mr-2 h-4 w-4" /> Contact</Button>
                    <Button variant="outline">Follow</Button>
                </div>
            </div>
          </div>
        </div>
        
        {/* Main content with tabs */}
        <Tabs defaultValue="products" className="mt-8">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
                <TabsTrigger value="products">Products</TabsTrigger>
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="logistics">Trade & Logistics</TabsTrigger>
                <TabsTrigger value="reviews">Reviews ({manufacturer.reviews?.length || 0})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="products" className="mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Product Catalog</CardTitle>
                        <CardDescription>Browse all products from {manufacturer.name}</CardDescription>
                         <div className="flex flex-col md:flex-row gap-2 pt-4">
                            <div className="relative flex-grow">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input placeholder="Search in this shop..." className="pl-10" />
                            </div>
                            <Button variant="outline" className="w-full md:w-auto"><ListFilter className="mr-2 h-4 w-4" /> Filter</Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {isLoadingProducts ? Array.from({length: 4}).map((_, i) => <Skeleton key={i} className="h-80 w-full" />) :
                            manufacturerProducts && manufacturerProducts.length > 0 ? (
                                manufacturerProducts.map((product) => (
                                <Card key={product.id} className="overflow-hidden group flex flex-col">
                                  <div className="flex-grow">
                                    <Link href={`/products/${shopId}/${product.slug}`}>
                                    <CardContent className="p-0">
                                    <div className="relative aspect-[4/3] overflow-hidden">
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
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="about" className="mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle>About {manufacturer.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="prose prose-sm max-w-none text-muted-foreground">
                        <p>{manufacturer.overview}</p>
                        <div className="not-prose grid md:grid-cols-2 gap-6 mt-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Business Details</CardTitle>
                                </CardHeader>
                                <CardContent className="text-sm space-y-2">
                                     <p><strong>Business Type:</strong> {manufacturer.businessType || 'N/A'}</p>
                                     <p><strong>Location:</strong> {manufacturer.location || 'N/A'}</p>
                                     <p><strong>Workforce:</strong> {manufacturer.workforceSize || 'N/A'}</p>
                                     <p><strong>Main Export Markets:</strong> {manufacturer.exportMarkets?.join(', ') || 'N/A'}</p>
                                </CardContent>
                            </Card>
                             <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Certifications</CardTitle>
                                </CardHeader>
                                <CardContent className="text-sm space-y-2">
                                    {manufacturer.certifications?.map(cert => (
                                        <div key={cert} className="flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                            <span>{cert}</span>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
            
            <TabsContent value="logistics" className="mt-6">
                 <Card>
                    <CardHeader>
                        <CardTitle>Trade & Logistics Information</CardTitle>
                        <CardDescription>Key details for sourcing and shipping.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <Card>
                            <CardHeader className="flex-row items-center gap-4 space-y-0">
                                <Banknote className="h-8 w-8 text-primary"/>
                                <div>
                                    <CardTitle className="text-base">Payment</CardTitle>
                                    <CardDescription>Accepted Methods</CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent>{manufacturer.paymentMethods?.join(', ') || 'Not specified'}</CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex-row items-center gap-4 space-y-0">
                                <Truck className="h-8 w-8 text-primary"/>
                                <div>
                                    <CardTitle className="text-base">Delivery</CardTitle>
                                    <CardDescription>Terms & Lead Time</CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p>{manufacturer.deliveryTerms?.join(', ') || 'Not specified'}</p>
                                <p className="text-sm text-muted-foreground">Lead time: {manufacturer.leadTime || 'Not specified'}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex-row items-center gap-4 space-y-0">
                                <Globe className="h-8 w-8 text-primary"/>
                                <div>
                                    <CardTitle className="text-base">Production</CardTitle>
                                    <CardDescription>Capacity & MOQ</CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p>Capacity: {manufacturer.productionCapacity || 'Not specified'}</p>
                                <p className="text-sm text-muted-foreground">Min. Order: {manufacturer.moq || 'Not specified'} units</p>
                            </CardContent>
                        </Card>
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="reviews" className="mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Ratings & Reviews</CardTitle>
                        <CardDescription>Feedback from verified buyers.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {manufacturer.reviews?.map(review => (
                             <div key={review.id} className="border-t py-4">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="flex">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className={`h-5 w-5 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}/>
                                        ))}
                                    </div>
                                     <p className="font-semibold">{review.author}</p>
                                </div>
                                <p className="text-muted-foreground">{review.comment}</p>
                            </div>
                        ))}
                        {!manufacturer.reviews || manufacturer.reviews.length === 0 && (
                            <div className="text-center text-muted-foreground py-8">
                                <p>No reviews yet for this manufacturer.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
