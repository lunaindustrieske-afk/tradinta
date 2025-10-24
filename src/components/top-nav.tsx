
"use client";

import Link from 'next/link';
import { ChevronDown, Search, UserPlus } from 'lucide-react';
import { Logo } from './logo';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal
} from './ui/dropdown-menu';
import { Input } from './ui/input';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { ScrollArea } from './ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

function UserMenu() {
    const { user, isUserLoading } = useUser();
    const auth = useAuth();
    const router = useRouter();

    const handleLogout = async () => {
      await signOut(auth);
      router.push('/');
    };

    if (isUserLoading) {
      return null; // Or a loading spinner
    }

    if (user) {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                <Avatar>
                  <AvatarImage src={user.photoURL || "https://picsum.photos/seed/user-avatar/32/32"} />
                  <AvatarFallback>{user.email?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                </Avatar>
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
               <DropdownMenuItem asChild><Link href="/dashboards/seller-centre">My Tradinta</Link></DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Support</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
    }

    return (
      <TooltipProvider>
        <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
                <Link href="/login">Log in</Link>
            </Button>
            <Tooltip>
              <TooltipTrigger asChild>
                 <Button asChild variant="outline" size="icon">
                    <Link href="/signup">
                      <UserPlus />
                      <span className="sr-only">Sign Up</span>
                    </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Create an account</p>
              </TooltipContent>
            </Tooltip>
        </div>
      </TooltipProvider>
    )
  }

export function TopNav() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-auto flex items-center gap-4">
            <Logo />
             <nav className="hidden items-center gap-4 text-sm md:flex">
                <Link href="/products" className='font-medium text-muted-foreground transition-colors hover:text-primary'>
                    Products
                </Link>
                <Link href="/blog" className='font-medium text-muted-foreground transition-colors hover:text-primary'>
                    Insights
                </Link>
                 <Link href="/marketing-plans" className='font-medium text-muted-foreground transition-colors hover:text-primary'>
                    Marketing
                </Link>
                <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center gap-1 font-medium text-muted-foreground transition-colors hover:text-primary">
                        Dashboards <ChevronDown className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem asChild><Link href="/dashboards/seller-centre">Seller Centre</Link></DropdownMenuItem>
                        <DropdownMenuItem asChild><Link href="/dashboards/buyer">Buyer Dashboard</Link></DropdownMenuItem>
                        <DropdownMenuItem asChild><Link href="/dashboards/distributor">Distributor Dashboard</Link></DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger>Admin Roles</DropdownMenuSubTrigger>
                          <DropdownMenuPortal>
                            <DropdownMenuSubContent>
                               <DropdownMenuItem asChild><Link href="/dashboards/admin">Admin</Link></DropdownMenuItem>
                               <DropdownMenuItem asChild><Link href="/dashboards/operations-manager">Operations Manager</Link></DropdownMenuItem>
                                <DropdownMenuItem asChild><Link href="/dashboards/marketing-manager">Marketing Manager</Link></DropdownMenuItem>
                                <DropdownMenuItem asChild><Link href="/dashboards/support">Support</Link></DropdownMenuItem>
                                <DropdownMenuItem asChild><Link href="/dashboards/finance">Finance</Link></DropdownMenuItem>
                                <DropdownMenuItem asChild><Link href="/dashboards/legal-compliance">Legal & Compliance</Link></DropdownMenuItem>
                                <DropdownMenuItem asChild><Link href="/dashboards/content-management">Content Management</Link></DropdownMenuItem>
                            </DropdownMenuSubContent>
                          </DropdownMenuPortal>
                        </DropdownMenuSub>
                         <DropdownMenuSub>
                          <DropdownMenuSubTrigger>TradPay Roles</DropdownMenuSubTrigger>
                          <DropdownMenuPortal>
                            <DropdownMenuSubContent>
                               <DropdownMenuItem asChild><Link href="/dashboards/tradpay-admin">TradPay Admin</Link></DropdownMenuItem>
                                <DropdownMenuItem asChild><Link href="/dashboards/tradcoin-airdrop">TradCoin Airdrop</Link></DropdownMenuItem>
                            </DropdownMenuSubContent>
                          </DropdownMenuPortal>
                        </DropdownMenuSub>
                        <DropdownMenuSeparator />
                         <DropdownMenuItem asChild><Link href="/dashboards/logistics">Logistics Dashboard</Link></DropdownMenuItem>
                        <DropdownMenuItem asChild><Link href="/dashboards/analytics">Analytics Dashboard</Link></DropdownMenuItem>
                        <DropdownMenuItem asChild><Link href="/dashboards/growth-partner">Growth Partner</Link></DropdownMenuItem>
                        <DropdownMenuItem asChild><Link href="/dashboards/super-admin">Super Admin</Link></DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
              </nav>
        </div>
        
        <div className="flex items-center justify-end space-x-2">
            <UserMenu />
        </div>
      </div>
    </header>
  );
}
