
'use client';

import * as React from 'react';
import Link from 'next/link';
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
import { Textarea } from '@/components/ui/textarea';
import type { Product } from '@/lib/definitions';
import { Send, Loader2, Info, Paperclip, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { sendNewInquiryEmail } from '@/app/(auth)/actions';
import { Alert, AlertDescription } from './ui/alert';
import { PhotoUpload } from './ui/photo-upload';
import Image from 'next/image';
import { collection, query, where, orderBy, addDoc, serverTimestamp, getDocs, limit } from 'firebase/firestore';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { ScrollArea } from './ui/scroll-area';

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

type Message = {
    id: string;
    from: 'user' | 'contact';
    text?: string;
    imageUrl?: string;
    timestamp?: any;
};

export function ContactManufacturerModal({
  product,
  manufacturer,
  children,
}: ContactManufacturerModalProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const [imageUrl, setImageUrl] = React.useState<string | null>(null);
  const [isSending, setIsSending] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const [conversationId, setConversationId] = React.useState<string | null>(null);

  const conversationQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
        collection(firestore, 'users', user.uid, 'conversations'),
        where('productId', '==', product.id),
        where('contactId', '==', manufacturer.id),
        limit(1)
    );
  }, [firestore, user, product.id, manufacturer.id]);

  const { data: existingConversations } = useCollection(conversationQuery);
  
  React.useEffect(() => {
    if (existingConversations && existingConversations.length > 0) {
        setConversationId(existingConversations[0].id);
    } else {
        setConversationId(null);
    }
  }, [existingConversations]);

  const messagesQuery = useMemoFirebase(() => {
      if (!firestore || !user || !conversationId) return null;
      return query(
          collection(firestore, 'users', user.uid, 'conversations', conversationId, 'messages'),
          orderBy('timestamp', 'asc')
      );
  }, [firestore, user, conversationId]);

  const { data: messages, isLoading: isLoadingMessages } = useCollection<Message>(messagesQuery);


  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if ((!message.trim() && !imageUrl) || !user || !firestore) {
      toast({
        title: 'Error',
        description: 'You must be logged in and type a message or upload an image.',
        variant: 'destructive',
      });
      return;
    }
    setIsSending(true);

    try {
        let currentConversationId = conversationId;

        // If no conversation exists, create one for both buyer and seller
        if (!currentConversationId) {
            const newConversationData = {
                title: product.name,
                contactName: manufacturer.shopName || manufacturer.name,
                contactId: manufacturer.id,
                productId: product.id,
                contactRole: 'Seller',
                lastMessage: message || 'Image sent',
                lastMessageTimestamp: serverTimestamp(),
                isUnread: true,
            };

            const buyerConvoRef = await addDoc(collection(firestore, 'users', user.uid, 'conversations'), newConversationData);
            currentConversationId = buyerConvoRef.id;
            setConversationId(currentConversationId); // Update state for message sending

            const sellerConvoData = {
                ...newConversationData,
                contactName: user.displayName || 'A Tradinta Buyer',
                contactId: user.uid,
                contactRole: 'Buyer',
            };
            await addDoc(collection(firestore, 'manufacturers', manufacturer.id, 'conversations'), sellerConvoData);
            
            // Only send email for the very first message of a new conversation
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
        }
        
        // Add the new message to the messages subcollection
        if (currentConversationId) {
            const messageData = {
                from: 'user',
                text: message,
                imageUrl: imageUrl,
                timestamp: serverTimestamp(),
            };
            await addDoc(collection(firestore, 'users', user.uid, 'conversations', currentConversationId, 'messages'), messageData);
            // Also add to seller's messages
            await addDoc(collection(firestore, 'manufacturers', manufacturer.id, 'conversations', currentConversationId, 'messages'), {
                ...messageData,
                from: 'contact'
            });
        }
        
        setMessage('');
        setImageUrl(null);
        toast({
            title: 'Message Sent!',
            description: `Your message has been sent to ${manufacturer.shopName || manufacturer.name}.`,
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
          <ScrollArea className="h-64 flex flex-col justify-end p-4 bg-muted/50 rounded-md">
            {isLoadingMessages ? (
                <div className="flex justify-center items-center h-full"><Loader2 className="h-6 w-6 animate-spin"/></div>
            ) : messages && messages.length > 0 ? (
                messages.map((msg) => (
                    <div key={msg.id} className={`flex items-end gap-2 mb-4 ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.from === 'contact' && (
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={`https://picsum.photos/seed/${manufacturer.name}/32/32`} />
                                <AvatarFallback>{manufacturer.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                        )}
                         <div className={`max-w-sm p-2 rounded-lg ${msg.from === 'user' ? 'bg-primary text-primary-foreground' : 'bg-background'}`}>
                            {msg.imageUrl && (
                                <Image src={msg.imageUrl} alt="Uploaded image" width={200} height={200} className="rounded-md mb-2" />
                            )}
                            {msg.text && <p className="text-sm">{msg.text}</p>}
                        </div>
                         {msg.from === 'user' && (
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={user?.photoURL || ''} />
                                <AvatarFallback>{user?.displayName?.charAt(0) || 'U'}</AvatarFallback>
                            </Avatar>
                        )}
                    </div>
                ))
            ) : (
              <div className="text-center text-muted-foreground text-sm flex items-center justify-center h-full">
                <p>Start the conversation by sending a message.</p>
              </div>
            )}
          </ScrollArea>
        </div>

        <form onSubmit={handleSubmit}>
          {imageUrl && (
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
            />
            <div className="flex justify-between items-center">
                <div className="flex gap-2">
                    <PhotoUpload
                        label=""
                        onUpload={handleImageUpload}
                        onLoadingChange={setIsUploading}
                        disabled={isSending || isUploading}
                    >
                        <Button type="button" variant="ghost" size="icon" disabled={isSending || isUploading}>
                           {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Paperclip className="h-4 w-4" />}
                        </Button>
                    </PhotoUpload>
                </div>
                <Button type="submit" disabled={isSending || isUploading || (!message.trim() && !imageUrl)}>
                {isSending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Send className="mr-2 h-4 w-4" />
                )}
                {isSending ? 'Sending...' : 'Send Message'}
                </Button>
            </div>
          </div>
        </form>

        <Alert className="mt-4">
          <Info className="h-4 w-4" />
          <AlertDescription className="text-xs">
            You will be notified of replies. You can view and continue all conversations in your{' '}
            <Link href="/dashboards/buyer/messages" className="font-bold underline">Tradinta Inbox</Link>.
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

    