
'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Shield, Building, ShoppingCart, UserPlus, Search } from "lucide-react";
import { Input } from '@/components/ui/input';

const mockSummary = [
    { title: "Total Users", count: "1,428", icon: <Users /> },
    { title: "Sellers (Manufacturers)", count: "356", icon: <Building /> },
    { title: "Buyers", count: "980", icon: <ShoppingCart /> },
    { title: "Admin Staff", count: "12", icon: <Shield /> },
];

const mockUsers = [
    { tradintaId: 'A8B2C3D4', name: 'John Doe', email: 'john.doe@example.com', role: 'Buyer', status: 'Active' },
    { tradintaId: 'E5F6G7H8', name: 'Jane Smith (Constructa Ltd)', email: 'jane.s@constructa.com', role: 'Manufacturer', status: 'Active' },
    { tradintaId: 'I9J0K1L2', name: 'Alice Williams', email: 'alice.w@tradinta.com', role: 'Admin', status: 'Active' },
    { tradintaId: 'M3N4O5P6', name: 'Bob Brown', email: 'bob.b@buyerco.net', role: 'Buyer', status: 'Suspended' },
];

export default function UserManagementPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>Oversee all users, manage roles, and control access across the platform.</CardDescription>
        </CardHeader>
      </Card>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {mockSummary.map(item => (
            <Card key={item.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
                    <div className="text-muted-foreground">{item.icon}</div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{item.count}</div>
                </CardContent>
                 <CardFooter>
                    <Button size="sm" variant="outline"><UserPlus className="mr-2 h-4 w-4"/> Add</Button>
                </CardFooter>
            </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <CardTitle>All Users</CardTitle>
                    <CardDescription>Search, filter, and manage all user accounts.</CardDescription>
                </div>
                <div className="relative w-full md:w-1/3">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search by name, email, or Tradinta ID..." className="pl-8" />
                </div>
            </div>
        </CardHeader>
        <CardContent>
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
                    {mockUsers.map(user => (
                        <TableRow key={user.tradintaId}>
                            <TableCell className="font-mono text-xs">{user.tradintaId}</TableCell>
                            <TableCell className="font-medium">{user.name}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{user.role}</TableCell>
                            <TableCell>
                                <Badge variant={user.status === 'Active' ? 'secondary' : 'destructive'}>{user.status}</Badge>
                            </TableCell>
                            <TableCell className="space-x-2">
                                <Button size="sm" variant="outline">Manage</Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}
