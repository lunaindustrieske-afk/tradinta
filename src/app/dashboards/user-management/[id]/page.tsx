'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, User, Mail, Shield, AlertTriangle, Key, Trash2 } from 'lucide-react';
import Link from 'next/link';

type UserProfile = {
  id: string;
  fullName: string;
  email: string;
  role: string;
  tradintaId: string;
  registrationDate?: any;
};

const DetailItem = ({ label, value }: { label: string; value?: string | null }) => (
    <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-semibold">{value || 'N/A'}</p>
    </div>
);

export default function UserDetailPage() {
    const params = useParams();
    const userId = params.id as string;
    const firestore = useFirestore();

    const userDocRef = useMemoFirebase(() => {
        if (!firestore || !userId) return null;
        return doc(firestore, 'users', userId);
    }, [firestore, userId]);

    const { data: user, isLoading } = useDoc<UserProfile>(userDocRef);

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-10 w-64" />
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-1/3" />
                        <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-5 w-full" />
                        <Skeleton className="h-5 w-full" />
                        <Skeleton className="h-5 w-2/3" />
                    </CardContent>
                </Card>
            </div>
        );
    }
    
    if (!user) {
        return (
             <div className="text-center">
                <h1 className="text-xl font-bold">User not found</h1>
                <p className="text-muted-foreground">The user you are looking for does not exist.</p>
                <Button variant="link" asChild><Link href="/dashboards/user-management">Return to list</Link></Button>
            </div>
        )
    }

    return (
         <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" className="h-7 w-7" asChild>
                    <Link href="/dashboards/user-management">
                        <ChevronLeft className="h-4 w-4" />
                        <span className="sr-only">Back</span>
                    </Link>
                </Button>
                <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                    User Profile
                </h1>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                    <Card>
                        <CardHeader className="flex flex-row items-start justify-between">
                            <div>
                                <CardTitle className="text-2xl">{user.fullName}</CardTitle>
                                <CardDescription>{user.email}</CardDescription>
                            </div>
                            <Badge variant="outline" className="capitalize">{user.role}</Badge>
                        </CardHeader>
                        <CardContent className="grid sm:grid-cols-2 gap-4">
                            <DetailItem label="Tradinta ID" value={user.tradintaId} />
                             <DetailItem 
                                label="Registration Date" 
                                value={user.registrationDate ? new Date(user.registrationDate.seconds * 1000).toLocaleDateString() : 'N/A'} 
                            />
                            <DetailItem label="Last Login" value="2 days ago (mock)" />
                             <DetailItem label="Account Status" value="Active (mock)" />
                        </CardContent>
                    </Card>
                </div>
                 <div className="md:col-span-1">
                    <Card>
                        <CardHeader>
                            <CardTitle>Administrative Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Button variant="outline" className="w-full justify-start"><Key className="mr-2 h-4 w-4" /> Send Password Reset</Button>
                            <Button variant="outline" className="w-full justify-start"><Shield className="mr-2 h-4 w-4" /> Change Role</Button>
                            <Button variant="destructive" className="w-full justify-start"><AlertTriangle className="mr-2 h-4 w-4" /> Suspend User</Button>
                        </CardContent>
                        <CardFooter>
                            <Button variant="link" className="text-destructive p-0 h-auto">
                                <Trash2 className="mr-2 h-4 w-4" /> Delete User Permanently
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
}
