
'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import {
  Star,
  Users,
  BarChart,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, collection, query, where, limit, getDocs } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { FollowButton } from '@/components/follow-button';


type UserProfile = {
  id: string;
  fullName: string;
  bio?: string;
  photoURL?: string;
};

export default function PartnerProfilePage() {
  const params = useParams();
  const partnerId = params.id as string;
  const firestore = useFirestore();

  const [partner, setPartner] = React.useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (!firestore || !partnerId) return;
    const fetchPartner = async () => {
      setIsLoading(true);
      const userRef = doc(firestore, 'users', partnerId);
      const docSnap = await getDoc(userRef);
      
      if (docSnap.exists() && docSnap.data().role === 'partner') {
        setPartner({ id: docSnap.id, ...docSnap.data() } as UserProfile);
      } else {
        setPartner(null);
      }
      setIsLoading(false);
    };
    fetchPartner();
  }, [firestore, partnerId]);

  if (isLoading) {
    return (
        <div className="container mx-auto px-4 py-12">
            <Skeleton className="h-6 w-1/3 mb-12" />
            <div className="grid md:grid-cols-3 items-center gap-8 mb-12">
                <div className="md:col-span-2 space-y-4">
                    <Skeleton className="h-12 w-3/4" />
                    <Skeleton className="h-6 w-full" />
                </div>
                <div className="flex justify-center md:justify-end">
                    <Skeleton className="h-32 w-32 rounded-full" />
                </div>
            </div>
            <Skeleton className="h-48 w-full" />
        </div>
    )
  }

  if (!partner) {
    return notFound();
  }

  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-8">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem><BreadcrumbLink asChild><Link href="/">Home</Link></BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbLink asChild><Link href="/partners">Partners</Link></BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbPage>{partner.fullName}</BreadcrumbPage></BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        
        <header className="grid md:grid-cols-3 gap-8 items-center mb-12">
          <div className="md:col-span-2">
            <h1 className="text-4xl lg:text-5xl font-bold font-headline mb-3">{partner.fullName}</h1>
            <p className="text-lg text-muted-foreground mb-4">Tradinta Growth Partner</p>
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2"><Users className="w-4 h-4 text-muted-foreground" /> 1,234 Followers</div>
                <FollowButton targetId={partner.id} targetType="partner" />
            </div>
          </div>
          <div className="flex justify-start md:justify-end">
            <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
                <AvatarImage src={partner.photoURL || `https://i.pravatar.cc/150?u=${partner.id}`} />
                <AvatarFallback>{partner.fullName.charAt(0)}</AvatarFallback>
            </Avatar>
          </div>
        </header>

        <section className="mb-16">
          <Card>
            <CardHeader>
              <CardTitle>About {partner.fullName}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{partner.bio || "This partner has not added a bio yet."}</p>
            </CardContent>
          </Card>
        </section>

        <section>
          <h2 className="text-2xl font-bold font-headline mb-6">Promoted Campaigns</h2>
           <div className="text-center py-16 bg-muted/50 rounded-lg">
                <h3 className="text-lg font-semibold">No Active Campaigns</h3>
                <p className="text-muted-foreground mt-2">
                    This partner is not currently promoting any campaigns.
                </p>
            </div>
        </section>
      </div>
    </div>
  );
}
