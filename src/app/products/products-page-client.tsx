
'use client';

import React, { useState, useMemo } from 'react';
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
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { RequestQuoteModal } from '@/components/request-quote-modal';
import { type Product } from '@/lib/definitions';
import { categories } from '@/app/lib/categories';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

type ProductWithShopId = Product & { shopId: string; slug: string; };

const categoryIcons: Record<string, React.ReactNode> = {
    "Industrial & Manufacturing Supplies": <Factory className="w-5 h-5" />,
    "Construction & Building Materials": <Building2 className="w-5 h-5" />,
    "Food & Beverage": <UtensilsCrossed className="w-5 h-5" />,
    "Beauty, Hygiene & Personal Care": <Sparkles className="w-5 h-5" />,
    "Cleaning & Home Care": <Home className="w-5 h-5" />,
    "Packaging, Printing & Branding": <Printer className="w-5 h-5" />,
    "Automotive & Transport Supplies": <Car className="w-5 h-5" />,
    "Office, School & Stationery Supplies": <BookOpen className="w-5 h-5" />,
    "Fashion, Textiles & Apparel": <Shirt className="w-5 h-5" />,
    "Furniture & Home Goods": <Armchair className="w-5 h-5" />,
    "Agriculture & Agri-Processing": <Sprout className="w-5 h-5" />,
    "Medical, Health & Safety": <HeartPulse className="w-5 h-5" />,
    "Energy & Utilities": <Bolt className="w-5 h-5" />,
    "Local & Small Manufacturers (Made in Kenya)": <Award className="w-5 h-5" />,
    "Services & Trade Support": <Handshake className="w-5 h-5" />,
};

export function ProductsPageClient({ initialProducts }: { initialProducts: ProductWithShopId[] }) {
  const [filters, setFilters] = useState({
    category: 'all',
    priceRange: [0, 200000],
    verified: false,
    rating: 0,
  });
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = useMemo(() => {
    return initialProducts.filter((product) => {
      return (
        (filters.category === 'all' || product.category === filters.category) &&
        product.price >= filters.priceRange[0] &&
        product.price <= filters.priceRange[1] &&
        product.rating >= filters.rating &&
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [initialProducts, filters, searchQuery]);

  const FilterSidebar = () => (
    <Card className="p-4 lg:p-6">
      <h3 className="text-lg font-bold mb-4">Filters</h3>
      <div className="space-y-6">
        <div>
          <Label className="font-semibold">Category</Label>
          <Select
            value={filters.category}
            onValueChange={(value) =>
              setFilters({ ...filters, category: value })
            }
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
        <div>
          <Label className="font-semibold">Price Range (KES)</Label>
          <Slider
            min={0}
            max={200000}
            step={1000}
            defaultValue={filters.priceRange}
            onValueChange={(value) =>
              setFilters({ ...filters, priceRange: value })
            }
          />
          <div className="flex justify-between text-sm text-muted-foreground mt-2">
            <span>{filters.priceRange[0].toLocaleString()}</span>
            <span>{filters.priceRange[1].toLocaleString()}</span>
          </div>
        </div>
        <div>
          <Label className="font-semibold">Rating</Label>
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`cursor-pointer ${
                  filters.rating >= star
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-gray-300'
                }`}
                onClick={() => setFilters({ ...filters, rating: star })}
              />
            ))}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="verified"
            checked={filters.verified}
            onCheckedChange={(checked) =>
              setFilters({ ...filters, verified: !!checked })
            }
          />
          <label
            htmlFor="verified"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Tradinta Verified
          </label>
        </div>
      </div>
    </Card>
  );

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
          <div className="flex flex-col md:flex-row gap-4 mb-6">
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
                  <SelectItem value="price-asc">Sort by: Price Low-High</SelectItem>
                  <SelectItem value="price-desc">Sort by: Price High-Low</SelectItem>
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
          
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredProducts.length > 0 ? (
                 filteredProducts.map((product) => (
                  <Card key={product.id} className="overflow-hidden group flex flex-col">
                    <div className="flex-grow">
                        <Link href={`/products/${product.shopId}/${product.slug}`}>
                            <CardContent className="p-0">
                              <div className="relative aspect-[4/3] overflow-hidden">
                                <Image
                                  src={product.imageUrl || 'https://placehold.co/600x400'}
                                  alt={product.name}
                                  fill
                                  className="object-cover group-hover:scale-105 transition-transform"
                                  data-ai-hint={product.imageHint}
                                />
                                 <Badge variant="secondary" className="absolute top-2 left-2 bg-background/80 backdrop-blur-sm">
                                  Verified Factory
                                </Badge>
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
                                        KES {product.price.toLocaleString()}
                                    </p>
                                    <div className="flex items-center gap-1">
                                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                        <span className="text-sm font-medium">{product.rating}</span>
                                        <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
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
                ))
            ) : (
                <div className="col-span-full text-center py-12">
                    <h3 className="text-lg font-semibold">No Products Found</h3>
                    <p className="text-muted-foreground">Try adjusting your search or filter criteria.</p>
                </div>
            )}
          </div>
          
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
  )
}
