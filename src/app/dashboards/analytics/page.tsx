'use client';

import * as React from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, ShoppingCart, DollarSign, Activity, MousePointerClick, BarChart, LineChart } from "lucide-react";
import { Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Bar } from 'recharts';
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, where, collectionGroup, orderBy, Timestamp, startOfDay, endOfDay } from "firebase/firestore";
import { subDays } from 'date-fns';
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';


// --- TYPE DEFINITIONS ---
type User = { role: string; };
type Order = { totalAmount: number; };
type Product = { category: string; };
type FeatureUsage = {
    feature: string;
    timestamp: any;
};

// --- NAVIGATION LINK COMPONENT ---
const NavLink = ({ active, onClick, children }: { active: boolean, onClick: () => void, children: React.ReactNode }) => (
    <button
        onClick={onClick}
        className={cn(
            "flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md w-full text-left",
            active ? "bg-muted text-primary" : "hover:bg-muted/50"
        )}
    >
        {children}
        <ChevronRight className={cn("h-4 w-4 transition-transform", active ? "transform translate-x-1" : "")} />
    </button>
);


// --- OVERVIEW COMPONENT ---
const OverviewAnalytics = () => {
    const firestore = useFirestore();

    const usersQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'users')) : null, [firestore]);
    const ordersQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'orders')) : null, [firestore]);

    const { data: users, isLoading: isLoadingUsers } = useCollection<User>(usersQuery);
    const { data: orders, isLoading: isLoadingOrders } = useCollection<Order>(ordersQuery);

    const isLoading = isLoadingUsers || isLoadingOrders;

    const totalRevenue = React.useMemo(() => orders?.reduce((sum, order) => sum + order.totalAmount, 0) || 0, [orders]);
    const totalSales = React.useMemo(() => orders?.length || 0, [orders]);
    const totalUsers = React.useMemo(() => users?.length || 0, [users]);
    
     const renderMetricCard = (title: string, value: string | number, description: string, icon: React.ReactNode, loading: boolean) => (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                {loading ? <Skeleton className="h-8 w-24" /> : <div className="text-2xl font-bold">{value}</div>}
                <p className="text-xs text-muted-foreground">{description}</p>
            </CardContent>
        </Card>
    );

    return (
        <Card>
            <CardHeader>
                <CardTitle>Platform Overview</CardTitle>
                <CardDescription>Monitors data to guide business and product growth.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {renderMetricCard("Total Revenue", `KES ${totalRevenue.toLocaleString()}`, "+0% from last month", <DollarSign className="h-4 w-4 text-muted-foreground" />, isLoading)}
                    {renderMetricCard("Total Sales", totalSales.toLocaleString(), "+0 from last month", <ShoppingCart className="h-4 w-4 text-muted-foreground" />, isLoading)}
                    {renderMetricCard("Total Users", totalUsers.toLocaleString(), "Across all roles", <Users className="h-4 w-4 text-muted-foreground" />, isLoading)}
                    {renderMetricCard("Session Duration", "N/A", "Avg. session time", <Activity className="h-4 w-4 text-muted-foreground" />, isLoading)}
                </div>
                 <Card>
                   <CardHeader>
                       <CardTitle>Data Overview (Coming Soon)</CardTitle>
                       <CardDescription>Monthly trends for key metrics.</CardDescription>
                   </CardHeader>
                   <CardContent>
                        <div className="h-[300px] w-full bg-muted rounded-md flex items-center justify-center">
                           <p className="ml-4 text-muted-foreground">Historical data charts will be available soon.</p>
                        </div>
                   </CardContent>
                </Card>
            </CardContent>
        </Card>
    );
};

// --- USER BEHAVIOR COMPONENT ---
const UserBehaviorAnalytics = () => {
    const firestore = useFirestore();
    const usersQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'users')) : null, [firestore]);
    const { data: users, isLoading: isLoadingUsers } = useCollection<User>(usersQuery);

    const buyerCount = React.useMemo(() => users?.filter(u => u.role === 'buyer').length || 0, [users]);
    const sellerCount = React.useMemo(() => users?.filter(u => u.role === 'manufacturer').length || 0, [users]);
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>User Behavior Analytics</CardTitle>
                <CardDescription>Insights into user registration, activity, and retention.</CardDescription>
            </CardHeader>
            <CardContent>
                 <Card>
                   <CardHeader>
                       <CardTitle>User Growth</CardTitle>
                       <CardDescription>Breakdown of registered buyers vs. sellers.</CardDescription>
                   </CardHeader>
                   <CardContent>
                        {isLoadingUsers ? <Skeleton className="h-[300px] w-full" /> : 
                        <ResponsiveContainer width="100%" height={300}>
                             <ComposedChart data={[{ name: 'Users', buyers: buyerCount, sellers: sellerCount }]}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="buyers" fill="#8884d8" name="Buyers" />
                                <Bar dataKey="sellers" fill="#82ca9d" name="Sellers" />
                            </ComposedChart>
                       </ResponsiveContainer>
                       }
                   </CardContent>
                </Card>
            </CardContent>
        </Card>
    );
};


// --- PRODUCT ANALYTICS COMPONENT ---
const ProductAnalytics = () => {
    const firestore = useFirestore();
    const productsQuery = useMemoFirebase(() => firestore ? query(collectionGroup(firestore, 'products'), where('status', '==', 'published')) : null, [firestore]);
    const { data: products, isLoading: isLoadingProducts } = useCollection<Product>(productsQuery);

    const topCategories = React.useMemo(() => {
        if (!products) return [];
        const categoryCounts: Record<string, number> = {};
        products.forEach(p => {
            if (p.category) {
                categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
            }
        });
        return Object.entries(categoryCounts)
            .map(([category, count]) => ({ category, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
    }, [products]);
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>Product & Category Analytics</CardTitle>
                <CardDescription>Performance of product categories and individual items.</CardDescription>
            </CardHeader>
             <CardContent>
                 <Card>
                   <CardHeader>
                       <CardTitle>Top Categories by Product Count</CardTitle>
                   </CardHeader>
                   <CardContent>
                        {isLoadingProducts ? <Skeleton className="h-[300px] w-full" /> : 
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart layout="vertical" data={topCategories} margin={{ left: 120 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" />
                                <YAxis dataKey="category" type="category" width={150} tick={{ fontSize: 12 }} />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="count" fill="#8884d8" name="Product Count" />
                            </BarChart>
                        </ResponsiveContainer>
                        }
                   </CardContent>
                </Card>
            </CardContent>
        </Card>
    );
};


// --- FEATURE USAGE COMPONENT ---
const FeatureUsageAnalytics = () => {
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

    const aggregatedFeatures = React.useMemo(() => {
        if (!usageEvents) return [];

        const counts: Record<string, { feature: string; page: string; dashboard: string; count: number }> = {};
        
        usageEvents.forEach(event => {
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

    }, [usageEvents]);
    
    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Feature Usage Analytics</CardTitle>
                        <CardDescription>How users are interacting with key features.</CardDescription>
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
                                <TableCell colSpan={4} className="h-24 text-center">No feature usage data for this period.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};


// --- MAIN DASHBOARD COMPONENT ---
export default function AnalyticsDashboard() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const activeTab = searchParams.get('tab') || 'overview';
    
    const handleTabChange = (value: string) => {
        const params = new URLSearchParams(window.location.search);
        params.set('tab', value);
        router.push(`${pathname}?${params.toString()}`);
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'users':
                return <UserBehaviorAnalytics />;
            case 'products':
                return <ProductAnalytics />;
            case 'feature-usage':
                return <FeatureUsageAnalytics />;
            case 'overview':
            default:
                return <OverviewAnalytics />;
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Analytics & Insights Dashboard</CardTitle>
                    <CardDescription>Central hub for platform-wide analytics and user behavior insights.</CardDescription>
                </CardHeader>
            </Card>
             <div className="grid md:grid-cols-4 gap-6 items-start">
                <div className="md:col-span-1">
                    <Card>
                        <CardContent className="p-4">
                             <nav className="space-y-1">
                                <NavLink active={activeTab === 'overview'} onClick={() => handleTabChange('overview')}>Platform Overview</NavLink>
                                <NavLink active={activeTab === 'users'} onClick={() => handleTabChange('users')}>User Behavior</NavLink>
                                <NavLink active={activeTab === 'products'} onClick={() => handleTabChange('products')}>Product & Category</NavLink>
                                <NavLink active={activeTab === 'feature-usage'} onClick={() => handleTabChange('feature-usage')}>Feature Usage</NavLink>
                            </nav>
                        </CardContent>
                    </Card>
                </div>
                <div className="md:col-span-3">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
}