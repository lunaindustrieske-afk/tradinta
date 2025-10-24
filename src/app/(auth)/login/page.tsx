"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Logo } from "@/components/logo";
import Image from "next/image";
import { useState } from "react";
import { useAuth } from "@/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2a10 10 0 0 0-3.91 19.85" />
        <path d="M22 12a10 10 0 0 0-19.85-3.91" />
        <path d="M12 22a10 10 0 0 0 19.85-3.91" />
        <path d="M2 12a10 10 0 0 0 3.91 9.85" />
      </svg>
    );
  }
  
  function AppleIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z" />
        <path d="M10 2c1 .5 2 2 2 5" />
      </svg>
    );
  }

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: "Login Successful",
        description: "Welcome back!",
      });
      router.push('/dashboards/seller-centre');
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-full min-h-screen lg:grid lg:grid-cols-2">
      <div className="relative hidden bg-gradient-to-br from-blue-700 to-orange-500 lg:block">
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="relative z-10 flex flex-col justify-between h-full p-8">
            <Logo className="w-40" />
            <div className="text-white">
                <h1 className="text-4xl font-bold font-headline">Powering Africa’s Manufacturers.</h1>
                <p className="mt-2 text-lg text-blue-100">Your gateway to a continental market.</p>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1/2">
             <Image
                src="https://picsum.photos/seed/login-bg/1200/800"
                alt="Abstract digital warehouse"
                fill
                className="object-cover opacity-20"
                data-ai-hint="digital warehouse"
                />
            </div>
        </div>
      </div>
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-md space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-50 font-headline">
              Welcome Back to Trade.
            </h2>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <div className="space-y-4 rounded-md shadow-sm">
              <div>
                <Label htmlFor="email-phone">Email or Phone number</Label>
                <Input
                  id="email-phone"
                  name="email-phone"
                  type="email"
                  autoComplete="email"
                  required
                  className="mt-1"
                  placeholder="john.doe@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="mt-1"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Checkbox id="remember-me" name="remember-me" />
                <Label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                  Remember me
                </Label>
              </div>

              <div className="text-sm">
                <Link href="#" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-500 dark:hover:text-blue-400">
                  Forgot Password?
                </Link>
              </div>
            </div>

            <div>
              <Button type="submit" className="w-full">
                Login
              </Button>
            </div>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white dark:bg-gray-900 px-2 text-gray-500 dark:text-gray-400">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline">
              <GoogleIcon className="mr-2 h-4 w-4" />
              Google
            </Button>
            <Button variant="outline">
              <AppleIcon className="mr-2 h-4 w-4" />
              Apple
            </Button>
          </div>

          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            New to Tradinta?{' '}
            <Link href="/signup" className="font-medium text-orange-600 hover:text-orange-500 dark:text-orange-500 dark:hover:text-orange-400">
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
