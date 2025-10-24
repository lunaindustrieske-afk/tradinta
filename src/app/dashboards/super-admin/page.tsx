
'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserPlus, ShieldAlert, BarChart, Settings, Users, Loader2 } from "lucide-react";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, where, orderBy, limit } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";


type UserProfile = {
    id: string;
    fullName: string;
    role: string;
    email: string;
};

type ActivityLog = {
    id: string;
    timestamp: any;
    userEmail: string;
    action: string;
    details: string;
};

type SystemAlert = {
    id: string;
    timestamp: any;
    type: string;
    severity: 'critical' | 'warning' | 'info';
    message: string;
    status: 'new' | 'acknowledged' | 'resolved';
}

export default function SuperAdminDashboard() {
    const firestore = useFirestore();

    const usersQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'users'));
    }, [firestore]);

    const activityLogsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'activityLogs'), orderBy('timestamp', 'desc'), limit(50));
    }, [firestore]);
    
    const criticalAlertsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'systemAlerts'), where('status', '==', 'new'), where('severity', '==', 'critical'));
    }, [firestore]);

    const { data: users, isLoading: isLoadingUsers } = useCollection<UserProfile>(usersQuery);
    const { data: activityLogs, isLoading: isLoadingLogs } = useCollection<ActivityLog>(activityLogsQuery);
    const { data: criticalAlerts, isLoading: isLoadingAlerts } = useCollection<SystemAlert>(criticalAlertsQuery);

    const renderUserRows = () => {
        if (isLoadingUsers) {
            return Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={`skel-user-${i}`}>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-9 w-48" /></TableCell>
                </TableRow>
            ));
        }
        if (!users || users.length === 0) {
            return <TableRow><TableCell colSpan={4} className="h-24 text-center">No users found.</TableCell></TableRow>;
        }
        return users.map((user) => (
            <TableRow key={user.id}>
                <TableCell className="font-medium">{user.fullName}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell><Badge variant="secondary">Active</Badge></TableCell>
                <TableCell className="space-x-2">
                    <Button variant="outline" size="sm">Edit Permissions</Button>
                    <Button variant="destructive" size="sm">Revoke Access</Button>
                </TableCell>
            </TableRow>
        ));
    };
    
    const renderLogRows = () => {
        if (isLoadingLogs) {
             return Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={`skel-log-${i}`}>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                    <TableCell><Skeleton className="h-9 w-24" /></TableCell>
                </TableRow>
            ));
        }
         if (!activityLogs || activityLogs.length === 0) {
            return <TableRow><TableCell colSpan={4} className="h-24 text-center">No activity logs found.</TableCell></TableRow>;
        }
         return activityLogs.map((log) => (
            <TableRow key={log.id}>
                <TableCell><Badge variant="outline">{log.action}</Badge></TableCell>
                <TableCell>{log.details}</TableCell>
                <TableCell>{log.userEmail}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{new Date(log.timestamp?.seconds * 1000).toLocaleString()}</TableCell>
            </TableRow>
        ));
    }


    return (
        <Tabs defaultValue="overview">
            <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Platform Overview</TabsTrigger>
                <TabsTrigger value="user-management">User Management</TabsTrigger>
                <TabsTrigger value="activity-log">Activity Log</TabsTrigger>
                <TabsTrigger value="global-settings">Global Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
                <Card>
                    <CardHeader>
                        <CardTitle>Super Admin Dashboard</CardTitle>
                        <CardDescription>Full control of the platform. Oversee all operations, users, and configurations.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                             <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    {isLoadingUsers ? <Loader2 className="h-6 w-6 animate-spin" /> : <div className="text-2xl font-bold">{users?.length || 0}</div>}
                                    <p className="text-xs text-muted-foreground">Across all roles</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
                                    <ShieldAlert className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    {isLoadingAlerts ? <Loader2 className="h-6 w-6 animate-spin" /> : 
                                        <div className={`text-2xl font-bold ${criticalAlerts && criticalAlerts.length > 0 ? 'text-destructive' : 'text-green-600'}`}>
                                            {criticalAlerts?.length || 0}
                                        </div>
                                    }
                                    <p className="text-xs text-muted-foreground">New critical issues requiring attention</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Platform GMV</CardTitle>
                                    <BarChart className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">KES 34.2M</div>
                                    <p className="text-xs text-muted-foreground">Year-to-date (mock)</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">New Users Today</CardTitle>
                                    <UserPlus className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">+15</div>
                                    <p className="text-xs text-muted-foreground">10 Buyers, 5 Sellers (mock)</p>
                                </CardContent>
                            </Card>
                        </div>
                        {criticalAlerts && criticalAlerts.length > 0 && (
                            <Card className="border-destructive">
                                <CardHeader>
                                    <CardTitle className="text-destructive flex items-center gap-2">
                                        <ShieldAlert /> Critical System Alerts
                                    </CardTitle>
                                    <CardDescription>The following issues require immediate attention.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Message</TableHead>
                                                <TableHead>Type</TableHead>
                                                <TableHead>Time</TableHead>
                                                <TableHead>Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {criticalAlerts.map(alert => (
                                                <TableRow key={alert.id}>
                                                    <TableCell className="font-medium">{alert.message}</TableCell>
                                                    <TableCell><Badge variant="destructive">{alert.type}</Badge></TableCell>
                                                    <TableCell className="text-xs">{new Date(alert.timestamp?.seconds * 1000).toLocaleTimeString()}</TableCell>
                                                    <TableCell className="space-x-2">
                                                        <Button size="sm">Acknowledge</Button>
                                                        <Button size="sm" variant="outline">View Details</Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>
            
            <TabsContent value="user-management">
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle>User Management</CardTitle>
                                <CardDescription>Manage user accounts and their platform roles.</CardDescription>
                            </div>
                            <Button><UserPlus className="mr-2 h-4 w-4" /> Add New Admin</Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {renderUserRows()}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="activity-log">
                <Card>
                    <CardHeader>
                        <CardTitle>Platform Activity Log</CardTitle>
                        <CardDescription>A real-time feed of all significant actions performed by admins.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Action</TableHead>
                                    <TableHead className="w-[40%]">Details</TableHead>
                                    <TableHead>Admin User</TableHead>
                                    <TableHead>Timestamp</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {renderLogRows()}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="global-settings">
                 <Card>
                    <CardHeader>
                        <CardTitle>Platform-Wide Settings</CardTitle>
                        <CardDescription>Manage global configurations like transaction fees and feature flags.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                       <div className="h-[300px] w-full bg-muted rounded-md flex items-center justify-center">
                           <Settings className="h-16 w-16 text-muted-foreground" />
                           <p className="ml-4 text-muted-foreground">Global Settings Component Here</p>
                       </div>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    );
}
