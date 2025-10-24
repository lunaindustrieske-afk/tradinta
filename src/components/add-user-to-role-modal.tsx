
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
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UserPlus } from 'lucide-react';

interface AddUserToRoleModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  roleName: string;
}

export function AddUserToRoleModal({ isOpen, onOpenChange, roleName }: AddUserToRoleModalProps) {
  const { toast } = useToast();
  const [tradintaId, setTradintaId] = React.useState('');
  const [isAdding, setIsAdding] = React.useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!tradintaId) {
      toast({ title: 'Error', description: 'Please enter a Tradinta ID.', variant: 'destructive' });
      return;
    }
    
    setIsAdding(true);
    
    // In a real app, you would:
    // 1. Query Firestore to find the user document with this tradintaId.
    // 2. Get that user's Firebase Auth UID.
    // 3. Set a custom claim for the role using a server-side function (e.g., a Firebase Function).
    // For now, we'll just simulate the action.
    
    console.log(`Attempting to add user with Tradinta ID: ${tradintaId} to role: ${roleName}`);

    // Simulate async action
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: 'Role Assignment Queued',
      description: `User with ID ${tradintaId} will be assigned the role: ${roleName}.`,
    });
    
    setIsAdding(false);
    onOpenChange(false); // Close the modal
    setTradintaId(''); // Reset input
  };

  // Reset local state when modal is closed
  React.useEffect(() => {
    if (!isOpen) {
      setTradintaId('');
      setIsAdding(false);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add User to "{roleName}"</DialogTitle>
          <DialogDescription>
            Enter the user's 8-character Tradinta ID to grant them this role.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tradintaId" className="text-right">
                Tradinta ID
              </Label>
              <Input
                id="tradintaId"
                value={tradintaId}
                onChange={(e) => setTradintaId(e.target.value)}
                className="col-span-3"
                placeholder="e.g. A8B2C3D4"
                maxLength={8}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isAdding}>
                {isAdding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
                {isAdding ? 'Adding...' : 'Add User'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
