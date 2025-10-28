
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
import { Coins, Star, UserPlus, ShoppingCart, Loader2 } from 'lucide-react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy, limit } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

type PointsLedgerEvent = {
    id: string;
    points: number;
    action: string;
    reason_code: string;
    created_at: any;
    metadata?: Record<string, any>;
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

  const totalPoints = React.useMemo(() => {
    if (!ledgerEvents) return 0;
    return ledgerEvents.reduce((sum, event) => sum + event.points, 0);
  }, [ledgerEvents]);
  
  const renderLedgerRows = () => {
      if (isLoadingLedger) {
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
          <CardTitle className="flex items-center gap-2">
            <Coins className="w-6 h-6 text-primary" />
            My TradPoints
          </CardTitle>
          <CardDescription>
            Your rewards hub. Earn points for your activity on Tradinta.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <Card className="w-fit">
                <CardHeader>
                    <CardTitle className="text-sm font-medium">Your Total Balance</CardTitle>
                </CardHeader>
                <CardContent>
                    {isUserLoading || isLoadingLedger ? <Skeleton className="h-8 w-32" /> : (
                        <div className="text-3xl font-bold flex items-center gap-2">
                           {totalPoints.toLocaleString()} <span className="text-lg text-muted-foreground">Points</span>
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
