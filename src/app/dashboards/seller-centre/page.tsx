
'use client';

import * as React from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
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
  Package,
  ShoppingCart,
  FileText,
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
  Loader2,
  Wallet,
  BookCopy,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  useDoc,
  useUser,
  useFirestore,
  useMemoFirebase,
  useCollection,
} from '@/firebase';
import {
  doc,
  collectionGroup,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import type { Review } from '@/app/lib/definitions';
import { formatDistanceToNow } from 'date-fns';
import { PermissionDenied } from '@/components/ui/permission-denied';

const products = [
  { id: 'PROD-001', name: 'Industrial Grade Cement', stock: 1200, status: 'Live' },
  {
    id: 'PROD-003',
    name: 'HDPE Plastic Pellets',
    stock: 0,
    status: 'Out of Stock',
  },
  {
    id: 'PROD-004',
    name: 'Recycled Kraft Paper Rolls',
    stock: 300,
    status: 'Live',
  },
];

const orders = [
  {
    id: 'ORD-006',
    customer: 'BuildRight Const.',
    total: 450000,
    status: 'Pending Fulfillment',
  },
  { id: 'ORD-008', customer: 'Yum Foods', total: 66000, status: 'Shipped' },
];

type VerificationStatus =
  | 'Unsubmitted'
  | 'Pending Legal'
  | 'Pending Admin'
  | 'Action Required'
  | 'Verified';

const statusInfo: Record<
  VerificationStatus,
  {
    icon: React.ReactNode;
    title: string;
    description: string;
    badgeVariant: 'secondary' | 'default' | 'destructive' | 'outline';
  }
> = {
  Unsubmitted: {
    icon: <Info className="h-8 w-8 text-muted-foreground" />,
    title: 'Profile Incomplete',
    description:
      'Complete your shop profile and submit verification documents to start selling.',
    badgeVariant: 'outline',
  },
  'Pending Legal': {
    icon: <Clock className="h-8 w-8 text-yellow-500" />,
    title: 'Pending Legal & Compliance Review',
    description:
      'Your business documents are being reviewed. This usually takes 2-3 business days.',
    badgeVariant: 'default',
  },
  'Pending Admin': {
    icon: <Clock className="h-8 w-8 text-blue-500" />,
    title: 'Pending Admin Approval',
    description:
      'Your documents are approved. Final review of your shop profile is in progress.',
    badgeVariant: 'default',
  },
  'Action Required': {
    icon: <AlertTriangle className="h-8 w-8 text-destructive" />,
    title: 'Action Required',
    description:
      'There was an issue with your submission. Please check your email for details and resubmit.',
    badgeVariant: 'destructive',
  },
  Verified: {
    icon: <ShieldCheck className="h-8 w-8 text-green-500" />,
    title: 'Shop Verified',
    description:
      'Congratulations! Your shop is live and visible to all buyers on Tradinta.',
    badgeVariant: 'secondary',
  },
};

const VerificationStatusCard = ({
  manufacturerId,
}: {
  manufacturerId: string;
}) => {
  const firestore = useFirestore();
  const manufacturerDocRef = useMemoFirebase(() => {
    if (!firestore || !manufacturerId) return null;
    return doc(firestore, 'manufacturers', manufacturerId);
  }, [firestore, manufacturerId]);

  const { data: manufacturer, isLoading } = useDoc<{
    verificationStatus?: VerificationStatus;
  }>(manufacturerDocRef);

  if (isLoading) {
    return <Skeleton className="h-32" />;
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
          <Badge variant={currentStatusInfo.badgeVariant} className="mb-2">
            {currentStatusInfo.title}
          </Badge>
          <p className="text-sm text-muted-foreground">
            {currentStatusInfo.description}
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild variant="secondary" className="w-full">
          <Link href="/dashboards/seller-centre/profile">
            {status === 'Verified'
              ? 'View Profile'
              : 'Update Profile & Documents'}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default function SellerDashboardPage() {
  const { user, isUserLoading, role } = useUser();
  const firestore = useFirestore();

  const reviewsQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return query(
      collectionGroup(firestore, 'reviews'),
      where('manufacturerId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(5)
    );
  }, [firestore, user?.uid]);

  const { data: reviews, isLoading: isLoadingReviews } =
    useCollection<Review>(reviewsQuery);

  if (isUserLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-4 text-muted-foreground">Verifying permissions...</p>
      </div>
    );
  }

  const hasAccess = role === 'manufacturer' || role === 'super-admin';
  if (!hasAccess) {
    return <PermissionDenied />;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Constructa Ltd. Shop Dashboard</CardTitle>
          <CardDescription>
            Your central hub for managing your shop, products, and orders.
          </CardDescription>
        </CardHeader>
      </Card>
      
      <Card>
        <CardHeader>
            <CardTitle>Quick Access</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Button variant="outline" className="flex-col h-24" asChild>
                <Link href="/dashboards/seller-centre/products">
                    <Package className="w-6 h-6 mb-2" />
                    Manage Products
                </Link>
            </Button>
             <Button variant="outline" className="flex-col h-24" asChild>
                <Link href="/dashboards/seller-centre/orders">
                    <ShoppingCart className="w-6 h-6 mb-2" />
                    View Orders
                </Link>
            </Button>
             <Button variant="outline" className="flex-col h-24" asChild>
                <Link href="/dashboards/seller-centre#wallet">
                    <Wallet className="w-6 h-6 mb-2" />
                    Wallet & Payouts
                </Link>
            </Button>
             <Button variant="outline" className="flex-col h-24" asChild>
                <Link href="/dashboards/seller-centre/quotations">
                    <BookCopy className="w-6 h-6 mb-2" />
                    Quotations
                </Link>
            </Button>
             <Button variant="outline" className="flex-col h-24" asChild>
                <Link href="/dashboards/seller-centre/messages">
                    <MessageSquare className="w-6 h-6 mb-2" />
                    Messages
                </Link>
            </Button>
        </CardContent>
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
            <p className="text-xs text-muted-foreground">
              +20.1% from last month
            </p>
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
              <Button variant="ghost" size="sm">
                View All
              </Button>
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
                      <TableCell>
                        <Badge
                          variant={
                            order.status === 'Shipped'
                              ? 'secondary'
                              : 'default'
                          }
                        >
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button size="sm">View Order</Button>
                      </TableCell>
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
              <CardDescription>
                Manage your shop's reputation and engage with buyers.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoadingReviews ? (
                <div className="space-y-4">
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
              ) : reviews && reviews.length > 0 ? (
                reviews.map((review) => (
                  <div
                    key={review.id}
                    className="p-4 border rounded-lg space-y-2"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={review.buyerAvatar} />
                          <AvatarFallback>
                            {review.buyerName?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{review.buyerName}</p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <p>on {review.productName}</p>
                            <span className="mx-1">•</span>
                            <p>
                              {review.createdAt
                                ? formatDistanceToNow(
                                    review.createdAt.toDate()
                                  )
                                : ''}{' '}
                              ago
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground pl-11">
                      "{review.comment}"
                    </p>
                    <div className="flex items-center gap-2 pl-11 pt-1">
                      <Button size="sm" variant="outline">
                        <MessageSquare className="mr-2 h-4 w-4" /> Reply
                      </Button>
                      <Button size="sm" variant="ghost">
                        Report
                      </Button>
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
          <Card id="wallet">
            <CardHeader>
              <CardTitle>My Wallet</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  Available for Payout
                </p>
                <p className="text-2xl font-bold">KES 875,500</p>
              </div>
              <div className="border-t pt-4">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Lock className="w-4 h-4" /> Funds in Escrow
                </p>
                <p className="text-lg font-semibold">KES 120,000</p>
              </div>
              <div className="border-t pt-4">
                <p className="text-sm text-muted-foreground">Last Payout</p>
                <p className="text-lg font-semibold">
                  KES 500,000 on 1 Nov 2023
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex-col items-stretch space-y-2">
              <Button>
                <Banknote className="mr-2 h-4 w-4" /> Request Payout
              </Button>
              <Button variant="outline">View Statement</Button>
            </CardFooter>
          </Card>

          {/* Shop Profile Card */}
          <Card>
            <CardHeader className="flex flex-row items-center">
              <Image
                src="https://picsum.photos/seed/mfg1/64/64"
                alt="Shop Logo"
                width={56}
                height={56}
                className="rounded-lg mr-4"
              />
              <div>
                <CardTitle>Your Shop Profile</CardTitle>
                <CardDescription>Public view</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Complete your profile to attract more buyers. Your current
                completion rate is 85%.
              </p>
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
                      <TableCell className="font-medium">
                        {product.name}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            product.status === 'Live' ? 'default' : 'destructive'
                          }
                        >
                          {product.status}
                        </Badge>
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
