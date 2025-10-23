import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { BarChart, Users, ShoppingCart, DollarSign, LineChart as LineChartIcon, Activity } from "lucide-react";
import { Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, ComposedChart } from 'recharts';


const salesData = [
  { name: 'Jan', sales: 4000, revenue: 2400 },
  { name: 'Feb', sales: 3000, revenue: 1398 },
  { name: 'Mar', sales: 5000, revenue: 9800 },
  { name: 'Apr', sales: 2780, revenue: 3908 },
  { name: 'May', sales: 1890, revenue: 4800 },
  { name: 'Jun', sales: 2390, revenue: 3800 },
];

const userGrowthData = [
    { name: 'Jan', buyers: 120, sellers: 15 },
    { name: 'Feb', buyers: 180, sellers: 20 },
    { name: 'Mar', buyers: 230, sellers: 28 },
    { name: 'Apr', buyers: 280, sellers: 35 },
    { name: 'May', buyers: 350, sellers: 42 },
    { name: 'Jun', buyers: 410, sellers: 50 },
];

const topCategories = [
    { category: 'Building Materials', sales: 1250000 },
    { category: 'Food & Beverage', sales: 980000 },
    { category: 'Plastics & Polymers', sales: 750000 },
    { category: 'Packaging', sales: 620000 },
    { category: 'Chemicals', sales: 450000 },
];

export default function AnalyticsDashboard() {
    return (
        <Tabs defaultValue="overview">
            <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Platform Overview</TabsTrigger>
                <TabsTrigger value="sales">Sales & Revenue</TabsTrigger>
                <TabsTrigger value="users">User Behavior</TabsTrigger>
                <TabsTrigger value="products">Product & Category</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
                <Card>
                    <CardHeader>
                        <CardTitle>Analytics & Insights Dashboard</CardTitle>
                        <CardDescription>Monitors data to guide business and product growth.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">KES 8,450,231</div>
                                    <p className="text-xs text-muted-foreground">+12.1% from last month</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                                    <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">10,293</div>
                                    <p className="text-xs text-muted-foreground">+180 from last month</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">852</div>
                                    <p className="text-xs text-muted-foreground">+50 active today</p>
                                </CardContent>
                            </Card>
                             <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Session Duration</CardTitle>
                                    <Activity className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">12m 45s</div>
                                    <p className="text-xs text-muted-foreground">Avg. session time</p>
                                </CardContent>
                            </Card>
                        </div>
                        <Card>
                           <CardHeader>
                               <CardTitle>Sales Trend</CardTitle>
                               <CardDescription>Monthly sales and revenue.</CardDescription>
                           </CardHeader>
                           <CardContent>
                               <ResponsiveContainer width="100%" height={300}>
                                    <ComposedChart data={salesData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                                        <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                                        <Tooltip />
                                        <Legend />
                                        <Bar yAxisId="right" dataKey="sales" fill="#82ca9d" name="Sales (Units)" />
                                        <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#8884d8" name="Revenue (KES)" />
                                    </ComposedChart>
                               </ResponsiveContainer>
                           </CardContent>
                        </Card>
                    </CardContent>
                </Card>
            </TabsContent>
            
            <TabsContent value="sales">
                <Card>
                    <CardHeader>
                        <CardTitle>Sales & Revenue Analytics</CardTitle>
                        <CardDescription>Detailed breakdown of sales performance.</CardDescription>
                    </CardHeader>
                     <CardContent>
                        {/* Placeholder for detailed sales charts */}
                        <div className="h-[300px] w-full bg-muted rounded-md flex items-center justify-center">
                           <LineChartIcon className="h-16 w-16 text-muted-foreground" />
                           <p className="ml-4 text-muted-foreground">Detailed Sales & Revenue Charts</p>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="users">
                <Card>
                    <CardHeader>
                        <CardTitle>User Behavior Analytics</CardTitle>
                        <CardDescription>Insights into user registration, activity, and retention.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <Card>
                           <CardHeader>
                               <CardTitle>User Growth</CardTitle>
                               <CardDescription>New buyers vs. sellers over the last 6 months.</CardDescription>
                           </CardHeader>
                           <CardContent>
                               <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={userGrowthData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Line type="monotone" dataKey="buyers" stroke="#8884d8" name="New Buyers"/>
                                        <Line type="monotone" dataKey="sellers" stroke="#82ca9d" name="New Sellers"/>
                                    </LineChart>
                               </ResponsiveContainer>
                           </CardContent>
                        </Card>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="products">
                 <Card>
                    <CardHeader>
                        <CardTitle>Product & Category Analytics</CardTitle>
                        <CardDescription>Performance of product categories and individual items.</CardDescription>
                    </CardHeader>
                     <CardContent>
                         <Card>
                           <CardHeader>
                               <CardTitle>Top Performing Categories by Sales Volume</CardTitle>
                           </CardHeader>
                           <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart layout="vertical" data={topCategories}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis type="number" />
                                        <YAxis dataKey="category" type="category" width={150} />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="sales" fill="#8884d8" name="Sales (KES)" />
                                    </BarChart>
                                </ResponsiveContainer>
                           </CardContent>
                        </Card>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    );
}
