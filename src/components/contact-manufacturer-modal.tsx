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
import { Send, Loader2, Info, Paperclip, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/firebase';
import { sendNewInquiryEmail } from '@/app/(auth)/actions';
import { Alert, AlertDescription } from './ui/alert';
import { PhotoUpload } from './ui/photo-upload';
import Image from 'next/image';

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
  const [imageUrl, setImageUrl] = React.useState<string | null>(null);
  const [isSending, setIsSending] = React.useState(false);
  const [sentMessage, setSentMessage] = React.useState<{ text: string, imageUrl?: string | null } | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);


  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if ((!message.trim() && !imageUrl) || !user) {
      toast({
        title: 'Error',
        description: 'You must be logged in and type a message or upload an image.',
        variant: 'destructive',
      });
      return;
    }
    setIsSending(true);

    try {
      if (manufacturer.email) {
        const result = await sendNewInquiryEmail({
            buyerName: user.displayName || 'A Tradinta Buyer',
            buyerEmail: user.email || '',
            manufacturerEmail: manufacturer.email,
            manufacturerName: manufacturer.shopName || manufacturer.name,
            productName: product.name,
            productImageUrl: imageUrl || product.imageUrl,
            message: message,
        });

        if (!result.success) {
            console.error("Failed to send inquiry email:", result.message);
        }
      } else {
        console.warn(`Manufacturer ${manufacturer.id} has no email. Message sent to dashboard only.`);
      }

      setSentMessage({ text: message, imageUrl });
      setMessage('');
      setImageUrl(null);
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

  React.useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setSentMessage(null);
        setMessage('');
        setImageUrl(null);
      }, 300);
    }
  }, [open]);
  
  const handleImageUpload = (url: string) => {
    setImageUrl(url);
  };


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
                <div className="bg-primary text-primary-foreground p-2 rounded-lg max-w-sm">
                    {sentMessage.imageUrl && (
                        <Image src={sentMessage.imageUrl} alt="Uploaded image" width={200} height={200} className="rounded-md mb-2" />
                    )}
                    {sentMessage.text && <p className="text-sm">{sentMessage.text}</p>}
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
          {imageUrl && !sentMessage && (
            <div className="relative w-24 h-24 mb-2 p-2 border rounded-md">
                <Image src={imageUrl} alt="preview" fill className="object-cover rounded-sm" />
                <Button variant="ghost" size="icon" className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground" onClick={() => setImageUrl(null)}>
                    <span className="sr-only">Remove Image</span>
                    &times;
                </Button>
            </div>
          )}
          <div className="grid gap-2">
            <Textarea
              id="message"
              placeholder="Type your message here..."
              className="min-h-24"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={!!sentMessage}
            />
            <div className="flex justify-between items-center">
                <div className="flex gap-2">
                    <PhotoUpload
                        label=""
                        onUpload={handleImageUpload}
                        onLoadingChange={setIsUploading}
                        disabled={isSending || !!sentMessage || isUploading}
                    >
                        <Button type="button" variant="ghost" size="icon" disabled={isSending || !!sentMessage || isUploading}>
                           {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Paperclip className="h-4 w-4" />}
                        </Button>
                    </PhotoUpload>
                </div>
                <Button type="submit" disabled={isSending || !!sentMessage || isUploading}>
                {isSending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Send className="mr-2 h-4 w-4" />
                )}
                Send Initial Message
                </Button>
            </div>
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
