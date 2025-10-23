import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart, FileText, MessageSquare, Heart } from "lucide-react";

const myOrders = [
    { id: 'ORD-002', product: '50 sacks of Baking Flour', supplier: 'SuperBake Bakery', status: 'Pending Payment', total: 110000, date: '2023-10-27' },
    { id: 'ORD-001', product: '200 bags of Cement', supplier: 'Constructa Ltd', status: 'Delivered', total: 130000, date: '2023-10-26' },
];

const myQuotations = [
    { id: 'QUO-001', product: '200 bags of Cement', supplier: 'Constructa Ltd', status: 'Approved', expires: '2023-11-28' },
    { id: 'QUO-003', product: '10 tons of steel bars', supplier: 'SteelMakers Inc', status: 'Pending', expires: '2023-11-30' },
];

const myWishlist = [
    { id: 'PROD-003', name: 'HDPE Plastic Pellets', category: 'Plastics & Polymers', price: 135000.00 },
    { id: 'PROD-005', name: 'Bulk Cooking Oil', category: 'Food & Beverage', price: 4500.00 },
];

export default function BuyerDashboard() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Buyer Dashboard</CardTitle>
                <CardDescription>Manage your orders, quotations, and communications.</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="orders">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="orders">My Orders</TabsTrigger>
                        <TabsTrigger value="quotations">My Quotations</TabsTrigger>
                        <TabsTrigger value="messages">Messages</TabsTrigger>
                        <TabsTrigger value="wishlist">My Wishlist</TabsTrigger>
                    </TabsList>
                    <TabsContent value="orders">
                        <Card>
                            <CardHeader>
                                <CardTitle>My Orders</CardTitle>
                                <CardDescription>Track your active and past orders.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Order ID</TableHead>
                                            <TableHead>Product Summary</TableHead>
                                            <TableHead>Supplier</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Total</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {myOrders.map((order) => (
                                            <TableRow key={order.id}>
                                                <TableCell>{order.id}</TableCell>
                                                <TableCell className="font-medium">{order.product}</TableCell>
                                                <TableCell>{order.supplier}</TableCell>
                                                <TableCell><Badge variant={order.status === 'Delivered' ? 'secondary' : 'default'}>{order.status}</Badge></TableCell>
                                                <TableCell>KES {order.total.toLocaleString()}</TableCell>
                                                <TableCell className="space-x-2">
                                                    <Button variant="outline" size="sm">View Details</Button>
                                                    {order.status === 'Pending Payment' && <Button size="sm">Pay Now</Button>}
                                                </TableCell>
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
                                <CardTitle>My Quotations</CardTitle>
                                <CardDescription>Manage your requested price quotations.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Quote ID</TableHead>
                                            <TableHead>Product</TableHead>
                                            <TableHead>Supplier</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Expires On</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {myQuotations.map((quote) => (
                                            <TableRow key={quote.id}>
                                                <TableCell>{quote.id}</TableCell>
                                                <TableCell className="font-medium">{quote.product}</TableCell>
                                                <TableCell>{quote.supplier}</TableCell>
                                                <TableCell><Badge variant={quote.status === 'Approved' ? 'default' : 'outline'}>{quote.status}</Badge></TableCell>
                                                <TableCell>{quote.expires}</TableCell>
                                                <TableCell>
                                                    {quote.status === 'Approved' ? <Button size="sm">Accept & Order</Button> : <Button variant="outline" size="sm">View Quote</Button>}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="messages">
                        <Card>
                            <CardHeader>
                                <CardTitle>Messages</CardTitle>
                                <CardDescription>Conversations with sellers and support.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                 <div className="h-[300px] w-full bg-muted rounded-md flex items-center justify-center">
                                   <MessageSquare className="h-16 w-16 text-muted-foreground" />
                                   <p className="ml-4 text-muted-foreground">Message History Component Here</p>
                               </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="wishlist">
                         <Card>
                            <CardHeader>
                                <CardTitle>My Wishlist</CardTitle>
                                <CardDescription>Products you have saved for later.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Product Name</TableHead>
                                            <TableHead>Category</TableHead>
                                            <TableHead>Price</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {myWishlist.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="font-medium">{item.name}</TableCell>
                                                <TableCell>{item.category}</TableCell>
                                                <TableCell>KES {item.price.toLocaleString()}</TableCell>
                                                <TableCell className="space-x-2">
                                                    <Button size="sm">Add to Cart</Button>
                                                    <Button variant="outline" size="sm">Remove</Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
