
'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserCheck, Star, BarChart, LifeBuoy, Loader2, AlertTriangle, Package, Search, ListFilter, MoreHorizontal, Edit, Trash2, BarChart2 } from "lucide-react";
import { useCollection, useFirestore, useMemoFirebase, useAuth } from "@/firebase";
import { collection, query, where, doc, collectionGroup } from "firebase/firestore";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { logActivity } from "@/lib/activity-log";
import React from 'react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuCheckboxItem } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import Image from "next/image";

type Manufacturer = {
    id: string;
    shopName: string;
    industry?: string;
    registrationDate: any; // Firestore timestamp
    verificationStatus: 'Unsubmitted' | 'Pending Legal' | 'Pending Admin' | 'Action Required' | 'Verified' | 'Restricted';
    rating?: number;
    sales?: number; // This would need to be calculated/stored
};

type Product = {
  id: string;
  name: string;
  manufacturerId: string;
  shopName?: string; // Denormalized for display
  imageUrl?: string;
  status: 'draft' | 'published' | 'archived';
  stock: number;
  price: number;
};

export default function AdminDashboard() {
    const firestore = useFirestore();
    const auth = useAuth();
    const { toast } = useToast();
    
    const [productSearchQuery, setProductSearchQuery] = React.useState('');
    const [productStatusFilter, setProductStatusFilter] = React.useState<'all' | 'published' | 'draft' | 'archived'>('all');

    const manufacturersQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return collection(firestore, 'manufacturers');
    }, [firestore]);

    const allProductsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return collectionGroup(firestore, 'products');
    }, [firestore]);

    const { data: allManufacturers, isLoading: isLoadingManufacturers } = useCollection<Manufacturer>(manufacturersQuery);
    const { data: allProducts, isLoading: isLoadingProducts } = useCollection<Product>(allProductsQuery);
    
    const productsWithSeller = React.useMemo(() => {
        if (!allProducts || !allManufacturers) return null;
        const manufacturerMap = new Map(allManufacturers.map(m => [m.id, m.shopName]));
        return allProducts.map(p => ({
            ...p,
            shopName: manufacturerMap.get(p.manufacturerId) || 'Unknown Seller'
        }));
    }, [allProducts, allManufacturers]);

    const filteredProducts = React.useMemo(() => {
        if (!productsWithSeller) return [];
        return productsWithSeller.filter(product => {
            const matchesSearch = product.name.toLowerCase().includes(productSearchQuery.toLowerCase()) || product.shopName?.toLowerCase().includes(productSearchQuery.toLowerCase());
            const matchesStatus = productStatusFilter === 'all' || product.status === productStatusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [productsWithSeller, productSearchQuery, productStatusFilter]);


    const pendingVerifications = React.useMemo(() => {
        if (!allManufacturers) return null;
        return allManufacturers.filter(m => ['Pending Legal', 'Pending Admin'].includes(m.verificationStatus));
    }, [allManufacturers]);

    const allSellers = React.useMemo(() => {
        if (!allManufacturers) return null;
        return allManufacturers.filter(m => ['Verified', 'Restricted'].includes(m.verificationStatus));
    }, [allManufacturers]);


    const handleRestrictSeller = (sellerId: string, sellerName: string) => {
        if (!firestore || !auth) return;
        const sellerRef = doc(firestore, 'manufacturers', sellerId);
        updateDocumentNonBlocking(sellerRef, { verificationStatus: 'Restricted' });
        logActivity(
            firestore,
            auth,
            'SELLER_RESTRICTED',
            `Restricted seller: ${sellerName} (ID: ${sellerId})`
        );
        toast({
            title: "Seller Restricted",
            description: `${sellerName} has been restricted.`,
            variant: "destructive",
        });
    };

     const handleUnrestrictSeller = (sellerId: string, sellerName: string) => {
        if (!firestore || !auth) return;
        const sellerRef = doc(firestore, 'manufacturers', sellerId);
        updateDocumentNonBlocking(sellerRef, { verificationStatus: 'Verified' });
         logActivity(
            firestore,
            auth,
            'SELLER_UNRESTRICTED',
            `Lifted restrictions for seller: ${sellerName} (ID: ${sellerId})`
        );
        toast({
            title: "Seller Unrestricted",
            description: `${sellerName}'s restrictions have been lifted.`,
        });
    };

    const getStatusVariant = (status: Product['status']) => {
        switch (status) {
            case 'published': return 'secondary';
            case 'draft': return 'outline';
            case 'archived': return 'destructive';
            default: return 'default';
        }
    };


    const renderVerificationRows = () => {
        if (isLoadingManufacturers) {
            return Array.from({length: 2}).map((_, i) => (
                <TableRow key={`skel-ver-${i}`}>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-9 w-40" /></TableCell>
                </TableRow>
            ))
        }
        if (!pendingVerifications || pendingVerifications.length === 0) {
            return <TableRow><TableCell colSpan={4} className="text-center h-24">No pending verifications.</TableCell></TableRow>
        }
        return pendingVerifications.map((seller) => (
            <TableRow key={seller.id}>
                <TableCell className="font-medium">{seller.shopName}</TableCell>
                <TableCell>{seller.industry || 'N/A'}</TableCell>
                <TableCell>{new Date(seller.registrationDate?.seconds * 1000).toLocaleDateString()}</TableCell>
                <TableCell>
                    <Button size="sm" asChild>
                        <Link href={`/dashboards/admin/verifications/${seller.id}`}>
                            <UserCheck className="mr-2 h-4 w-4"/> Review Application
                        </Link>
                    </Button>
                </TableCell>
            </TableRow>
        ));
    }
    
    const renderPerformanceRows = () => {
        if (isLoadingManufacturers) {
            return Array.from({length: 3}).map((_, i) => (
                <TableRow key={`skel-perf-${i}`}>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-9 w-48" /></TableCell>
                </TableRow>
            ))
        }
         if (!allSellers || allSellers.length === 0) {
            return <TableRow><TableCell colSpan={5} className="text-center h-24">No verified sellers yet.</TableCell></TableRow>
        }
        // Using mock data for sales for now as it's not in the DB
        return allSellers.map((seller) => (
            <TableRow key={seller.id}>
                <TableCell className="font-medium">{seller.shopName}</TableCell>
                <TableCell><Star className="inline mr-1 h-4 w-4 text-yellow-400"/>{seller.rating || 'N/A'}</TableCell>
                <TableCell>{seller.sales || 0}</TableCell>
                <TableCell><Badge variant={seller.verificationStatus === 'Verified' ? 'secondary' : 'destructive'}>{seller.verificationStatus}</Badge></TableCell>
                <TableCell className="space-x-2">
                    <Button variant="outline" size="sm"><BarChart className="mr-1 h-4 w-4"/> View Analytics</Button>
                    {seller.verificationStatus === 'Verified' ? (
                        <Button variant="destructive" size="sm" onClick={() => handleRestrictSeller(seller.id, seller.shopName)}>
                            <AlertTriangle className="mr-1 h-4 w-4" /> Restrict
                        </Button>
                    ) : (
                         <Button variant="secondary" size="sm" onClick={() => handleUnrestrictSeller(seller.id, seller.shopName)}>
                           Lift Restriction
                        </Button>
                    )}
                </TableCell>
            </TableRow>
        ));
    }
    
    const renderProductCatalogRows = () => {
        if (isLoadingProducts || isLoadingManufacturers) {
            return Array.from({length: 5}).map((_, i) => (
                <TableRow key={`skel-prod-${i}`}>
                    <TableCell className="hidden sm:table-cell"><Skeleton className="h-16 w-16 rounded-md" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                </TableRow>
            ))
        }
        if (!filteredProducts || filteredProducts.length === 0) {
            return <TableRow><TableCell colSpan={7} className="text-center h-24">No products found for the current filter.</TableCell></TableRow>
        }
        return filteredProducts.map((product) => (
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
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{product.shopName}</TableCell>
                <TableCell><Badge variant={getStatusVariant(product.status)}>{product.status}</Badge></TableCell>
                <TableCell>{product.price?.toLocaleString() || 'N/A'}</TableCell>
                <TableCell>{product.stock > 0 ? product.stock : <Badge variant="destructive">Out of Stock</Badge>}</TableCell>
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
                                <Link href={`/dashboards/seller-centre/products/analytics/${product.id}`}>
                                <BarChart2 className="mr-2 h-4 w-4" /> View Analytics
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href={`/dashboards/seller-centre/products/edit/${product.id}`}>
                                <Edit className="mr-2 h-4 w-4" /> Edit Product
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </TableCell>
            </TableRow>
        ));
    }


    return (
        <Tabs defaultValue="onboarding">
            <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="onboarding">Onboarding & Verification</TabsTrigger>
                <TabsTrigger value="performance">Seller Performance</TabsTrigger>
                <TabsTrigger value="catalog">Product Catalog</TabsTrigger>
                <TabsTrigger value="support">Support & Training</TabsTrigger>
            </TabsList>

            <TabsContent value="onboarding">
                <Card>
                    <CardHeader>
                        <CardTitle>Seller Onboarding Queue</CardTitle>
                        <CardDescription>Review and approve new manufacturers waiting to join Tradinta.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Company Name</TableHead>
                                    <TableHead>Industry</TableHead>
                                    <TableHead>Application Date</TableHead>
                                    <TableHead>Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                               {renderVerificationRows()}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </TabsContent>
            
            <TabsContent value="performance">
                <Card>
                    <CardHeader>
                        <CardTitle>Seller Performance</CardTitle>
                        <CardDescription>Track seller ratings, sales performance, and account status.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Seller</TableHead>
                                    <TableHead>Rating</TableHead>
                                    <TableHead>Total Sales (Last 30d)</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {renderPerformanceRows()}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </TabsContent>
            
            <TabsContent value="catalog">
                <Card>
                    <CardHeader>
                        <CardTitle>Product Catalog</CardTitle>
                        <CardDescription>View and manage all products across the Tradinta platform.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between mb-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Search by product or seller..." className="pl-8" value={productSearchQuery} onChange={e => setProductSearchQuery(e.target.value)} />
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="ml-4 gap-1">
                                    <ListFilter className="h-3.5 w-3.5" />
                                    <span>Filter</span>
                                </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuCheckboxItem checked={productStatusFilter === 'all'} onCheckedChange={() => setProductStatusFilter('all')}>All</DropdownMenuCheckboxItem>
                                <DropdownMenuCheckboxItem checked={productStatusFilter === 'published'} onCheckedChange={() => setProductStatusFilter('published')}>Published</DropdownMenuCheckboxItem>
                                <DropdownMenuCheckboxItem checked={productStatusFilter === 'draft'} onCheckedChange={() => setProductStatusFilter('draft')}>Draft</DropdownMenuCheckboxItem>
                                <DropdownMenuCheckboxItem checked={productStatusFilter === 'archived'} onCheckedChange={() => setProductStatusFilter('archived')}>Archived</DropdownMenuCheckboxItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[80px] hidden sm:table-cell"></TableHead>
                                    <TableHead>Product Name</TableHead>
                                    <TableHead>Seller</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Price (KES)</TableHead>
                                    <TableHead>Stock</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {renderProductCatalogRows()}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="support">
                <Card>
                    <CardHeader>
                        <CardTitle>Support Resources & Training</CardTitle>
                        <CardDescription>Manage help articles and training materials for sellers.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Card>
                           <CardContent className="p-6 flex items-center justify-between">
                               <div>
                                   <p className="font-semibold">Seller Handbook</p>
                                   <p className="text-sm text-muted-foreground">The complete guide to selling on Tradinta.</p>
                               </div>
                               <Button variant="outline" asChild><Link href="/dashboards/content-management">Manage Content</Link></Button>
                           </CardContent>
                        </Card>
                        <Card>
                           <CardContent className="p-6 flex items-center justify-between">
                               <div>
                                   <p className="font-semibold">Video Tutorials</p>
                                   <p className="text-sm text-muted-foreground">Training videos for product uploads, marketing, and more.</p>
                               </div>
                                <Button variant="outline" asChild><Link href="/dashboards/content-management">Upload/Edit Videos</Link></Button>
                           </CardContent>
                        </Card>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    );
}

    