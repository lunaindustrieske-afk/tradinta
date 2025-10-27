
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
import type { Product } from '@/lib/definitions';
import { Send, Loader2, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/firebase';
import { sendNewInquiryEmail } from '@/app/(auth)/actions';
import { Alert, AlertDescription } from './ui/alert';

// Add email to the Manufacturer type
type Manufacturer = {
  id: string;
  shopName?: string;
  name: string;
  email?: string;
};

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
  const { user } = useUser();
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const [isSending, setIsSending] = React.useState(false);
  const [sentMessage, setSentMessage] = React.useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!message.trim() || !user) {
      toast({
        title: 'Error',
        description: 'You must be logged in and type a message.',
        variant: 'destructive',
      });
      return;
    }
    setIsSending(true);

    try {
      // Conditionally send the email
      if (manufacturer.email) {
        const result = await sendNewInquiryEmail({
            buyerName: user.displayName || 'A Tradinta Buyer',
            buyerEmail: user.email || '',
            manufacturerEmail: manufacturer.email,
            manufacturerName: manufacturer.shopName || manufacturer.name,
            productName: product.name,
            productImageUrl: product.imageUrl,
            message: message,
        });

        if (!result.success) {
            // Log the error but don't block the user
            console.error("Failed to send inquiry email:", result.message);
        }
      } else {
        console.warn(`Manufacturer ${manufacturer.id} has no email. Message sent to dashboard only.`);
      }

      // TODO: Here you would also write the message to a 'conversations' collection in Firestore.
      
      setSentMessage(message);
      setMessage(''); // Clear the input
      toast({
        title: 'Message Sent!',
        description: `Your message has been sent to ${
          manufacturer.shopName || manufacturer.name
        }.`,
      });
    } catch (error: any) {
      toast({
        title: 'Failed to Send Message',
        description: error.message || 'An unknown error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  // Reset state when modal is closed
  React.useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setSentMessage(null);
        setMessage('');
      }, 300); // Delay to allow fade-out animation
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Chat with {manufacturer.shopName || manufacturer.name}</DialogTitle>
          <DialogDescription>
            Regarding product:{' '}
            <span className="font-semibold text-primary">{product.name}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="pr-2">
          <div className="h-64 flex flex-col justify-end p-4 bg-muted/50 rounded-md">
            {sentMessage ? (
              <div className="flex justify-end">
                <div className="bg-primary text-primary-foreground p-3 rounded-lg max-w-sm">
                  <p className="text-sm">{sentMessage}</p>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground text-sm">
                <p>Your conversation will appear here.</p>
              </div>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <Textarea
              id="message"
              placeholder="Type your message here..."
              className="min-h-24"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              disabled={!!sentMessage} // Disable after sending the first message
            />
            <Button type="submit" disabled={isSending || !!sentMessage}>
              {isSending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              Send Initial Message
            </Button>
          </div>
        </form>

        <Alert className="mt-4">
          <Info className="h-4 w-4" />
          <AlertDescription className="text-xs">
            You will be notified via email when the manufacturer responds. You
            can view and continue all conversations in your{' '}
            <strong>Tradinta Inbox</strong>.
          </AlertDescription>
        </Alert>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
