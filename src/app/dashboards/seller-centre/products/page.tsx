
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
  DropdownMenuCheckboxItem,
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

  const [activeTab, setActiveTab] = React.useState('all');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [stockFilter, setStockFilter] = React.useState<'all' | 'inStock' | 'outOfStock'>('all');

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

  const filteredProducts = React.useMemo(() => {
    if (!products) return null;

    return products
      .filter((product) => {
        // Tab filter
        if (activeTab === 'all') return true;
        return product.status === activeTab;
      })
      .filter((product) => {
        // Search filter
        return product.name.toLowerCase().includes(searchQuery.toLowerCase());
      })
      .filter((product) => {
        // Stock filter
        if (stockFilter === 'all') return true;
        if (stockFilter === 'inStock') return product.stock > 0;
        if (stockFilter === 'outOfStock') return product.stock === 0;
        return true;
      });
  }, [products, activeTab, searchQuery, stockFilter]);

  const exportToCsv = () => {
    if (!filteredProducts || filteredProducts.length === 0) {
      toast({
        title: "No products to export",
        description: "There are no products in the current view to export.",
        variant: "destructive"
      });
      return;
    }
    const headers = ['ID', 'Name', 'Status', 'Stock', 'Price (KES)'];
    const rows = filteredProducts.map(p => 
      [p.id, `"${p.name.replace(/"/g, '""')}"`, p.status, p.stock, p.price].join(',')
    );

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "products.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: "Export successful", description: "Your products have been downloaded as products.csv."});
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
            No products found. Try adjusting your filters.
          </TableCell>
        </TableRow>
      );
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
        <TableCell className="hidden md:table-cell">{product.stock > 0 ? product.stock : <Badge variant="destructive">Out of Stock</Badge>}</TableCell>
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

  const productTable = (
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
        <TableBody>{renderProductRows(filteredProducts)}</TableBody>
      </Table>
  );

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
            <Button variant="outline" size="sm" onClick={exportToCsv}>
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
        <Tabs defaultValue="all" onValueChange={setActiveTab}>
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="published">Published</TabsTrigger>
              <TabsTrigger value="draft">Drafts</TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search products..." className="pl-8" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1">
                    <ListFilter className="h-3.5 w-3.5" />
                    <span>Filter</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Filter by Stock</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuCheckboxItem
                    checked={stockFilter === 'all'}
                    onCheckedChange={() => setStockFilter('all')}
                  >
                    All
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={stockFilter === 'inStock'}
                    onCheckedChange={() => setStockFilter('inStock')}
                  >
                    In Stock
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={stockFilter === 'outOfStock'}
                    onCheckedChange={() => setStockFilter('outOfStock')}
                  >
                    Out of Stock
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <TabsContent value="all">
            {productTable}
          </TabsContent>
          <TabsContent value="published">
             {productTable}
          </TabsContent>
          <TabsContent value="draft">
             {productTable}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
