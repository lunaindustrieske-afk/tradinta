
'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Coins, Gift, Settings, BarChart, UserPlus, ShoppingCart, Star, Edit, ShieldCheck, UploadCloud, Save, Loader2, TrendingUp, ChevronRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useDoc, useFirestore, useMemoFirebase, setDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const airdropPhases = [
    { id: 'phase1', name: 'Phase 1: Early Adopters', status: 'Completed', claimed: '1.2M / 1.2M' },
    { id: 'phase2', name: 'Phase 2: Verified Sellers', status: 'Active', claimed: '750K / 2.0M', progress: 37.5 },
    { id: 'phase3', name: 'Phase 3: Public Launch', status: 'Upcoming', claimed: '0 / 5.0M' },
];

const buyerEarningRuleDefs = [
  { id: 'buyerSignupPoints', action: 'Sign Up & Verify Email', icon: <UserPlus className="w-5 h-5 text-primary" />, description: "One-time reward for joining the platform." },
  { id: 'buyerPurchasePointsPer10', action: 'Make a Purchase', icon: <ShoppingCart className="w-5 h-5 text-primary" />, description: "Points earned per KES 10 spent." },
  { id: 'buyerReviewPoints', action: 'Write a Product Review', icon: <Star className="w-5 h-5 text-primary" />, description: "Reward for reviewing a purchased product." },
  { id: 'buyerReferralPoints', action: 'Refer a New User', icon: <UserPlus className="w-5 h-5 text-primary" />, description: "Awarded when your referral verifies their account." },
];

const sellerEarningRuleDefs = [
    { id: 'sellerVerificationPoints', action: 'Complete Profile Verification', icon: <ShieldCheck className="w-5 h-5 text-primary" />, description: 'One-time reward for becoming a "Verified" seller.' },
    { id: 'sellerSalePointsPer10', action: 'Make a Sale', icon: <ShoppingCart className="w-5 h-5 text-primary" />, description: 'Points earned per KES 10 of sale value.' },
    { id: 'sellerFirstProductPoints', action: 'Publish First Product', icon: <UploadCloud className="w-5 h-5 text-primary" />, description: "Awarded when the first product goes live." },
    { id: 'sellerFiveStarReviewPoints', action: 'Receive a 5-Star Review', icon: <Star className="w-5 h-5 text-primary" />, description: "Reward for each 5-star review received from a verified buyer." },
];

type PointsConfig = {
    buyerSignupPoints?: number;
    buyerPurchasePointsPer10?: number;
    buyerReviewPoints?: number;
    buyerReferralPoints?: number;
    sellerVerificationPoints?: number;
    sellerSalePointsPer10?: number;
    sellerFirstProductPoints?: number;
    sellerFiveStarReviewPoints?: number;
    globalSellerPointMultiplier?: number;
}

const NavLink = ({ active, onClick, children }: { active: boolean, onClick: () => void, children: React.ReactNode }) => (
    <button
        onClick={onClick}
        className={cn(
            "flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md w-full text-left",
            active ? "bg-muted text-primary" : "hover:bg-muted/50"
        )}
    >
        {children}
        <ChevronRight className={cn("h-4 w-4 transition-transform", active ? "transform translate-x-1" : "")} />
    </button>
);


export default function TradCoinAirdropDashboard() {
    const [isEditing, setIsEditing] = React.useState(false);
    const [isSaving, setIsSaving] = React.useState(false);
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const firestore = useFirestore();

    const pointsConfigRef = useMemoFirebase(() => firestore ? doc(firestore, 'platformSettings', 'pointsConfig') : null, [firestore]);
    const { data: pointsConfig, isLoading } = useDoc<PointsConfig>(pointsConfigRef);
    
    const [rules, setRules] = React.useState<Record<string, number>>({});
    
    React.useEffect(() => {
        if (pointsConfig) {
            setRules({
                buyerSignupPoints: pointsConfig.buyerSignupPoints || 50,
                buyerPurchasePointsPer10: pointsConfig.buyerPurchasePointsPer10 || 1,
                buyerReviewPoints: pointsConfig.buyerReviewPoints || 15,
                buyerReferralPoints: pointsConfig.buyerReferralPoints || 100,
                sellerVerificationPoints: pointsConfig.sellerVerificationPoints || 150,
                sellerSalePointsPer10: pointsConfig.sellerSalePointsPer10 || 1,
                sellerFirstProductPoints: pointsConfig.sellerFirstProductPoints || 25,
                sellerFiveStarReviewPoints: pointsConfig.sellerFiveStarReviewPoints || 10,
                globalSellerPointMultiplier: pointsConfig.globalSellerPointMultiplier || 1,
            });
        }
    }, [pointsConfig]);
    
    const handleRuleChange = (id: string, value: string) => {
        setRules(prev => ({ ...prev, [id]: Number(value) }));
    };
    
    const handleSaveRules = async () => {
        if (!pointsConfigRef) return;
        setIsSaving(true);
        try {
            const dataToSave: PointsConfig = {
                buyerSignupPoints: rules.buyerSignupPoints,
                buyerPurchasePointsPer10: rules.buyerPurchasePointsPer10,
                buyerReviewPoints: rules.buyerReviewPoints,
                buyerReferralPoints: rules.buyerReferralPoints,
                sellerVerificationPoints: rules.sellerVerificationPoints,
                sellerSalePointsPer10: rules.sellerSalePointsPer10,
                sellerFirstProductPoints: rules.sellerFirstProductPoints,
                sellerFiveStarReviewPoints: rules.sellerFiveStarReviewPoints,
                globalSellerPointMultiplier: rules.globalSellerPointMultiplier,
            };
            await setDocumentNonBlocking(pointsConfigRef, dataToSave);
            toast({ title: "Success", description: "Points earning rules have been updated." });
            setIsEditing(false);
        } catch (error: any) {
            toast({ title: "Error", description: "Could not save rules: " + error.message, variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };

    const activeTab = searchParams.get('tab') || 'overview';
    
    const handleTabChange = (value: string) => {
        const params = new URLSearchParams(window.location.search);
        params.set('tab', value);
        router.push(`${pathname}?${params.toString()}`);
    };

    const renderOverview = () => (
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
    );

    const renderPointsRules = () => (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Points Earning Rules</CardTitle>
                            <CardDescription>Define how users are awarded TradPoints for their actions.</CardDescription>
                        </div>
                        <Button onClick={isEditing ? handleSaveRules : () => setIsEditing(true)} disabled={isSaving}>
                            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : isEditing ? <Save className="mr-2 h-4 w-4" /> : <Edit className="mr-2 h-4 w-4" />}
                            {isSaving ? 'Saving...' : isEditing ? 'Save Rules' : 'Edit Rules'}
                        </Button>
                    </div>
                </CardHeader>
            </Card>
                <Card>
                <CardHeader>
                    <CardTitle>Buyer Earning Rules</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {isLoading ? Array.from({length: 4}).map((_, i) => <Skeleton key={i} className="h-20 w-full" />) :
                        buyerEarningRuleDefs.map(rule => (
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
                                        <Input type="number" value={rules[rule.id] || 0} onChange={(e) => handleRuleChange(rule.id, e.target.value)} className="w-24 h-9" />
                                    ) : (
                                        <p className="font-bold text-lg">{rules[rule.id] || 0}</p>
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
                    <CardTitle>Seller Earning Rules</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {isLoading ? Array.from({length: 4}).map((_, i) => <Skeleton key={i} className="h-20 w-full" />) :
                        sellerEarningRuleDefs.map(rule => (
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
                                        <Input type="number" value={rules[rule.id] || 0} onChange={(e) => handleRuleChange(rule.id, e.target.value)} className="w-24 h-9" />
                                    ) : (
                                        <p className="font-bold text-lg">{rules[rule.id] || 0}</p>
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
                    <CardTitle className="flex items-center gap-2"><TrendingUp /> Global Boost Settings</CardTitle>
                        <CardDescription>Apply platform-wide multipliers to incentivize specific user groups.</CardDescription>
                </CardHeader>
                <CardContent>
                        <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="flex items-center gap-4">
                            <ShieldCheck className="w-5 h-5 text-primary" />
                            <div>
                                <p className="font-semibold">Global Seller Point Multiplier</p>
                                <p className="text-sm text-muted-foreground">Boosts points earned from sales for all "Verified" sellers. Default is 1 (no boost).</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {isEditing ? (
                                <Input type="number" value={rules['globalSellerPointMultiplier'] || 1} onChange={(e) => handleRuleChange('globalSellerPointMultiplier', e.target.value)} className="w-24 h-9" />
                            ) : (
                                <p className="font-bold text-lg">{rules['globalSellerPointMultiplier'] || 1}x</p>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );

    return (
        <div className="space-y-6">
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

            <div className="grid md:grid-cols-4 gap-6">
                <div className="md:col-span-1">
                    <Card>
                        <CardContent className="p-4">
                             <nav className="space-y-1">
                                <NavLink active={activeTab === 'overview'} onClick={() => handleTabChange('overview')}>
                                    Airdrop Overview
                                </NavLink>
                                <NavLink active={activeTab === 'points'} onClick={() => handleTabChange('points')}>
                                    Points Earning Rules
                                </NavLink>
                            </nav>
                        </CardContent>
                    </Card>
                </div>
                <div className="md:col-span-3">
                    {activeTab === 'overview' && renderOverview()}
                    {activeTab === 'points' && renderPointsRules()}
                </div>
            </div>

        </div>
    );
}
