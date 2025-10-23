import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, BarChart, DollarSign, PlusCircle, Star, MessageSquare } from "lucide-react";
import { products, orders } from "@/app/lib/mock-data";


const quotes = [
    { id: 'QUO-005', customer: 'BuildWell Ltd', product: 'Industrial Grade Cement', quantity: 500, status: 'Pending' },
    { id: 'QUO-004', customer: 'Yum Foods', product: 'Commercial Baking Flour', quantity: 100, status: 'Responded' },
];

export default function SellerDashboard() {
    return (
        <Tabs defaultValue="overview">
            <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="products">Products</TabsTrigger>
                <TabsTrigger value="orders">Orders</TabsTrigger>
                <TabsTrigger value="quotes">Quotations</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
                <Card>
                    <CardHeader>
                        <CardTitle>Manufacturer / Seller Dashboard</CardTitle>
                        <CardDescription>Your central hub for managing your shop, products, and sales on Tradinta.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">KES 350,000</div>
                                    <p className="text-xs text-muted-foreground">+15% from last month</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
                                    <Package className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">12</div>
                                    <p className="text-xs text-muted-foreground">3 new orders today</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Pending Quotes</CardTitle>
                                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">3</div>
                                    <p className="text-xs text-muted-foreground">Respond to get orders</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Shop Rating</CardTitle>
                                    <Star className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">4.8/5.0</div>
                                    <p className="text-xs text-muted-foreground">Based on 150 reviews</p>
                                </CardContent>
                            </Card>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="products">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>My Products</CardTitle>
                            <CardDescription>Manage your product listings and inventory.</CardDescription>
                        </div>
                        <Button><PlusCircle className="mr-2 h-4 w-4"/> Add New Product</Button>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Product Name</TableHead>
                                    <TableHead>Stock</TableHead>
                                    <TableHead>Price (KES)</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {products.map((product) => (
                                    <TableRow key={product.id}>
                                        <TableCell className="font-medium">{product.name}</TableCell>
                                        <TableCell>{product.stock}</TableCell>
                                        <TableCell>{product.price.toLocaleString()}</TableCell>
                                        <TableCell><Badge>Active</Badge></TableCell>
                                        <TableCell className="space-x-2">
                                            <Button variant="outline" size="sm">Edit</Button>
                                            <Button variant="destructive" size="sm">Unlist</Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="orders">
                <Card>
                    <CardHeader>
                        <CardTitle>My Orders</CardTitle>
                        <CardDescription>Fulfill and track customer orders.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                             <TableHeader>
                                <TableRow>
                                    <TableHead>Order ID</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Product</TableHead>
                                    <TableHead>Total</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {orders.slice(0,3).map((order) => (
                                    <TableRow key={order.id}>
                                        <TableCell>{order.id}</TableCell>
                                        <TableCell>{order.customerName}</TableCell>
                                        <TableCell>{order.productName}</TableCell>
                                        <TableCell>KES {order.total.toLocaleString()}</TableCell>
                                        <TableCell><Badge variant={order.status === 'Pending' ? 'destructive' : 'default'}>{order.status}</Badge></TableCell>
                                        <TableCell>
                                            <Button size="sm" disabled={order.status !== 'Pending'}>Mark as Shipped</Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </TabsContent>
            
            <TabsContent value="quotes">
                <Card>
                    <CardHeader>
                        <CardTitle>Incoming Quotation Requests</CardTitle>
                        <CardDescription>Respond to inquiries from potential buyers.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <Table>
                             <TableHeader>
                                <TableRow>
                                    <TableHead>Quote ID</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Product</TableHead>
                                    <TableHead>Quantity</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {quotes.map((quote) => (
                                    <TableRow key={quote.id}>
                                        <TableCell>{quote.id}</TableCell>
                                        <TableCell>{quote.customer}</TableCell>
                                        <TableCell>{quote.product}</TableCell>
                                        <TableCell>{quote.quantity}</TableCell>
                                        <TableCell><Badge variant={quote.status === 'Pending' ? 'default' : 'outline'}>{quote.status}</Badge></TableCell>
                                        <TableCell>
                                            <Button size="sm" disabled={quote.status !== 'Pending'}>Respond</Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="analytics">
                <Card>
                    <CardHeader>
                        <CardTitle>Shop Analytics</CardTitle>
                        <CardDescription>Insights into your shop's performance.</CardDescription>
                    </CardHeader>
                    <CardContent>
                       <div className="h-[300px] w-full bg-muted rounded-md flex items-center justify-center">
                           <BarChart className="h-16 w-16 text-muted-foreground" />
                           <p className="ml-4 text-muted-foreground">Shop Performance Charts Here</p>
                       </div>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    );
}
