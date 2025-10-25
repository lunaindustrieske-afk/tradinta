
'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { sendPasswordResetEmail } from 'firebase/auth';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ChevronLeft,
  User,
  Mail,
  Shield,
  AlertTriangle,
  Key,
  Trash2,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { sendTransactionalEmail } from '@/lib/email';


type UserProfile = {
  id: string;
  fullName: string;
  email: string;
  role: string;
  tradintaId: string;
  registrationDate?: any;
  status?: 'active' | 'suspended';
};

const DetailItem = ({ label, value }: { label: string; value?: string | null }) => (
  <div>
    <p className="text-sm text-muted-foreground">{label}</p>
    <p className="font-semibold">{value || 'N/A'}</p>
  </div>
);

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;
  const firestore = useFirestore();
  const auth = useAuth();
  const { toast } = useToast();

  const [isProcessing, setIsProcessing] = React.useState(false);
  const [selectedRole, setSelectedRole] = React.useState('');

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !userId) return null;
    return doc(firestore, 'users', userId);
  }, [firestore, userId]);

  const { data: user, isLoading } = useDoc<UserProfile>(userDocRef);

  React.useEffect(() => {
    if (user?.role) {
      setSelectedRole(user.role);
    }
  }, [user]);

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    setIsProcessing(true);
    try {
      await sendPasswordResetEmail(auth, user.email);
      await sendTransactionalEmail({
        to: user.email,
        subject: 'Your Password Has Been Reset',
        htmlContent: `
          <p>Hi ${user.fullName},</p>
          <p>A password reset was initiated for your Tradinta account by an administrator. Please check your inbox for a link to create a new password.</p>
          <p>If you did not request this, please contact support immediately.</p>
        `,
      });
      toast({
        title: 'Password Reset Email Sent',
        description: `An email has been sent to ${user.email}.`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleSuspend = async () => {
    if (!userDocRef || !user) return;
    setIsProcessing(true);
    const newStatus = user.status === 'suspended' ? 'active' : 'suspended';
    try {
      await updateDoc(userDocRef, { status: newStatus });
      toast({
        title: `User ${newStatus === 'suspended' ? 'Suspended' : 'Unsuspended'}`,
        description: `${user.fullName}'s account is now ${newStatus}.`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userDocRef) return;
    setIsProcessing(true);
    try {
      await deleteDoc(userDocRef);
      toast({
        title: 'User Deleted',
        description: 'The user account has been permanently deleted.',
        variant: 'destructive',
      });
      router.push('/dashboards/user-management');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: `Failed to delete user: ${error.message}`,
        variant: 'destructive',
      });
      setIsProcessing(false);
    }
  };

  const handleRoleChange = async () => {
    if (!userDocRef || !selectedRole || !user?.email) return;
    setIsProcessing(true);
    try {
      await updateDoc(userDocRef, { role: selectedRole });
       await sendTransactionalEmail({
        to: user.email,
        subject: 'Your Role on Tradinta Has Been Updated',
        htmlContent: `
          <p>Hi ${user.fullName},</p>
          <p>An administrator has updated your role on the Tradinta platform. Your new role is: <strong>${selectedRole}</strong>.</p>
          <p>Please log in to see your updated dashboard and permissions.</p>
        `,
      });
      toast({
        title: 'Role Updated',
        description: `User role has been changed to ${selectedRole} and an email notification has been sent.`,
      });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsProcessing(false);
    }
  };


  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-2/3" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center">
        <h1 className="text-xl font-bold">User not found</h1>
        <p className="text-muted-foreground">
          The user you are looking for does not exist.
        </p>
        <Button variant="link" asChild>
          <Link href="/dashboards/user-management">Return to list</Link>
        </Button>
      </div>
    );
  }
  
  const userStatus = user.status || 'active';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" className="h-7 w-7" asChild>
          <Link href="/dashboards/user-management">
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
          User Profile
        </h1>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle className="text-2xl">{user.fullName}</CardTitle>
                <CardDescription>{user.email}</CardDescription>
              </div>
              <Badge variant="outline" className="capitalize">
                {user.role}
              </Badge>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4">
              <DetailItem label="Tradinta ID" value={user.tradintaId} />
              <DetailItem
                label="Registration Date"
                value={
                  user.registrationDate
                    ? new Date(
                        user.registrationDate.seconds * 1000
                      ).toLocaleDateString()
                    : 'N/A'
                }
              />
              <DetailItem label="Last Login" value="2 days ago (mock)" />
              <DetailItem label="Account Status" value={userStatus} />
            </CardContent>
          </Card>
           <Card>
            <CardHeader>
              <CardTitle>Change Role</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 max-w-sm">
                <Label htmlFor="role">User Role</Label>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="buyer">Buyer</SelectItem>
                    <SelectItem value="manufacturer">Manufacturer</SelectItem>
                    <SelectItem value="partner">Growth Partner</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="super-admin">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleRoleChange} disabled={isProcessing || user.role === selectedRole}>
                 {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Role
              </Button>
            </CardFooter>
          </Card>
        </div>
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Administrative Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handlePasswordReset}
                disabled={isProcessing}
              >
                {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Key className="mr-2 h-4 w-4" />}
                Send Password Reset
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full justify-start">
                        <AlertTriangle className="mr-2 h-4 w-4" />
                        {userStatus === 'suspended' ? 'Unsuspend User' : 'Suspend User'}
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will {userStatus === 'suspended' ? 'reactivate' : 'temporarily block'} the user's access to the platform.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleToggleSuspend} disabled={isProcessing}>
                       {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Continue
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

            </CardContent>
            <CardFooter className="flex-col items-start pt-4 border-t">
              <p className="text-sm font-semibold text-destructive mb-2">Danger Zone</p>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="link" className="text-destructive p-0 h-auto" disabled={isProcessing}>
                        <Trash2 className="mr-2 h-4 w-4" /> Delete User Permanently
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete User Permanently?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the user's profile, but will not delete associated data like orders or products to maintain historical integrity.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDeleteUser} disabled={isProcessing} className="bg-destructive hover:bg-destructive/90">
                                {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Yes, delete this user
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
              </AlertDialog>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
