
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
} from 'lucide-react';
import { DateRange } from 'react-day-picker';
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
import { useFirestore, useAuth } from '@/firebase';
import { getDocs, collection, query, where, limit } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { awardPoints } from '@/app/(auth)/actions';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Mock data based on the user's design
const mockSearchResults = [
  { userId: 'user-abc', fullName: 'John Doe', totalPoints: 150, kycStatus: 'Verified' },
  { userId: 'user-def', fullName: 'Jane Smith', totalPoints: 150, kycStatus: 'Pending' },
  { userId: 'user-ghi', fullName: 'Kimani Ltd', totalPoints: 150, kycStatus: 'Verified' },
];

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
      
      <div className="grid md:grid-cols-2 gap-6 items-start">
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

        {/* Search Panel */}
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Search & Revoke Points</CardTitle>
                    <CardDescription>
                        Find points awarded by date and reason code to perform bulk reversals.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="grid gap-2">
                        <Label htmlFor="date-range">Date Range</Label>
                         <Popover>
                            <PopoverTrigger asChild>
                            <Button
                                id="date-range"
                                variant={"outline"}
                                className={cn(
                                "w-full justify-start text-left font-normal",
                                !date && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date?.from ? (
                                date.to ? (
                                    <>
                                    {format(date.from, "LLL dd, y")} -{" "}
                                    {format(date.to, "LLL dd, y")}
                                    </>
                                ) : (
                                    format(date.from, "LLL dd, y")
                                )
                                ) : (
                                <span>Pick a date range</span>
                                )}
                            </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                initialFocus
                                mode="range"
                                defaultMonth={date?.from}
                                selected={date}
                                onSelect={setDate}
                                numberOfMonths={2}
                            />
                            </PopoverContent>
                        </Popover>
                    </div>
                     <div className="grid gap-2">
                        <Label htmlFor="reason-code">Reason Code</Label>
                        <Input 
                            id="reason-code" 
                            placeholder="e.g., PROMO-2025-10-24" 
                            value={reasonCode}
                            onChange={(e) => setReasonCode(e.target.value)}
                        />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button className="w-full" onClick={handleSearch} disabled={isLoading}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                        Search for Events
                    </Button>
                </CardFooter>
            </Card>
        </div>
      </div>
    </div>
  );
}
