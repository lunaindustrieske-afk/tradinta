
'use client';

import * as React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Coins, Gift, Settings, BarChart, UserPlus, ShoppingCart, Star, Edit, ShieldCheck, UploadCloud } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

const airdropPhases = [
    { id: 'phase1', name: 'Phase 1: Early Adopters', status: 'Completed', claimed: '1.2M / 1.2M' },
    { id: 'phase2', name: 'Phase 2: Verified Sellers', status: 'Active', claimed: '750K / 2.0M', progress: 37.5 },
    { id: 'phase3', name: 'Phase 3: Public Launch', status: 'Upcoming', claimed: '0 / 5.0M' },
];

const buyerEarningRules = [
  { id: 'SIGNUP_VERIFY', action: 'Sign Up & Verify Email', icon: <UserPlus className="w-5 h-5 text-primary" />, points: 50, description: "One-time reward for joining the platform." },
  { id: 'PURCHASE_KES', action: 'Make a Purchase', icon: <ShoppingCart className="w-5 h-5 text-primary" />, points: 1, description: "Points earned per 100 KES spent." },
  { id: 'WRITE_REVIEW', action: 'Write a Product Review', icon: <Star className="w-5 h-5 text-primary" />, points: 15, description: "Reward for reviewing a purchased product." },
  { id: 'REFERRAL_SUCCESS', action: 'Refer a New User', icon: <UserPlus className="w-5 h-5 text-primary" />, points: 100, description: "Awarded when your referral verifies their account." },
];

const sellerEarningRules = [
    { id: 'VERIFY_PROFILE', action: 'Complete Profile Verification', icon: <ShieldCheck className="w-5 h-5 text-primary" />, points: 150, description: 'One-time reward for becoming a "Verified" seller.' },
    { id: 'FIRST_PRODUCT_PUBLISH', action: 'Publish First Product', icon: <UploadCloud className="w-5 h-5 text-primary" />, points: 25, description: "Awarded when the first product goes live." },
    { id: 'FIVE_STAR_REVIEW', action: 'Receive a 5-Star Review', icon: <Star className="w-5 h-5 text-primary" />, points: 10, description: "Reward for each 5-star review received from a verified buyer." },
];

export default function TradCoinAirdropDashboard() {
    const [isEditing, setIsEditing] = React.useState(false);
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const activeTab = searchParams.get('tab') || 'overview';
    
    const handleTabChange = (value: string) => {
        const params = new URLSearchParams(window.location.search);
        params.set('tab', value);
        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Coins className="w-6 h-6 text-primary" />
                        TradCoin & Points Management
                    </CardTitle>
                    <CardDescription>
                        Oversee the TradCoin airdrop, define points earning rules, and manage the overall rewards economy.
                    </CardDescription>
                </CardHeader>
            </Card>

            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Airdrop Overview</TabsTrigger>
                <TabsTrigger value="points">Points Earning Rules</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
                <Card>
                    <CardHeader>
                        <CardTitle>TradCoin Airdrop Overview</CardTitle>
                        <CardDescription>Oversee the distribution of $Trad tokens converted from TradPoints.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Airdrop Phase</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Claimed $Trad</TableHead>
                                    <TableHead>Progress</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {airdropPhases.map((phase) => (
                                    <TableRow key={phase.id}>
                                        <TableCell className="font-medium">{phase.name}</TableCell>
                                        <TableCell><Badge variant={phase.status === 'Active' ? 'default' : 'outline'}>{phase.status}</Badge></TableCell>
                                        <TableCell>{phase.claimed}</TableCell>
                                        <TableCell>
                                            {phase.progress ? <Progress value={phase.progress} className="w-[60%]" /> : 'N/A'}
                                        </TableCell>
                                        <TableCell>
                                            <Button variant="outline" size="sm" disabled={phase.status !== 'Active'}>Manage Phase</Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </TabsContent>
            
            <TabsContent value="points">
                 <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle>Buyer Earning Rules</CardTitle>
                                    <CardDescription>Define how buyers are awarded TradPoints.</CardDescription>
                                </div>
                                <Button onClick={() => setIsEditing(!isEditing)}>
                                    <Edit className="mr-2 h-4 w-4" /> {isEditing ? 'Save Rules' : 'Edit Rules'}
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {buyerEarningRules.map(rule => (
                                    <div key={rule.id} className="flex items-center justify-between rounded-lg border p-4">
                                        <div className="flex items-center gap-4">
                                            {rule.icon}
                                            <div>
                                                <p className="font-semibold">{rule.action}</p>
                                                <p className="text-sm text-muted-foreground">{rule.description}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {isEditing ? (
                                                <Input type="number" defaultValue={rule.points} className="w-24 h-9" />
                                            ) : (
                                                <p className="font-bold text-lg">{rule.points}</p>
                                            )}
                                            <span className="text-muted-foreground">Points</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                     <Card>
                        <CardHeader>
                             <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle>Seller Earning Rules</CardTitle>
                                    <CardDescription>Define how sellers are awarded TradPoints.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                           <div className="space-y-4">
                                {sellerEarningRules.map(rule => (
                                    <div key={rule.id} className="flex items-center justify-between rounded-lg border p-4">
                                        <div className="flex items-center gap-4">
                                            {rule.icon}
                                            <div>
                                                <p className="font-semibold">{rule.action}</p>
                                                <p className="text-sm text-muted-foreground">{rule.description}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {isEditing ? (
                                                <Input type="number" defaultValue={rule.points} className="w-24 h-9" />
                                            ) : (
                                                <p className="font-bold text-lg">{rule.points}</p>
                                            )}
                                            <span className="text-muted-foreground">Points</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </TabsContent>

            <TabsContent value="analytics">
                <Card>
                    <CardHeader>
                        <CardTitle>Airdrop Analytics</CardTitle>
                        <CardDescription>Track claims, user participation, and token distribution.</CardDescription>
                    </CardHeader>
                    <CardContent>
                       <div className="h-[300px] w-full bg-muted rounded-md flex items-center justify-center">
                           <BarChart className="h-16 w-16 text-muted-foreground" />
                           <p className="ml-4 text-muted-foreground">Airdrop Analytics Charts Here</p>
                       </div>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    );
}
