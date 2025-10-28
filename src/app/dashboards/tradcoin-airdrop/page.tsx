
'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Coins, Gift, Settings, BarChart, UserPlus, ShoppingCart, Star, Edit, ShieldCheck, UploadCloud, Save, Loader2, TrendingUp, ChevronRight, PlusCircle, Ticket } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useDoc, useFirestore, useMemoFirebase, setDocumentNonBlocking, useCollection } from '@/firebase';
import { doc, collection, query, orderBy } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { generateClaimCodes, voidClaimCode } from './actions';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { awardPoints } from '@/app/(auth)/actions';
import { useAuth } from '@/firebase';
import { getDocs, where, limit } from 'firebase/firestore';

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

type ClaimCode = {
  id: string;
  code: string;
  points: number;
  status: 'active' | 'claimed' | 'voided';
  expiresAt?: any;
  createdAt: any;
};

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

const PointsRulesManager = () => {
    const [isEditing, setIsEditing] = React.useState(false);
    const [isSaving, setIsSaving] = React.useState(false);
    const { toast } = useToast();
    const firestore = useFirestore();

    const pointsConfigRef = useMemoFirebase(() => firestore ? doc(firestore, 'platformSettings', 'config') : null, [firestore]);
    const { data: pointsConfig, isLoading } = useDoc<PointsConfig>(pointsConfigRef);
    
    const [rules, setRules] = React.useState<Record<string, number>>({});
    
    React.useEffect(() => {
        if (pointsConfig?.pointsConfig) {
            const pc = pointsConfig.pointsConfig as PointsConfig;
            setRules({
                buyerSignupPoints: pc.buyerSignupPoints || 50,
                buyerPurchasePointsPer10: pc.buyerPurchasePointsPer10 || 1,
                buyerReviewPoints: pc.buyerReviewPoints || 15,
                buyerReferralPoints: pc.buyerReferralPoints || 100,
                sellerVerificationPoints: pc.sellerVerificationPoints || 150,
                sellerSalePointsPer10: pc.sellerSalePointsPer10 || 1,
                sellerFirstProductPoints: pc.sellerFirstProductPoints || 25,
                sellerFiveStarReviewPoints: pc.sellerFiveStarReviewPoints || 10,
                globalSellerPointMultiplier: pc.globalSellerPointMultiplier || 1,
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
            const dataToSave = { pointsConfig: rules };
            await setDocumentNonBlocking(pointsConfigRef, dataToSave, { merge: true });
            toast({ title: "Success", description: "Points earning rules have been updated." });
            setIsEditing(false);
        } catch (error: any) {
            toast({ title: "Error", description: "Could not save rules: " + error.message, variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };

    return (
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
                                <Input type="number" step="0.1" value={rules['globalSellerPointMultiplier'] || 1} onChange={(e) => handleRuleChange('globalSellerPointMultiplier', e.target.value)} className="w-24 h-9" />
                            ) : (
                                <p className="font-bold text-lg">{rules['globalSellerPointMultiplier'] || 1}x</p>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

function ClaimCodesManager() {
    const firestore = useFirestore();
    const auth = useAuth();
    const { toast } = useToast();
    const [isGenerating, setIsGenerating] = React.useState(false);

    // Manual Award state
    const [awardUserId, setAwardUserId] = React.useState('');
    const [awardPointsValue, setAwardPointsValue] = React.useState('');
    const [awardReason, setAwardReason] = React.useState('');
    const [awardNote, setAwardNote] = React.useState('');
    const [isAwarding, setIsAwarding] = React.useState(false);

    const codesQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'claimCodes'), orderBy('createdAt', 'desc'));
    }, [firestore]);

    const { data: codes, isLoading, forceRefetch } = useCollection<ClaimCode>(codesQuery);

    const handleGenerateSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsGenerating(true);
        const formData = new FormData(event.currentTarget);
        const count = Number(formData.get('count'));
        const points = Number(formData.get('points'));
        const expiresAt = formData.get('expiresAt') ? new Date(formData.get('expiresAt') as string) : undefined;
        
        if (isNaN(count) || count <= 0 || isNaN(points) || points <= 0) {
            toast({ title: 'Invalid input', description: 'Please enter valid numbers for count and points.', variant: 'destructive' });
            setIsGenerating(false);
            return;
        }

        try {
            const result = await generateClaimCodes({ count, points, expiresAt });
            if(result.success) {
                toast({ title: "Success!", description: `${result.count} claim codes have been generated.`});
                if (forceRefetch) forceRefetch();
            } else {
                throw new Error(result.message);
            }
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        } finally {
            setIsGenerating(false);
        }
    };
    
    const handleAwardPoints = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!firestore || !auth?.currentUser) {
            toast({ title: 'Admin not authenticated', variant: 'destructive' });
            return;
        }
        if (!awardUserId || !awardPointsValue || !awardReason) {
            toast({ title: 'All fields are required', variant: 'destructive' });
            return;
        }
        setIsAwarding(true);

        try {
            const usersRef = collection(firestore, 'users');
            const q = query(usersRef, where('tradintaId', '==', awardUserId), limit(1));
            const userSnapshot = await getDocs(q);

            if (userSnapshot.empty) {
                throw new Error(`User with Tradinta ID "${awardUserId}" not found.`);
            }
            
            const targetUser = userSnapshot.docs[0];

            await awardPoints(
                firestore,
                targetUser.id,
                Number(awardPointsValue),
                awardReason,
                { admin_note: awardNote, issued_by: auth.currentUser.email }
            );

            toast({
                title: 'Points Awarded!',
                description: `${awardPointsValue} points awarded to ${targetUser.data().fullName}.`
            });
            
            setAwardUserId('');
            setAwardPointsValue('');
            setAwardReason('');
            setAwardNote('');

        } catch (error: any) {
            toast({ title: 'Error Awarding Points', description: error.message, variant: 'destructive' });
        } finally {
            setIsAwarding(false);
        }
    };


    const handleVoidCode = async (codeId: string) => {
        try {
            const result = await voidClaimCode(codeId);
            if (result.success) {
                toast({ title: "Code Voided", description: "The claim code has been successfully voided." });
                if (forceRefetch) forceRefetch();
            } else {
                throw new Error(result.message);
            }
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        }
    };

    const getStatusVariant = (status: ClaimCode['status']) => {
        switch (status) {
            case 'active': return 'secondary';
            case 'claimed': return 'default';
            case 'voided': return 'destructive';
            default: return 'outline';
        }
    };

    return (
        <div className="space-y-6">
             <Card>
                <CardHeader>
                    <CardTitle>Manual Point Adjustments</CardTitle>
                    <CardDescription>Grant points for promotions, competitions, or manual corrections.</CardDescription>
                </CardHeader>
                <form onSubmit={handleAwardPoints}>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2"><Label htmlFor="award-user-id">User's Tradinta ID</Label><Input id="award-user-id" placeholder="e.g. a8B2c3D4" value={awardUserId} onChange={e => setAwardUserId(e.target.value)} required /></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2"><Label htmlFor="award-points">Points to Award</Label><Input id="award-points" type="number" placeholder="e.g. 500" value={awardPointsValue} onChange={e => setAwardPointsValue(e.target.value)} required /></div>
                            <div className="grid gap-2">
                                <Label htmlFor="award-reason">Reason</Label>
                                <Select onValueChange={setAwardReason} value={awardReason} required><SelectTrigger id="award-reason"><SelectValue placeholder="Select reason" /></SelectTrigger><SelectContent><SelectItem value="PROMOTIONAL_GIFT">Promotional Gift</SelectItem><SelectItem value="MANUAL_CORRECTION">Manual Correction</SelectItem></SelectContent></Select>
                            </div>
                        </div>
                        <div className="grid gap-2"><Label htmlFor="award-note">Admin Note (Optional)</Label><Input id="award-note" placeholder="e.g., Winner of Q4 Campaign" value={awardNote} onChange={e => setAwardNote(e.target.value)} /></div>
                    </CardContent>
                    <CardFooter><Button className="w-full" type="submit" disabled={isAwarding}>{isAwarding ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <PlusCircle className="mr-2 h-4 w-4" />}Award Points</Button></CardFooter>
                </form>
            </Card>
            <Card>
                <CardHeader><CardTitle>Generate New Claim Codes</CardTitle></CardHeader>
                <form onSubmit={handleGenerateSubmit}>
                    <CardContent className="space-y-4">
                        <div className="grid sm:grid-cols-3 gap-4">
                            <div className="grid gap-2"><Label htmlFor="count">Number of Codes</Label><Input id="count" name="count" type="number" placeholder="e.g. 50" required /></div>
                            <div className="grid gap-2"><Label htmlFor="points">Points per Code</Label><Input id="points" name="points" type="number" placeholder="e.g. 100" required /></div>
                            <div className="grid gap-2"><Label htmlFor="expiresAt">Expires On (Optional)</Label><Input id="expiresAt" name="expiresAt" type="date" /></div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" disabled={isGenerating}>
                            {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Ticket className="mr-2" />}
                            {isGenerating ? 'Generating...' : 'Generate Codes'}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
            <Card>
                <CardHeader><CardTitle>Existing Claim Codes</CardTitle></CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader><TableRow><TableHead>Code</TableHead><TableHead>Points</TableHead><TableHead>Status</TableHead><TableHead>Expires On</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {isLoading ? Array.from({length: 3}).map((_, i) => <TableRow key={i}><TableCell colSpan={5}><Skeleton className="h-8 w-full" /></TableCell></TableRow>) 
                            : codes && codes.length > 0 ? codes.map(code => (
                                <TableRow key={code.id}>
                                    <TableCell className="font-mono">{code.code}</TableCell>
                                    <TableCell>{code.points}</TableCell>
                                    <TableCell><Badge variant={getStatusVariant(code.status)}>{code.status}</Badge></TableCell>
                                    <TableCell>{code.expiresAt ? new Date(code.expiresAt.seconds * 1000).toLocaleDateString() : 'N/A'}</TableCell>
                                    <TableCell>{code.status === 'active' && <Button variant="destructive" size="sm" onClick={() => handleVoidCode(code.id)}>Void</Button>}</TableCell>
                                </TableRow>
                            )) : <TableRow><TableCell colSpan={5} className="text-center h-24">No claim codes found.</TableCell></TableRow>}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

export default function TradCoinAirdropDashboard() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const activeTab = searchParams.get('tab') || 'overview';
    
    const handleTabChange = (value: string) => {
        const params = new URLSearchParams(window.location.search);
        params.set('tab', value);
        router.push(`${pathname}?${params.toString()}`);
    };

    const renderOverview = () => (
         <Card>
            <CardHeader><CardTitle>TradCoin Airdrop Overview</CardTitle><CardDescription>Oversee the distribution of $Trad tokens converted from TradPoints.</CardDescription></CardHeader>
            <CardContent>
                <Table>
                    <TableHeader><TableRow><TableHead>Airdrop Phase</TableHead><TableHead>Status</TableHead><TableHead>Claimed $Trad</TableHead><TableHead>Progress</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                    <TableBody>
                        {airdropPhases.map((phase) => (
                            <TableRow key={phase.id}>
                                <TableCell className="font-medium">{phase.name}</TableCell>
                                <TableCell><Badge variant={phase.status === 'Active' ? 'default' : 'outline'}>{phase.status}</Badge></TableCell>
                                <TableCell>{phase.claimed}</TableCell>
                                <TableCell>{phase.progress ? <Progress value={phase.progress} className="w-[60%]" /> : 'N/A'}</TableCell>
                                <TableCell><Button variant="outline" size="sm" disabled={phase.status !== 'Active'}>Manage Phase</Button></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Coins className="w-6 h-6 text-primary" />TradCoin &amp; Points Management</CardTitle>
                    <CardDescription>Oversee the TradCoin airdrop, define points earning rules, and manage the overall rewards economy.</CardDescription>
                </CardHeader>
            </Card>

            <div className="grid md:grid-cols-4 gap-6 items-start">
                <div className="md:col-span-1">
                    <Card>
                        <CardContent className="p-4">
                             <nav className="space-y-1">
                                <NavLink active={activeTab === 'overview'} onClick={() => handleTabChange('overview')}>Airdrop Overview</NavLink>
                                <NavLink active={activeTab === 'points'} onClick={() => handleTabChange('points')}>Points Earning Rules</NavLink>
                                <NavLink active={activeTab === 'claim-codes'} onClick={() => handleTabChange('claim-codes')}>Claim Codes &amp; Awards</NavLink>
                            </nav>
                        </CardContent>
                    </Card>
                </div>
                <div className="md:col-span-3">
                    {activeTab === 'overview' && renderOverview()}
                    {activeTab === 'points' && <PointsRulesManager />}
                    {activeTab === 'claim-codes' && <ClaimCodesManager />}
                </div>
            </div>

        </div>
    );
}

    