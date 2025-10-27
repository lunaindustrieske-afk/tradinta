
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

  const handleSearch = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setSearchResults(mockSearchResults);
      setIsLoading(false);
    }, 1000);
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
            Tools for auditing the points ledger and revoking points.
          </CardDescription>
        </CardHeader>
      </Card>
      
      <div className="grid md:grid-cols-3 gap-6 items-start">
        {/* Search Panel */}
        <div className="md:col-span-1 space-y-6">
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
            
             <Card>
                <CardHeader>
                    <CardTitle>Reversal Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <p className="text-sm text-muted-foreground">Users Selected</p>
                        <p className="text-2xl font-bold">{selectedUsers.size}</p>
                    </div>
                     <div>
                        <p className="text-sm text-muted-foreground">Total Points to Revoke</p>
                        <p className="text-2xl font-bold text-destructive">{totalPointsToRevoke.toLocaleString()}</p>
                    </div>
                </CardContent>
                <CardFooter>
                     <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" className="w-full" disabled={selectedUsers.size === 0}>
                                <FileWarning className="mr-2 h-4 w-4" /> Preview & Revoke Points
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Confirm Point Reversal</AlertDialogTitle>
                                <AlertDialogDescription>
                                    You are about to permanently revoke <strong className="text-destructive">{totalPointsToRevoke.toLocaleString()}</strong> points from <strong className="text-destructive">{selectedUsers.size}</strong> user(s). This action is irreversible and will be logged.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <div className="grid gap-2">
                                <Label htmlFor="admin-note">Reason for Reversal (Admin Note)</Label>
                                <Input id="admin-note" placeholder="e.g., Correcting promo error" required />
                            </div>
                             <div className="grid gap-2">
                                <Label htmlFor="2fa-code">2FA Code</Label>
                                <Input id="2fa-code" placeholder="Enter your 6-digit code" required />
                            </div>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction>Confirm & Execute Reversal</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </CardFooter>
            </Card>
        </div>

        {/* Search Results */}
        <div className="md:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle>Search Results</CardTitle>
                     <CardDescription>
                        Users who received points matching the specified criteria.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]">
                                     <Checkbox
                                        checked={searchResults.length > 0 && selectedUsers.size === searchResults.length}
                                        onCheckedChange={(checked) => handleSelectAll(!!checked)}
                                        aria-label="Select all"
                                    />
                                </TableHead>
                                <TableHead>User</TableHead>
                                <TableHead>Points Awarded</TableHead>
                                <TableHead>KYC Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                                    </TableCell>
                                </TableRow>
                            ) : searchResults.length > 0 ? (
                                searchResults.map((result) => (
                                    <TableRow key={result.userId} data-state={selectedUsers.has(result.userId) && "selected"}>
                                         <TableCell>
                                            <Checkbox
                                                checked={selectedUsers.has(result.userId)}
                                                onCheckedChange={(checked) => handleSelectUser(result.userId, !!checked)}
                                                aria-label={`Select user ${result.fullName}`}
                                            />
                                        </TableCell>
                                        <TableCell className="font-medium">{result.fullName} <span className="text-xs text-muted-foreground font-mono ml-2">{result.userId}</span></TableCell>
                                        <TableCell>{result.totalPoints}</TableCell>
                                        <TableCell><Badge variant={result.kycStatus === 'Verified' ? 'secondary' : 'outline'}>{result.kycStatus}</Badge></TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        No results found. Please start a search.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}

    