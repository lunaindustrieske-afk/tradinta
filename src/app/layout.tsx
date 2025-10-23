import type { Metadata } from 'next';
import { Toaster } from "@/components/ui/toaster"
import './globals.css';
import { TopNav } from '@/components/top-nav';
import { Logo } from '@/components/logo';
import Link from 'next/link';


export const metadata: Metadata = {
  title: 'Tradinta',
  description: 'Powering Africa’s Manufacturers Through Digital Trade',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=Inter:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <TopNav />
          <main>{children}</main>
        <Toaster />
        <footer className="border-t pt-8">
        <div className="container mx-auto grid md:grid-cols-4 gap-8">
            <div>
                <Logo />
                <p className="text-muted-foreground mt-2 text-sm">© {new Date().getFullYear()} Tradinta. All rights reserved.</p>
            </div>
            <div>
                <h4 className="font-semibold mb-2">Links</h4>
                <ul className="space-y-1 text-sm">
                    <li><Link href="#" className="text-muted-foreground hover:text-primary">About</Link></li>
                    <li><Link href="#" className="text-muted-foreground hover:text-primary">Contact</Link></li>
                    <li><Link href="#" className="text-muted-foreground hover:text-primary">Privacy Policy</Link></li>
                    <li><Link href="#" className="text-muted-foreground hover:text-primary">Terms of Service</Link></li>
                    <li><Link href="#" className="text-muted-foreground hover:text-primary">Careers</Link></li>
                </ul>
            </div>
            <div>
                <h4 className="font-semibold mb-2">Follow Us</h4>
                <ul className="space-y-1 text-sm">
                    <li><Link href="#" className="text-muted-foreground hover:text-primary">LinkedIn</Link></li>
                    <li><Link href="#" className="text-muted-foreground hover:text-primary">YouTube</Link></li>
                    <li><Link href="#" className="text-muted-foreground hover:text-primary">X / Twitter</Link></li>
                    <li><Link href="#" className="text-muted-foreground hover:text-primary">Instagram</Link></li>
                </ul>
            </div>
            <div>
                <h4 className="font-semibold mb-2">Stay ahead with trade insights.</h4>
                {/* Newsletter signup form can be added here */}
            </div>
        </div>
        <div className="container mx-auto mt-8 text-center text-sm text-muted-foreground">
            <p>Payment partners: M-Pesa, Visa, Mastercard</p>
        </div>
      </footer>
      </body>
    </html>
  );
}
