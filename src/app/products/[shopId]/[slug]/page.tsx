
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
import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, where, limit, getDocs, doc } from 'firebase/firestore';
import { type Manufacturer, type Review, type Product } from '@/app/lib/definitions';
import { Skeleton } from '@/components/ui/skeleton';
import { products } from '@/lib/mock-data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ContactManufacturerModal } from '@/components/contact-manufacturer-modal';

type ProductWithVariants = Product & {
    variants: { price: number }[];
    otherImageUrls?: string[];
    bannerUrl?: string;
    moq?: number;
    weight?: string;
    dimensions?: string;
    material?: string;
    packagingDetails?: string;
    sku?: string;
};


const relatedProducts = products.slice(1, 5);

export default function ProductDetailPage() {
    const params = useParams();
    const shopId = params.shopId as string;
    const slug = params.slug as string;
    const { user } = useUser();
    const firestore = useFirestore();

    const [product, setProduct] = React.useState<ProductWithVariants | null>(null);
    const [manufacturer, setManufacturer] = React.useState<Manufacturer | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isInWishlist, setIsInWishlist] = React.useState(false);
    const { toast } = useToast();
    
    // Check if a quotation has already been requested for this product by this user
    const quotationQuery = useMemoFirebase(() => {
        if (!firestore || !user || !product) return null;
        // We query the manufacturer's subcollection for a quote from the current buyer for this product
        return query(
            collection(firestore, 'manufacturers', product.manufacturerId, 'quotations'),
            where('buyerId', '==', user.uid),
            where('productId', '==', product.id),
            limit(1)
        );
    }, [firestore, user, product]);

    const { data: existingQuotations } = useCollection(quotationQuery);
    
    const existingQuote = useMemo(() => {
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
                setProduct({ ...productDoc.data(), id: productDoc.id } as ProductWithVariants);
            }
            
            setIsLoading(false);
        };

        fetchData();
    }, [firestore, shopId, slug]);
    
    const [mainImage, setMainImage] = React.useState<string | undefined>(product?.bannerUrl || product?.imageUrl);

    React.useEffect(() => {
        if(product && !mainImage) {
            setMainImage(product.bannerUrl || product.imageUrl);
        }
    }, [product, mainImage]);

    const reviewsQuery = useMemoFirebase(() => {
        if (!firestore || !product) return null;
        return query(
            collection(firestore, 'reviews'),
            where('productId', '==', product.id),
            where('status', '==', 'approved')
        );
    }, [firestore, product]);

    const { data: reviews, isLoading: isLoadingReviews } = useCollection<Review>(reviewsQuery);
    
    const handleWishlistToggle = () => {
        setIsInWishlist(!isInWishlist);
        toast({
            title: isInWishlist ? "Removed from Wishlist" : "Added to Wishlist",
            description: `${product?.name} has been ${isInWishlist ? 'removed from' : 'added to'} your wishlist.`,
        });
    };
    
    const productUrl = typeof window !== 'undefined' ? window.location.href : '';
    const shareText = `Check out this product on Tradinta: ${product?.name}`;


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
              <span className="text-sm text-muted-foreground">({product.reviewCount} reviews)</span>
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
                    {existingQuote ? (
                        <Button size="lg" className="w-full" asChild>
                            <Link href={`/dashboards/buyer/quotations/${existingQuote.id}`}>
                                <FileText className="mr-2 h-5 w-5" />
                                View My Quotation
                            </Link>
                        </Button>
                    ) : (
                        <RequestQuoteModal product={product}>
                            <Button size="lg" className="w-full">Request Quotation</Button>
                        </RequestQuoteModal>
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
                    <TabsTrigger value="reviews">Reviews ({reviews?.length || 0})</TabsTrigger>
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
                <TabsContent value="reviews" className="mt-4">
                     <CardContent className="space-y-4">
                            {isLoadingReviews ? (
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
                        </CardContent>
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
              <Link href={`/products/${p.manufacturerId}/${p.slug}`}>
                <CardContent className="p-0">
                  <div className="relative aspect-[4/3]">
                    <Image
                      src={p.imageUrl}
                      alt={p.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                      data-ai-hint={p.imageHint}
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold truncate">{p.name}</h3>
                    <p className="text-primary font-bold">KES {p.price.toLocaleString()}</p>
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
