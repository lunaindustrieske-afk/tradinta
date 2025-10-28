
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import {
  Star,
  ShieldCheck,
  Truck,
  MessageSquare,
  Heart,
  Coins,
  Share2,
  Facebook,
  Twitter,
  MessageCircle,
  Instagram,
  Check,
  FileText,
  Eye,
  Loader2,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { RequestQuoteModal } from '@/components/request-quote-modal';
import { useFirestore, useCollection, useMemoFirebase, useUser, addDocumentNonBlocking } from '@/firebase';
import { collection, query, where, limit, getDocs, doc, collectionGroup, getDoc, serverTimestamp } from 'firebase/firestore';
import { type Manufacturer, type Review, type Product } from '@/app/lib/definitions';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ContactManufacturerModal } from '@/components/contact-manufacturer-modal';
import { ProductReviews } from '@/components/product-reviews';
import { nanoid } from 'nanoid';

type ProductWithVariants = Product & {
    variants: { price: number }[];
    otherImageUrls?: string[];
    bannerUrl?: string;
    moq?: number;
    weight?: string;
    dimensions?: string;
    material?: string;
    packagingDetails?: string;
    certifications?: string;
    sku?: string;
    shopId?: string;
};

type ForgingEvent = {
    id: string;
    currentBuyerCount: number;
    endTime: any; // Firestore Timestamp
    tiers: { buyerCount: number; discountPercentage: number }[];
};

export default function ProductDetailPage() {
    const params = useParams();
    const shopId = params.shopId as string;
    const slug = params.slug as string;
    const { user } = useUser();
    const firestore = useFirestore();

    const [product, setProduct] = React.useState<ProductWithVariants | null>(null);
    const [manufacturer, setManufacturer] = React.useState<Manufacturer | null>(null);
    const [forgingEvent, setForgingEvent] = React.useState<ForgingEvent | null>(null);
    const [relatedProducts, setRelatedProducts] = React.useState<ProductWithVariants[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isPledging, setIsPledging] = React.useState(false);
    const [userHasPledged, setUserHasPledged] = React.useState(false);

    const [isInWishlist, setIsInWishlist] = React.useState(false);
    const { toast } = useToast();
    
    const quotationQuery = useMemoFirebase(() => {
        if (!firestore || !user || !product) return null;
        return query(
            collection(firestore, 'manufacturers', product.manufacturerId, 'quotations'),
            where('buyerId', '==', user.uid),
            where('productId', '==', product.id),
            limit(1)
        );
    }, [firestore, user, product]);

    const { data: existingQuotations } = useCollection(quotationQuery);
    
    const existingQuote = React.useMemo(() => {
        if (existingQuotations && existingQuotations.length > 0) {
            return existingQuotations[0];
        }
        return null;
    }, [existingQuotations]);


    React.useEffect(() => {
        const fetchData = async () => {
            if (!firestore || !shopId || !slug) return;
            setIsLoading(true);

            // 1. Fetch Manufacturer by shopId
            const manufQuery = query(collection(firestore, 'manufacturers'), where('shopId', '==', shopId), limit(1));
            const manufSnapshot = await getDocs(manufQuery);

            if (manufSnapshot.empty) {
                setManufacturer(null);
                setProduct(null);
                setIsLoading(false);
                return;
            }
            
            const manufacturerDoc = manufSnapshot.docs[0];
            const manufacturerData = { ...manufacturerDoc.data(), id: manufacturerDoc.id } as Manufacturer;
            setManufacturer(manufacturerData);

            // 2. Fetch Product from the manufacturer's subcollection using slug
            const productQuery = query(
                collection(firestore, 'manufacturers', manufacturerData.id, 'products'),
                where('slug', '==', slug),
                limit(1)
            );
            const productSnapshot = await getDocs(productQuery);

            if (productSnapshot.empty) {
                setProduct(null);
            } else {
                const productDoc = productSnapshot.docs[0];
                const productData = { ...productDoc.data(), id: productDoc.id } as ProductWithVariants;
                setProduct(productData);

                // 2a. Check for an active forging event for this product
                const eventQuery = query(
                    collection(firestore, 'forgingEvents'),
                    where('productId', '==', productDoc.id),
                    where('status', '==', 'active'),
                    limit(1)
                );
                const eventSnapshot = await getDocs(eventQuery);
                if (!eventSnapshot.empty) {
                    const eventData = eventSnapshot.docs[0].data() as ForgingEvent;
                    setForgingEvent(eventData);

                    // Check if current user has pledged
                    if (user) {
                        const pledgeQuery = query(collection(firestore, 'pledges'), where('buyerId', '==', user.uid), where('forgingEventId', '==', eventData.id), limit(1));
                        const pledgeSnapshot = await getDocs(pledgeQuery);
                        setUserHasPledged(!pledgeSnapshot.empty);
                    }
                }

                 // 3. Fetch related products from the same category
                const relatedQuery = query(
                  collectionGroup(firestore, 'products'),
                  where('category', '==', productData.category),
                  where('status', '==', 'published'),
                  limit(5) // Fetch 5, one might be the current product
                );
                const relatedSnapshot = await getDocs(relatedQuery);
                const relatedPromises = relatedSnapshot.docs
                  .filter(doc => doc.id !== productData.id) // Exclude current product
                  .map(async doc => {
                    const data = doc.data();
                    const manufacturerId = doc.ref.parent.parent?.id;
                    if (manufacturerId) {
                      const manufDoc = await getDoc(doc.ref.parent.parent);
                      if (manufDoc.exists()) {
                        const manufData = manufDoc.data();
                        return { ...data, id: doc.id, shopId: manufData.shopId, slug: data.slug } as ProductWithVariants;
                      }
                    }
                    return null;
                  });

                const related = (await Promise.all(relatedPromises)).filter(p => p !== null) as ProductWithVariants[];
                setRelatedProducts(related.slice(0, 4));
            }
            
            setIsLoading(false);
        };

        fetchData();
    }, [firestore, shopId, slug, user]);
    
    const [mainImage, setMainImage] = React.useState<string | undefined>(product?.bannerUrl || product?.imageUrl);

    React.useEffect(() => {
        if(product && !mainImage) {
            setMainImage(product.bannerUrl || product.imageUrl);
        }
    }, [product, mainImage]);
    
    const handleWishlistToggle = () => {
        setIsInWishlist(!isInWishlist);
        toast({
            title: isInWishlist ? "Removed from Wishlist" : "Added to Wishlist",
            description: `${product?.name} has been ${isInWishlist ? 'removed from' : 'added to'} your wishlist.`,
        });
    };
    
    const productUrl = typeof window !== 'undefined' ? window.location.href : '';
    const shareText = `Check out this product on Tradinta: ${product?.name}`;
    
    const handlePledge = async () => {
        if (!user || !firestore || !forgingEvent) {
            toast({ title: 'You must be logged in to pledge.', variant: 'destructive'});
            return;
        }
        setIsPledging(true);
        try {
            await addDocumentNonBlocking(collection(firestore, 'pledges'), {
                id: nanoid(),
                forgingEventId: forgingEvent.id,
                buyerId: user.uid,
                pledgedAt: serverTimestamp(),
            });
            // Note: Cloud Function would update the count on forgingEvent
            toast({ title: "You've Pledged!", description: "You will be notified when the event ends."});
            setUserHasPledged(true);
        } catch (error: any) {
             toast({ title: 'Pledge failed', description: error.message, variant: 'destructive'});
        } finally {
            setIsPledging(false);
        }
    };


    if (isLoading) {
        return (
             <div className="container mx-auto py-12">
                 <div className="grid lg:grid-cols-3 gap-12">
                     <div className="lg:col-span-1">
                         <Skeleton className="aspect-square w-full mb-4 rounded-lg" />
                         <div className="grid grid-cols-4 gap-2">
                             <Skeleton className="aspect-square rounded-md" />
                             <Skeleton className="aspect-square rounded-md" />
                             <Skeleton className="aspect-square rounded-md" />
                             <Skeleton className="aspect-square rounded-md" />
                         </div>
                     </div>
                     <div className="lg:col-span-2 space-y-4">
                         <Skeleton className="h-10 w-3/4" />
                         <Skeleton className="h-6 w-1/2" />
                         <Skeleton className="h-24 w-full" />
                         <Skeleton className="h-24 w-full" />
                     </div>
                 </div>
             </div>
        )
    }

    if (!product || !manufacturer) {
        return (
            <div className="container mx-auto py-12 text-center">
                <h1 className="text-2xl font-bold">Product Not Found</h1>
                <p className="text-muted-foreground mt-2">The product you are looking for does not exist or may have been moved.</p>
                <Button asChild className="mt-4">
                    <Link href="/products">Back to Products</Link>
                </Button>
            </div>
        );
    }
  
  const price = product.variants?.[0]?.price;

  const images = [
    product.bannerUrl,
    product.imageUrl,
    ...(product.otherImageUrls || [])
  ].filter(Boolean) as string[];

  return (
    <div className="container mx-auto py-12">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/products">Products</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
           <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={`/products?category=${product.category}`}>{product.category}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{product.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="grid lg:grid-cols-3 gap-12">
        {/* Left Column: Image Gallery */}
        <div className="lg:col-span-1">
          <div className="relative aspect-square w-full mb-4 rounded-lg overflow-hidden">
            <Image
              src={mainImage || product.imageUrl || 'https://i.postimg.cc/j283ydft/image.png'}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-300 hover:scale-105"
            />
          </div>
          <div className="grid grid-cols-4 gap-2">
            {images.map((img, index) => (
              <div
                key={index}
                className={`relative aspect-square rounded-md overflow-hidden cursor-pointer border-2 ${mainImage === img ? 'border-primary' : 'border-transparent'}`}
                onClick={() => setMainImage(img)}
              >
                <Image
                  src={img}
                  alt={`${product.name} thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Center Column: Product Info */}
        <div className="lg:col-span-1">
          <h1 className="text-3xl font-bold font-headline mb-2">{product.name}</h1>
          <div className="flex items-center gap-4 mb-4">
             <div className="flex items-center gap-1">
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              <span className="font-bold">{product.rating}</span>
              <span className="text-sm text-muted-foreground">({product.reviewCount || 0} reviews)</span>
            </div>
            <Separator orientation="vertical" className="h-5" />
             <Badge variant="secondary" className="flex items-center gap-1">
                <ShieldCheck className="h-4 w-4 text-green-600" />
                Verified Manufacturer
            </Badge>
          </div>
          <p className="text-muted-foreground mb-4">{product.description}</p>
          
          <Card className="bg-muted/50">
            <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="text-muted-foreground">SKU</p>
                        <p className="font-semibold">{product.sku || 'N/A'}</p>
                    </div>
                     <div>
                        <p className="text-muted-foreground">Category</p>
                        <p className="font-semibold text-primary hover:underline">
                            <Link href={`/products?category=${product.category}`}>{product.category}</Link>
                        </p>
                    </div>
                    <div>
                        <p className="text-muted-foreground">Min. Order (MOQ)</p>
                        <p className="font-semibold">{product.moq || 1} Units</p>
                    </div>
                     <div>
                        <p className="text-muted-foreground">Lead Time</p>
                        <p className="font-semibold">7-14 days</p>
                    </div>
                </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Action Panel */}
        <div className="lg:col-span-1">
            <Card className="p-6">
                <p className="text-sm text-muted-foreground">Price starts from</p>
                 <p className="text-3xl font-bold mb-4">
                    {price !== undefined && price !== null ? `KES ${price.toLocaleString()}` : 'Inquire for Price'}
                </p>
                
                <div className="space-y-3">
                   {forgingEvent ? (
                      <Button size="lg" className="w-full" onClick={handlePledge} disabled={isPledging || userHasPledged}>
                        {isPledging ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
                        {userHasPledged ? "You've Pledged!" : "Pledge to Purchase"}
                      </Button>
                   ) : (
                    <RequestQuoteModal product={product}>
                        <Button size="lg" className="w-full" disabled={!!existingQuote}>
                            Request Quotation
                        </Button>
                    </RequestQuoteModal>
                   )}
                    {existingQuote && (
                        <p className="text-xs text-center text-muted-foreground">
                            You have an existing quotation for this product.{' '}
                            <Link href={`/dashboards/buyer/quotations/${existingQuote.id}`} className="font-semibold text-primary hover:underline flex items-center justify-center gap-1">
                                <Eye className="h-4 w-4" /> View Quotation
                            </Link>
                        </p>
                    )}

                    <ContactManufacturerModal product={product} manufacturer={manufacturer}>
                        <Button size="lg" variant="outline" className="w-full">
                            <MessageSquare className="mr-2 h-5 w-5"/>
                            Contact Manufacturer
                        </Button>
                    </ContactManufacturerModal>
                </div>

                <div className="flex items-center justify-center gap-4 mt-4 text-sm">
                    <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={handleWishlistToggle}>
                        <Heart className={`mr-2 h-4 w-4 ${isInWishlist ? 'fill-red-500 text-red-500' : ''}`}/> Wishlist
                    </Button>
                     <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-muted-foreground">
                                <Share2 className="mr-2 h-4 w-4"/> Share
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto">
                            <div className="flex gap-2">
                                <Button size="icon" variant="outline" asChild>
                                    <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`} target="_blank" rel="noopener noreferrer"><Facebook className="h-5 w-5 text-[#1877F2]" /></a>
                                </Button>
                                <Button size="icon" variant="outline" asChild>
                                    <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(productUrl)}&text=${encodeURIComponent(shareText)}`} target="_blank" rel="noopener noreferrer"><Twitter className="h-5 w-5 text-[#1DA1F2]" /></a>
                                </Button>
                                <Button size="icon" variant="outline" asChild>
                                     <a href={`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + productUrl)}`} target="_blank" rel="noopener noreferrer"><MessageCircle className="h-5 w-5 text-[#25D366]" /></a>
                                </Button>
                                <Button size="icon" variant="outline" asChild>
                                     <a href={`https://www.instagram.com`} target="_blank" rel="noopener noreferrer"><Instagram className="h-5 w-5 text-[#E4405F]" /></a>
                                </Button>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>
                <Separator className="my-4"/>

                <div className="space-y-2 text-center text-sm">
                    <p className="font-semibold">Accepted Payments</p>
                    <div className="flex justify-center gap-2">
                        <Badge>TradPay</Badge>
                        <Badge>Bank Transfer</Badge>
                        <Badge>LPO</Badge>
                    </div>
                </div>
                <div className="mt-4 p-3 bg-accent/20 rounded-md text-center">
                    <p className="flex items-center justify-center gap-2 text-sm font-semibold text-primary">
                        <Coins className="h-5 w-5" />
                        Earn +30 TradPoints on purchase
                    </p>
                </div>
            </Card>
        </div>
      </div>
      
      {/* Lower Section */}
      <div className="grid lg:grid-cols-3 gap-12 mt-12">
        <div className="lg:col-span-2">
            {/* Product Details Tabs */}
            <Tabs defaultValue="description">
                <TabsList>
                    <TabsTrigger value="description">Description</TabsTrigger>
                    <TabsTrigger value="specs">Specifications</TabsTrigger>
                    <TabsTrigger value="packaging">Packaging</TabsTrigger>
                    <TabsTrigger value="reviews">Reviews</TabsTrigger>
                </TabsList>
                <TabsContent value="description" className="prose prose-sm max-w-none text-muted-foreground mt-4">
                    <p>{product.description}</p>
                </TabsContent>
                <TabsContent value="specs" className="mt-4">
                     <Table>
                        <TableBody>
                            <TableRow><TableCell className="font-medium text-muted-foreground">Weight</TableCell><TableCell>{product.weight || 'N/A'}</TableCell></TableRow>
                            <TableRow><TableCell className="font-medium text-muted-foreground">Dimensions</TableCell><TableCell>{product.dimensions || 'N/A'}</TableCell></TableRow>
                            <TableRow><TableCell className="font-medium text-muted-foreground">Material</TableCell><TableCell>{product.material || 'N/A'}</TableCell></TableRow>
                            <TableRow><TableCell className="font-medium text-muted-foreground">Standards</TableCell><TableCell>{product.certifications || 'N/A'}</TableCell></TableRow>
                        </TableBody>
                    </Table>
                </TabsContent>
                 <TabsContent value="packaging" className="mt-4 text-sm text-muted-foreground">
                    <p>{product.packagingDetails || 'Standard packaging information not available.'}</p>
                </TabsContent>
                <TabsContent value="reviews" className="mt-4 space-y-6">
                    <ProductReviews product={product} />
                </TabsContent>
            </Tabs>
        </div>
        <div className="lg:col-span-1">
             {/* Manufacturer Section */}
            <Card>
                <CardHeader>
                    <CardTitle>About the Supplier</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4 mb-4">
                        <Image src={manufacturer.logoUrl || 'https://i.postimg.cc/j283ydft/image.png'} alt={manufacturer.shopName || ''} width={64} height={64} className="rounded-full" />
                        <div>
                            <h4 className="font-bold">{manufacturer.shopName}</h4>
                            <p className="text-sm text-muted-foreground">{manufacturer.location}</p>
                             <div className="flex items-center gap-1 text-sm">
                                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400"/> {manufacturer.rating} Seller Rating
                             </div>
                        </div>
                    </div>
                    <Button asChild className="w-full">
                        <Link href={`/manufacturer/${manufacturer.slug}`}>View Shop</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
      </div>

       {/* Related Products */}
      <div className="mt-16">
        <h2 className="text-3xl font-bold font-headline mb-6">You May Also Like</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {relatedProducts.map((p) => (
            <Card key={p.id} className="overflow-hidden group">
              <Link href={`/products/${p.shopId}/${p.slug}`}>
                <CardContent className="p-0">
                  <div className="relative aspect-[4/3]">
                    <Image
                      src={p.imageUrl || 'https://i.postimg.cc/j283ydft/image.png'}
                      alt={p.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                      data-ai-hint={p.imageHint}
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold truncate">{p.name}</h3>
                    <p className="text-primary font-bold">KES {p.price?.toLocaleString() || 'N/A'}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span>{p.rating || 'N/A'}</span>
                        <span>({p.reviewCount || 0})</span>
                    </div>
                  </div>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      </div>

    </div>
  );
}
