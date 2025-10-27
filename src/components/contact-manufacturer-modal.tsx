
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { Product, Manufacturer } from '@/lib/definitions';
import { Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Logo } from './logo';

interface ContactManufacturerModalProps {
  product: Product;
  manufacturer: Manufacturer;
  children: React.ReactNode;
}

export function ContactManufacturerModal({
  product,
  manufacturer,
  children,
}: ContactManufacturerModalProps) {
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Here you would typically handle form submission, e.g., send data to a server.
    
    toast({
        title: "Message Sent!",
        description: `Your message regarding ${product.name} has been sent to ${manufacturer.shopName}.`,
    });

    // Close the modal after submission
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Contact {manufacturer.shopName}</DialogTitle>
          <DialogDescription>
            Your message regarding <span className="font-semibold text-primary">{product.name}</span>.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
             <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="message">
                Your Message
              </Label>
              <Textarea
                id="message"
                placeholder="Type your message here. Ask about stock, delivery, or other details."
                className="min-h-32"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">
                <Send className="mr-2 h-4 w-4" /> Send Message
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
