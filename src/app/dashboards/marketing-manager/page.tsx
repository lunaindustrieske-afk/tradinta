
'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Megaphone, Users, BarChart, PlusCircle } from "lucide-react";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, collectionGroup, query, where } from "firebase/firestore";
import type { Campaign } from '@/app/lib/definitions';
import { Skeleton } from "@/components/ui/skeleton";

type UserProfile = {
    id: string;
    fullName: string;
    role: string;
    // We don't have these fields yet, but can add later
    // campaigns: number; 
    // followers: string;
};


export default function MarketingDashboard() {
    const firestore = useFirestore();

    const campaignsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        // Use a collectionGroup query to get all campaigns across all manufacturers
        return query(collectionGroup(firestore, 'marketingCampaigns'));
    }, [firestore]);

    const ambassadorsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'users'), where('role', '==', 'partner'));
    }, [firestore]);

    const { data: campaigns, isLoading: isLoadingCampaigns } = useCollection<Campaign>(campaignsQuery);
    const { data: ambassadors, isLoading: isLoadingAmbassadors } = useCollection<UserProfile>(ambassadorsQuery);
    
    const renderCampaignRows = () => {
        if (isLoadingCampaigns) {
            return Array.from({length: 3}).map((_, i) => (
                <TableRow key={`skel-camp-${i}`}>
                    <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-9 w-40" /></TableCell>
                </TableRow>
            ));
        }
        if (!campaigns || campaigns.length === 0) {
            return <TableRow><TableCell colSpan={6} className="text-center h-24">No campaigns found.</TableCell></TableRow>;
        }
        return campaigns.map((campaign) => (
            <TableRow key={campaign.id}>
                <TableCell className="font-medium">{campaign.name}</TableCell>
                <TableCell><Badge variant={campaign.status === 'Active' ? 'default' : 'outline'}>{campaign.status}</Badge></TableCell>
                <TableCell>{campaign.budget?.toLocaleString() || 'N/A'}</TableCell>
                <TableCell>{campaign.impressions?.toLocaleString() || 0}</TableCell>
                <TableCell>{campaign.clicks?.toLocaleString() || 0}</TableCell>
                <TableCell className="space-x-2">
                    <Button variant="outline" size="sm">Edit</Button>
                    <Button size="sm"><BarChart className="mr-1 h-4 w-4"/> View Analytics</Button>
                </TableCell>
            </TableRow>
        ));
    };

    const renderAmbassadorRows = () => {
        if (isLoadingAmbassadors) {
            return Array.from({length: 2}).map((_, i) => (
                 <TableRow key={`skel-amb-${i}`}>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-9 w-24" /></TableCell>
                </TableRow>
            ));
        }
        if (!ambassadors || ambassadors.length === 0) {
            return <TableRow><TableCell colSpan={5} className="text-center h-24">No Growth Partners found.</TableCell></TableRow>;
        }
        return ambassadors.map((amb) => (
            <TableRow key={amb.id}>
                <TableCell className="font-medium">{amb.fullName}</TableCell>
                <TableCell><Badge variant={'secondary'}>{'Verified'}</Badge></TableCell>
                <TableCell>{0}</TableCell>
                <TableCell>{'N/A'}</TableCell>
                <TableCell>
                    <Button variant="outline" size="sm">View Profile</Button>
                </TableCell>
            </TableRow>
        ));
    };


    return (
        <Tabs defaultValue="campaigns">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="campaigns">Campaign Management</TabsTrigger>
                <TabsTrigger value="ambassadors">Growth Partner Network</TabsTrigger>
                <TabsTrigger value="promotions">Promotions & Banners</TabsTrigger>
            </TabsList>
            
            <TabsContent value="campaigns">
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle>Marketing Campaigns</CardTitle>
                                <CardDescription>Manage promotional campaigns and ad placements across the platform.</CardDescription>
                            </div>
                            <Button><PlusCircle className="mr-2 h-4 w-4" /> Create New Campaign</Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Campaign Name</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Budget (KES)</TableHead>
                                    <TableHead>Impressions</TableHead>
                                    <TableHead>Clicks</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {renderCampaignRows()}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="ambassadors">
                <Card>
                    <CardHeader>
                        <CardTitle>Growth Partner Network</CardTitle>
                        <CardDescription>Manage and approve influencers and brand ambassadors.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Active Campaigns</TableHead>
                                    <TableHead>Follower Count</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {renderAmbassadorRows()}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="promotions">
                 <Card>
                    <CardHeader>
                        <CardTitle>Homepage Banners & Promotions</CardTitle>
                        <CardDescription>Manage featured listings and homepage ad banners.</CardDescription>
                    </CardHeader>
                     <CardContent>
                        <div className="h-[300px] w-full bg-muted rounded-md flex items-center justify-center">
                           <Megaphone className="h-16 w-16 text-muted-foreground" />
                           <p className="ml-4 text-muted-foreground">Banner Management Component Here</p>
                       </div>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    );
}
