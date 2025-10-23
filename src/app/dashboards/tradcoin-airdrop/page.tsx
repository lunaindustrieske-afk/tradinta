import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Coins, Gift, Settings, BarChart } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const airdropPhases = [
    { id: 'phase1', name: 'Phase 1: Early Adopters', status: 'Completed', claimed: '1.2M / 1.2M' },
    { id: 'phase2', name: 'Phase 2: Verified Sellers', status: 'Active', claimed: '750K / 2.0M', progress: 37.5 },
    { id: 'phase3', name: 'Phase 3: Public Launch', status: 'Upcoming', claimed: '0 / 5.0M' },
];

const conversionRules = [
    { pointType: 'Verification Point', ratio: '1:1.2', description: 'Points from KYC/business verification' },
    { pointType: 'Transaction Point', ratio: '1:1', description: 'Points from buying/selling' },
    { point2pointType: 'Community Point', ratio: '1:0.8', description: 'Points from referrals, reviews etc.' },
];

export default function TradCoinAirdropDashboard() {
    return (
        <Tabs defaultValue="overview">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Airdrop Overview</TabsTrigger>
                <TabsTrigger value="conversion">Conversion Rules</TabsTrigger>
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
            
            <TabsContent value="conversion">
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle>TradPoints to $Trad Conversion Rules</CardTitle>
                                <CardDescription>Define the conversion ratios for different types of points.</CardDescription>
                            </div>
                            <Button><Settings className="mr-2 h-4 w-4" /> Edit Rules</Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Point Type</TableHead>
                                    <TableHead>Conversion Ratio (Points:$Trad)</TableHead>
                                    <TableHead>Description</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {conversionRules.map((rule, index) => (
                                    <TableRow key={index}>
                                        <TableCell className="font-medium">{rule.pointType}</TableCell>
                                        <TableCell>{rule.ratio}</TableCell>
                                        <TableCell>{rule.description}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
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
