import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DollarSign, ShieldCheck, FileWarning, Landmark } from "lucide-react";

const transactions = [
    { id: 'TXN001', type: 'Payout', amount: 50000, user: 'SellerShop1', status: 'Completed', date: '2023-11-15' },
    { id: 'TXN002', type: 'Payment', amount: 110000, user: 'BuyerCo', status: 'In Escrow', date: '2023-11-14' },
    { id: 'TXN003', type: 'Withdrawal', amount: 250000, user: 'DistributorX', status: 'Pending Approval', date: '2023-11-14' },
];

const kycVerifications = [
    { id: 'KYC004', user: 'NewSeller Inc.', status: 'Pending', submitted: '2023-11-13' },
    { id: 'KYC005', user: 'BulkBuyer Ltd.', status: 'Action Required', submitted: '2023-11-12' },
];

export default function FinanceDashboard() {
    return (
        <Tabs defaultValue="transactions">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="transactions">Transaction Monitoring</TabsTrigger>
                <TabsTrigger value="kyc">KYC & Compliance</TabsTrigger>
                <TabsTrigger value="reporting">Reporting</TabsTrigger>
            </TabsList>

            <TabsContent value="transactions">
                <Card>
                    <CardHeader>
                        <CardTitle>Transaction Monitoring</CardTitle>
                        <CardDescription>Oversee all financial movements within the TradPay system.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Transaction ID</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Amount (KES)</TableHead>
                                    <TableHead>User</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {transactions.map((txn) => (
                                    <TableRow key={txn.id}>
                                        <TableCell className="font-medium">{txn.id}</TableCell>
                                        <TableCell>{txn.type}</TableCell>
                                        <TableCell>{txn.amount.toLocaleString()}</TableCell>
                                        <TableCell>{txn.user}</TableCell>
                                        <TableCell><Badge variant={
                                            txn.status === 'Completed' ? 'secondary' :
                                            txn.status === 'In Escrow' ? 'default' : 'destructive'
                                        }>{txn.status}</Badge></TableCell>
                                        <TableCell>{txn.date}</TableCell>
                                        <TableCell>
                                            <Button variant="outline" size="sm">
                                                {txn.status === 'Pending Approval' ? 'Review' : 'View Details'}
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </TabsContent>
            
            <TabsContent value="kyc">
                <Card>
                    <CardHeader>
                        <CardTitle>KYC & Compliance Management</CardTitle>
                        <CardDescription>Manage and verify user KYC documents to ensure regulatory compliance.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Verification ID</TableHead>
                                    <TableHead>User / Business</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Date Submitted</TableHead>
                                    <TableHead>Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {kycVerifications.map((kyc) => (
                                    <TableRow key={kyc.id}>
                                        <TableCell className="font-medium">{kyc.id}</TableCell>
                                        <TableCell>{kyc.user}</TableCell>
                                        <TableCell><Badge variant={kyc.status === 'Pending' ? 'default' : 'destructive'}>{kyc.status}</Badge></TableCell>
                                        <TableCell>{kyc.submitted}</TableCell>
                                        <TableCell>
                                            <Button variant="outline" size="sm"><ShieldCheck className="mr-2 h-4 w-4" /> Review Documents</Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="reporting">
                <Card>
                    <CardHeader>
                        <CardTitle>Financial Reporting</CardTitle>
                        <CardDescription>Generate and download financial reports for auditing and analysis.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Card>
                           <CardContent className="p-6 flex items-center justify-between">
                               <div>
                                   <p className="font-semibold">Monthly Revenue Report</p>
                                   <p className="text-sm text-muted-foreground">Summary of all transaction fees and platform revenues.</p>
                               </div>
                               <Button><FileWarning className="mr-2 h-4 w-4"/> Generate Report</Button>
                           </CardContent>
                        </Card>
                        <Card>
                           <CardContent className="p-6 flex items-center justify-between">
                               <div>
                                   <p className="font-semibold">Payouts & Withdrawals Report</p>
                                   <p className="text-sm text-muted-foreground">Complete log of all funds moved out of the platform.</p>
                               </div>
                               <Button><Landmark className="mr-2 h-4 w-4"/> Generate Report</Button>
                           </CardContent>
                        </Card>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    );
}
