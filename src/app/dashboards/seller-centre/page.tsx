import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserCheck, Star, BarChart, LifeBuoy } from "lucide-react";

const pendingVerifications = [
    { id: 'S004', name: 'Creative Prints', industry: 'Packaging', date: '2023-11-14' },
    { id: 'S005', name: 'AgriChem Solutions', industry: 'Chemicals', date: '2023-11-13' },
];

const sellerPerformance = [
    { id: 'S001', name: 'Constructa Ltd', rating: 4.8, sales: 15, status: 'Active' },
    { id: 'S002', name: 'SuperBake Bakery', rating: 4.9, sales: 22, status: 'Active' },
    { id: 'S003', name: 'PlastiCo Kenya', rating: 4.7, sales: 8, status: 'Restricted' },
];

export default function SellerCentreDashboard() {
    return (
        <Tabs defaultValue="onboarding">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="onboarding">Onboarding & Verification</TabsTrigger>
                <TabsTrigger value="performance">Seller Performance</TabsTrigger>
                <TabsTrigger value="support">Support & Training</TabsTrigger>
            </TabsList>

            <TabsContent value="onboarding">
                <Card>
                    <CardHeader>
                        <CardTitle>Seller Onboarding Queue</CardTitle>
                        <CardDescription>Review and approve new manufacturers waiting to join Tradinta.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Company Name</TableHead>
                                    <TableHead>Industry</TableHead>
                                    <TableHead>Application Date</TableHead>
                                    <TableHead>Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {pendingVerifications.map((seller) => (
                                    <TableRow key={seller.id}>
                                        <TableCell className="font-medium">{seller.name}</TableCell>
                                        <TableCell>{seller.industry}</TableCell>
                                        <TableCell>{seller.date}</TableCell>
                                        <TableCell>
                                            <Button size="sm"><UserCheck className="mr-2 h-4 w-4"/> Review Application</Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </TabsContent>
            
            <TabsContent value="performance">
                <Card>
                    <CardHeader>
                        <CardTitle>Seller Performance</CardTitle>
                        <CardDescription>Track seller ratings, sales performance, and account status.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Seller</TableHead>
                                    <TableHead>Rating</TableHead>
                                    <TableHead>Total Sales (Last 30d)</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sellerPerformance.map((seller) => (
                                    <TableRow key={seller.id}>
                                        <TableCell className="font-medium">{seller.name}</TableCell>
                                        <TableCell><Star className="inline mr-1 h-4 w-4 text-yellow-400"/>{seller.rating}</TableCell>
                                        <TableCell>{seller.sales}</TableCell>
                                        <TableCell><Badge variant={seller.status === 'Active' ? 'secondary' : 'destructive'}>{seller.status}</Badge></TableCell>
                                        <TableCell className="space-x-2">
                                            <Button variant="outline" size="sm"><BarChart className="mr-1 h-4 w-4"/> View Analytics</Button>
                                            <Button variant="destructive" size="sm" disabled={seller.status !== 'Restricted'}>Lift Restriction</Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="support">
                <Card>
                    <CardHeader>
                        <CardTitle>Support Resources & Training</CardTitle>
                        <CardDescription>Manage help articles and training materials for sellers.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Card>
                           <CardContent className="p-6 flex items-center justify-between">
                               <div>
                                   <p className="font-semibold">Seller Handbook</p>
                                   <p className="text-sm text-muted-foreground">The complete guide to selling on Tradinta.</p>
                               </div>
                               <Button variant="outline">Manage Content</Button>
                           </CardContent>
                        </Card>
                        <Card>
                           <CardContent className="p-6 flex items-center justify-between">
                               <div>
                                   <p className="font-semibold">Video Tutorials</p>
                                   <p className="text-sm text-muted-foreground">Training videos for product uploads, marketing, and more.</p>
                               </div>
                               <Button variant="outline">Upload/Edit Videos</Button>
                           </CardContent>
                        </Card>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    );
}
