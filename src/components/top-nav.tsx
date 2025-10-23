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

const dashboardRoles = [
    { name: 'Super Admin', href: '/dashboards/super-admin' },
    { name: 'Operations Manager', href: '/dashboards/operations-manager' },
    { name: 'Marketing Manager', href: '/dashboards/marketing-manager' },
    { name: 'Seller', href: '/dashboards/seller' },
    { name: 'Buyer', href: '/dashboards/buyer' },
]

function RoleSwitcher() {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline">
                    <span>Select Dashboard</span>
                    <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Role-Based Dashboards</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {dashboardRoles.map(role => (
                    <DropdownMenuItem key={role.href} asChild>
                        <Link href={role.href}>{role.name}</Link>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

function UserMenu() {
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
          <DropdownMenuItem>Settings</DropdownMenuItem>
          <DropdownMenuItem>Support</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Logout</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

export function TopNav() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Logo />
          </Link>
        </div>
        
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
             <RoleSwitcher />
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/dashboards" className='text-sm font-medium text-muted-foreground transition-colors hover:text-primary'>
                Dashboard
            </Link>
            <UserMenu />
          </nav>
        </div>
      </div>
    </header>
  );
}
