
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/firebase';
import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/logo';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, KeyRound, Loader2, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

function ResetPasswordComponent() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const auth = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const oobCode = searchParams.get('oobCode');

  useEffect(() => {
    if (!oobCode) {
      setError('Invalid or missing password reset code. Please request a new link.');
      setIsVerifying(false);
      return;
    }

    const verifyCode = async () => {
      try {
        await verifyPasswordResetCode(auth, oobCode);
        setIsVerifying(false);
      } catch (err: any) {
        setError('The password reset link is invalid or has expired. Please request a new one.');
        setIsVerifying(false);
      }
    };

    verifyCode();
  }, [auth, oobCode]);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({ title: "Passwords don't match", variant: 'destructive' });
      return;
    }
    if (!oobCode) {
        toast({ title: "Missing reset code", variant: 'destructive' });
        return;
    }

    setIsLoading(true);
    try {
      await confirmPasswordReset(auth, oobCode, password);
      toast({
        title: 'Success!',
        description: 'Your password has been reset. You can now log in.',
      });
      router.push('/login');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isVerifying) {
    return (
        <div className="text-center">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
            <h2 className="mt-4 text-lg font-semibold">Verifying reset link...</h2>
        </div>
    );
  }

  if (error) {
     return (
        <div className="text-center">
            <ShieldAlert className="mx-auto h-12 w-12 text-destructive" />
            <h2 className="mt-4 text-lg font-semibold">Link Invalid</h2>
            <p className="mt-2 text-muted-foreground">{error}</p>
            <Button asChild className="mt-6">
                <Link href="/forgot-password">Request a New Link</Link>
            </Button>
        </div>
    );
  }

  return (
    <>
        <div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-50 font-headline">
                Create a New Password
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
                Your new password must be different from previous passwords.
            </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handlePasswordReset}>
            <div className="relative">
                <Label htmlFor="password">New Password</Label>
                <KeyRound className="absolute left-3 top-[2.4rem] h-5 w-5 text-muted-foreground" />
                <Input id="password" name="password" type={showPassword ? "text" : "password"} required className="mt-1 pl-10 pr-10" value={password} onChange={(e) => setPassword(e.target.value)} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-[2.4rem] text-muted-foreground">
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
            </div>
            <div className="relative">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <KeyRound className="absolute left-3 top-[2.4rem] h-5 w-5 text-muted-foreground" />
                <Input id="confirm-password" name="confirm-password" type={showConfirmPassword ? "text" : "password"} required className="mt-1 pl-10 pr-10" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-[2.4rem] text-muted-foreground">
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
            </div>
             <div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Reset Password'}
                </Button>
            </div>
        </form>
    </>
  )
}


export default function ResetPasswordPage() {
    return (
         <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-md space-y-8">
                <Logo className="w-40 mb-6 mx-auto" />
                <Suspense fallback={<Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />}>
                    <ResetPasswordComponent />
                </Suspense>
            </div>
        </div>
    );
}

