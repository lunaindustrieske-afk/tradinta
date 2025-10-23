'use client';

import Link from 'next/link';
import { ChevronDown, Search } from 'lucide-react';
import { Logo } from './logo';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Input } from './ui/input';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { ScrollArea } from './ui/scroll-area';

function UserMenu() {
    // This is a placeholder for a real authentication check
    const isLoggedIn = false;

    if (isLoggedIn) {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                <Avatar>
                  <AvatarImage src="https://picsum.photos/seed/user/32/32" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
               <DropdownMenuItem asChild><Link href="/dashboards">My Tradinta</Link></DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Support</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
    }

    return (
        <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
                <Link href="/login">Log in</Link>
            </Button>
            <Button asChild>
                <Link href="/signup">Sign Up</Link>
            </Button>
        </div>
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
                 <Link href="/marketing-plans" className='font-medium text-muted-foreground transition-colors hover:text-primary'>
                    Marketing
                </Link>
                <Link href="/about" className='font-medium text-muted-foreground transition-colors hover:text-primary'>
                    About
                </Link>
              </nav>
        </div>
        
        <div className="flex items-center justify-end space-x-2">
            <UserMenu />
        </div>
      </div>
    </header>
  );
}
