import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DollarSign, BarChart, Users, Link as LinkIcon } from "lucide-react";
import { ResponsiveContainer, ComposedChart, XAxis, YAxis, Tooltip, Legend, Bar } from 'recharts';

const campaigns = [
    { id: 'CAMP-A01', name: 'Eco-Friendly Packaging Launch', seller: 'GreenPack Ltd', status: 'Active', earnings: 5200, clicks: 450 },
    { id: 'CAMP-A02', name: 'Steel Deals', seller: 'Constructa Ltd', status: 'Active', earnings: 12500, clicks: 1102 },
    { id: 'CAMP-A03', name: 'Bake Off Bonanza', seller: 'SuperBake Bakery', status: 'Completed', earnings: 8800, clicks: 750 },
];

const referralLinks = [
    { id: 'REF001', product: 'GreenPack Boxes', link: 'https://tradinta.com/ref/johndoe/gp01', clicks: 120, conversions: 12 },
    { id: 'REF002', product: 'Constructa Steel Beams', link: 'https://tradinta.com/ref/johndoe/cs02', clicks: 350, conversions: 8 },
];

const performanceData = [
  { name: 'Week 1', clicks: 400, earnings: 2400 },
  { name: 'Week 2', clicks: 300, earnings: 1398 },
  { name: 'Week 3', clicks: 500, earnings: 9800 },
  { name: 'Week 4', clicks: 278, earnings: 3908 },
];

export default function AmbassadorDashboard() {
    return (
        <Tabs defaultValue="overview">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="campaigns">My Campaigns</TabsTrigger>
                <TabsTrigger value="referrals">Referral Links & Codes</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
                <Card>
                    <CardHeader>
                        <CardTitle>Influencer Dashboard — Tradinta Creators Hub</CardTitle>
                        <CardDescription>Monitor your performance, earnings, and collaborations in real-time.</CardDescription>
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
                                    <CardTitle className="text-sm font-medium">Total Clicks from Links</CardTitle>
                                    <BarChart className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">2,302</div>
                                    <p className="text-xs text-muted-foreground">+15% from last month</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Conversions</CardTitle>
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
                               <ResponsiveContainer width="100%" height={300}>
                                    <ComposedChart data={performanceData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="clicks" fill="hsl(var(--primary))" name="Clicks" />
                                        <Bar dataKey="earnings" fill="hsl(var(--accent))" name="Earnings (KES)" />
                                    </ComposedChart>
                               </ResponsiveContainer>
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
                        <CardTitle>My Referral Links & Promo Codes</CardTitle>
                        <CardDescription>Generate and track unique links to earn from sales.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex justify-end mb-4">
                            <Button>Generate New Link</Button>
                        </div>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Product / Campaign</TableHead>
                                    <TableHead>Referral Link / Code</TableHead>
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
