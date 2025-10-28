
'use client';

import React from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Copy,
  Link as LinkIcon,
  Users,
  BarChart,
  DollarSign,
  ExternalLink,
  Loader2,
  Wallet,
  ClipboardCheck,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { collection, query, where, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { logFeatureUsage } from '@/lib/analytics';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';

// Mock data until backend is fully integrated
const mockMetrics = {
  clicks: 1256,
  signups: 78,
  sales: 450250,
  earnings: 22512.5,
};

const mockSales = [
    { id: 'SALE-001', campaign: 'Constructa Ltd Q4 Promo', orderId: 'ORD-582', amount: 120000, commission: 6000, date: '2023-11-20', status: 'Unpaid' },
    { id: 'SALE-002', campaign: 'SuperBake Bakery Launch', orderId: 'ORD-588', amount: 45000, commission: 2250, date: '2023-11-19', status: 'Unpaid' },
     { id: 'SALE-003', campaign: 'Constructa Ltd Q4 Promo', orderId: 'ORD-591', amount: 210000, commission: 10500, date: '2023-11-18', status: 'Paid' },
];

const mockPayouts = [
    { id: 'PAY-001', amount: 15000, date: '2023-11-01', status: 'Completed' },
];

type UserProfile = {
  tradintaId?: string;
};

type ForgingEvent = {
  id: string;
  name: string;
  sellerName: string;
  commissionRate: number;
  status: 'proposed' | 'active' | 'finished' | 'declined';
  tiers: { buyers: number; discount: number }[];
};


export default function GrowthPartnerDashboard() {
  const { user, isUserLoading, role } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [copiedLink, setCopiedLink] = React.useState(false);
  const [copiedCampaignLink, setCopiedCampaignLink] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (user && role) {
      logFeatureUsage({ feature: 'page:view', userId: user.uid, userRole: role, metadata: { page: '/dashboards/growth-partner' } });
    }
  }, [user, role]);

  const userDocRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userDocRef);

  const campaignsQuery = useMemoFirebase(() => {
    if (!user?.uid || !firestore) return null;
    // For now, we'll fetch all events for a partner. In a real app, you might paginate.
    return query(collection(firestore, 'forgingEvents'), where('partnerId', '==', user.uid));
  }, [user, firestore]);

  const { data: forgingEvents, isLoading: isLoadingCampaigns } = useCollection<ForgingEvent>(campaignsQuery);
  
  const handleProposal = (eventId: string, status: 'active' | 'declined') => {
      const eventRef = doc(firestore, 'forgingEvents', eventId);
      updateDocumentNonBlocking(eventRef, { status: status, respondedAt: serverTimestamp() });
      toast({
          title: `Proposal ${status === 'active' ? 'Accepted' : 'Declined'}!`,
          description: `The seller has been notified.`
      });
  };

  const referralLink = React.useMemo(() => {
    if (typeof window === 'undefined' || !userProfile?.tradintaId) return '';
    return `${window.location.origin}/signup?ref=${userProfile?.tradintaId}`;
  }, [userProfile]);

  const copyToClipboard = (link: string, type: 'general' | 'campaign', id?: string) => {
    navigator.clipboard.writeText(link);
    toast({
      title: 'Copied to Clipboard!',
      description: 'Your referral link has been copied.',
    });
    if (type === 'general') {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
    } else {
        setCopiedCampaignLink(id || null);
        setTimeout(() => setCopiedCampaignLink(null), 2000);
    }
  };

  if (isUserLoading || isProfileLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-full" />
        <div className="grid gap-4 md:grid-cols-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
           <Skeleton className="h-32 w-full" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading user data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Your Growth Partner Dashboard</CardTitle>
          <CardDescription>
            Track your impact, manage campaigns, and view your earnings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Label htmlFor="referral-link" className="font-semibold">
            Your Unique Referral Link
          </Label>
          <div className="flex gap-2 mt-1">
            <Input id="referral-link" value={referralLink} readOnly />
            <Button size="icon" onClick={() => copyToClipboard(referralLink, 'general')} aria-label="Copy referral link" disabled={!referralLink}>
              {copiedLink ? <ClipboardCheck className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Share this link to attribute new sign-ups to your account.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Link Clicks</CardTitle>
            <LinkIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockMetrics.clicks.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total clicks on your links</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sign-ups</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockMetrics.signups}</div>
            <p className="text-xs text-muted-foreground">New users from your link</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Attributed Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              KES {mockMetrics.sales.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              From your referred users
            </p>
          </CardContent>
        </Card>
         <Card className="bg-primary/10 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings (Unpaid)</CardTitle>
            <Wallet className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              KES {mockMetrics.earnings.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Awaiting next payout cycle
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="deal-hub">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="deal-hub">Deal Hub</TabsTrigger>
          <TabsTrigger value="sales">Attributed Sales</TabsTrigger>
          <TabsTrigger value="payouts">Payout History</TabsTrigger>
        </TabsList>
        <TabsContent value="deal-hub">
          <Card>
            <CardHeader>
              <CardTitle>Deal Hub</CardTitle>
              <CardDescription>
                Review proposals from sellers and manage your active Forging Events.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Seller</TableHead>
                    <TableHead>Campaign</TableHead>
                    <TableHead>Commission</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions / Link</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                   {isLoadingCampaigns ? (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center">
                                <Loader2 className="h-6 w-6 animate-spin mx-auto my-4" />
                            </TableCell>
                        </TableRow>
                   ) : forgingEvents && forgingEvents.length > 0 ? (
                        forgingEvents.map((event: any) => {
                            const campaignLink = `${window.location.origin}/foundry/${event.id}`;
                            return (
                                <TableRow key={event.id}>
                                    <TableCell>{event.sellerName}</TableCell>
                                    <TableCell className="font-medium">{event.name}</TableCell>
                                    <TableCell className="font-semibold">{event.commissionRate}%</TableCell>
                                    <TableCell>
                                        <Badge variant={event.status === 'active' ? 'default' : 'outline'}>{event.status}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {event.status === 'proposed' && (
                                            <div className="flex gap-2 justify-end">
                                                <Button size="sm" variant="secondary" onClick={() => handleProposal(event.id, 'active')}>
                                                    <CheckCircle className="mr-2 h-4 w-4"/> Accept
                                                </Button>
                                                <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleProposal(event.id, 'declined')}>
                                                    <XCircle className="mr-2 h-4 w-4"/> Decline
                                                </Button>
                                            </div>
                                        )}
                                        {event.status === 'active' && (
                                             <Button size="sm" variant="outline" onClick={() => copyToClipboard(campaignLink, 'campaign', event.id)} disabled={!userProfile?.tradintaId}>
                                                {copiedCampaignLink === event.id ? <ClipboardCheck className="mr-2 h-4 w-4 text-green-500"/> : <LinkIcon className="mr-2 h-4 w-4" />}
                                                {copiedCampaignLink === event.id ? 'Copied!' : 'Copy Link'}
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            )
                        })
                   ) : (
                    <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                            No deal proposals yet.
                        </TableCell>
                    </TableRow>
                   )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="sales">
            <Card>
                <CardHeader>
                    <CardTitle>Recent Attributed Sales</CardTitle>
                    <CardDescription>Sales from users who used your links.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader><TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Campaign</TableHead>
                            <TableHead>Order ID</TableHead>
                            <TableHead>Order Amount</TableHead>
                            <TableHead>Your Commission</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow></TableHeader>
                        <TableBody>
                            {mockSales.map(sale => (
                                <TableRow key={sale.id}>
                                    <TableCell>{sale.date}</TableCell>
                                    <TableCell>{sale.campaign}</TableCell>
                                    <TableCell>{sale.orderId}</TableCell>
                                    <TableCell>KES {sale.amount.toLocaleString()}</TableCell>
                                    <TableCell className="font-medium text-primary">KES {sale.commission.toLocaleString()}</TableCell>
                                    <TableCell><Badge variant={sale.status === 'Paid' ? 'secondary' : 'default'}>{sale.status}</Badge></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="payouts">
            <Card>
                 <CardHeader>
                    <CardTitle>Payout History</CardTitle>
                    <CardDescription>Record of commissions paid out to you.</CardDescription>
                </CardHeader>
                 <CardContent>
                    <Table>
                        <TableHeader><TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow></TableHeader>
                        <TableBody>
                             {mockPayouts.map(payout => (
                                <TableRow key={payout.id}>
                                    <TableCell>{payout.date}</TableCell>
                                    <TableCell>KES {payout.amount.toLocaleString()}</TableCell>
                                    <TableCell><Badge variant="secondary">{payout.status}</Badge></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
