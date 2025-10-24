
'use client';

import * as React from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  PlusCircle,
  MoreHorizontal,
  File,
  ListFilter,
  Search,
  Loader2,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  useUser,
  useFirestore,
  useCollection,
  useMemoFirebase,
} from '@/firebase';
import { collection, query, where, doc } from 'firebase/firestore';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

type Product = {
  id: string;
  name: string;
  imageUrl?: string;
  status: 'draft' | 'published' | 'archived';
  stock: number;
  price: number;
};

export default function SellerProductsPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const productsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(firestore, 'manufacturers', user.uid, 'products'),
      where('status', '!=', 'archived')
    );
  }, [firestore, user]);

  const {
    data: products,
    isLoading,
    error,
  } = useCollection<Product>(productsQuery);

  const handleUpdateStatus = (
    productId: string,
    status: 'draft' | 'archived'
  ) => {
    if (!user) return;
    const productRef = doc(
      firestore,
      'manufacturers',
      user.uid,
      'products',
      productId
    );
    updateDocumentNonBlocking(productRef, { status });
    toast({
      title: `Product ${status === 'draft' ? 'Unpublished' : 'Deleted'}`,
      description: `The product has been moved to ${
        status === 'draft' ? 'drafts' : 'archives'
      }.`,
    });
  };

  const getStatusVariant = (status: Product['status']) => {
    switch (status) {
      case 'published':
        return 'secondary';
      case 'draft':
        return 'outline';
      default:
        return 'destructive';
    }
  };

  const renderProductRows = (productData: Product[] | null) => {
    if (isLoading) {
      return Array.from({ length: 3 }).map((_, i) => (
        <TableRow key={`skl-${i}`}>
          <TableCell className="hidden sm:table-cell">
            <Skeleton className="h-16 w-16 rounded-md" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-6 w-48" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-6 w-20" />
          </TableCell>
          <TableCell className="hidden md:table-cell">
            <Skeleton className="h-6 w-16" />
          </TableCell>
          <TableCell className="hidden md:table-cell">
            <Skeleton className="h-6 w-24" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-8 w-8" />
          </TableCell>
        </TableRow>
      ));
    }

    if (!productData || productData.length === 0) {
        return (
            <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                    No products found. Get started by adding a new product.
                </TableCell>
            </TableRow>
        )
    }

    return productData.map((product) => (
      <TableRow key={product.id}>
        <TableCell className="hidden sm:table-cell">
          <Image
            alt={product.name}
            className="aspect-square rounded-md object-cover"
            height="64"
            src={product.imageUrl || 'https://placehold.co/64x64'}
            width="64"
          />
        </TableCell>
        <TableCell className="font-medium">
          <p className="line-clamp-2">{product.name}</p>
        </TableCell>
        <TableCell>
          <Badge variant={getStatusVariant(product.status)}>
            {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
          </Badge>
        </TableCell>
        <TableCell className="hidden md:table-cell">{product.stock}</TableCell>
        <TableCell className="hidden md:table-cell">
          KES {product.price?.toLocaleString() || '0'}
        </TableCell>
        <TableCell>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button aria-haspopup="true" size="icon" variant="ghost">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link
                  href={`/dashboards/seller-centre/products/edit/${product.id}`}
                >
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleUpdateStatus(product.id, 'draft')}
                disabled={product.status === 'draft'}
              >
                Unpublish
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => handleUpdateStatus(product.id, 'archived')}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
    ));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle>My Products</CardTitle>
            <CardDescription>
              Manage your product catalog, inventory, and pricing.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <File className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button asChild>
              <Link href="/dashboards/seller-centre/products/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Product
              </Link>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="published">Published</TabsTrigger>
              <TabsTrigger value="draft">Drafts</TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search products..." className="pl-8" />
              </div>
              <Button variant="outline" size="sm" className="gap-1">
                <ListFilter className="h-3.5 w-3.5" />
                <span>Filter</span>
              </Button>
            </div>
          </div>
          <TabsContent value="all">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px] hidden sm:table-cell"></TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Stock</TableHead>
                  <TableHead className="hidden md:table-cell">Price</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>{renderProductRows(products)}</TableBody>
            </Table>
          </TabsContent>
          <TabsContent value="published">
             <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px] hidden sm:table-cell"></TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Stock</TableHead>
                  <TableHead className="hidden md:table-cell">Price</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>{renderProductRows(products?.filter(p => p.status === 'published') || null)}</TableBody>
            </Table>
          </TabsContent>
          <TabsContent value="draft">
             <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px] hidden sm:table-cell"></TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Stock</TableHead>
                  <TableHead className="hidden md:table-cell">Price</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>{renderProductRows(products?.filter(p => p.status === 'draft') || null)}</TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
