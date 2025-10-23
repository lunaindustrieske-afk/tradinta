import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";

const summaryCards = [
  { title: "Total Orders", value: "146" },
  { title: "Total Sales", value: "KES 1.2M" },
  { title: "TradPoints", value: "8,240" },
  { title: "TradCoin (Locked)", value: "210 $Trad" },
  { title: "Wallet Balance", value: "KES 14,500" },
  { title: "Ads Running", value: "3 Campaigns" },
];

const recentActivities = [
    { description: "Your quotation to EastChem was approved.", time: "5m ago" },
    { description: "Received payment of KES 45,000 via TradPay.", time: "1h ago" },
    { description: "You earned +20 TradPoints for completing verification.", time: "3h ago" },
    { description: "Airdrop countdown: 10 days left!", time: "1d ago" },
    { description: "New message from 'Bulk Buyers Inc'.", time: "2d ago" },
];


export default function DashboardPage() {
    return (
        <div className="grid gap-6">
            {/* 1. Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
                {summaryCards.map((card) => (
                    <Card key={card.title}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                                <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{card.value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* 2. Recent Activity */}
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentActivities.map((activity, index) => (
                                <div key={index} className="flex items-start gap-4">
                                    <div className="flex-1">
                                        <p className="text-sm">{activity.description}</p>
                                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* 3. TradPoints & TradCoin Module */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>TradPoints & TradCoin</CardTitle>
                        <CardDescription>Earn points for your activity and convert them to TradCoin.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p>Placeholder for TradPoints and TradCoin module.</p>
                    </CardContent>
                </Card>
            </div>


             <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* 4. My Shop Module */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>My Shop Performance</CardTitle>
                        <CardDescription>Overview of your seller activities.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p>Placeholder for Shop Performance analytics.</p>
                    </CardContent>
                </Card>
                {/* 5. Wallet Module */}
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle>TradPay Wallet</CardTitle>
                    </CardHeader>
                    <CardContent>
                         <p>Placeholder for TradPay Wallet module.</p>
                    </CardContent>
                </Card>
            </div>
            
        </div>
    )
}
