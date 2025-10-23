
'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
    Package, 
    ShoppingCart, 
    FileText, 
    BarChart, 
    Star, 
    DollarSign, 
    MoreVertical,
    ArrowRight,
    Lock,
    Banknote,
    MessageSquare
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const products = [
    { id: 'PROD-001', name: 'Industrial Grade Cement', stock: 1200, status: 'Live' },
    { id: 'PROD-003', name: 'HDPE Plastic Pellets', stock: 0, status: 'Out of Stock' },
    { id: 'PROD-004', name: 'Recycled Kraft Paper Rolls', stock: 300, status: 'Live' },
];

const orders = [
    { id: 'ORD-006', customer: 'BuildRight Const.', total: 450000, status: 'Pending Fulfillment' },
    { id: 'ORD-008', customer: 'Yum Foods', total: 66000, status: 'Shipped' },
];

const reviews = [
    { 
        id: 'rev-1',
        author: 'BuildRight Const.',
        rating: 5,
        comment: 'Reliable supplier with consistent quality. Our go-to for all major projects.',
        product: 'Industrial Grade Cement',
        date: '2 days ago',
        avatar: 'https://picsum.photos/seed/rev1/32/32'
    },
    { 
        id: 'rev-2',
        author: 'Home Builders Inc.',
        rating: 4,
        comment: 'Good products and fair pricing. Sometimes lead times can be longer than stated.',
        product: 'Steel Reinforcement Bars',
        date: '1 week ago',
        avatar: 'https://picsum.photos/seed/rev2/32/32'
    }
]

export default function SellerDashboard() {
    return (
        <div className="space-y-6">
             <Card>
                <CardHeader>
                    <CardTitle>Constructa Ltd. Shop Dashboard</CardTitle>
                    <CardDescription>Your central hub for managing your shop, products, and orders.</CardDescription>
                </CardHeader>
            </Card>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">KES 1,250,000</div>
                        <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+12</div>
                        <p className="text-xs text-muted-foreground">+5 from yesterday</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Quotes</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">5</div>
                        <p className="text-xs text-muted-foreground">2 new RFQs today</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Shop Rating</CardTitle>
                        <Star className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">4.8 / 5.0</div>
                        <p className="text-xs text-muted-foreground">From 150 reviews</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Recent Orders */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Recent Orders</CardTitle>
                            <Button variant="ghost" size="sm">View All</Button>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Order ID</TableHead>
                                        <TableHead>Customer</TableHead>
                                        <TableHead>Total</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {orders.map((order) => (
                                        <TableRow key={order.id}>
                                            <TableCell className="font-medium">{order.id}</TableCell>
                                            <TableCell>{order.customer}</TableCell>
                                            <TableCell>KES {order.total.toLocaleString()}</TableCell>
                                            <TableCell><Badge variant={order.status === 'Shipped' ? 'secondary' : 'default'}>{order.status}</Badge></TableCell>
                                            <TableCell><Button size="sm">View Order</Button></TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {/* Recent Reviews */}
                     <Card>
                        <CardHeader>
                            <CardTitle>Recent Customer Reviews</CardTitle>
                            <CardDescription>Manage your shop's reputation and engage with buyers.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {reviews.map(review => (
                                <div key={review.id} className="p-4 border rounded-lg space-y-2">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarImage src={review.avatar} />
                                                <AvatarFallback>{review.author.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-semibold">{review.author}</p>
                                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                    <p>on {review.product}</p>
                                                    <span className="mx-1">•</span>
                                                    <p>{review.date}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}/>
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-sm text-muted-foreground pl-11">"{review.comment}"</p>
                                     <div className="flex items-center gap-2 pl-11 pt-1">
                                        <Button size="sm" variant="outline"><MessageSquare className="mr-2 h-4 w-4"/> Reply</Button>
                                        <Button size="sm" variant="ghost">Report</Button>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                </div>

                {/* Right column */}
                <div className="space-y-6">
                    {/* Wallet Card */}
                     <Card>
                        <CardHeader>
                            <CardTitle>My Wallet</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Available for Payout</p>
                                <p className="text-2xl font-bold">KES 875,500</p>
                            </div>
                             <div className="border-t pt-4">
                                <p className="text-sm text-muted-foreground flex items-center gap-2"><Lock className="w-4 h-4" /> Funds in Escrow</p>
                                <p className="text-lg font-semibold">KES 120,000</p>
                            </div>
                             <div className="border-t pt-4">
                                <p className="text-sm text-muted-foreground">Last Payout</p>
                                <p className="text-lg font-semibold">KES 500,000 on 1 Nov 2023</p>
                            </div>
                        </CardContent>
                        <CardFooter className="flex-col items-stretch space-y-2">
                             <Button><Banknote className="mr-2 h-4 w-4"/> Request Payout</Button>
                             <Button variant="outline">View Statement</Button>
                        </CardFooter>
                    </Card>

                    {/* Shop Profile Card */}
                    <Card>
                        <CardHeader className="flex flex-row items-center">
                           <Image src="https://picsum.photos/seed/mfg1/64/64" alt="Shop Logo" width={56} height={56} className="rounded-lg mr-4" />
                           <div>
                                <CardTitle>Your Shop Profile</CardTitle>
                                <CardDescription>Public view</CardDescription>
                           </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground mb-4">Complete your profile to attract more buyers. Your current completion rate is 85%.</p>
                            <Progress value={85} className="mb-4 h-2" />
                        </CardContent>
                        <CardFooter>
                             <Button asChild variant="secondary" className="w-full">
                                <Link href="/dashboards/seller-centre/profile">
                                    Edit Profile <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                             </Button>
                        </CardFooter>
                    </Card>

                    {/* Products Quick View */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Products at a Glance</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Product</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {products.map((product) => (
                                        <TableRow key={product.id}>
                                            <TableCell className="font-medium">{product.name}</TableCell>
                                            <TableCell>
                                                <Badge variant={product.status === 'Live' ? 'default' : 'destructive'}>{product.status}</Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                         <CardFooter>
                            <Button asChild variant="outline" className="w-full">
                                <Link href="/dashboards/seller-centre/products">
                                    Manage All Products <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                         </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
}
