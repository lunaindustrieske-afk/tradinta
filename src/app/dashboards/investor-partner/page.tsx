'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { DollarSign, BarChart, Users, TrendingUp, FileText } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const gmvData = [
  { name: 'Jan', GMV: 3.2 },
  { name: 'Feb', GMV: 3.8 },
  { name: 'Mar', GMV: 5.1 },
  { name: 'Apr', GMV: 6.2 },
  { name: 'May', GMV: 7.5 },
  { name: 'Jun', GMV: 8.1 },
];

const userGrowthData = [
  { name: 'Jan', Users: 800 },
  { name: 'Feb', Users: 950 },
  { name: 'Mar', Users: 1100 },
  { name: 'Apr', Users: 1250 },
  { name: 'May', Users: 1400 },
  { name: 'Jun', Users: 1550 },
];

export default function InvestorPartnerDashboard() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Investor / Partner Dashboard</CardTitle>
                <CardDescription>Read-only view of key performance indicators and platform growth metrics.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Gross Merchandise Volume (GMV)</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">KES 34.2M</div>
                            <p className="text-xs text-muted-foreground">YTD</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Active Users</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">1,550</div>
                            <p className="text-xs text-muted-foreground">+20% since last quarter</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
                            <BarChart className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">KES 120,500</div>
                            <p className="text-xs text-muted-foreground">Increasing QoQ</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Platform Growth</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">+18%</div>
                            <p className="text-xs text-muted-foreground">Month-over-Month</p>
                        </CardContent>
                    </Card>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>GMV Trend (KES Millions)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={gmvData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="GMV" stroke="#8884d8" name="GMV (Millions)" />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>User Growth</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={userGrowthData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="Users" stroke="#82ca9d" name="Total Users" />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>
                 <Card>
                    <CardHeader>
                        <CardTitle>Reports</CardTitle>
                        <CardDescription>Download quarterly and annual performance reports.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex gap-4">
                        <Button variant="outline"><FileText className="mr-2 h-4 w-4" /> Download Q3 2023 Report</Button>
                        <Button variant="outline"><FileText className="mr-2 h-4 w-4" /> Download Annual 2022 Report</Button>
                    </CardContent>
                </Card>
            </CardContent>
        </Card>
    );
}
