'use client';

import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFirestore } from '@/firebase/provider';
import { doc, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

interface RenameDeviceDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  deviceId: string;
  currentName?: string | null;
}

export function RenameDeviceDialog({ isOpen, setIsOpen, deviceId, currentName }: RenameDeviceDialogProps) {
  const [newName, setNewName] = React.useState(currentName || '');
  const [isSaving, setIsSaving] = React.useState(false);
  const firestore = useFirestore();
  const { toast } = useToast();

  React.useEffect(() => {
    if (isOpen) {
      setNewName(currentName || '');
    }
  }, [isOpen, currentName]);

  const handleSave = async () => {
    if (!firestore || !deviceId) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not save new name. Device or database is not available.',
      });
      return;
    }
    if (!newName.trim()) {
        toast({
            variant: 'destructive',
            title: 'Invalid Name',
            description: 'Device name cannot be empty.',
        });
        return;
    }

    setIsSaving(true);
    const deviceDocRef = doc(firestore, 'device-data', deviceId);
    const updatedData = { name: newName };

    setDoc(deviceDocRef, updatedData, { merge: true })
      .then(() => {
        toast({
          title: 'Device Renamed',
          description: `The device has been successfully renamed to "${newName}".`,
        });
        setIsOpen(false);
      })
      .catch((serverError) => {
        const permissionError = new FirestorePermissionError({
            path: deviceDocRef.path,
            operation: 'update',
            requestResourceData: updatedData,
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      })
      .finally(() => {
        setIsSaving(false);
      });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename Device</DialogTitle>
          <DialogDescription>
            Enter a new name for the device with ID: <span className="font-mono">{deviceId}</span>
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              New Name
            </Label>
            <Input
              id="name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="col-span-3"
              disabled={isSaving}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isSaving ? 'Saving...' : 'Save Name'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
