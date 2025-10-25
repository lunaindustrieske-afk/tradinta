
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/logo';
import { useToast } from '@/hooks/use-toast';
import { Mail, Loader2, ArrowLeft } from 'lucide-react';
import Image from 'next/image';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const auth = useAuth();
  const { toast } = useToast();

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // You must configure the Action URL in your Firebase Console
      // to point to your custom domain where /reset-password lives.
      await sendPasswordResetEmail(auth, email);
      setIsEmailSent(true);
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

  return (
    <div className="w-full min-h-screen lg:grid lg:grid-cols-2">
       <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-md space-y-8">
            <Logo className="w-40 mb-6" />
            
            {isEmailSent ? (
                <div className="text-center">
                    <Mail className="mx-auto h-12 w-12 text-green-500" />
                    <h2 className="mt-6 text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
                        Check your email
                    </h2>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                        We've sent a password reset link to <span className="font-semibold text-primary">{email}</span>. Please check your inbox and spam folder.
                    </p>
                     <Button asChild className="mt-6">
                        <Link href="/login">
                           <ArrowLeft className="mr-2 h-4 w-4" /> Back to Login
                        </Link>
                    </Button>
                </div>
            ) : (
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-50 font-headline">
                        Forgot Your Password?
                    </h2>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                        No worries. Enter your email address and we'll send you a link to reset it.
                    </p>
                    <form className="mt-8 space-y-6" onSubmit={handleResetRequest}>
                        <div className="relative">
                            <Label htmlFor="email">Email</Label>
                            <Mail className="absolute left-3 top-[2.4rem] h-5 w-5 text-muted-foreground" />
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="mt-1 pl-10"
                                placeholder="you@company.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Send Reset Link'}
                            </Button>
                        </div>
                    </form>
                    <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                        Remember your password?{' '}
                        <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                           Back to Login
                        </Link>
                    </p>
                </div>
            )}
        </div>
       </div>
       <div className="relative hidden lg:block">
            <Image
                src="https://picsum.photos/seed/forgot-pw/1200/1800"
                alt="Abstract digital network"
                fill
                className="object-cover"
                data-ai-hint="digital network"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-blue-900/50 to-orange-500/20"></div>
        </div>
    </div>
  );
}
