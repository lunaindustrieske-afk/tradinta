
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  ListFilter,
  Search,
  Star,
  Factory,
  Building2,
  UtensilsCrossed,
  Sparkles,
  Home,
  Printer,
  Car,
  BookOpen,
  Shirt,
  Armchair,
  Sprout,
  HeartPulse,
  Bolt,
  Award,
  Handshake,
  RefreshCw,
  ShieldCheck,
  Building,
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { RequestQuoteModal } from '@/components/request-quote-modal';
import { type Product, type Manufacturer } from '@/lib/definitions';
import { categories } from '@/app/lib/categories';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { getAllProducts } from '@/app/lib/data';
import { Skeleton } from '@/components/ui/skeleton';
import { manufacturers as mockManufacturers } from '@/app/lib/mock-data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '../ui/separator';

type ProductWithShopId = Product & {
  shopId: string;
  slug: string;
  variants: { price: number }[];
  isVerified?: boolean;
  isSponsored?: boolean; // Added for marketing
};

const categoryIcons: Record<string, React.ReactNode> = {
  'Industrial & Manufacturing Supplies': <Factory className="w-5 h-5" />,
  'Construction & Building Materials': <Building2 className="w-5 h-5" />,
  'Food & Beverage': <UtensilsCrossed className="w-5 h-5" />,
  'Beauty, Hygiene & Personal Care': <Sparkles className="w-5 h-5" />,
  'Cleaning & Home Care': <Home className="w-5 h-5" />,
  'Packaging, Printing & Branding': <Printer className="w-5 h-5" />,
  'Automotive & Transport Supplies': <Car className="w-5 h-5" />,
  'Office, School & Stationery Supplies': <BookOpen className="w-5 h-5" />,
  'Fashion, Textiles & Apparel': <Shirt className="w-5 h-5" />,
  'Furniture & Home Goods': <Armchair className="w-5 h-5" />,
  'Agriculture & Agri-Processing': <Sprout className="w-5 h-5" />,
  'Medical, Health & Safety': <HeartPulse className="w-5 h-5" />,
  'Energy & Utilities': <Bolt className="w-5 h-5" />,
  'Local & Small Manufacturers (Made in Kenya)': <Award className="w-5 h-5" />,
  'Services & Trade Support': <Handshake className="w-5 h-5" />,
};

export function ProductsPageClient({
  initialProducts,
}: {
  initialProducts: ProductWithShopId[];
}) {
  const [allProducts, setAllProducts] =
    useState<ProductWithShopId[]>(initialProducts);
  const [allManufacturers, setAllManufacturers] =
    useState<Manufacturer[]>(mockManufacturers);
  const [isLoading, setIsLoading] = useState(false);

  const [filters, setFilters] = useState({
    category: 'all',
  });
  const [searchQuery, setSearchQuery] = useState('');

  const fetchProducts = async () => {
    setIsLoading(true);
    const products = await getAllProducts();
    setAllProducts(products);
    setIsLoading(false);
  };

  const { filteredProducts, filteredManufacturers } = useMemo(() => {
    if (!allProducts || !allManufacturers)
      return { filteredProducts: [], filteredManufacturers: [] };

    let products = allProducts.filter((product) => {
      const matchesCategory =
        filters.category === 'all' || product.category === filters.category;
      const matchesSearch =
        searchQuery === '' ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
    
    let manufacturers = allManufacturers.filter(mfg => {
        const matchesSearch = searchQuery === '' || 
            mfg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            mfg.industry.toLowerCase().includes(searchQuery.toLowerCase());
        
        return matchesSearch;
    });

    // Prioritize sponsored items
    products.sort((a, b) => {
      if (a.isSponsored && !b.isSponsored) return -1;
      if (!a.isSponsored && b.isSponsored) return 1;
      return 0;
    });
    
    // Similarly, you can add `isSponsored` to manufacturers later
    // manufacturers.sort((a, b) => ...);

    return { filteredProducts: products.slice(0, 10), filteredManufacturers: manufacturers };
  }, [allProducts, allManufacturers, filters, searchQuery]);

  const FilterSidebar = () => (
    <Card className="p-4 lg:p-6">
      <h3 className="text-lg font-bold mb-4">Filters</h3>
      <div className="space-y-6">
        <div>
          <Label className="font-semibold">Category</Label>
          <Select
            value={filters.category}
            onValueChange={(value) => setFilters({ ...filters, category: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.name} value={cat.name}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </Card>
  );

  const ProductGrid = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-5 w-1/2" />
            </div>
          ))}
        </div>
      );
    }
    
    if (filteredProducts.length === 0) return null;

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredProducts.map((product) => {
          const price = product.variants?.[0]?.price ?? 0;
          return (
            <Card
              key={product.id}
              className="overflow-hidden group flex flex-col"
            >
              <div className="flex-grow">
                <Link href={`/products/${product.shopId}/${product.slug}`}>
                  <CardContent className="p-0">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <Image
                        src={
                          product.imageUrl ||
                          'https://i.postimg.cc/j283ydft/image.png'
                        }
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                        data-ai-hint={product.imageHint}
                      />
                      {product.isSponsored && (
                        <Badge
                          variant="destructive"
                          className="absolute top-2 left-2"
                        >
                          Sponsored
                        </Badge>
                      )}
                      {product.isVerified && !product.isSponsored && (
                        <Badge
                          variant="secondary"
                          className="absolute top-2 left-2 bg-background/80 backdrop-blur-sm flex items-center gap-1"
                        >
                          <ShieldCheck className="h-4 w-4 text-green-600" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    <div className="p-4 space-y-2">
                      <CardTitle className="text-lg leading-tight h-10">
                        {product.name}
                      </CardTitle>
                      <CardDescription className="text-sm">
                        From a trusted supplier in{' '}
                        <span className="font-semibold text-primary">
                          {product.category}
                        </span>
                      </CardDescription>
                      <div className="flex items-baseline justify-between">
                        <p className="text-xl font-bold text-foreground">
                          {price > 0
                            ? `KES ${price.toLocaleString()}`
                            : 'Inquire for Price'}
                        </p>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                          <span className="text-sm font-medium">
                            {product.rating}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            ({product.reviewCount})
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Link>
              </div>
              <div className="p-4 pt-0">
                <RequestQuoteModal product={product}>
                  <Button className="w-full mt-2">Request Quotation</Button>
                </RequestQuoteModal>
              </div>
            </Card>
          );
        })}
      </div>
    );
  };
  
  const ManufacturerList = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="space-y-2 flex-grow">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      );
    }
    
    if(filteredManufacturers.length === 0) return null;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {filteredManufacturers.map(mfg => (
                <Card key={mfg.id} className="hover:shadow-lg transition-shadow">
                    <Link href={`/manufacturer/${mfg.slug}`}>
                        <CardContent className="p-4 flex items-center gap-4">
                            <Avatar className="h-16 w-16 border">
                                <AvatarImage src={mfg.logoUrl} alt={mfg.name} />
                                <AvatarFallback>{mfg.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-grow">
                                <h3 className="font-bold">{mfg.name}</h3>
                                <p className="text-sm text-muted-foreground">{mfg.industry}</p>
                                <div className="flex items-center gap-1 mt-1 text-sm">
                                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                    <span>{mfg.rating}</span>
                                </div>
                            </div>
                            {mfg.isVerified && <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm flex items-center gap-1">
                                <ShieldCheck className="h-4 w-4 text-green-600" /> Verified
                            </Badge>}
                        </CardContent>
                    </Link>
                </Card>
            ))}
        </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-4xl font-bold font-headline mb-2">
          Tradinta Marketplace
        </h1>
        <p className="text-muted-foreground">
          Source directly from Africa’s top manufacturers.
        </p>
      </div>

      <div className="sticky top-14 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-4 -mx-4 px-4 border-b">
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex w-max space-x-2">
            <Button
              variant={filters.category === 'all' ? 'default' : 'outline'}
              className="rounded-full"
              onClick={() => setFilters({ ...filters, category: 'all' })}
            >
              All Categories
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat.name}
                variant={filters.category === cat.name ? 'default' : 'outline'}
                className="rounded-full"
                onClick={() => setFilters({ ...filters, category: cat.name })}
              >
                {categoryIcons[cat.name]}
                <span className="ml-2">{cat.name}</span>
              </Button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      <div className="grid lg:grid-cols-4 gap-8 mt-6">
        <div className="hidden lg:block lg:col-span-1">
          <FilterSidebar />
        </div>

        <div className="lg:col-span-3">
          <div className="mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search for products or manufacturers..."
                  className="pl-10 text-base"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <Select defaultValue="relevance">
                  <SelectTrigger className="w-full md:w-auto">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Sort by: Relevance</SelectItem>
                    <SelectItem value="newest">Sort by: Newest</SelectItem>
                    <SelectItem value="price-asc">
                      Sort by: Price Low-High
                    </SelectItem>
                    <SelectItem value="price-desc">
                      Sort by: Price High-Low
                    </SelectItem>
                  </SelectContent>
                </Select>
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="lg:hidden">
                      <ListFilter className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left">
                    <FilterSidebar />
                  </SheetContent>
                </Sheet>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 text-muted-foreground"
              onClick={fetchProducts}
              disabled={isLoading}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
              />
              {isLoading ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
          
          <div className="space-y-12">
            <div>
              <h2 className="text-2xl font-bold font-headline mb-4 flex items-center gap-2">
                <Search className="w-6 h-6" /> Product Results
              </h2>
              <ProductGrid />
            </div>

            <Separator />
            
            <div>
              <h2 className="text-2xl font-bold font-headline mb-4 flex items-center gap-2">
                <Building className="w-6 h-6" /> Manufacturer Results
              </h2>
              <ManufacturerList />
            </div>
          </div>
          
          {filteredProducts.length === 0 && filteredManufacturers.length === 0 && (
             <div className="col-span-full text-center py-12 bg-muted/50 rounded-lg">
                <h3 className="text-lg font-semibold">No Results Found</h3>
                <p className="text-muted-foreground mt-2">
                    Try adjusting your search or filter criteria.
                </p>
            </div>
          )}


          <div className="mt-8">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href="#" />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#" isActive>
                    1
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">2</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext href="#" />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      </div>
    </div>
  );
}
