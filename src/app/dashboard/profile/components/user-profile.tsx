
'use client';

import { useRef, useState, useEffect } from 'react';
import { useAppState } from '@/context/app-state-provider';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Upload, Loader2 } from 'lucide-react';
import { useUser } from '@/firebase/auth/use-user';
import { useFirestore } from '@/firebase/provider';
import { doc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadString, getDownloadURL } from "firebase/storage";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import type { SecurityRuleContext } from '@/firebase/errors';


export function UserProfile() {
  const { name, email, avatar, phone } = useAppState();
  const { user } = useUser();
  const firestore = useFirestore();

  const [currentName, setCurrentName] = useState(name);
  const [currentEmail, setCurrentEmail] = useState(email);
  const [currentAvatar, setCurrentAvatar] = useState(avatar);
  const [currentPhone, setCurrentPhone] = useState(phone);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
        setCurrentName(user.displayName || name);
        setCurrentEmail(user.email || email);
        setCurrentAvatar(user.photoURL || avatar);
    }
  }, [user, name, email, avatar]);

  const handleSave = async () => {
    if (!user || !firestore) {
      toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to update your profile.' });
      return;
    }
    setIsSaving(true);
    
    const userRef = doc(firestore, 'users', user.uid);
    const updatedData = {
        name: currentName,
        email: currentEmail,
        phone: currentPhone,
      };

    updateDoc(userRef, updatedData)
        .then(() => {
            toast({
                title: 'Profile Updated',
                description: 'Your profile information has been successfully saved.',
            });
        })
        .catch(async (serverError) => {
             const permissionError = new FirestorePermissionError({
                path: userRef.path,
                operation: 'update',
                requestResourceData: updatedData,
            } satisfies SecurityRuleContext);

            errorEmitter.emit('permission-error', permissionError);
        })
        .finally(() => {
            setIsSaving(false);
        });
  };
  
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !firestore) {
      toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to upload an image.' });
      return;
    }
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) {
        toast({ variant: 'destructive', title: 'Invalid File Type', description: 'Please upload an image file.' });
        return;
      }
      
      setIsUploading(true);
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        const dataUrl = reader.result as string;
        
        const storage = getStorage();
        const storageRef = ref(storage, `avatars/${user.uid}`);
        
        try {
          await uploadString(storageRef, dataUrl, 'data_url');
          const downloadURL = await getDownloadURL(storageRef);
          
          setCurrentAvatar(downloadURL);
          
          const userRef = doc(firestore, 'users', user.uid);
          const updatedData = { photoURL: downloadURL };
          
          updateDoc(userRef, updatedData)
            .then(() => {
                toast({ title: 'Avatar Updated', description: 'Your new avatar has been saved.' });
            })
            .catch((serverError) => {
                 const permissionError = new FirestorePermissionError({
                    path: userRef.path,
                    operation: 'update',
                    requestResourceData: updatedData,
                } satisfies SecurityRuleContext);

                errorEmitter.emit('permission-error', permissionError);
            });

        } catch (error: any) {
          toast({ variant: 'destructive', title: 'Upload Failed', description: error.message || 'Could not upload avatar.' });
        } finally {
          setIsUploading(false);
        }
      };
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const getInitials = (name: string) => {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  return (
    <Card className="animate-energy-wave">
      <CardHeader>
        <CardTitle>My Profile</CardTitle>
        <CardDescription>Update your personal information and avatar.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-6">
          <Avatar className="h-20 w-20">
            <AvatarImage src={currentAvatar} alt="User Avatar" />
            <AvatarFallback>{getInitials(currentName)}</AvatarFallback>
          </Avatar>
           <div className="space-y-2">
             <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                className="hidden"
                accept="image/*"
                disabled={isUploading}
              />
            <Button variant="outline" onClick={handleUploadClick} disabled={isUploading}>
                {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                {isUploading ? 'Uploading...' : 'Upload Avatar'}
            </Button>
           </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" value={currentName} onChange={(e) => setCurrentName(e.target.value)} disabled={isSaving} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={currentEmail} onChange={(e) => setCurrentEmail(e.target.value)} disabled={isSaving} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input id="phone" type="tel" value={currentPhone} onChange={(e) => setCurrentPhone(e.target.value)} placeholder="+1 (555) 555-5555" disabled={isSaving} />
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </CardFooter>
    </Card>
  );
}
