import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserPlus, ShieldAlert, BarChart, Settings, Users } from "lucide-react";

const admins = [
    { id: 'ADM01', name: 'Alice', role: 'Operations Manager', status: 'Active' },
    { id: 'ADM02', name: 'Bob', role: 'Marketing Manager', status: 'Active' },
    { id: 'ADM03', name: 'Charlie', role: 'Finance Officer', status: 'Inactive' },
];

const systemAlerts = [
    { id: 'ALT01', severity: 'High', description: 'Payment gateway API has a 5% error rate.', time: '5m ago' },
    { id: 'ALT02', severity: 'Medium', description: 'Database CPU utilization at 85%.', time: '30m ago' },
];

export default function SuperAdminDashboard() {
    return (
        <Tabs defaultValue="overview">
            <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Platform Overview</TabsTrigger>
                <TabsTrigger value="admin-management">Admin Management</TabsTrigger>
                <TabsTrigger value="system-health">System Health</TabsTrigger>
                <TabsTrigger value="global-settings">Global Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
                <Card>
                    <CardHeader>
                        <CardTitle>Super Admin Dashboard</CardTitle>
                        <CardDescription>Full control of the platform. Oversee all operations, users, and configurations.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                             <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Admins</CardTitle>
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">12</div>
                                    <p className="text-xs text-muted-foreground">3 Active Roles</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">System Alerts</CardTitle>
                                    <ShieldAlert className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-destructive">2</div>
                                    <p className="text-xs text-muted-foreground">1 High Severity</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Platform GMV</CardTitle>
                                    <BarChart className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">KES 34.2M</div>
                                    <p className="text-xs text-muted-foreground">Year-to-date</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">New Users Today</CardTitle>
                                    <UserPlus className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">+15</div>
                                    <p className="text-xs text-muted-foreground">10 Buyers, 5 Sellers</p>
                                </CardContent>
                            </Card>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
            
            <TabsContent value="admin-management">
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle>Admin User Management</CardTitle>
                                <CardDescription>Manage admin accounts and their permissions.</CardDescription>
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
                                {admins.map((admin) => (
                                    <TableRow key={admin.id}>
                                        <TableCell className="font-medium">{admin.name}</TableCell>
                                        <TableCell>{admin.role}</TableCell>
                                        <TableCell><Badge variant={admin.status === 'Active' ? 'default' : 'destructive'}>{admin.status}</Badge></TableCell>
                                        <TableCell className="space-x-2">
                                            <Button variant="outline" size="sm">Edit Permissions</Button>
                                            <Button variant="destructive" size="sm">Revoke Access</Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="system-health">
                <Card>
                    <CardHeader>
                        <CardTitle>System Health & Alerts</CardTitle>
                        <CardDescription>Monitor the real-time health and performance of the platform.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Severity</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Timestamp</TableHead>
                                    <TableHead>Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {systemAlerts.map((alert) => (
                                    <TableRow key={alert.id}>
                                        <TableCell><Badge variant={alert.severity === 'High' ? 'destructive' : 'default'}>{alert.severity}</Badge></TableCell>
                                        <TableCell>{alert.description}</TableCell>
                                        <TableCell>{alert.time}</TableCell>
                                        <TableCell>
                                            <Button variant="outline" size="sm">Acknowledge</Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
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
