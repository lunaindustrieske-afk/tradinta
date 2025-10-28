
'use client';

import * as React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Coins, Gift, Settings, BarChart, UserPlus, ShoppingCart, Star, Edit, ShieldCheck, UploadCloud, Save, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useDoc, useFirestore, useMemoFirebase, setDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

const airdropPhases = [
    { id: 'phase1', name: 'Phase 1: Early Adopters', status: 'Completed', claimed: '1.2M / 1.2M' },
    { id: 'phase2', name: 'Phase 2: Verified Sellers', status: 'Active', claimed: '750K / 2.0M', progress: 37.5 },
    { id: 'phase3', name: 'Phase 3: Public Launch', status: 'Upcoming', claimed: '0 / 5.0M' },
];

const initialBuyerRules = {
  'SIGNUP_VERIFY': 50,
  'PURCHASE_KES': 1, // 1 point per 10 KES
  'WRITE_REVIEW': 15,
  'REFERRAL_SUCCESS': 100,
};

const initialSellerRules = {
    'VERIFY_PROFILE': 150,
    'SALE_KES': 1, // 1 point per 10 KES
    'FIRST_PRODUCT_PUBLISH': 25,
    'FIVE_STAR_REVIEW': 10,
};

const buyerEarningRuleDefs = [
  { id: 'SIGNUP_VERIFY', action: 'Sign Up & Verify Email', icon: <UserPlus className="w-5 h-5 text-primary" />, description: "One-time reward for joining the platform." },
  { id: 'PURCHASE_KES', action: 'Make a Purchase', icon: <ShoppingCart className="w-5 h-5 text-primary" />, description: "Points earned per KES 10 spent." },
  { id: 'WRITE_REVIEW', action: 'Write a Product Review', icon: <Star className="w-5 h-5 text-primary" />, description: "Reward for reviewing a purchased product." },
  { id: 'REFERRAL_SUCCESS', action: 'Refer a New User', icon: <UserPlus className="w-5 h-5 text-primary" />, description: "Awarded when your referral verifies their account." },
];

const sellerEarningRuleDefs = [
    { id: 'VERIFY_PROFILE', action: 'Complete Profile Verification', icon: <ShieldCheck className="w-5 h-5 text-primary" />, description: 'One-time reward for becoming a "Verified" seller.' },
    { id: 'SALE_KES', action: 'Make a Sale', icon: <ShoppingCart className="w-5 h-5 text-primary" />, description: 'Points earned per KES 10 of sale value.' },
    { id: 'FIRST_PRODUCT_PUBLISH', action: 'Publish First Product', icon: <UploadCloud className="w-5 h-5 text-primary" />, description: "Awarded when the first product goes live." },
    { id: 'FIVE_STAR_REVIEW', action: 'Receive a 5-Star Review', icon: <Star className="w-5 h-5 text-primary" />, description: "Reward for each 5-star review received from a verified buyer." },
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
}

const ruleToDbFieldMapping: Record<string, keyof PointsConfig> = {
    'SIGNUP_VERIFY': 'buyerSignupPoints',
    'PURCHASE_KES': 'buyerPurchasePointsPer10',
    'WRITE_REVIEW': 'buyerReviewPoints',
    'REFERRAL_SUCCESS': 'buyerReferralPoints',
    'VERIFY_PROFILE': 'sellerVerificationPoints',
    'SALE_KES': 'sellerSalePointsPer10',
    'FIRST_PRODUCT_PUBLISH': 'sellerFirstProductPoints',
    'FIVE_STAR_REVIEW': 'sellerFiveStarReviewPoints',
};

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
    
    const [buyerRules, setBuyerRules] = React.useState(initialBuyerRules);
    const [sellerRules, setSellerRules] = React.useState(initialSellerRules);
    
    React.useEffect(() => {
        if (pointsConfig) {
            setBuyerRules({
                'SIGNUP_VERIFY': pointsConfig.buyerSignupPoints || 50,
                'PURCHASE_KES': pointsConfig.buyerPurchasePointsPer10 || 1,
                'WRITE_REVIEW': pointsConfig.buyerReviewPoints || 15,
                'REFERRAL_SUCCESS': pointsConfig.buyerReferralPoints || 100,
            });
            setSellerRules({
                'VERIFY_PROFILE': pointsConfig.sellerVerificationPoints || 150,
                'SALE_KES': pointsConfig.sellerSalePointsPer10 || 1,
                'FIRST_PRODUCT_PUBLISH': pointsConfig.sellerFirstProductPoints || 25,
                'FIVE_STAR_REVIEW': pointsConfig.sellerFiveStarReviewPoints || 10,
            });
        }
    }, [pointsConfig]);
    
    const handleBuyerRuleChange = (id: string, value: string) => {
        setBuyerRules(prev => ({ ...prev, [id]: Number(value) }));
    };
    const handleSellerRuleChange = (id: string, value: string) => {
        setSellerRules(prev => ({ ...prev, [id]: Number(value) }));
    };
    
    const handleSaveRules = async () => {
        if (!pointsConfigRef) return;
        setIsSaving(true);
        try {
            const dataToSave: PointsConfig = {
                buyerSignupPoints: buyerRules.SIGNUP_VERIFY,
                buyerPurchasePointsPer10: buyerRules.PURCHASE_KES,
                buyerReviewPoints: buyerRules.WRITE_REVIEW,
                buyerReferralPoints: buyerRules.REFERRAL_SUCCESS,
                sellerVerificationPoints: sellerRules.VERIFY_PROFILE,
                sellerSalePointsPer10: sellerRules.SALE_KES,
                sellerFirstProductPoints: sellerRules.FIRST_PRODUCT_PUBLISH,
                sellerFiveStarReviewPoints: sellerRules.FIVE_STAR_REVIEW,
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

            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="overview">Airdrop Overview</TabsTrigger>
                <TabsTrigger value="points">Points Earning Rules</TabsTrigger>
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
                                <Button onClick={isEditing ? handleSaveRules : () => setIsEditing(true)} disabled={isSaving}>
                                  {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : isEditing ? <Save className="mr-2 h-4 w-4" /> : <Edit className="mr-2 h-4 w-4" />}
                                  {isSaving ? 'Saving...' : isEditing ? 'Save Rules' : 'Edit Rules'}
                                </Button>
                            </div>
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
                                                <Input type="number" value={buyerRules[rule.id as keyof typeof buyerRules]} onChange={(e) => handleBuyerRuleChange(rule.id, e.target.value)} className="w-24 h-9" />
                                            ) : (
                                                <p className="font-bold text-lg">{buyerRules[rule.id as keyof typeof buyerRules]}</p>
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
                                                <Input type="number" value={sellerRules[rule.id as keyof typeof sellerRules]} onChange={(e) => handleSellerRuleChange(rule.id, e.target.value)} className="w-24 h-9" />
                                            ) : (
                                                <p className="font-bold text-lg">{sellerRules[rule.id as keyof typeof sellerRules]}</p>
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
        </Tabs>
    );
}
