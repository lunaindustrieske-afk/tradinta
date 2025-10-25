'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Shield, Building, ShoppingCart, UserPlus, Search, Loader2 } from "lucide-react";
import { Input } from '@/components/ui/input';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';

type UserProfile = {
  id: string;
  fullName: string;
  email: string;
  role: 'manufacturer' | 'buyer' | 'partner' | 'admin' | string; // Assuming these roles exist
  status?: 'Active' | 'Suspended' | 'Pending'; // This might be on a different doc, mock for now
  tradintaId: string;
};

const SummaryCard = ({ title, icon, count, isLoading }: { title: string; icon: React.ReactNode; count: number; isLoading: boolean }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <div className="text-muted-foreground">{icon}</div>
        </CardHeader>
        <CardContent>
            {isLoading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{count.toLocaleString()}</div>}
        </CardContent>
    </Card>
);


export default function UserManagementPage() {
    const firestore = useFirestore();
    const [searchQuery, setSearchQuery] = React.useState('');
    const [activeTab, setActiveTab] = React.useState('all');

    // --- Data Fetching ---
    const usersQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'users'));
    }, [firestore]);
    
    const { data: allUsers, isLoading: isLoadingAllUsers } = useCollection<UserProfile>(usersQuery);

    const sellersQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'users'), where('role', '==', 'manufacturer'));
    }, [firestore]);
    const { data: sellers, isLoading: isLoadingSellers } = useCollection(sellersQuery);
    
    const buyersQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'users'), where('role', '==', 'buyer'));
    }, [firestore]);
    const { data: buyers, isLoading: isLoadingBuyers } = useCollection(buyersQuery);
    
    const partnersQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'users'), where('role', '==', 'partner'));
    }, [firestore]);
    const { data: partners, isLoading: isLoadingPartners } = useCollection(partnersQuery);
    
    const adminsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        // This is a placeholder, a real app might use custom claims or a specific 'admin' role
        return query(collection(firestore, 'users'), where('role', 'in', ['admin', 'super-admin']));
    }, [firestore]);
    const { data: admins, isLoading: isLoadingAdmins } = useCollection(adminsQuery);


    const summaryCards = [
        { title: "Total Users", count: allUsers?.length || 0, icon: <Users />, isLoading: isLoadingAllUsers },
        { title: "Sellers (Manufacturers)", count: sellers?.length || 0, icon: <Building />, isLoading: isLoadingSellers },
        { title: "Buyers", count: buyers?.length || 0, icon: <ShoppingCart />, isLoading: isLoadingBuyers },
        { title: "Admin Staff", count: admins?.length || 0, icon: <Shield />, isLoading: isLoadingAdmins },
    ];

    const filteredUsers = React.useMemo(() => {
        let usersToFilter = allUsers;

        if (activeTab !== 'all') {
            usersToFilter = usersToFilter?.filter(user => user.role === activeTab);
        }

        if (searchQuery) {
            usersToFilter = usersToFilter?.filter(user => 
                user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.email.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        return usersToFilter;
    }, [allUsers, activeTab, searchQuery]);

    const renderTableRows = () => {
        if (isLoadingAllUsers) {
            return Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={`skel-user-${i}`}>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-20" /></TableCell>
                </TableRow>
            ));
        }

        if (!filteredUsers || filteredUsers.length === 0) {
            return (
                <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                        No users found.
                    </TableCell>
                </TableRow>
            );
        }

        return filteredUsers.map(user => (
            <TableRow key={user.id}>
                <TableCell className="font-mono text-xs">{user.tradintaId || 'N/A'}</TableCell>
                <TableCell className="font-medium">{user.fullName}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell className="capitalize">{user.role}</TableCell>
                <TableCell>
                    <Badge variant={user.status === 'Active' ? 'secondary' : user.status === 'Suspended' ? 'destructive' : 'outline'}>
                        {user.status || 'Active'}
                    </Badge>
                </TableCell>
                <TableCell className="space-x-2">
                    <Button size="sm" variant="outline" asChild>
                        <Link href={`/dashboards/user-management/${user.id}`}>Manage</Link>
                    </Button>
                </TableCell>
            </TableRow>
        ));
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>Oversee all users, manage roles, and control access across the platform.</CardDescription>
                </CardHeader>
            </Card>
      
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {summaryCards.map(item => (
                    <SummaryCard key={item.title} {...item} />
                ))}
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div>
                            <CardTitle>All Users</CardTitle>
                            <CardDescription>Search, filter, and manage all user accounts.</CardDescription>
                        </div>
                         <div className="flex items-center gap-2 w-full md:w-auto">
                            <div className="relative flex-grow">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input 
                                    placeholder="Search by name or email..." 
                                    className="pl-8" 
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                />
                            </div>
                             <Button><UserPlus className="mr-2 h-4 w-4"/> Add User</Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="mb-4">
                            <TabsTrigger value="all">All</TabsTrigger>
                            <TabsTrigger value="manufacturer">Sellers</TabsTrigger>
                            <TabsTrigger value="buyer">Buyers</TabsTrigger>
                            <TabsTrigger value="partner">Partners</TabsTrigger>
                        </TabsList>
                        
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Tradinta ID</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Primary Role</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {renderTableRows()}
                            </TableBody>
                        </Table>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}
