
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
import { Coins, Star, UserPlus, ShoppingCart, Loader2, RefreshCw, Sparkles, Gift, Check, Ticket, Hash } from 'lucide-react';
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { collection, query, where, orderBy, limit, doc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { reconcileUserPoints } from '@/app/(auth)/actions';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type PointsLedgerEvent = {
    id: string;
    points: number;
    action: string;
    reason_code: string;
    created_at: any;
    metadata?: Record<string, any>;
};

type ReferredUser = {
  emailVerified: boolean;
};

const waysToEarn = [
  { icon: <UserPlus className="w-5 h-5 text-primary" />, title: 'Sign Up & Verify Email', points: '50 Points (Admin Defined)', description: 'One-time reward for joining the platform.' },
  { icon: <ShoppingCart className="w-5 h-5 text-primary" />, title: 'Make a Purchase', points: 'Variable', description: 'Earn points for every KES spent on orders from Verified sellers.' },
  { icon: <Star className="w-5 h-5 text-primary" />, title: 'Write a Review', points: '15 Points (Admin Defined)', description: 'Get rewarded for reviewing a product you purchased.' },
  { icon: <UserPlus className="w-5 h-5 text-primary" />, title: 'Refer a Friend', points: '100 Points (Admin Defined)', description: 'Awarded when your referral signs up and verifies their email.' },
];

export default function TradPointsDashboardPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isReconciling, setIsReconciling] = React.useState(false);

  // Fetch current user's full profile to get tradintaId
  const userDocRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);
  const { data: userProfile, isLoading: isLoadingProfile } = useDoc(userDocRef);


  // Fetch points ledger
  const ledgerQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
        collection(firestore, 'pointsLedgerEvents'), 
        where('user_id', '==', user.uid),
        orderBy('created_at', 'desc'),
        limit(50)
    );
  }, [user, firestore]);
  const { data: ledgerEvents, isLoading: isLoadingLedger } = useCollection<PointsLedgerEvent>(ledgerQuery);

  // Fetch users referred by the current user
  const referralsQuery = useMemoFirebase(() => {
    if (!userProfile?.tradintaId) return null;
    return query(collection(firestore, 'users'), where('referredBy', '==', userProfile.tradintaId));
  }, [userProfile, firestore]);
  const { data: referrals, isLoading: isLoadingReferrals } = useCollection<ReferredUser>(referralsQuery);
  
  const totalPoints = React.useMemo(() => {
    if (!ledgerEvents) return 0;
    return ledgerEvents.reduce((sum, event) => sum + event.points, 0);
  }, [ledgerEvents]);

  const referralStats = React.useMemo(() => {
    if (!referrals) return { verified: 0, unverified: 0 };
    return {
      verified: referrals.filter(r => r.emailVerified).length,
      unverified: referrals.filter(r => !r.emailVerified).length,
    };
  }, [referrals]);
  
  const handleReconcile = async () => {
    if (!user) return;
    setIsReconciling(true);
    try {
        const result = await reconcileUserPoints(user.uid);
        if(result.success) {
            toast({
                title: result.pointsAwarded > 0 ? "Reconciliation Complete!" : "All Good!",
                description: result.message,
            });
        } else {
            throw new Error(result.message);
        }
    } catch (error: any) {
        toast({ title: 'Error Reconciling Points', description: error.message, variant: 'destructive' });
    } finally {
        setIsReconciling(false);
    }
  };

  
  const renderLedgerRows = () => {
      const isLoading = isLoadingLedger || isLoadingProfile;
      if (isLoading) {
          return Array.from({length: 4}).map((_, i) => (
              <TableRow key={`skel-row-${i}`}>
                  <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
              </TableRow>
          ));
      }
      if (!ledgerEvents || ledgerEvents.length === 0) {
          return <TableRow><TableCell colSpan={3} className="text-center h-24">No points history yet.</TableCell></TableRow>;
      }
      return ledgerEvents.map(event => (
          <TableRow key={event.id}>
              <TableCell>
                  <p className="font-medium capitalize">{event.reason_code.replace(/_/g, ' ')}</p>
                  <p className="text-xs text-muted-foreground">{event.created_at ? new Date(event.created_at.seconds * 1000).toLocaleString() : ''}</p>
              </TableCell>
              <TableCell className={`font-semibold ${event.points > 0 ? 'text-green-600' : 'text-destructive'}`}>
                {event.points > 0 ? `+${event.points}` : event.points}
              </TableCell>
              <TableCell>
                  <Badge variant={event.action === 'award' ? 'secondary' : 'outline'}>
                      {event.action}
                  </Badge>
              </TableCell>
          </TableRow>
      ));
  };


  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
                <Coins className="w-6 h-6 text-primary" />
                My TradPoints
            </CardTitle>
            <Button variant="outline" size="sm" onClick={handleReconcile} disabled={isReconciling}>
                {isReconciling ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                Sync My Points
            </Button>
          </div>
          <CardDescription>
            Your rewards hub. Earn points for your activity on Tradinta.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
             <Card className="col-span-1">
                <CardHeader>
                    <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
                </CardHeader>
                <CardContent>
                    {(isLoadingLedger || isLoadingProfile) ? <Skeleton className="h-8 w-32" /> : (
                        <div className="text-3xl font-bold flex items-center gap-2">
                           {totalPoints.toLocaleString()} <span className="text-lg text-muted-foreground">Points</span>
                        </div>
                    )}
                </CardContent>
            </Card>
            <Card className="col-span-1">
                <CardHeader>
                    <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                    {(isLoadingLedger || isLoadingProfile) ? <Skeleton className="h-8 w-16" /> : (
                        <div className="text-3xl font-bold flex items-center gap-2">
                           {ledgerEvents?.length || 0}
                        </div>
                    )}
                </CardContent>
            </Card>
             <Card className="col-span-1">
                <CardHeader>
                    <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
                </CardHeader>
                <CardContent>
                    {(isLoadingReferrals || isLoadingProfile) ? <Skeleton className="h-8 w-24" /> : (
                       <div className="flex items-end gap-4">
                            <div className="text-3xl font-bold">{referralStats.verified + referralStats.unverified}</div>
                            <div className="text-sm space-x-2">
                                <Badge className="bg-green-100 text-green-800">{referralStats.verified} Verified</Badge>
                                <Badge className="bg-yellow-100 text-yellow-800">{referralStats.unverified} Pending</Badge>
                            </div>
                       </div>
                    )}
                </CardContent>
            </Card>
        </CardContent>
      </Card>
      
      <div className="grid lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-1 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Ways to Earn</CardTitle>
                    <CardDescription>Complete tasks to earn more points.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {waysToEarn.map(item => (
                        <div key={item.title} className="flex items-start gap-4">
                            <div>{item.icon}</div>
                            <div>
                                <p className="font-semibold">{item.title}</p>
                                <p className="text-sm text-muted-foreground">{item.description}</p>
                                <Badge variant="outline" className="mt-1">{item.points}</Badge>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Ticket /> Redeem a Claim Code</CardTitle>
                    <CardDescription>Enter an 8-digit code from a promotion to claim your points.</CardDescription>
                </CardHeader>
                 <CardContent>
                    <div className="flex gap-2">
                        <Input placeholder="ABC-1234" />
                        <Button>Claim</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-2">
             <Card>
                <CardHeader>
                    <CardTitle>Points History</CardTitle>
                    <CardDescription>A complete ledger of your points transactions.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Activity</TableHead>
                                <TableHead>Points</TableHead>
                                <TableHead>Type</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {renderLedgerRows()}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
      </div>

    </div>
  );
}
