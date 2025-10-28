
'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, where, orderBy, Timestamp } from "firebase/firestore";
import { subDays, startOfDay } from 'date-fns';
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type FeatureUsage = {
    feature: string;
    timestamp: any;
    userRole: 'manufacturer' | 'buyer' | 'partner' | string;
};

const FeatureUsageTable = ({ events, isLoading }: { events: FeatureUsage[], isLoading: boolean }) => {
    const aggregatedFeatures = React.useMemo(() => {
        if (!events) return [];

        const counts: Record<string, { feature: string; page: string; dashboard: string; count: number }> = {};
        
        events.forEach(event => {
            const [resource, action] = event.feature.split(':');
            const page = resource.replace(/_/g, ' ');
            const dashboard = 'Seller Centre'; // This is hardcoded for now, can be derived later
            
            if (!counts[event.feature]) {
                counts[event.feature] = {
                    feature: action,
                    page: page,
                    dashboard: dashboard,
                    count: 0
                };
            }
            counts[event.feature].count++;
        });

        return Object.values(counts).sort((a,b) => b.count - a.count);

    }, [events]);

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Feature</TableHead>
                    <TableHead>Page</TableHead>
                    <TableHead>Dashboard</TableHead>
                    <TableHead className="text-right">Usage Count</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {isLoading ? (
                    Array.from({length: 4}).map((_, i) => (
                        <TableRow key={i}>
                            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                        </TableRow>
                    ))
                ) : aggregatedFeatures.length > 0 ? (
                    aggregatedFeatures.map(feature => (
                        <TableRow key={feature.feature + feature.page}>
                            <TableCell className="font-medium capitalize">{feature.feature.replace(/_/g, ' ')}</TableCell>
                            <TableCell className="capitalize">{feature.page}</TableCell>
                            <TableCell>{feature.dashboard}</TableCell>
                            <TableCell className="text-right font-bold">{feature.count}</TableCell>
                        </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">No feature usage data for this role and period.</TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );
};

export default function FeatureUsageDashboard() {
    const firestore = useFirestore();
    const [timeFilter, setTimeFilter] = React.useState('7days');
    
    const usageQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        let q = query(collection(firestore, 'featureUsage'), orderBy('timestamp', 'desc'));
        
        const now = new Date();
        if (timeFilter === 'today') {
            q = query(q, where('timestamp', '>=', startOfDay(now)));
        } else if (timeFilter === '7days') {
            q = query(q, where('timestamp', '>=', subDays(now, 7)));
        } else if (timeFilter === '30days') {
             q = query(q, where('timestamp', '>=', subDays(now, 30)));
        }
        return q;

    }, [firestore, timeFilter]);

    const { data: usageEvents, isLoading } = useCollection<FeatureUsage>(usageQuery);

    const sellerEvents = React.useMemo(() => usageEvents?.filter(e => e.userRole === 'manufacturer') || [], [usageEvents]);
    const buyerEvents = React.useMemo(() => usageEvents?.filter(e => e.userRole === 'buyer') || [], [usageEvents]);
    const partnerEvents = React.useMemo(() => usageEvents?.filter(e => e.userRole === 'partner') || [], [usageEvents]);

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Feature Usage Analytics</CardTitle>
                        <CardDescription>How users are interacting with key features, segmented by role.</CardDescription>
                    </div>
                    <Select value={timeFilter} onValueChange={setTimeFilter}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select time range" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="today">Today</SelectItem>
                            <SelectItem value="7days">Last 7 Days</SelectItem>
                            <SelectItem value="30days">Last 30 Days</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="sellers">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="sellers">Sellers</TabsTrigger>
                        <TabsTrigger value="buyers">Buyers</TabsTrigger>
                        <TabsTrigger value="partners">Growth Partners</TabsTrigger>
                    </TabsList>
                    <TabsContent value="sellers" className="mt-4">
                       <FeatureUsageTable events={sellerEvents} isLoading={isLoading} />
                    </TabsContent>
                    <TabsContent value="buyers" className="mt-4">
                       <FeatureUsageTable events={buyerEvents} isLoading={isLoading} />
                    </TabsContent>
                    <TabsContent value="partners" className="mt-4">
                        <FeatureUsageTable events={partnerEvents} isLoading={isLoading} />
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
};
