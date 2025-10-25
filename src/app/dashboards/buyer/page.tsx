
'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, Coins, Gift, Heart, MessageSquare, Package, Search, Sparkles, Star, User, Wallet, Copy, Check } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { useDoc, useFirestore, useUser, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import React from "react";
import { useToast } from "@/hooks/use-toast";

const quickActions = [
  { title: "My Orders & RFQs", icon: <Package className="w-6 h-6 text-primary" />, href: "/dashboards/buyer/orders" },
  { title: "Messages", icon: <MessageSquare className="w-6 h-6 text-primary" />, href: "/dashboards/buyer/messages" },
  { title: "My Wishlist", icon: <Heart className="w-6 h-6 text-primary" />, href: "/dashboards/buyer/wishlist" },
  { title: "Browse Products", icon: <Search className="w-6 h-6 text-primary" />, href: "/products" },
];

type UserProfile = {
    tradintaId: string;
    email: string;
    fullName: string;
};

const ProfileCard = () => {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    const [copied, setCopied] = React.useState(false);

    const userDocRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return doc(firestore, 'users', user.uid);
    }, [user, firestore]);

    const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userDocRef);

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        toast({ title: 'Copied to clipboard!' });
        setTimeout(() => setCopied(false), 2000);
    };

    const isLoading = isUserLoading || isProfileLoading;

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-40" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-3/4" />
                </CardContent>
            </Card>
        );
    }

    if (!userProfile) return null;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><User className="w-6 h-6" /> My Profile</CardTitle>
                <CardDescription>Your personal information on Tradinta.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
                <div>
                    <p className="text-muted-foreground">Full Name</p>
                    <p className="font-semibold">{userProfile.fullName}</p>
                </div>
                <div>
                    <p className="text-muted-foreground">Email</p>
                    <p className="font-semibold">{userProfile.email}</p>
                </div>
                 <div>
                    <p className="text-muted-foreground">Tradinta ID</p>
                    <div className="flex items-center gap-2">
                        <p className="font-semibold font-mono">{userProfile.tradintaId}</p>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleCopy(userProfile.tradintaId)}>
                            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};


export default function BuyerDashboard() {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>My Tradinta Dashboard</CardTitle>
                    <CardDescription>Your central hub for trading, rewards, and insights.</CardDescription>
                </CardHeader>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Center Column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Balances & Rewards Panel */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                            <CardHeader className="flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">TradPay Balance</CardTitle>
                                <Wallet className="w-5 h-5 text-blue-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">KES 12,450.00</div>
                                <p className="text-xs text-muted-foreground">Available for payments</p>
                            </CardContent>
                            <CardFooter>
                                <Button size="sm" variant="outline">Add Funds</Button>
                            </CardFooter>
                        </Card>
                        <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                            <CardHeader className="flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">TradPoints</CardTitle>
                                <Sparkles className="w-5 h-5 text-green-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">1,850 Points</div>
                                <Progress value={85} className="mt-2 h-2" />
                            </CardContent>
                            <CardFooter>
                                <p className="text-xs text-muted-foreground">150 points to next reward</p>
                            </CardFooter>
                        </Card>
                        <Card className="bg-muted/50 border-dashed">
                            <CardHeader className="flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">$TRAD Balance</CardTitle>
                                <Coins className="w-5 h-5 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-muted-foreground">Coming Soon</div>
                                <p className="text-xs text-muted-foreground">TradPoints will be convertible to $TRAD</p>
                            </CardContent>
                        </Card>
                    </div>
                    {/* Quick Actions Panel */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {quickActions.map((action) => (
                            <Link href={action.href} key={action.title}>
                                <Card className="text-center hover:bg-accent hover:shadow-md transition-all h-full flex flex-col justify-center items-center p-4">
                                    <div className="mb-2">{action.icon}</div>
                                    <p className="font-semibold text-sm">{action.title}</p>
                                </Card>
                            </Link>
                        ))}
                    </div>

                    {/* Insights & Tasks Panel */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Your Next Steps</CardTitle>
                            <CardDescription>Complete these tasks to earn more points and improve your profile.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                                <div className="flex items-center gap-3">
                                    <Star className="w-5 h-5 text-yellow-500" />
                                    <div>
                                        <p className="font-semibold">Review your last purchase</p>
                                        <p className="text-sm text-muted-foreground">Product: Industrial Grade Cement</p>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm">Write Review (+15 Points)</Button>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                                <div className="flex items-center gap-3">
                                    <Badge>New</Badge>
                                    <div>
                                        <p className="font-semibold">Verify Your Business Details</p>
                                        <p className="text-sm text-muted-foreground">Get a verified buyer badge.</p>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm">Start Verification (+100 Points)</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                 {/* Right Column */}
                <div className="lg:col-span-1 space-y-6">
                    <ProfileCard />

                     {/* TradPoints Engagement Panel */}
                    <Card className="bg-gradient-to-br from-primary/10 to-accent/10">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Gift className="w-6 h-6"/> Earn More TradPoints!</CardTitle>
                            <CardDescription>Complete tasks and refer others to earn rewards that will convert to $TRAD tokens.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-background/50 rounded-lg p-4 mb-4">
                                <label htmlFor="referral-link" className="text-sm font-medium">Your Unique Referral Link</label>
                                <div className="flex items-center gap-2 mt-1">
                                    <input id="referral-link" type="text" value="https://tradinta.com/ref/johndoe123" readOnly className="flex-grow bg-muted border border-border rounded-md px-3 py-1.5 text-sm" />
                                    <Button size="sm" variant="outline">Copy</Button>
                                </div>
                            </div>
                            <p className="text-sm text-muted-foreground">Share your link via WhatsApp, Email, or Social Media to earn 50 points for every verified signup!</p>
                        </CardContent>
                        <CardFooter>
                            <Button>View All Tasks & Rewards <ArrowRight className="ml-2 w-4 h-4" /></Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
}
