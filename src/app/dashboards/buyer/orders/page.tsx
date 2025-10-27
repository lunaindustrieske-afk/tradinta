
'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileText, Truck, CheckCircle, Clock, Eye, FileSignature } from "lucide-react";
import Link from 'next/link';

const orders = [
    {
        id: "ORD-002",
        products: "50 sacks of Baking Flour",
        seller: "SuperBake Bakery",
        total: "KES 110,000",
        status: "Shipped",
    },
    {
        id: "ORD-001",
        products: "200 bags of Cement",
        seller: "Constructa Ltd",
        total: "KES 130,000",
        status: "Delivered",
    },
];

const quotations = [
    {
        id: "RFQ-001",
        product: "Industrial Grade Cement",
        seller: "Constructa Ltd",
        status: "Responded",
        date: "2023-11-14",
    },
    {
        id: "RFQ-004",
        product: "Steel Beams (Custom)",
        seller: "Regional Distributors",
        status: "New",
        date: "2023-11-16",
    },
     {
        id: "RFQ-003",
        product: "HDPE Plastic Pellets",
        seller: "PlastiCo Kenya",
        status: "Accepted",
        date: "2023-11-12",
    },
];

const getStatusBadge = (status: string) => {
    switch (status) {
        case 'Delivered':
            return <Badge variant="secondary"><CheckCircle className="mr-1 h-3 w-3"/>{status}</Badge>;
        case 'Shipped':
            return <Badge><Truck className="mr-1 h-3 w-3"/>{status}</Badge>;
        case 'New':
        case 'Pending':
            return <Badge variant="outline"><Clock className="mr-1 h-3 w-3"/>{status}</Badge>;
        case 'Responded':
            return <Badge variant="secondary" className="bg-blue-100 text-blue-800"><FileSignature className="mr-1 h-3 w-3"/>{status}</Badge>;
        case 'Accepted':
             return <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle className="mr-1 h-3 w-3"/>{status}</Badge>;
        default:
            return <Badge variant="outline">{status}</Badge>;
    }
}


export default function OrdersPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary" />
            My Orders & Quotations
          </CardTitle>
          <CardDescription>
            Track your orders and manage your requests for quotation (RFQs) with suppliers.
          </CardDescription>
        </CardHeader>
      </Card>
      <Tabs defaultValue="orders">
        <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="orders">My Orders</TabsTrigger>
            <TabsTrigger value="quotations">My Quotations (RFQs)</TabsTrigger>
        </TabsList>
        <TabsContent value="orders">
            <Card>
                <CardHeader>
                    <CardTitle>Order History</CardTitle>
                    <CardDescription>Review and track your current and past orders.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order ID</TableHead>
                                <TableHead>Products</TableHead>
                                <TableHead>Seller</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders.map(order => (
                                <TableRow key={order.id}>
                                    <TableCell className="font-medium">{order.id}</TableCell>
                                    <TableCell>{order.products}</TableCell>
                                    <TableCell>{order.seller}</TableCell>
                                    <TableCell>{order.total}</TableCell>
                                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                                    <TableCell className="space-x-2">
                                        <Button variant="outline" size="sm"><Truck className="mr-2 h-4 w-4"/>Track Order</Button>
                                        <Button variant="ghost" size="sm">View Invoice</Button>
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
                     <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Quotation History</CardTitle>
                            <CardDescription>Manage your price inquiries with sellers.</CardDescription>
                        </div>
                        <Button asChild>
                            <Link href="/products">
                                <FileText className="mr-2 h-4 w-4" /> New RFQ
                            </Link>
                        </Button>
                     </div>
                </CardHeader>
                 <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>RFQ ID</TableHead>
                                <TableHead>Product</TableHead>
                                <TableHead>Seller</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {quotations.map(quote => (
                                <TableRow key={quote.id}>
                                    <TableCell className="font-medium">{quote.id}</TableCell>
                                    <TableCell>{quote.product}</TableCell>
                                    <TableCell>{quote.seller}</TableCell>
                                    <TableCell>{getStatusBadge(quote.status)}</TableCell>
                                    <TableCell>{quote.date}</TableCell>
                                    <TableCell>
                                        <Button variant="outline" size="sm"><Eye className="mr-2 h-4 w-4"/> View Details</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

    