
'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, FileText, CheckCircle, Clock, Search, MessageSquare } from "lucide-react";
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';

const conversations = [
    {
        id: "CONV-001",
        title: "Quotation for 200 bags of Cement",
        contactName: "Constructa Ltd",
        contactRole: "Seller",
        lastMessage: "Yes, this is our best offer for bulk purchase. The quote is attached.",
        lastMessageTimestamp: "2 hours ago",
        status: "Approved",
        statusIcon: <CheckCircle className="text-green-500" />,
        isUnread: false,
        messages: [
            { from: "user", text: "Is this the final price for the 200 bags of Industrial Grade Cement?" },
            { from: "contact", text: "Yes, this is our best offer for bulk purchase. The quote is attached." }
        ]
    },
    {
        id: "CONV-002",
        title: "Order: 50 sacks of Baking Flour",
        contactName: "SuperBake Bakery",
        contactRole: "Seller",
        lastMessage: "Your order has been shipped and is scheduled for delivery tomorrow.",
        lastMessageTimestamp: "1 day ago",
        status: "Shipped",
        statusIcon: <Clock className="text-yellow-500" />,
        isUnread: true,
        messages: [
            { from: "user", text: "Hi, any update on my order #ORD-002?" },
            { from: "contact", text: "Your order has been shipped and is scheduled for delivery tomorrow." },

        ]
    },
    {
        id: "CONV-003",
        title: "Inquiry about Steel Beams",
        contactName: "Regional Distributors",
        contactRole: "Distributor",
        lastMessage: "We have a new shipment arriving next week. Let me know the specs you need.",
        lastMessageTimestamp: "3 days ago",
        status: "Inquiry",
        statusIcon: <FileText className="text-blue-500" />,
        isUnread: false,
        messages: [
            { from: "user", text: "Do you have 10-inch steel beams in stock?"},
            { from: "contact", text: "We have a new shipment arriving next week. Let me know the specs you need." }
        ]
    }
];


export default function MessagesPage() {
    const [selectedConversation, setSelectedConversation] = React.useState(conversations[0]);

    const getRoleBadgeVariant = (role: string) => {
        switch (role) {
            case 'Seller': return 'secondary';
            case 'Distributor': return 'outline';
            default: return 'default';
        }
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><MessageSquare className="w-6 h-6 text-primary"/>Tradinta Inbox</CardTitle>
                    <CardDescription>Your central hub for all communications with manufacturers, distributors, and buyers.</CardDescription>
                </CardHeader>
            </Card>
            <div className="grid md:grid-cols-3 gap-6 h-[calc(100vh-220px)]">
                {/* Left Column: Conversation List */}
                <div className="md:col-span-1 flex flex-col">
                    <Card className="flex flex-col h-full">
                        <CardHeader className="border-b p-4">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Search conversations..." className="pl-8" />
                            </div>
                        </CardHeader>
                        <ScrollArea className="flex-grow">
                            <CardContent className="p-2 space-y-1">
                                {conversations.map(convo => (
                                    <div key={convo.id} className={`p-3 rounded-lg cursor-pointer border-2 ${selectedConversation.id === convo.id ? 'bg-muted border-primary' : 'border-transparent hover:bg-muted/50'}`} onClick={() => setSelectedConversation(convo)}>
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className="font-semibold text-sm truncate pr-2">{convo.contactName}</h3>
                                            {convo.isUnread && <div className="w-2.5 h-2.5 rounded-full bg-primary shrink-0"></div>}
                                        </div>
                                        <p className="text-sm font-bold truncate">{convo.title}</p>
                                        <p className="text-xs text-muted-foreground truncate">{convo.lastMessage}</p>
                                        <div className="flex justify-between items-center mt-2">
                                            <Badge variant={getRoleBadgeVariant(convo.contactRole)}>{convo.contactRole}</Badge>
                                            <p className="text-xs text-muted-foreground">{convo.lastMessageTimestamp}</p>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </ScrollArea>
                    </Card>
                </div>

                {/* Right Column: Message and Details View */}
                <div className="md:col-span-2 flex flex-col">
                    <Card className="flex-grow flex flex-col">
                        <CardHeader className="flex flex-row justify-between items-center border-b">
                            <div>
                                <CardTitle>{selectedConversation.title}</CardTitle>
                                <CardDescription>Conversation with {selectedConversation.contactName}</CardDescription>
                            </div>
                            <Button variant="outline" size="sm" asChild>
                                <Link href="/dashboards/buyer/orders">
                                    <FileText className="mr-2 h-4 w-4" /> View Related Order
                                </Link>
                            </Button>
                        </CardHeader>
                        <ScrollArea className="flex-grow p-6 space-y-4">
                            {selectedConversation.messages.map((msg, index) => (
                                <div key={index} className={`flex items-end gap-2 ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    {msg.from === 'contact' && (
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={`https://picsum.photos/seed/${selectedConversation.contactName}/32/32`} />
                                            <AvatarFallback>{selectedConversation.contactName.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                    )}
                                    <div className={`max-w-md p-3 rounded-lg ${msg.from === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                        <p className="text-sm">{msg.text}</p>
                                    </div>
                                    {msg.from === 'user' && (
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src="https://picsum.photos/seed/buyer-avatar/32/32" />
                                            <AvatarFallback>You</AvatarFallback>
                                        </Avatar>
                                    )}
                                </div>
                            ))}
                        </ScrollArea>
                        <CardFooter className="border-t p-4 bg-muted/50">
                            <div className="flex w-full items-center gap-2">
                                <Input placeholder="Type your message..." className="bg-background"/>
                                <Button size="icon"><Send className="h-4 w-4" /></Button>
                            </div>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    )
}
