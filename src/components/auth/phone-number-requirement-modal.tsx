'use client';

import * as React from 'react';
import { useAppState } from '@/context/app-state-provider';
import { useUser } from '@/firebase/auth/use-user';
import { useFirestore } from '@/firebase/provider';
import { doc, setDoc } from 'firebase/firestore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Phone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function PhoneNumberRequirementModal() {
  const { phone, name, email } = useAppState();
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [inputPhone, setInputPhone] = React.useState('');
  const [isSaving, setIsSaving] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
    if (!userLoading && user && !phone) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [user, userLoading, phone]);

  const handleSave = async () => {
    if (!inputPhone || inputPhone.length < 10) {
      toast({ variant: 'destructive', title: 'Invalid Phone', description: 'Enter a valid number for alerts.' });
      return;
    }
    if (!user || !firestore) return;
    setIsSaving(true);
    const userRef = doc(firestore, 'users', user.uid);
    await setDoc(userRef, { phone: inputPhone }, { merge: true })
      .then(() => {
        toast({ title: 'Profile Updated', description: 'Phone number saved.' });
        setIsOpen(false);
      })
      .finally(() => setIsSaving(false));
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Phone className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center">Phone Number Required</DialogTitle>
          <DialogDescription className="text-center">To receive real-time alerts, please provide your mobile number.</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Label htmlFor="phone-requirement">Mobile Number</Label>
          <Input id="phone-requirement" placeholder="+91 98765 43210" value={inputPhone} onChange={(e) => setInputPhone(e.target.value)} disabled={isSaving} />
        </div>
        <DialogFooter>
          <Button onClick={handleSave} className="w-full" disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save and Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
