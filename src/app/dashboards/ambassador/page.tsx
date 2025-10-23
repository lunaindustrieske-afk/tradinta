import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DollarSign, BarChart, Users, Link as LinkIcon } from "lucide-react";

const campaigns = [
    { id: 'CAMP-A01', name: 'Eco-Friendly Packaging Launch', seller: 'GreenPack Ltd', status: 'Active', earnings: 5200, clicks: 450 },
    { id: 'CAMP-A02', name: 'Steel Deals', seller: 'Constructa Ltd', status: 'Active', earnings: 12500, clicks: 1102 },
    { id: 'CAMP-A03', name: 'Bake Off Bonanza', seller: 'SuperBake Bakery', status: 'Completed', earnings: 8800, clicks: 750 },
];

const referralLinks = [
    { id: 'REF001', product: 'GreenPack Boxes', link: 'https://tradinta.com/ref/johndoe/gp01', clicks: 120, conversions: 12 },
    { id: 'REF002', product: 'Constructa Steel Beams', link: 'https://tradinta.com/ref/johndoe/cs02', clicks: 350, conversions: 8 },
];

export default function AmbassadorDashboard() {
    return (
        <Tabs defaultValue="overview">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="campaigns">My Campaigns</TabsTrigger>
                <TabsTrigger value="referrals">Referral Links</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
                <Card>
                    <CardHeader>
                        <CardTitle>Ambassador / Influencer Dashboard</CardTitle>
                        <CardDescription>Run digital ads, access your marketing dashboard, and earn commissions.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                             <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">KES 26,500</div>
                                    <p className="text-xs text-muted-foreground">+KES 5,200 this month</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
                                    <BarChart className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">2,302</div>
                                    <p className="text-xs text-muted-foreground">+15% from last month</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Conversions</CardTitle>
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">45</div>
                                    <p className="text-xs text-muted-foreground">5 new conversions this week</p>
                                </CardContent>
                            </Card>
                             <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                                    <BarChart className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">1.95%</div>
                                    <p className="text-xs text-muted-foreground">Up from 1.8% last month</p>
                                </CardContent>
                            </Card>
                        </div>
                        <Card>
                           <CardHeader>
                               <CardTitle>Performance Overview</CardTitle>
                               <CardDescription>Your campaign performance over the last 30 days.</CardDescription>
                           </CardHeader>
                           <CardContent>
                               {/* Placeholder for a chart */}
                               <div className="h-[200px] w-full bg-muted rounded-md flex items-center justify-center">
                                   <BarChart className="h-16 w-16 text-muted-foreground" />
                                   <p className="ml-4 text-muted-foreground">Earnings & Clicks Chart</p>
                               </div>
                           </CardContent>
                        </Card>
                    </CardContent>
                </Card>
            </TabsContent>
            
            <TabsContent value="campaigns">
                <Card>
                    <CardHeader>
                        <CardTitle>My Campaigns</CardTitle>
                        <CardDescription>Manage your active and past promotional campaigns.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Campaign Name</TableHead>
                                    <TableHead>Seller</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Clicks</TableHead>
                                    <TableHead>Earnings</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {campaigns.map((campaign) => (
                                    <TableRow key={campaign.id}>
                                        <TableCell className="font-medium">{campaign.name}</TableCell>
                                        <TableCell>{campaign.seller}</TableCell>
                                        <TableCell><Badge variant={campaign.status === 'Active' ? 'default' : 'outline'}>{campaign.status}</Badge></TableCell>
                                        <TableCell>{campaign.clicks}</TableCell>
                                        <TableCell>KES {campaign.earnings.toLocaleString()}</TableCell>
                                        <TableCell>
                                            <Button variant="outline" size="sm">View Analytics</Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="referrals">
                <Card>
                    <CardHeader>
                        <CardTitle>My Referral Links</CardTitle>
                        <CardDescription>Generate and track unique links to earn from sales.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex justify-end mb-4">
                            <Button>Generate New Link</Button>
                        </div>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Product</TableHead>
                                    <TableHead>Referral Link</TableHead>
                                    <TableHead>Clicks</TableHead>
                                    <TableHead>Conversions</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {referralLinks.map((ref) => (
                                    <TableRow key={ref.id}>
                                        <TableCell className="font-medium">{ref.product}</TableCell>
                                        <TableCell><LinkIcon className="inline h-4 w-4 mr-2"/>{ref.link}</TableCell>
                                        <TableCell>{ref.clicks}</TableCell>
                                        <TableCell>{ref.conversions}</TableCell>
                                        <TableCell>
                                            <Button variant="ghost" size="sm">Copy Link</Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    );
}
