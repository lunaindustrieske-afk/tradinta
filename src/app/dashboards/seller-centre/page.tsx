
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, ShoppingCart, FileText, BarChart, Settings, LifeBuoy, Star } from "lucide-react";

const products = [
    { id: 'PROD-001', name: 'Industrial Grade Cement', category: 'Building Materials', price: 650, stock: 1200, status: 'Live' },
    { id: 'PROD-002', name: 'Commercial Baking Flour', category: 'Food & Beverage', price: 2200, stock: 800, status: 'Live' },
    { id: 'PROD-003', name: 'HDPE Plastic Pellets', category: 'Plastics & Polymers', price: 135000, stock: 0, status: 'Out of Stock' },
    { id: 'PROD-004', name: 'Recycled Kraft Paper Rolls', category: 'Packaging', price: 8500, stock: 300, status: 'Unlisted' },
];

const orders = [
    { id: 'ORD-006', customer: 'BuildRight Const.', date: '2023-11-15', total: 450000, status: 'Pending Fulfillment' },
    { id: 'ORD-008', customer: 'Yum Foods', date: '2023-11-16', total: 66000, status: 'Pending Fulfillment' },
];

const quotes = [
    { id: 'QUO-004', customer: 'Global Exports', product: 'HDPE Plastic Pellets', quantity: '10 tons', status: 'Pending Response' },
    { id: 'QUO-005', customer: 'Agri Supplies', product: 'Organic Fertilizers', quantity: '5 tons', status: 'Responded' },
]


export default function SellerDashboard() {
    return (
        <Tabs defaultValue="overview">
            <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="products">Products</TabsTrigger>
                <TabsTrigger value="orders">Orders</TabsTrigger>
                <TabsTrigger value="quotations">Quotations</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
                <Card>
                    <CardHeader>
                        <CardTitle>Seller Dashboard</CardTitle>
                        <CardDescription>Manage your shop, products, and orders.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                                    <FileText className="h-4 w-4 text-muted-foreground" />
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
                    </CardContent>
                </Card>
            </TabsContent>
            
            <TabsContent value="products">
                <Card>
                    <CardHeader>
                         <div className="flex justify-between items-center">
                            <div>
                                <CardTitle>My Products</CardTitle>
                                <CardDescription>Manage your product listings.</CardDescription>
                            </div>
                            <Button><Package className="mr-2 h-4 w-4" /> Add New Product</Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Product Name</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Price (KES)</TableHead>
                                    <TableHead>Stock</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {products.map((product) => (
                                    <TableRow key={product.id}>
                                        <TableCell className="font-medium">{product.name}</TableCell>
                                        <TableCell>{product.category}</TableCell>
                                        <TableCell>{product.price.toLocaleString()}</TableCell>
                                        <TableCell>{product.stock.toLocaleString()}</TableCell>
                                        <TableCell><Badge variant={product.status === 'Live' ? 'default' : 'outline'}>{product.status}</Badge></TableCell>
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
                        <CardTitle>Customer Orders</CardTitle>
                        <CardDescription>Track and fulfill your customer orders.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Order ID</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Total</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {orders.map((order) => (
                                    <TableRow key={order.id}>
                                        <TableCell>{order.id}</TableCell>
                                        <TableCell>{order.customer}</TableCell>
                                        <TableCell>{order.date}</TableCell>
                                        <TableCell>KES {order.total.toLocaleString()}</TableCell>
                                        <TableCell><Badge variant="default">{order.status}</Badge></TableCell>
                                        <TableCell><Button size="sm">Fulfill Order</Button></TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </TabsContent>
            
            <TabsContent value="quotations">
                <Card>
                    <CardHeader>
                        <CardTitle>Quotation Requests</CardTitle>
                        <CardDescription>Respond to inquiries from potential buyers.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <Table>
                            <TableHeader>
                                <TableRow>
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
                                        <TableCell>{quote.customer}</TableCell>
                                        <TableCell>{quote.product}</TableCell>
                                        <TableCell>{quote.quantity}</TableCell>
                                        <TableCell><Badge variant={quote.status === 'Pending Response' ? 'destructive' : 'outline'}>{quote.status}</Badge></TableCell>
                                        <TableCell><Button size="sm">Respond</Button></TableCell>
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
                           <p className="ml-4 text-muted-foreground">Performance Charts Coming Soon</p>
                       </div>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    );
}

    