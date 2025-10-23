import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileWarning, CheckCircle, Clock, Users, Package, BarChart, AlertCircle, Handshake } from "lucide-react";

const pendingVerifications = [
  { id: 'V001', entity: 'MegaPlastics Ltd', type: 'Seller', date: '2023-11-15' },
  { id: 'V002', entity: 'FreshProduce Co.', type: 'Buyer', date: '2023-11-14' },
];

const recentOrders = [
  { id: 'ORD-006', product: 'Steel Beams', status: 'Pending', total: 450000, customer: 'BuildRight Const.' },
  { id: 'ORD-007', product: 'Organic Fertilizers', status: 'Shipped', total: 85000, customer: 'GreenFarms' },
];

const openDisputes = [
    { id: 'D001', order: 'ORD-003', user: 'PlastiCo Kenya', reason: 'Incorrect product specifications', status: 'Awaiting response' },
    { id: 'D002', order: 'ORD-005', user: 'PrintPack Solutions', reason: 'Order cancelled but charged', status: 'Under review' },
];

export default function OperationsManagerDashboard() {
    return (
        <Tabs defaultValue="overview">
            <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="approvals">Approvals & Verification</TabsTrigger>
                <TabsTrigger value="disputes">Dispute Resolution</TabsTrigger>
                <TabsTrigger value="platform-health">Platform Health</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview">
                <Card>
                    <CardHeader>
                        <CardTitle>Operations Manager Dashboard</CardTitle>
                        <CardDescription>Manage the daily functioning of the marketplace and ensure smooth business processes.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">1,257</div>
                                    <p className="text-xs text-muted-foreground">+30 since last week</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
                                    <Package className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">84</div>
                                    <p className="text-xs text-muted-foreground">2 new orders today</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Open Disputes</CardTitle>
                                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-destructive">5</div>
                                    <p className="text-xs text-muted-foreground">1 new dispute filed</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Platform Revenue (Today)</CardTitle>
                                    <BarChart className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">KES 45,231</div>
                                    <p className="text-xs text-muted-foreground">from transaction fees</p>
                                </CardContent>
                            </Card>
                        </div>
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Orders</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Order ID</TableHead>
                                            <TableHead>Product</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Amount</TableHead>
                                            <TableHead>Customer</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {recentOrders.map(order => (
                                            <TableRow key={order.id}>
                                                <TableCell>{order.id}</TableCell>
                                                <TableCell>{order.product}</TableCell>
                                                <TableCell><Badge variant={order.status === 'Pending' ? 'destructive' : 'secondary'}>{order.status}</Badge></TableCell>
                                                <TableCell>KES {order.total.toLocaleString()}</TableCell>
                                                <TableCell>{order.customer}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </CardContent>
                </Card>
            </TabsContent>

            {/* Approvals Tab */}
            <TabsContent value="approvals">
                <Card>
                    <CardHeader>
                        <CardTitle>Pending Verifications</CardTitle>
                        <CardDescription>Approve or reject new sellers and buyers waiting for platform access.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Entity Name</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Submission Date</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {pendingVerifications.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>{item.id}</TableCell>
                                        <TableCell className="font-medium">{item.entity}</TableCell>
                                        <TableCell>{item.type}</TableCell>
                                        <TableCell>{item.date}</TableCell>
                                        <TableCell className="space-x-2">
                                            <Button variant="outline" size="sm">View Documents</Button>
                                            <Button size="sm">Approve</Button>
                                            <Button variant="destructive" size="sm">Reject</Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </TabsContent>

            {/* Disputes Tab */}
            <TabsContent value="disputes">
                <Card>
                    <CardHeader>
                        <CardTitle>Open Disputes</CardTitle>
                        <CardDescription>Mediate and resolve conflicts between buyers and sellers.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Dispute ID</TableHead>
                                    <TableHead>Order ID</TableHead>
                                    <TableHead>User</TableHead>
                                    <TableHead>Reason</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {openDisputes.map((dispute) => (
                                    <TableRow key={dispute.id}>
                                        <TableCell>{dispute.id}</TableCell>
                                        <TableCell>{dispute.order}</TableCell>
                                        <TableCell>{dispute.user}</TableCell>
                                        <TableCell>{dispute.reason}</TableCell>
                                        <TableCell><Badge variant="outline">{dispute.status}</Badge></TableCell>
                                        <TableCell>
                                            <Button size="sm">Review Case</Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </TabsContent>
             {/* Platform Health Tab */}
            <TabsContent value="platform-health">
                <Card>
                    <CardHeader>
                        <CardTitle>Platform Health & Monitoring</CardTitle>
                        <CardDescription>Overview of system status and performance metrics.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                        <Card className="flex items-center p-4">
                            <CheckCircle className="h-8 w-8 text-green-500 mr-4"/>
                            <div>
                                <p className="font-bold">API Status</p>
                                <p className="text-sm text-green-500">All Systems Operational</p>
                            </div>
                        </Card>
                         <Card className="flex items-center p-4">
                            <Clock className="h-8 w-8 text-muted-foreground mr-4"/>
                            <div>
                                <p className="font-bold">Average Response Time</p>
                                <p className="text-sm">120ms</p>
                            </div>
                        </Card>
                        <Card className="flex items-center p-4">
                            <FileWarning className="h-8 w-8 text-yellow-500 mr-4"/>
                            <div>
                                <p className="font-bold">Error Rate</p>
                                <p className="text-sm">0.05%</p>
                            </div>
                        </Card>
                        <Card className="flex items-center p-4">
                            <Handshake className="h-8 w-8 text-blue-500 mr-4"/>
                            <div>
                                <p className="font-bold">Payment Gateway</p>
                                <p className="text-sm text-green-500">Connected</p>
                            </div>
                        </Card>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    );
}
