
'use client';

import * as React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserPlus, ShieldAlert, Users, Loader2, Package, ShoppingCart, Users2, User, Signal, Building, Handshake, Landmark, Scale, Megaphone, LifeBuoy, Wallet, FileText, ArrowRight, Coins, BarChart, Truck, Shield, BookUser, Settings, FileWarning } from "lucide-react";
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, where, orderBy, limit, collectionGroup } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { AddUserToRoleModal } from '@/components/add-user-to-role-modal';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { PermissionDenied } from '@/components/ui/permission-denied';


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

const RoleCard = ({ title, count, isLoading, onAddUser }: { title: string, count?: number, isLoading: boolean, onAddUser: () => void }) => (
    <Card className="hover:bg-muted/50 transition-colors flex items-center p-3 justify-between">
        <div className="flex flex-col">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            {isLoading ? <Skeleton className="h-5 w-8 mt-1" /> : <p className="text-xs text-muted-foreground">{count ?? 0} Members</p>}
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onAddUser}>
            <UserPlus className="h-4 w-4" />
            <span className="sr-only">Add user to {title}</span>
        </Button>
    </Card>
);


function SuperAdminDashboardContent() {
    const firestore = useFirestore();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const activeTab = searchParams.get('tab') || 'overview';
    
    // State for the modal
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [selectedRole, setSelectedRole] = React.useState({ name: '', value: '' });

    const handleAddUserClick = (role: {name: string, value: string}) => {
        setSelectedRole(role);
        setIsModalOpen(true);
    };

    const handleTabChange = (value: string) => {
        const params = new URLSearchParams(window.location.search);
        params.set('tab', value);
        router.push(`${pathname}?${params.toString()}`);
    };

    // --- Data Queries ---
    const usersQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'users'));
    }, [firestore]);

     const sellersQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'manufacturers'));
    }, [firestore]);

     const buyersQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'users'), where('role', '==', 'buyer'));
    }, [firestore]);
    
    const partnersQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'users'), where('role', '==', 'partner'));
    }, [firestore]);


    const productsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collectionGroup(firestore, 'products'));
    }, [firestore]);

     const ordersQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collectionGroup(firestore, 'orders'));
    }, [firestore]);

    const activityLogsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'activityLogs'), orderBy('timestamp', 'desc'), limit(50));
    }, [firestore]);
    
    const criticalAlertsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'systemAlerts'), where('status', '==', 'new'), where('severity', '==', 'critical'));
    }, [firestore]);

    // --- Data Hooks ---
    const { data: users, isLoading: isLoadingUsers } = useCollection<UserProfile>(usersQuery);
    const { data: sellers, isLoading: isLoadingSellers } = useCollection(sellersQuery);
    const { data: buyers, isLoading: isLoadingBuyers } = useCollection(buyersQuery);
    const { data: partners, isLoading: isLoadingPartners } = useCollection(partnersQuery);
    const { data: products, isLoading: isLoadingProducts } = useCollection(productsQuery);
    const { data: orders, isLoading: isLoadingOrders } = useCollection(ordersQuery);
    const { data: activityLogs, isLoading: isLoadingLogs } = useCollection<ActivityLog>(activityLogsQuery);
    const { data: criticalAlerts, isLoading: isLoadingAlerts } = useCollection<SystemAlert>(criticalAlertsQuery);

    
    const renderLogRows = () => {
        if (isLoadingLogs) {
             return Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={`skel-log-${i}`}>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
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

    const customerRoles = [
        { name: 'Sellers / Manufacturers', value: 'manufacturer', count: sellers?.length, isLoading: isLoadingSellers },
        { name: 'Registered Buyers', value: 'buyer', count: buyers?.length, isLoading: isLoadingBuyers },
        { name: 'Growth Partners', value: 'partner', count: partners?.length, isLoading: isLoadingPartners },
        { name: 'Distributors', value: 'distributor', count: 0, isLoading: false },
    ];

    const adminRoles = [
        { name: 'Super Admin', value: 'super-admin', count: 1, isLoading: false },
        { name: 'Admin', value: 'admin', count: users?.filter(u => u.role === 'admin').length, isLoading: isLoadingUsers },
        { name: 'Operations', value: 'operations-manager', count: users?.filter(u => u.role === 'operations-manager').length, isLoading: isLoadingUsers },
        { name: 'Marketing', value: 'marketing-manager', count: users?.filter(u => u.role === 'marketing-manager').length, isLoading: isLoadingUsers },
        { name: 'Finance', value: 'finance', count: users?.filter(u => u.role === 'finance').length, isLoading: isLoadingUsers },
        { name: 'Support', value: 'support', count: users?.filter(u => u.role === 'support').length, isLoading: isLoadingUsers },
        { name: 'Legal & Compliance', value: 'legal-compliance', count: users?.filter(u => u.role === 'legal-compliance').length, isLoading: isLoadingUsers },
        { name: 'Content Management', value: 'content-management', count: users?.filter(u => u.role === 'content-management').length, isLoading: isLoadingUsers },
        { name: 'User Management', value: 'user-management', count: users?.filter(u => u.role === 'user-management').length, isLoading: isLoadingUsers },
        { name: 'Analytics', value: 'analytics', count: users?.filter(u => u.role === 'analytics').length, isLoading: isLoadingUsers },
        { name: 'Logistics', value: 'logistics', count: users?.filter(u => u.role === 'logistics').length, isLoading: isLoadingUsers },
    ];

    const tradpayRoles = [
        { name: 'TradPay Admins', value: 'tradpay-admin', count: users?.filter(u => u.role === 'tradpay-admin').length, isLoading: isLoadingUsers },
        { name: 'TradCoin Airdrop Admins', value: 'tradcoin-airdrop', count: users?.filter(u => u.role === 'tradcoin-airdrop').length, isLoading: isLoadingUsers },
    ]


    return (
        <>
            <AddUserToRoleModal 
                isOpen={isModalOpen}
                onOpenChange={setIsModalOpen}
                roleName={selectedRole.name}
                roleValue={selectedRole.value}
            />
            <Tabs value={activeTab} onValueChange={handleTabChange}>
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
                                <Card className="cursor-pointer hover:bg-muted/50" onClick={() => handleTabChange('user-management')}>
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
                                        <CardTitle className="text-sm font-medium">Total Sellers</CardTitle>
                                        <Building className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        {isLoadingSellers ? <Loader2 className="h-6 w-6 animate-spin" /> : <div className="text-2xl font-bold">{sellers?.length || 0}</div>}
                                        <p className="text-xs text-muted-foreground">Verified & pending</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Total Buyers</CardTitle>
                                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        {isLoadingBuyers ? <Loader2 className="h-6 w-6 animate-spin" /> : <div className="text-2xl font-bold">{buyers?.length || 0}</div>}
                                        <p className="text-xs text-muted-foreground">Registered buyers</p>
                                    </CardContent>
                                </Card>
                                <Card className="cursor-pointer hover:bg-muted/50" onClick={() => handleTabChange('activity-log')}>
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
                                        <p className="text-xs text-muted-foreground">New critical issues</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                                        <Package className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        {isLoadingProducts ? <Loader2 className="h-6 w-6 animate-spin" /> : <div className="text-2xl font-bold">{products?.length || 0}</div>}
                                        <p className="text-xs text-muted-foreground">Published items</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        {isLoadingOrders ? <Loader2 className="h-6 w-6 animate-spin" /> : <div className="text-2xl font-bold">{orders?.length || 0}</div>}
                                        <p className="text-xs text-muted-foreground">Across all time</p>
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
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Live Visitors</CardTitle>
                                        <Signal className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">N/A</div>
                                        <p className="text-xs text-muted-foreground">Requires analytics integration</p>
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
                            <CardTitle>User Role Management</CardTitle>
                            <CardDescription>Assign roles and manage permissions for all users on the platform.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold mb-4">Customer Roles</h3>
                                <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
                                    {customerRoles.map((role) => (
                                        <RoleCard key={role.name} title={role.name} count={role.count} isLoading={role.isLoading} onAddUser={() => handleAddUserClick({name: role.name, value: role.value})} />
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-4">Administrative Roles</h3>
                                <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
                                    {adminRoles.map((role) => (
                                        <RoleCard key={role.name} title={role.name} count={role.count} isLoading={role.isLoading} onAddUser={() => handleAddUserClick({name: role.name, value: role.value})} />
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-4">TradPay & TradCoin Roles</h3>
                                <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
                                    {tradpayRoles.map((role) => (
                                        <RoleCard key={role.name} title={role.name} count={role.count} isLoading={role.isLoading} onAddUser={() => handleAddUserClick({name: role.name, value: role.value})} />
                                    ))}
                                </div>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <Card className="border-dashed flex flex-col items-center justify-center text-center p-4 hover:border-primary hover:text-primary transition-colors cursor-pointer min-h-[60px]">
                                    <h4 className="font-semibold text-sm">Create New Role</h4>
                            </Card>
                            </div>
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
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Platform-Wide Settings</CardTitle>
                                <CardDescription>Manage global configurations like transaction fees and feature flags.</CardDescription>
                            </CardHeader>
                        </Card>

                        <Card>
                            <CardHeader><CardTitle>Financial Settings</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="tx-fee">Platform Transaction Fee (%)</Label>
                                        <p className="text-xs text-muted-foreground">The percentage fee applied to all transactions processed through TradPay.</p>
                                    </div>
                                    <Input id="tx-fee" type="number" className="w-24" defaultValue="2.5" />
                                </div>
                                <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="payout-threshold">Minimum Payout Amount (KES)</Label>
                                        <p className="text-xs text-muted-foreground">The minimum balance a seller must have to request a payout.</p>
                                    </div>
                                    <Input id="payout-threshold" type="number" className="w-32" defaultValue="5000" />
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button>Save Financial Settings</Button>
                            </CardFooter>
                        </Card>

                        <Card>
                            <CardHeader><CardTitle>Feature Flags</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="tradpay-enabled">Enable TradPay System</Label>
                                        <p className="text-xs text-muted-foreground">Master switch to enable or disable the TradPay wallet and escrow system.</p>
                                    </div>
                                    <Switch id="tradpay-enabled" defaultChecked={true} />
                                </div>
                                <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="tradcoin-enabled">Enable TradCoin Airdrop</Label>
                                        <p className="text-xs text-muted-foreground">Allow users to convert earned TradPoints into TradCoin tokens.</p>
                                    </div>
                                    <Switch id="tradcoin-enabled" defaultChecked={false} />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader><CardTitle>Security & Compliance</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="session-timeout">User Session Timeout (hours)</Label>
                                        <p className="text-xs text-muted-foreground">Automatically log out inactive users after this period.</p>
                                    </div>
                                    <Input id="session-timeout" type="number" className="w-24" defaultValue="24" />
                                </div>
                                <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="retention-policy">Data Retention Policy (days)</Label>
                                        <p className="text-xs text-muted-foreground">How long to keep inactive user data before anonymization. (0 = forever)</p>
                                    </div>
                                    <Input id="retention-policy" type="number" className="w-24" defaultValue="0" />
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button>Save Security Settings</Button>
                            </CardFooter>
                        </Card>

                         <Card className="border-destructive">
                            <CardHeader>
                                <CardTitle className="text-destructive">System Maintenance</CardTitle>
                                <CardDescription>These are high-impact actions. Proceed with caution.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex flex-row items-center justify-between rounded-lg border border-destructive/50 p-4">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="maintenance-mode">Enable Maintenance Mode</Label>
                                        <p className="text-xs text-destructive/80">This will make the entire public-facing site unavailable to visitors and non-admin users.</p>
                                    </div>
                                    <Switch id="maintenance-mode" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </>
    );
}


export default function SuperAdminDashboardPage() {
  const { user, isUserLoading, role } = useUser();

  if (isUserLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Allow access ONLY if the user's role is 'super-admin'.
  if (role !== 'super-admin') {
    return <PermissionDenied />;
  }

  return <SuperAdminDashboardContent />;
}
