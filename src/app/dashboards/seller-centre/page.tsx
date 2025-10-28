
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
  Factory,
  Send,
  Megaphone,
  Sparkles,
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
  collection,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import type { Review } from '@/app/lib/definitions';
import { formatDistanceToNow } from 'date-fns';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { logFeatureUsage } from '@/lib/analytics';
import { ReportModal } from '@/components/report-modal';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';


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
  
type ManufacturerData = {
  shopName?: string;
  tagline?: string;
  description?: string;
  logoUrl?: string;
  bannerUrl?: string;
  businessLicenseNumber?: string;
  kraPin?: string;
  address?: string;
  phone?: string;
  email?: string;
  paymentPolicy?: string;
  shippingPolicy?: string;
  returnPolicy?: string;
  verificationStatus?: VerificationStatus;
  suspensionDetails?: {
    isSuspended: boolean;
    reason: string;
    prohibitions: string[];
    publicDisclaimer: boolean;
  };
};

type Product = {
  id: string;
  name: string;
  status: 'draft' | 'published' | 'archived';
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
          <Link href="/dashboards/seller-centre/verification">
            {status === 'Verified'
              ? 'View Verification Documents'
              : 'Submit Verification Documents'}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};


const calculateProfileCompleteness = (manufacturer: ManufacturerData | null) => {
    if (!manufacturer) return 0;
    const fields = [
        'shopName', 'tagline', 'description', 'logoUrl',
        'address', 'phone', 
        'paymentPolicy', 'shippingPolicy', 'returnPolicy'
    ];
    const totalFields = fields.length;
    let completedFields = 0;
    
    fields.forEach(field => {
        if (manufacturer[field as keyof ManufacturerData]) {
            completedFields++;
        }
    });

    return Math.round((completedFields / totalFields) * 100);
}

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
    title: 'Documents Required',
    description:
      'Submit your business documents to get a "Verified" badge and build trust with buyers.',
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

export default function SellerDashboardPage() {
  const { user, role } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  React.useEffect(() => {
    if (user && role) {
      logFeatureUsage({ feature: 'page:view', userId: user.uid, userRole: role, metadata: { page: '/dashboards/seller-centre' } });
    }
  }, [user, role]);

  const manufacturerDocRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'manufacturers', user.uid);
  }, [user, firestore]);
  
  const { data: manufacturer, isLoading: isLoadingManufacturer } = useDoc<ManufacturerData>(manufacturerDocRef);
  const profileCompleteness = calculateProfileCompleteness(manufacturer);

  const reviewsQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return query(
      collection(firestore, 'reviews'),
      where('manufacturerId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(5)
    );
  }, [firestore, user?.uid]);

  const recentProductsQuery = useMemoFirebase(() => {
    if (!user?.uid || !firestore) return null;
    return query(
      collection(firestore, 'manufacturers', user.uid, 'products'),
      orderBy('updatedAt', 'desc'),
      limit(3)
    );
  }, [firestore, user?.uid]);

  const { data: reviews, isLoading: isLoadingReviews } =
    useCollection<Review>(reviewsQuery);
    
  const { data: recentProducts, isLoading: isLoadingRecentProducts } = 
    useCollection<Product>(recentProductsQuery);
    
  const handleFeatureClick = (feature: string, metadata?: Record<string, any>) => {
    if (user && role) {
      logFeatureUsage({ feature, userId: user.uid, userRole: role, metadata: { page: '/dashboards/seller-centre', ...metadata } });
    }
  };
  
  const [replyingTo, setReplyingTo] = React.useState<string | null>(null);
  const [replyText, setReplyText] = React.useState('');
  const [isReplying, setIsReplying] = React.useState(false);

  const handlePostReply = async (reviewId: string) => {
      if (!replyText.trim()) {
          toast({ title: "Reply cannot be empty.", variant: "destructive"});
          return;
      }
      setIsReplying(true);
      // In a real app, you would save this to a 'replies' subcollection
      // on the review document. For now, we simulate success.
      await new Promise(res => setTimeout(res, 1000));
      toast({ title: "Reply Posted!", description: "Your reply is now visible." });
      setReplyingTo(null);
      setReplyText('');
      setIsReplying(false);
  }


  const shopName = manufacturer?.shopName;
  const isSuspended = manufacturer?.suspensionDetails?.isSuspended === true;
  const hasNoEmail = !manufacturer?.email;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          {isSuspended && (
             <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Shop Suspended</AlertTitle>
              <AlertDescription>
                Your shop has active restrictions. Please contact support for more information.
              </AlertDescription>
            </Alert>
          )}
          {hasNoEmail && !isSuspended && (
             <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Contact Email Missing</AlertTitle>
              <AlertDescription>
                You will not receive email notifications for new messages from buyers. Please <Link href="/dashboards/seller-centre/profile" className="font-semibold underline">update your profile</Link> to add a contact email.
              </AlertDescription>
            </Alert>
          )}
          {isLoadingManufacturer ? <Skeleton className="h-8 w-2/3" /> : (
            <CardTitle>{shopName ? `${shopName} Shop Dashboard` : "Your Shop Dashboard"}</CardTitle>
          )}
          <CardDescription>
            {shopName ? "Your central hub for managing your shop, products, and orders." : "Welcome! Name your shop in your profile to get started."}
          </CardDescription>
        </CardHeader>
      </Card>
      
      <Card>
        <CardHeader>
            <CardTitle>Quick Access</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Button variant="outline" className="flex-col h-24" asChild>
                <Link href="/dashboards/seller-centre/products" onClick={() => handleFeatureClick('quick_access:manage_products')}>
                    <Package className="w-6 h-6 mb-2" />
                    Manage Products
                </Link>
            </Button>
             <Button variant="outline" className="flex-col h-24" asChild>
                <Link href="/dashboards/seller-centre/orders" onClick={() => handleFeatureClick('quick_access:view_orders')}>
                    <ShoppingCart className="w-6 h-6 mb-2" />
                    View Orders
                </Link>
            </Button>
            <Button variant="outline" className="flex-col h-24" asChild>
                <Link href="/dashboards/seller-centre/marketing" onClick={() => handleFeatureClick('quick_access:marketing')}>
                    <Megaphone className="w-6 h-6 mb-2" />
                    Marketing
                </Link>
            </Button>
             <Button variant="outline" className="flex-col h-24" asChild>
                <Link href="/dashboards/seller-centre#wallet" onClick={() => handleFeatureClick('quick_access:wallet')}>
                    <Wallet className="w-6 h-6 mb-2" />
                    Wallet & Payouts
                </Link>
            </Button>
            <Button variant="outline" className="flex-col h-24" asChild>
                <Link href="/dashboards/seller-centre/foundry" onClick={() => handleFeatureClick('quick_access:foundry')}>
                    <Sparkles className="w-6 h-6 mb-2" />
                    The Foundry
                </Link>
            </Button>
             <Button variant="outline" className="flex-col h-24" asChild>
                <Link href="/dashboards/seller-centre/messages" onClick={() => handleFeatureClick('quick_access:messages')}>
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
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboards/seller-centre/orders" onClick={() => handleFeatureClick('recent_orders:view_all')}>View All</Link>
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
                        <Button size="sm" onClick={() => handleFeatureClick('recent_orders:view_order', { orderId: order.id })}>View Order</Button>
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
                      <Button size="sm" variant="outline" onClick={() => {
                          handleFeatureClick('reviews:reply', { reviewId: review.id });
                          setReplyingTo(replyingTo === review.id ? null : review.id);
                          setReplyText('');
                        }}>
                        <MessageSquare className="mr-2 h-4 w-4" />
                        {replyingTo === review.id ? 'Cancel' : 'Reply'}
                      </Button>
                       <ReportModal reportType="Review" referenceId={review.id} productName={review.productName}>
                        <Button size="sm" variant="ghost" onClick={() => handleFeatureClick('reviews:report', { reviewId: review.id })}>
                          Report
                        </Button>
                      </ReportModal>
                    </div>
                    {replyingTo === review.id && (
                        <div className="pl-11 pt-2 space-y-2">
                            <Textarea 
                                placeholder={`Replying to ${review.buyerName}...`}
                                value={replyText}
                                onChange={e => setReplyText(e.target.value)}
                            />
                            <div className="flex justify-end">
                                <Button size="sm" disabled={isReplying} onClick={() => handlePostReply(review.id)}>
                                    {isReplying && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                                    <Send className="mr-2 h-4 w-4" /> Post Reply
                                </Button>
                            </div>
                        </div>
                    )}
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
          {/* Shop Profile Card */}
          <Card>
            <CardHeader>
                <CardTitle>Shop Profile</CardTitle>
                <CardDescription>
                    Complete your profile to attract more buyers.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-muted-foreground">Profile Completeness</p>
                    <p className="text-sm font-bold">{profileCompleteness}%</p>
                </div>
                <Progress value={profileCompleteness} className="h-2" />
            </CardContent>
            <CardFooter>
                <Button asChild variant="secondary" className="w-full" onClick={() => handleFeatureClick('profile:edit_shop')}>
                    <Link href="/dashboards/seller-centre/profile">
                        Edit Shop Profile <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </CardFooter>
          </Card>

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
              <Button onClick={() => handleFeatureClick('wallet:request_payout')}>
                <Banknote className="mr-2 h-4 w-4" /> Request Payout
              </Button>
              <Button variant="outline" onClick={() => handleFeatureClick('wallet:view_statement')}>View Statement</Button>
            </CardFooter>
          </Card>

          {/* Products Quick View */}
          <Card>
            <CardHeader>
              <CardTitle>Products at a Glance</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingRecentProducts ? (
                <div className="space-y-2">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                </div>
              ) : recentProducts && recentProducts.length > 0 ? (
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Status</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {recentProducts.map((product) => (
                        <TableRow key={product.id}>
                        <TableCell className="font-medium">
                            {product.name}
                        </TableCell>
                        <TableCell>
                            <Badge
                            variant={
                                product.status === 'published' ? 'default' : 'destructive'
                            }
                            >
                            {product.status}
                            </Badge>
                        </TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No products found.</p>
              )}
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="w-full" onClick={() => handleFeatureClick('products_glance:manage_all')}>
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
