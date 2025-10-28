
'use client';

import * as React from 'react';
import Link from 'next/link';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Sparkles, Users, Clock, Percent, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

type ForgingEvent = {
  id: string;
  name: string;
  productName: string;
  productImageUrl: string;
  sellerName: string;
  sellerId: string;
  partnerName: string;
  partnerId: string;
  partnerAvatarUrl?: string;
  status: 'active' | 'finished';
  endTime: any; // Firestore Timestamp
  tiers: { buyerCount: number; discountPercentage: number }[];
  currentBuyerCount: number;
};

const CountdownTimer = ({ endTime }: { endTime: any }) => {
  const calculateTimeLeft = () => {
    const difference = +new Date(endTime.toDate()) - +new Date();
    let timeLeft: Record<string, number> = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
      };
    }
    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = React.useState(calculateTimeLeft);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearTimeout(timer);
  });
  
  if (!timeLeft.days && !timeLeft.hours && !timeLeft.minutes) {
      return <span className="font-semibold text-destructive">Ending soon!</span>
  }

  return (
    <div className="flex items-center gap-1 text-sm font-semibold">
      <Clock className="w-4 h-4" />
      <span>
        {timeLeft.days > 0 && `${timeLeft.days}d `}
        {timeLeft.hours > 0 && `${timeLeft.hours}h `}
        {timeLeft.minutes > 0 && `${timeLeft.minutes}m `}
        left
      </span>
    </div>
  );
};

const FoundryCard = ({ event }: { event: ForgingEvent }) => {
    const { currentDiscount, nextTier, progress } = React.useMemo(() => {
        const sortedTiers = [...event.tiers].sort((a, b) => a.buyerCount - b.buyerCount);
        let currentDiscount = 0;
        
        for (const tier of sortedTiers) {
            if (event.currentBuyerCount >= tier.buyerCount) {
                currentDiscount = tier.discountPercentage;
            }
        }
        
        const nextTier = sortedTiers.find(t => t.buyerCount > event.currentBuyerCount);
        const progress = nextTier ? (event.currentBuyerCount / nextTier.buyerCount) * 100 : 100;

        return { currentDiscount, nextTier, progress };
    }, [event.tiers, event.currentBuyerCount]);

    return (
        <Card className="overflow-hidden group">
            <Link href={`/products/${event.sellerId}/${event.id}`}> {/* Needs correct slug */}
                 <div className="relative aspect-video">
                    <Image src={event.productImageUrl || 'https://i.postimg.cc/j283ydft/image.png'} alt={event.productName} fill className="object-cover group-hover:scale-105 transition-transform" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
                     <div className="absolute top-2 right-2">
                        <CountdownTimer endTime={event.endTime} />
                    </div>
                     <div className="absolute bottom-4 left-4 text-white">
                        <h3 className="font-bold text-lg">{event.productName}</h3>
                        <p className="text-sm">from {event.sellerName}</p>
                    </div>
                </div>
            </Link>
            <CardContent className="p-4 space-y-3">
                 <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="font-semibold">{event.currentBuyerCount} Buyers Pledged</span>
                    </div>
                     <div className="flex items-center gap-2">
                        <Percent className="w-4 h-4 text-muted-foreground" />
                        <span className="font-bold text-lg text-primary">{currentDiscount}% OFF</span>
                    </div>
                </div>
                <div>
                    <Progress value={progress} className="h-2" />
                    {nextTier && (
                         <p className="text-xs text-muted-foreground mt-1.5 text-center">
                            {nextTier.buyerCount - event.currentBuyerCount} more buyers needed to unlock <span className="font-bold">{nextTier.discountPercentage}% OFF!</span>
                        </p>
                    )}
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                     <div className="flex items-center gap-2">
                        <Avatar className="w-8 h-8">
                            <AvatarImage src={event.partnerAvatarUrl} />
                            <AvatarFallback>{event.partnerName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="text-xs text-muted-foreground">Promoted by</p>
                            <p className="text-sm font-semibold">{event.partnerName}</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={`/products/${event.sellerId}/${event.id}`}> {/* Needs correct slug */}
                            Join Deal <ArrowRight className="w-4 h-4 ml-1" />
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

export default function FoundryPage() {
  const firestore = useFirestore();

  const eventsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, 'forgingEvents'),
      where('status', '==', 'active'),
      orderBy('endTime', 'asc')
    );
  }, [firestore]);

  const { data: events, isLoading } = useCollection<ForgingEvent>(eventsQuery);

  return (
    <div className="container mx-auto py-12">
      <div className="text-center mb-12">
        <Sparkles className="mx-auto h-12 w-12 text-primary animate-pulse" />
        <h1 className="text-4xl md:text-5xl font-bold font-headline mt-4 mb-4">
          The Foundry
        </h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Join forces with other buyers to forge incredible deals directly from
          manufacturers. The more people who pledge, the bigger the discount for everyone.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {isLoading ? (
             Array.from({length: 3}).map((_, i) => <Skeleton key={i} className="h-96 w-full" />)
        ) : events && events.length > 0 ? (
            events.map(event => <FoundryCard key={event.id} event={event} />)
        ) : (
            <div className="col-span-full text-center py-24 bg-muted/50 rounded-lg">
                <h3 className="text-xl font-semibold">No Active Deals</h3>
                <p className="text-muted-foreground mt-2">
                    There are no active Forging Events right now. Check back soon!
                </p>
            </div>
        )}
      </div>
    </div>
  );
}
