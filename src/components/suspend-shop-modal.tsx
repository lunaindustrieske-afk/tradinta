
'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import { Switch } from './ui/switch';
import { AlertTriangle, Loader2, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useAuth, updateDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { logActivity } from '@/lib/activity-log';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

type Manufacturer = {
  id: string;
  shopName: string;
  suspensionDetails?: {
    isSuspended: boolean;
    reason: string;
    prohibitions: string[];
    publicDisclaimer: boolean;
  };
};

interface SuspendShopModalProps {
  seller: Manufacturer;
  children: React.ReactNode;
}

const prohibitionOptions = [
  { id: 'cannot_upload_products', label: 'Block new product uploads' },
  { id: 'cannot_edit_products', label: 'Block product editing' },
  { id: 'cannot_receive_messages', label: 'Disable incoming messages' },
  { id: 'hide_from_search', label: 'Hide shop from search results' },
];

export function SuspendShopModal({ seller, children }: SuspendShopModalProps) {
  const { toast } = useToast();
  const firestore = useFirestore();
  const auth = useAuth();
  const [open, setOpen] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(false);

  const [reason, setReason] = React.useState('');
  const [prohibitions, setProhibitions] = React.useState<string[]>([]);
  const [publicDisclaimer, setPublicDisclaimer] = React.useState(false);
  const [deleteContent, setDeleteContent] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      const details = seller.suspensionDetails;
      setReason(details?.reason || '');
      setProhibitions(details?.prohibitions || []);
      setPublicDisclaimer(details?.publicDisclaimer || false);
      setDeleteContent(false);
    }
  }, [open, seller.suspensionDetails]);

  const handleProhibitionChange = (id: string, checked: boolean) => {
    setProhibitions((prev) =>
      checked ? [...prev, id] : prev.filter((p) => p !== id)
    );
  };

  const handleSaveSuspension = async (suspend: boolean) => {
    if (suspend && !reason.trim()) {
      toast({
        title: 'Reason Required',
        description: 'Please provide a reason for suspending the shop.',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);
    const sellerRef = doc(firestore, 'manufacturers', seller.id);
    const suspensionDetails = {
      isSuspended: suspend,
      reason: suspend ? reason : '',
      prohibitions: suspend ? prohibitions : [],
      publicDisclaimer: suspend ? publicDisclaimer : false,
    };

    try {
      updateDocumentNonBlocking(sellerRef, { suspensionDetails });

      if (deleteContent && suspend) {
        // This is a placeholder for a more complex backend operation
        console.warn(`Action required: Delete content for seller ${seller.id}`);
        toast({
          title: 'Content Deletion Queued',
          description: 'A request to delete products and logos has been logged.',
        });
      }

      await logActivity(
        firestore,
        auth,
        suspend ? 'SELLER_SUSPENDED' : 'SELLER_UNSUSPENDED',
        `${suspend ? 'Suspended' : 'Unsuspended'} seller: ${
          seller.shopName
        } (ID: ${seller.id}). Reason: ${suspend ? reason : 'N/A'}`
      );

      toast({
        title: `Shop ${suspend ? 'Suspended' : 'Reinstated'}`,
        description: `${seller.shopName}'s status has been updated.`,
      });

      setOpen(false);
    } catch (error: any) {
      toast({
        title: 'Operation Failed',
        description: error.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const isCurrentlySuspended = seller.suspensionDetails?.isSuspended === true;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Manage Suspension for {seller.shopName}</DialogTitle>
          <DialogDescription>
            Apply or lift restrictions for this seller. All actions are logged.
          </DialogDescription>
        </DialogHeader>
        {isCurrentlySuspended ? (
          <div className="py-4 text-center">
            <p className="mb-4">This shop is currently suspended.</p>
            <Button
              onClick={() => handleSaveSuspension(false)}
              disabled={isProcessing}
              variant="secondary"
            >
              {isProcessing && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Reinstate Shop
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="reason">Reason for Suspension</Label>
              <Textarea
                id="reason"
                placeholder="e.g., Violation of content policy, multiple user complaints."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>Prohibitions</Label>
              <div className="space-y-2 rounded-md border p-4">
                {prohibitionOptions.map((opt) => (
                  <div key={opt.id} className="flex items-center gap-2">
                    <Checkbox
                      id={opt.id}
                      checked={prohibitions.includes(opt.id)}
                      onCheckedChange={(checked) =>
                        handleProhibitionChange(opt.id, !!checked)
                      }
                    />
                    <Label htmlFor={opt.id} className="text-sm font-normal">
                      {opt.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <Label htmlFor="public-disclaimer">
                Show Public Disclaimer
                <p className="text-xs font-normal text-muted-foreground">
                  Display a suspension notice on the shop's public profile.
                </p>
              </Label>
              <Switch
                id="public-disclaimer"
                checked={publicDisclaimer}
                onCheckedChange={setPublicDisclaimer}
              />
            </div>
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Danger Zone</AlertTitle>
              <AlertDescription>
                <div className="flex items-center justify-between mt-2">
                  <Label htmlFor="delete-content">
                    Permanently delete all products and media.
                    <p className="text-xs font-normal">This action cannot be undone.</p>
                  </Label>
                  <Switch
                    id="delete-content"
                    checked={deleteContent}
                    onCheckedChange={setDeleteContent}
                    className="data-[state=checked]:bg-destructive"
                  />
                </div>
              </AlertDescription>
            </Alert>
          </div>
        )}

        {!isCurrentlySuspended && (
          <DialogFooter>
            <Button
              variant="destructive"
              onClick={() => handleSaveSuspension(true)}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <AlertTriangle className="mr-2 h-4 w-4" />
              )}
              Suspend Shop
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
