
'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Megaphone, Users, BarChart, PlusCircle, ExternalLink } from "lucide-react";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, collectionGroup, query, where } from "firebase/firestore";
import { type Campaign } from '@/app/lib/definitions';
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

type UserProfile = {
    id: string;
    fullName: string;
    role: string;
};

const mockPartnerCampaigns = [
    { id: 'PCAMP-01', name: 'John Doe Q4 Promo', partner: 'John Doe', seller: 'Constructa Ltd', status: 'Active', sales: 450250, commission: 22512 },
    { id: 'PCAMP-02', name: 'Jane Smith Influencer Push', partner: 'Jane Smith', seller: 'SuperBake Bakery', status: 'Active', sales: 120000, commission: 6000 },
    { id: 'PCAMP-03', name: 'End of Year Clearance', partner: 'Kimani Traders', seller: 'PlastiCo Kenya', status: 'Finished', sales: 85000, commission: 4250 },
];


export default function MarketingDashboard() {
    const firestore = useFirestore();

    const campaignsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
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
            return <TableRow><TableCell colSpan={6} className="text-center h-24">No manufacturer campaigns found.</TableCell></TableRow>;
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
    
    const renderPartnerCampaignRows = () => {
        return mockPartnerCampaigns.map((campaign) => (
            <TableRow key={campaign.id}>
                <TableCell className="font-medium">{campaign.name}</TableCell>
                <TableCell>{campaign.partner}</TableCell>
                <TableCell>{campaign.seller}</TableCell>
                <TableCell><Badge variant={campaign.status === 'Active' ? 'default' : 'outline'}>{campaign.status}</Badge></TableCell>
                <TableCell>KES {campaign.sales.toLocaleString()}</TableCell>
                 <TableCell>KES {campaign.commission.toLocaleString()}</TableCell>
                <TableCell className="space-x-2">
                    <Button variant="outline" size="sm">View Details</Button>
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
        <Tabs defaultValue="partner-campaigns">
            <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="partner-campaigns">Growth Partner Campaigns</TabsTrigger>
                <TabsTrigger value="manufacturer-campaigns">Manufacturer Campaigns</TabsTrigger>
                <TabsTrigger value="ambassadors">Growth Partner Network</TabsTrigger>
                <TabsTrigger value="promotions">Site Content</TabsTrigger>
            </TabsList>
            
            <TabsContent value="partner-campaigns">
                 <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle>Growth Partner Campaigns</CardTitle>
                                <CardDescription>Create and track commissions for campaigns run by partners.</CardDescription>
                            </div>
                            <Button><PlusCircle className="mr-2 h-4 w-4" /> New Partner Campaign</Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Campaign Name</TableHead>
                                    <TableHead>Partner</TableHead>
                                    <TableHead>Seller</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Attributed Sales</TableHead>
                                    <TableHead>Commission Earned</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {renderPartnerCampaignRows()}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="manufacturer-campaigns">
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle>Manufacturer Ad Campaigns</CardTitle>
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
                        <CardTitle>Site Content Management</CardTitle>
                        <CardDescription>Manage homepage banners, blog posts, and other site content.</CardDescription>
                    </CardHeader>
                     <CardContent className="text-center py-12">
                        <Megaphone className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold">Manage Content Centrally</h3>
                        <p className="text-muted-foreground mt-2 mb-4">All site content, including homepage banners and blog posts, is managed in the Content Management dashboard.</p>
                        <Button asChild>
                            <Link href="/dashboards/content-management">Go to Content Management</Link>
                        </Button>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    );
}
