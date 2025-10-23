"use client"
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, FileText, CheckCircle, Clock } from "lucide-react";

const orders = [
    {
        id: "QUO-001",
        title: "Quotation for 200 bags of Cement",
        supplier: "Constructa Ltd",
        status: "Approved",
        statusIcon: <CheckCircle className="text-green-500" />,
        date: "2023-10-28",
        messages: [
            { from: "user", text: "Is this the final price?" },
            { from: "supplier", text: "Yes, this is our best offer for bulk purchase." }
        ]
    },
    {
        id: "ORD-002",
        title: "Order: 50 sacks of Baking Flour",
        supplier: "SuperBake Bakery",
        status: "Pending Payment",
        statusIcon: <Clock className="text-yellow-500" />,
        date: "2023-10-27",
        messages: [
            { from: "user", text: "When can you deliver?" },
        ]
    }
];


export default function DashboardPage() {
    const [selectedOrder, setSelectedOrder] = React.useState(orders[0]);

    return (
        <div className="grid md:grid-cols-3 gap-6 h-[calc(100vh-100px)]">
            {/* Left Column: Order/Quotation List */}
            <div className="md:col-span-1 flex flex-col">
                <h2 className="text-xl font-bold mb-4">Orders & Quotations</h2>
                <ScrollArea className="flex-grow border rounded-lg">
                    <div className="p-2 space-y-2">
                        {orders.map(order => (
                            <Card key={order.id} className={`cursor-pointer ${selectedOrder.id === order.id ? 'bg-muted' : ''}`} onClick={() => setSelectedOrder(order)}>
                                <CardContent className="p-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-base">{order.title}</CardTitle>
                                            <CardDescription>{order.supplier}</CardDescription>
                                        </div>
                                        {React.cloneElement(order.statusIcon, { className: 'h-5 w-5' })}
                                    </div>
                                    <div className="flex justify-between items-center mt-2">
                                        <Badge variant="outline">{order.status}</Badge>
                                        <p className="text-xs text-muted-foreground">{order.date}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </ScrollArea>
            </div>

            {/* Right Column: Message and Details View */}
            <div className="md:col-span-2 flex flex-col">
                <Card className="flex-grow flex flex-col">
                    <CardHeader className="flex flex-row justify-between items-center border-b">
                        <div>
                            <CardTitle>{selectedOrder.title}</CardTitle>
                            <CardDescription>Conversation with {selectedOrder.supplier}</CardDescription>
                        </div>
                        <Button variant="outline" size="sm"><FileText className="mr-2 h-4 w-4" /> View Details</Button>
                    </CardHeader>
                    <ScrollArea className="flex-grow p-6 space-y-4">
                        {selectedOrder.messages.map((msg, index) => (
                            <div key={index} className={`flex items-end gap-2 ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                                {msg.from === 'supplier' && (
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={`https://picsum.photos/seed/${selectedOrder.supplier}/32/32`} />
                                        <AvatarFallback>{selectedOrder.supplier.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                )}
                                <div className={`max-w-xs p-3 rounded-lg ${msg.from === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                    <p className="text-sm">{msg.text}</p>
                                </div>
                                 {msg.from === 'user' && (
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src="https://picsum.photos/seed/user/32/32" />
                                        <AvatarFallback>U</AvatarFallback>
                                    </Avatar>
                                )}
                            </div>
                        ))}
                    </ScrollArea>
                    <CardFooter className="border-t p-4">
                        <div className="flex w-full items-center gap-2">
                            <Input placeholder="Type your message..." />
                            <Button size="icon"><Send className="h-4 w-4" /></Button>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}
