
'use client';

import React, from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { products as allProducts, manufacturers } from '@/app/lib/mock-data';
import { notFound, useParams } from 'next/navigation';
import {
  Star,
  ShieldCheck,
  Truck,
  MessageSquare,
  Heart,
  Coins,
  Share2,
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
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, limit, getDocs } from 'firebase/firestore';
import { type Product } from '@/lib/definitions';
import { Skeleton } from '@/components/ui/skeleton';

const relatedProducts = allProducts.slice(1, 5); // This should be replaced with real data logic

export default function ProductDetailPage() {
    const params = useParams();
    const shopId = params.shopId as string;
    const slug = params.slug as string;
    const firestore = useFirestore();

    const [product, setProduct] = React.useState<Product | null>(null);
    const [manufacturer, setManufacturer] = React.useState<typeof manufacturers[0] | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchData = async () => {
            if (!firestore || !shopId || !slug) return;
            setIsLoading(true);

            // 1. Find the manufacturer UID using the shopId
            const manufQuery = query(collection(firestore, 'manufacturers'), where('shopId', '==', shopId), limit(1));
            const manufSnapshot = await getDocs(manufQuery);

            if (manufSnapshot.empty) {
                setIsLoading(false);
                return;
            }

            const manufacturerDoc = manufSnapshot.docs[0];
            const manufacturerData = { ...manufacturerDoc.data(), id: manufacturerDoc.id } as typeof manufacturers[0];
            setManufacturer(manufacturerData);

            // 2. Find the product using the manufacturer UID and slug
            const productQuery = query(
                collection(firestore, 'manufacturers', manufacturerDoc.id, 'products'),
                where('slug', '==', slug),
                limit(1)
            );
            const productSnapshot = await getDocs(productQuery);

            if (!productSnapshot.empty) {
                const productDoc = productSnapshot.docs[0];
                setProduct({ ...productDoc.data(), id: productDoc.id } as Product);
            }
            
            setIsLoading(false);
        };

        fetchData();
    }, [firestore, shopId, slug]);
    
    const [mainImage, setMainImage] = React.useState<string | undefined>(product?.imageUrl);

    React.useEffect(() => {
        if(product && !mainImage) {
            setMainImage(product.imageUrl);
        }
    }, [product, mainImage]);

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
        return notFound();
    }

  const images = [
    product.imageUrl,
    'https://picsum.photos/seed/product-gallery1/600/400',
    'https://picsum.photos/seed/product-gallery2/600/400',
    'https://picsum.photos/seed/product-gallery3/600/400',
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
              src={mainImage || product.imageUrl}
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
                        <p className="font-semibold">PROD-{product.id.substring(0, 4).toUpperCase()}</p>
                    </div>
                     <div>
                        <p className="text-muted-foreground">Category</p>
                        <p className="font-semibold text-primary hover:underline">
                            <Link href={`/products?category=${product.category}`}>{product.category}</Link>
                        </p>
                    </div>
                    <div>
                        <p className="text-muted-foreground">Min. Order (MOQ)</p>
                        <p className="font-semibold">50 Units</p>
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
                <p className="text-3xl font-bold mb-4">KES {product.price.toLocaleString()}</p>
                
                <div className="space-y-3">
                    <RequestQuoteModal product={product}>
                        <Button size="lg" className="w-full">Request Quotation</Button>
                    </RequestQuoteModal>
                    <Button size="lg" variant="outline" className="w-full">
                        <MessageSquare className="mr-2 h-5 w-5"/>
                        Contact Manufacturer
                    </Button>
                </div>

                <div className="flex items-center justify-center gap-4 mt-4 text-sm">
                    <Button variant="ghost" size="sm" className="text-muted-foreground">
                        <Heart className="mr-2 h-4 w-4"/> Wishlist
                    </Button>
                    <Button variant="ghost" size="sm" className="text-muted-foreground">
                        <Share2 className="mr-2 h-4 w-4"/> Share
                    </Button>
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
                    <TabsTrigger value="reviews">Reviews ({product.reviewCount})</TabsTrigger>
                </TabsList>
                <TabsContent value="description" className="prose prose-sm max-w-none text-muted-foreground mt-4">
                    <p>{product.description}</p>
                    <p>This industrial-grade cement is manufactured to the highest standards, ensuring optimal performance for all your construction needs. It provides excellent strength and durability for foundations, columns, beams, and slabs. Our automated production process guarantees consistency in every bag.</p>
                </TabsContent>
                <TabsContent value="specs" className="mt-4">
                     <Table>
                        <TableBody>
                            <TableRow><TableCell className="font-medium text-muted-foreground">Weight</TableCell><TableCell>50kg per bag</TableCell></TableRow>
                            <TableRow><TableCell className="font-medium text-muted-foreground">Dimensions</TableCell><TableCell>80cm x 50cm x 15cm</TableCell></TableRow>
                            <TableRow><TableCell className="font-medium text-muted-foreground">Material</TableCell><TableCell>Portland Cement Type I</TableCell></TableRow>
                            <TableRow><TableCell className="font-medium text-muted-foreground">Standards</TableCell><TableCell>KEBS Certified, ASTM C150</TableCell></TableRow>
                        </TableBody>
                    </Table>
                </TabsContent>
                 <TabsContent value="packaging" className="mt-4 text-sm text-muted-foreground">
                    <p>Packed in durable, multi-wall paper bags with a moisture-resistant barrier to ensure product integrity during transport and storage. Each pallet contains 40 bags (2 metric tons), securely shrink-wrapped for stability.</p>
                </TabsContent>
                <TabsContent value="reviews" className="mt-4">
                    <h3 className="text-lg font-bold">Customer Reviews</h3>
                    {/* Placeholder for reviews */}
                    <div className="border-t mt-4 pt-4">
                        <div className="flex gap-2 items-center mb-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400"/>
                             <Star className="w-4 h-4 text-yellow-400 fill-yellow-400"/>
                              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400"/>
                               <Star className="w-4 h-4 text-yellow-400 fill-yellow-400"/>
                                <Star className="w-4 h-4 text-gray-300"/>
                        </div>
                        <p className="font-semibold">Great value for bulk orders.</p>
                        <p className="text-sm text-muted-foreground">"The quality is consistent and delivery was on time." - John D. on 24 Oct 2023</p>
                    </div>
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
                        <Image src={manufacturer.logoUrl} alt={manufacturer.name} width={64} height={64} className="rounded-full" />
                        <div>
                            <h4 className="font-bold">{manufacturer.name}</h4>
                            <p className="text-sm text-muted-foreground">{manufacturer.location}</p>
                             <div className="flex items-center gap-1 text-sm">
                                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400"/> {manufacturer.rating} Seller Rating
                             </div>
                        </div>
                    </div>
                    <Button asChild className="w-full">
                        <Link href={`/manufacturer/${manufacturer.id}`}>View Shop</Link>
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
