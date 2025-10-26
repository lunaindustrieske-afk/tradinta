
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { ShieldAlert } from 'lucide-react';
import { useUser } from '@/firebase';
import { Badge } from './badge';

export function PermissionDenied() {
  const { role } = useUser();

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] bg-background text-center p-4">
      <Logo className="w-48 mb-8" />
      <ShieldAlert className="w-16 h-16 text-destructive mb-4" />
      <h1 className="text-2xl md:text-3xl font-bold font-headline mb-4">Access Denied</h1>
      <p className="text-muted-foreground max-w-md mb-6">
        Your current role does not have the necessary permissions to view this page. If you believe this is an error, please contact your administrator.
      </p>

       {role && (
        <div className="mb-8">
            <p className="text-sm text-muted-foreground">Your current role:</p>
            <Badge variant="outline" className="text-lg mt-1">{role}</Badge>
        </div>
      )}

      <div className="flex gap-4">
        <Button asChild>
          <Link href="/dashboards/buyer">Go to My Dashboard</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">Back to Homepage</Link>
        </Button>
      </div>
    </div>
  );
}
