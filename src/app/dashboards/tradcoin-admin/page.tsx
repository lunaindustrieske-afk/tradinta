
'use client';

import * as React from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Coins,
  Search,
  FileWarning,
  Loader2,
  Calendar as CalendarIcon,
  Gift,
  PlusCircle,
  Ticket,
} from 'lucide-react';
import { DateRange, DayPicker } from 'react-day-picker';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { useFirestore, useAuth, useCollection, useMemoFirebase } from '@/firebase';
import { getDocs, collection, query, where, limit, orderBy } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { awardPoints } from '@/app/(auth)/actions';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { generateClaimCodes, voidClaimCode } from './actions';
import { useFormState, useFormStatus } from 'react-dom';
import { Skeleton } from '@/components/ui/skeleton';

type ClaimCode = {
  id: string;
  code: string;
  points: number;
  status: 'active' | 'claimed' | 'voided';
  expiresAt?: any;
  createdAt: any;
};

// Mock data based on the user's design
const mockSearchResults = [
  { userId: 'user-abc', fullName: 'John Doe', totalPoints: 150, kycStatus: 'Verified' },
  { userId: 'user-def', fullName: 'Jane Smith', totalPoints: 150, kycStatus: 'Pending' },
  { userId: 'user-ghi', fullName: 'Kimani Ltd', totalPoints: 150, kycStatus: 'Verified' },
];

function GenerateCodesForm() {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = React.useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
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
             // Consider triggering a refetch of the table data here
        } else {
            throw new Error(result.message);
        }
    } catch (error: any) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
        setIsGenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generate New Claim Codes</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="count">Number of Codes</Label>
              <Input id="count" name="count" type="number" placeholder="e.g. 50" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="points">Points per Code</Label>
              <Input id="points" name="points" type="number" placeholder="e.g. 100" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="expiresAt">Expires On (Optional)</Label>
              <Input id="expiresAt" name="expiresAt" type="date" />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isGenerating}>
            {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2" />}
            {isGenerating ? 'Generating...' : 'Generate Codes'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}


function ClaimCodesTable() {
    const firestore = useFirestore();
    const { toast } = useToast();

    const codesQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'claimCodes'), orderBy('createdAt', 'desc'));
    }, [firestore]);

    const { data: codes, isLoading, forceRefetch } = useCollection<ClaimCode>(codesQuery);

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
    }

    const getStatusVariant = (status: ClaimCode['status']) => {
        switch (status) {
            case 'active': return 'secondary';
            case 'claimed': return 'default';
            case 'voided': return 'destructive';
            default: return 'outline';
        }
    };
    
    if (isLoading) {
        return <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
        </div>
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Existing Claim Codes</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Code</TableHead>
                            <TableHead>Points</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Expires On</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {codes && codes.length > 0 ? codes.map(code => (
                            <TableRow key={code.id}>
                                <TableCell className="font-mono">{code.code}</TableCell>
                                <TableCell>{code.points}</TableCell>
                                <TableCell><Badge variant={getStatusVariant(code.status)}>{code.status}</Badge></TableCell>
                                <TableCell>{code.expiresAt ? new Date(code.expiresAt.seconds * 1000).toLocaleDateString() : 'N/A'}</TableCell>
                                <TableCell>
                                    {code.status === 'active' && (
                                        <Button variant="destructive" size="sm" onClick={() => handleVoidCode(code.id)}>Void</Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        )) : (
                            <TableRow><TableCell colSpan={5} className="text-center h-24">No claim codes generated yet.</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}



export default function TradCoinAdminDashboard() {
  const [date, setDate] = React.useState<DateRange | undefined>();
  const [reasonCode, setReasonCode] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [searchResults, setSearchResults] = React.useState<typeof mockSearchResults>([]);
  const [selectedUsers, setSelectedUsers] = React.useState<Set<string>>(new Set());

  // State for awarding points
  const firestore = useFirestore();
  const auth = useAuth();
  const { toast } = useToast();
  const [awardUserId, setAwardUserId] = React.useState('');
  const [awardPointsValue, setAwardPointsValue] = React.useState('');
  const [awardReason, setAwardReason] = React.useState('');
  const [awardNote, setAwardNote] = React.useState('');
  const [isAwarding, setIsAwarding] = React.useState(false);

  const handleSearch = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setSearchResults(mockSearchResults);
      setIsLoading(false);
    }, 1000);
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


  const handleSelectUser = (userId: string, isSelected: boolean) => {
    setSelectedUsers(prev => {
        const newSet = new Set(prev);
        if (isSelected) {
            newSet.add(userId);
        } else {
            newSet.delete(userId);
        }
        return newSet;
    });
  };
  
  const handleSelectAll = (isSelected: boolean) => {
    if (isSelected) {
        setSelectedUsers(new Set(searchResults.map(r => r.userId)));
    } else {
        setSelectedUsers(new Set());
    }
  }

  const totalPointsToRevoke = searchResults
    .filter(r => selectedUsers.has(r.userId))
    .reduce((sum, r) => sum + r.totalPoints, 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="w-6 h-6 text-primary" />
            TradCoin Admin Console
          </CardTitle>
          <CardDescription>
            Tools for auditing the points ledger and managing points transactions.
          </CardDescription>
        </CardHeader>
      </Card>
      
        <Tabs defaultValue="manual-award">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="manual-award">Manual Point Adjustments</TabsTrigger>
                <TabsTrigger value="claim-codes">Claim Codes</TabsTrigger>
            </TabsList>
            <TabsContent value="manual-award" className="mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Award Points Manually</CardTitle>
                        <CardDescription>
                            Grant points for promotions, competitions, or manual corrections.
                        </CardDescription>
                    </CardHeader>
                    <form onSubmit={handleAwardPoints}>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="award-user-id">User's Tradinta ID</Label>
                                <Input id="award-user-id" placeholder="e.g. a8B2c3D4" value={awardUserId} onChange={e => setAwardUserId(e.target.value)} required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="award-points">Points to Award</Label>
                                    <Input id="award-points" type="number" placeholder="e.g. 500" value={awardPointsValue} onChange={e => setAwardPointsValue(e.target.value)} required />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="award-reason">Reason</Label>
                                    <Select onValueChange={setAwardReason} value={awardReason} required>
                                        <SelectTrigger id="award-reason"><SelectValue placeholder="Select reason" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="PROMOTIONAL_GIFT">Promotional Gift</SelectItem>
                                            <SelectItem value="MANUAL_CORRECTION">Manual Correction</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="award-note">Admin Note (Optional)</Label>
                                <Input id="award-note" placeholder="e.g., Winner of Q4 Campaign" value={awardNote} onChange={e => setAwardNote(e.target.value)} />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full" type="submit" disabled={isAwarding}>
                                {isAwarding ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <PlusCircle className="mr-2 h-4 w-4" />}
                                Award Points
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </TabsContent>
            <TabsContent value="claim-codes" className="mt-6 space-y-6">
                <GenerateCodesForm />
                <ClaimCodesTable />
            </TabsContent>
      </Tabs>
    </div>
  );
}
