
'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
    Package, 
    ShoppingCart, 
    FileText, "use client";

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
    if (!user || !firestore) return null;
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
    Star, 
    DollarSign, 
    ArrowRight,
    Lock,
    Banknote,
    MessageSquare,
    Info,
    CheckCircle,
    Clock,
    AlertTriangle,
    ShieldCheck,
    Loader2
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useDoc, useUser, useFirestore, useMemoFirebase, useCollection } from "@/firebase";
import { doc, collectionGroup, query, where, orderBy, limit } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import type { Review } from "@/app/lib/definitions";
import { formatDistanceToNow } from 'date-fns';
import { PermissionDenied } from '@/components/ui/permission-denied';

const products = [
    { id: 'PROD-001', name: 'Industrial Grade Cement', stock: 1200, status: 'Live' },
    { id: 'PROD-003', name: 'HDPE Plastic Pellets', stock: 0, status: 'Out of Stock' },
    { id: 'PROD-004', name: 'Recycled Kraft Paper Rolls', stock: 300, status: 'Live' },
];

const orders = [
    { id: 'ORD-006', customer: 'BuildRight Const.', total: 450000, status: 'Pending Fulfillment' },
    { id: 'ORD-008', customer: 'Yum Foods', total: 66000, status: 'Shipped' },
];

type VerificationStatus = 'Unsubmitted' | 'Pending Legal' | 'Pending Admin' | 'Action Required' | 'Verified';

const statusInfo: Record<VerificationStatus, {
    icon: React.ReactNode;
    title: string;
    description: string;
    badgeVariant: "secondary" | "default" | "destructive" | "outline";
}> = {
    'Unsubmitted': {
        icon: <Info className="h-8 w-8 text-muted-foreground" />,
        title: "Profile Incomplete",
        description: "Complete your shop profile and submit verification documents to start selling.",
        badgeVariant: "outline",
    },
    'Pending Legal': {
        icon: <Clock className="h-8 w-8 text-yellow-500" />,
        title: "Pending Legal & Compliance Review",
        description: "Your business documents are being reviewed. This usually takes 2-3 business days.",
        badgeVariant: "default",
    },
    'Pending Admin': {
        icon: <Clock className="h-8 w-8 text-blue-500" />,
        title: "Pending Admin Approval",
        description: "Your documents are approved. Final review of your shop profile is in progress.",
        badgeVariant: "default",
    },
    'Action Required': {
        icon: <AlertTriangle className="h-8 w-8 text-destructive" />,
        title: "Action Required",
        description: "There was an issue with your submission. Please check your email for details and resubmit.",
        badgeVariant: "destructive",
    },
    'Verified': {
        icon: <ShieldCheck className="h-8 w-8 text-green-500" />,
        title: "Shop Verified",
        description: "Congratulations! Your shop is live and visible to all buyers on Tradinta.",
        badgeVariant: "secondary",
    }
};

const VerificationStatusCard = ({ manufacturerId }: { manufacturerId: string }) => {
    const firestore = useFirestore();
    const manufacturerDocRef = useMemoFirebase(() => {
        if (!firestore || !manufacturerId) return null;
        return doc(firestore, 'manufacturers', manufacturerId);
    }, [firestore, manufacturerId]);

    const { data: manufacturer, isLoading } = useDoc<{ verificationStatus?: VerificationStatus }>(manufacturerDocRef);
    
    if (isLoading) {
        return <Skeleton className="h-32" />
    }

    const status = manufacturer?.verificationStatus || 'Unsubmitted';
    const currentStatusInfo = statusInfo[status];

    return (
        <Card>
            <CardHeader>
                <CardTitle>Verification Status</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-4">
                {currentStatusInfo.icon}
                <div>
                    <Badge variant={currentStatusInfo.badgeVariant} className="mb-2">{currentStatusInfo.title}</Badge>
                    <p className="text-sm text-muted-foreground">{currentStatusInfo.description}</p>
                </div>
            </CardContent>
            <CardFooter>
                 <Button asChild variant="secondary" className="w-full">
                    <Link href="/dashboards/seller-centre/profile">
                        {status === 'Verified' ? 'View Profile' : 'Update Profile & Documents'}
                    </Link>
                 </Button>
            </CardFooter>
        </Card>
    );
};


function SellerDashboardContent() {
    const { user } = useUser();
    const firestore = useFirestore();

    const reviewsQuery = useMemoFirebase(() => {
        if (!firestore || !user?.uid) return null;
        // Query all 'reviews' collection groups where the manufacturerId matches
        return query(
            collectionGroup(firestore, 'reviews'), 
            where('manufacturerId', '==', user.uid),
            orderBy('createdAt', 'desc'),
            limit(5)
        );
    }, [firestore, user]);

    const { data: reviews, isLoading: isLoadingReviews } = useCollection<Review>(reviewsQuery);


    return (
        <div className="space-y-6">
             <Card>
                <CardHeader>
                    <CardTitle>Constructa Ltd. Shop Dashboard</CardTitle>
                    <CardDescription>Your central hub for managing your shop, products, and orders.</CardDescription>
                </CardHeader>
            </Card>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">KES 1,250,000</div>
                        <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+12</div>
                        <p className="text-xs text-muted-foreground">+5 from yesterday</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Quotes</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">5</div>
                        <p className="text-xs text-muted-foreground">2 new RFQs today</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Shop Rating</CardTitle>
                        <Star className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">4.8 / 5.0</div>
                        <p className="text-xs text-muted-foreground">From 150 reviews</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Recent Orders */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Recent Orders</CardTitle>
                            <Button variant="ghost" size="sm">View All</Button>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Order ID</TableHead>
                                        <TableHead>Customer</TableHead>
                                        <TableHead>Total</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {orders.map((order) => (
                                        <TableRow key={order.id}>
                                            <TableCell className="font-medium">{order.id}</TableCell>
                                            <TableCell>{order.customer}</TableCell>
                                            <TableCell>KES {order.total.toLocaleString()}</TableCell>
                                            <TableCell><Badge variant={order.status === 'Shipped' ? 'secondary' : 'default'}>{order.status}</Badge></TableCell>
                                            <TableCell><Button size="sm">View Order</Button></TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {/* Recent Reviews */}
                     <Card>
                        <CardHeader>
                            <CardTitle>Recent Customer Reviews</CardTitle>
                            <CardDescription>Manage your shop's reputation and engage with buyers.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {isLoadingReviews ? (
                                <div className="space-y-4">
                                    <Skeleton className="h-24 w-full" />
                                    <Skeleton className="h-24 w-full" />
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
                                                        <p>on {review.productName}</p>
                                                        <span className="mx-1">•</span>
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
                                        <div className="flex items-center gap-2 pl-11 pt-1">
                                            <Button size="sm" variant="outline"><MessageSquare className="mr-2 h-4 w-4"/> Reply</Button>
                                            <Button size="sm" variant="ghost">Report</Button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-10 text-muted-foreground">
                                    <p>No reviews yet.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                </div>

                {/* Right column */}
                <div className="space-y-6">
                    {/* Verification Status Card */}
                    {user && <VerificationStatusCard manufacturerId={user.uid} />}
                    
                    {/* Wallet Card */}
                     <Card>
                        <CardHeader>
                            <CardTitle>My Wallet</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Available for Payout</p>
                                <p className="text-2xl font-bold">KES 875,500</p>
                            </div>
                             <div className="border-t pt-4">
                                <p className="text-sm text-muted-foreground flex items-center gap-2"><Lock className="w-4 h-4" /> Funds in Escrow</p>
                                <p className="text-lg font-semibold">KES 120,000</p>
                            </div>
                             <div className="border-t pt-4">
                                <p className="text-sm text-muted-foreground">Last Payout</p>
                                <p className="text-lg font-semibold">KES 500,000 on 1 Nov 2023</p>
                            </div>
                        </CardContent>
                        <CardFooter className="flex-col items-stretch space-y-2">
                             <Button><Banknote className="mr-2 h-4 w-4"/> Request Payout</Button>
                             <Button variant="outline">View Statement</Button>
                        </CardFooter>
                    </Card>

                    {/* Shop Profile Card */}
                    <Card>
                        <CardHeader className="flex flex-row items-center">
                           <Image src="https://picsum.photos/seed/mfg1/64/64" alt="Shop Logo" width={56} height={56} className="rounded-lg mr-4" />
                           <div>
                                <CardTitle>Your Shop Profile</CardTitle>
                                <CardDescription>Public view</CardDescription>
                           </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground mb-4">Complete your profile to attract more buyers. Your current completion rate is 85%.</p>
                            <Progress value={85} className="mb-4 h-2" />
                        </CardContent>
                        <CardFooter>
                             <Button asChild variant="secondary" className="w-full">
                                <Link href="/dashboards/seller-centre/profile">
                                    Edit Profile <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                             </Button>
                        </CardFooter>
                    </Card>

                    {/* Products Quick View */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Products at a Glance</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Product</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {products.map((product) => (
                                        <TableRow key={product.id}>
                                            <TableCell className="font-medium">{product.name}</TableCell>
                                            <TableCell>
                                                <Badge variant={product.status === 'Live' ? 'default' : 'destructive'}>{product.status}</Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                         <CardFooter>
                            <Button asChild variant="outline" className="w-full">
                                <Link href="/dashboards/seller-centre/products">
                                    Manage All Products <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                         </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
}

export default function SellerDashboardPage() {
    const { user, isUserLoading, role } = useUser();
    
    const isLoading = isUserLoading;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }
    
    // Allow access if the user is a manufacturer OR a super-admin
    if (role !== 'manufacturer' && role !== 'super-admin') {
        return <PermissionDenied />;
    }
    
    // If the user has the correct role, render the dashboard
    return <SellerDashboardContent />;
}
