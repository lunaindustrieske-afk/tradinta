
'use client';

import * as React from 'react';
import { useParams, useRouter, notFound } from 'next/navigation';
import { useDoc, useFirestore, useMemoFirebase, useCollection } from '@/firebase';
import { doc, collection, query } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, UserCheck, Star, BarChart, LifeBuoy, Loader2, AlertTriangle, Package, Search, ListFilter, MoreHorizontal, Edit, Trash2, BarChart2, Eye } from "lucide-react";
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SuspendShopModal } from '@/components/suspend-shop-modal';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";

type Manufacturer = {
    id: string;
    shopName: string;
    email: string;
    industry?: string;
    registrationDate: any;
    verificationStatus: 'Unsubmitted' | 'Pending Legal' | 'Pending Admin' | 'Action Required' | 'Verified' | 'Restricted' | 'Suspended';
    suspensionDetails?: {
        isSuspended: boolean;
        reason: string;
        prohibitions: string[];
        publicDisclaimer: boolean;
      };
    rating?: number;
    sales?: number; // mock
    logoUrl?: string;
    slug?: string;
};

type Product = {
  id: string;
  name: string;
  imageUrl?: string;
  status: 'draft' | 'published' | 'archived';
  stock: number;
  price: number;
};

const DetailItem = ({ label, value, children }: { label: string; value?: string | null, children?: React.ReactNode }) => (
    <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        {value && <p className="font-semibold">{value}</p>}
        {children && <div className="font-semibold">{children}</div>}
    </div>
);


export default function ShopManagementPage() {
    const params = useParams();
    const router = useRouter();
    const manufacturerId = params.id as string;
    const firestore = useFirestore();

    const manufRef = useMemoFirebase(() => {
        if (!firestore || !manufacturerId) return null;
        return doc(firestore, 'manufacturers', manufacturerId);
    }, [firestore, manufacturerId]);

    const productsQuery = useMemoFirebase(() => {
        if (!firestore || !manufacturerId) return null;
        return query(collection(firestore, 'manufacturers', manufacturerId, 'products'));
    }, [firestore, manufacturerId]);

    const { data: manufacturer, isLoading: isLoadingManufacturer } = useDoc<Manufacturer>(manufRef);
    const { data: products, isLoading: isLoadingProducts } = useCollection<Product>(productsQuery);

    const getStatusVariant = (status: Product['status']) => {
        switch (status) {
            case 'published': return 'secondary';
            case 'draft': return 'outline';
            case 'archived': return 'destructive';
            default: return 'default';
        }
    };
    
    if (isLoadingManufacturer) {
        return (
             <div className="space-y-6">
                <Skeleton className="h-10 w-48" />
                <div className="grid md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-6">
                        <Card><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent><Skeleton className="h-24 w-full" /></CardContent></Card>
                        <Card><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent><Skeleton className="h-48 w-full" /></CardContent></Card>
                    </div>
                    <div className="md:col-span-1 space-y-6">
                        <Card><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent><Skeleton className="h-24 w-full" /></CardContent></Card>
                    </div>
                </div>
            </div>
        )
    }
    
    if (!manufacturer) {
        return notFound();
    }
    
     const getSellerStatus = (seller: Manufacturer) => {
        if (seller.suspensionDetails?.isSuspended) {
            return <Badge variant="destructive">Suspended</Badge>;
        }
        return <Badge variant={seller.verificationStatus === 'Verified' ? 'secondary' : 'destructive'}>{seller.verificationStatus}</Badge>;
    }
    
    return (
        <div className="space-y-6">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" className="h-8 w-8" asChild>
                        <Link href="/dashboards/admin?tab=shop-management"><ChevronLeft className="h-4 w-4" /></Link>
                    </Button>
                     {manufacturer.logoUrl && (
                        <Image src={manufacturer.logoUrl} alt={manufacturer.shopName} width={40} height={40} className="rounded-full" />
                    )}
                    <div>
                        <h1 className="text-xl font-semibold">{manufacturer.shopName}</h1>
                        <div className="flex items-center gap-2">
                           <span className="text-sm text-muted-foreground">{manufacturer.email}</span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                       <Link href={`/manufacturer/${manufacturer.slug}`} target="_blank">
                           <Eye className="mr-2 h-4 w-4" /> View Public Profile
                       </Link>
                    </Button>
                     <SuspendShopModal seller={manufacturer}>
                         <Button variant={manufacturer.suspensionDetails?.isSuspended ? "secondary" : "destructive"} size="sm">
                            <AlertTriangle className="mr-1 h-4 w-4" /> {manufacturer.suspensionDetails?.isSuspended ? "Manage Suspension" : "Suspend"}
                        </Button>
                    </SuspendShopModal>
                </div>
            </div>
            
            <Separator />
            
            <div className="grid md:grid-cols-3 gap-6 items-start">
                 <div className="md:col-span-2 space-y-6">
                     <Card>
                        <CardHeader>
                            <CardTitle>Shop Products</CardTitle>
                             <CardDescription>A list of all products belonging to this shop.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[80px] hidden sm:table-cell"></TableHead>
                                            <TableHead>Product Name</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Price (KES)</TableHead>
                                            <TableHead>Stock</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {isLoadingProducts ? (
                                            Array.from({length: 3}).map((_, i) => (
                                                <TableRow key={`skel-prod-${i}`}>
                                                    <TableCell className="hidden sm:table-cell"><Skeleton className="h-16 w-16 rounded-md" /></TableCell>
                                                    <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                                                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                                                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                                                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                                                    <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                                                </TableRow>
                                            ))
                                        ) : products && products.length > 0 ? (
                                            products.map((product) => (
                                                <TableRow key={product.id}>
                                                    <TableCell className="hidden sm:table-cell">
                                                        <Image
                                                            alt={product.name}
                                                            className="aspect-square rounded-md object-cover"
                                                            height="64"
                                                            src={product.imageUrl || 'https://i.postimg.cc/j283ydft/image.png'}
                                                            width="64"
                                                        />
                                                    </TableCell>
                                                    <TableCell className="font-medium">{product.name}</TableCell>
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
                                                                <DropdownMenuLabel>Admin Actions</DropdownMenuLabel>
                                                                 <DropdownMenuItem asChild>
                                                                    <Link href={`/dashboards/seller-centre/products/edit/${product.id}`} target="_blank">
                                                                        <Edit className="mr-2 h-4 w-4" /> Edit Product
                                                                    </Link>
                                                                </DropdownMenuItem>
                                                                 <DropdownMenuItem asChild>
                                                                    <Link href={`/dashboards/seller-centre/products/analytics/${product.id}`} target="_blank">
                                                                        <BarChart2 className="mr-2 h-4 w-4" /> View Analytics
                                                                    </Link>
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow><TableCell colSpan={6} className="text-center h-24">No products found for this shop.</TableCell></TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                        </CardContent>
                     </Card>
                 </div>
                 <div className="md:col-span-1 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Shop Details</CardTitle>
                        </CardHeader>
                         <CardContent className="space-y-4">
                            <DetailItem label="Status">
                                {getSellerStatus(manufacturer)}
                            </DetailItem>
                            <DetailItem label="Rating" value={`${manufacturer.rating || 'N/A'} / 5`}/>
                            <DetailItem label="Industry" value={manufacturer.industry || 'N/A'} />
                            <DetailItem label="Registration Date" value={new Date(manufacturer.registrationDate?.seconds * 1000).toLocaleDateString()} />
                            <DetailItem label="Manufacturer ID" value={manufacturer.id} />
                         </CardContent>
                         <CardFooter>
                              <Button variant="outline" className="w-full" asChild>
                                <Link href={`/dashboards/admin/verifications/${manufacturer.id}`}>
                                  <UserCheck className="mr-2 h-4 w-4" /> View Verification Details
                                </Link>
                              </Button>
                         </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    )
}

    