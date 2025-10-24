
'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { products as allProducts, manufacturers } from '@/app/lib/mock-data';
import {
  Star,
  ShieldCheck,
  Globe,
  Mail,
  Phone,
  MessageSquare,
  Building,
  Users,
  Calendar,
  CheckCircle,
  Truck,
  Banknote,
  Search,
  ListFilter
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
import { Input } from '@/components/ui/input';

export default function ManufacturerPage({ params }: { params: { shopId: string } }) {
  const manufacturer = manufacturers.find((m) => m.shopId === params.shopId);

  if (!manufacturer) {
    notFound();
  }

  const manufacturerProducts = allProducts.filter(
    (p) => p.manufacturerId === manufacturer.id
  );

  return (
    <div className="bg-muted/20">
      {/* Hero Section */}
      <div className="relative h-48 md:h-64 w-full">
        <Image
          src={manufacturer.coverImageUrl}
          alt={`${manufacturer.name} cover image`}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
      </div>
      <div className="container -mt-16 md:-mt-24 pb-12">
        <div className="flex flex-col md:flex-row items-start gap-6">
          <div className="relative flex-shrink-0">
            <Image
              src={manufacturer.logoUrl}
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
                        <h1 className="text-3xl font-bold font-headline">{manufacturer.name}</h1>
                        {manufacturer.isVerified && <ShieldCheck className="h-7 w-7 text-green-500" />}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground mt-1">
                        <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                            <span>{manufacturer.rating} Seller Rating</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Building className="w-4 h-4" />
                            <span>{manufacturer.industry}</span>
                        </div>
                         <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>Member since {manufacturer.memberSince}</span>
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
                <TabsTrigger value="reviews">Reviews ({manufacturer.reviews.length})</TabsTrigger>
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
                            {manufacturerProducts.map((product) => (
                                <Card key={product.id} className="overflow-hidden group">
                                    <Link href={`/products/${manufacturer.shopId}/${product.slug}`}>
                                    <CardContent className="p-0">
                                    <div className="relative aspect-[4/3] overflow-hidden">
                                        <Image
                                        src={product.imageUrl}
                                        alt={product.name}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform"
                                        data-ai-hint={product.imageHint}
                                        />
                                    </div>
                                    <div className="p-4 space-y-1">
                                        <h3 className="font-semibold leading-tight h-10 truncate">{product.name}</h3>
                                        <p className="text-primary font-bold text-lg">KES {product.price.toLocaleString()}</p>
                                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                            <span>{product.rating}</span>
                                            <span>({product.reviewCount})</span>
                                        </div>
                                    </div>
                                    </CardContent>
                                    </Link>
                                    <div className="p-4 pt-0">
                                        <Button className="w-full">Request Quote</Button>
                                    </div>
                                </Card>
                            ))}
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
                                     <p><strong>Business Type:</strong> {manufacturer.businessType}</p>
                                     <p><strong>Location:</strong> {manufacturer.location}</p>
                                     <p><strong>Workforce:</strong> {manufacturer.workforceSize}</p>
                                     <p><strong>Main Export Markets:</strong> {manufacturer.exportMarkets.join(', ')}</p>
                                </CardContent>
                            </Card>
                             <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Certifications</CardTitle>
                                </CardHeader>
                                <CardContent className="text-sm space-y-2">
                                    {manufacturer.certifications.map(cert => (
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
                            <CardContent>{manufacturer.paymentMethods.join(', ')}</CardContent>
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
                                <p>{manufacturer.deliveryTerms.join(', ')}</p>
                                <p className="text-sm text-muted-foreground">Lead time: {manufacturer.leadTime}</p>
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
                                <p>Capacity: {manufacturer.productionCapacity}</p>
                                <p className="text-sm text-muted-foreground">Min. Order: {manufacturer.moq} units</p>
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
                        {manufacturer.reviews.map(review => (
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
                        {manufacturer.reviews.length === 0 && (
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
