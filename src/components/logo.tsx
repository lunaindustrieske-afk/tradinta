import { Building } from 'lucide-react';
import { cn } from '@/lib/utils';

type LogoProps = {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2 font-headline text-xl font-bold text-primary", className)}>
      <Building className="h-6 w-6" />
      <span>Tradigital</span>
    </div>
  );
}
