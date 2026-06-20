'use client';

import { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppState } from '@/context/app-state-provider';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Upload, Loader2, ArrowLeft, Camera } from 'lucide-react';
import { useUser } from '@/firebase/auth/use-user';
import { updateProfile } from 'firebase/auth';
import { useFirestore } from '@/firebase/provider';
import { doc, updateDoc, setDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { app } from '@/firebase/config';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export function UserProfile() {
  const router = useRouter();
  const { name, email, avatar, phone, setName, setEmail, setPhone, setAvatar } = useAppState();
  const { user } = useUser();
  const firestore = useFirestore();

  const [currentName, setCurrentName] = useState('');
  const [currentEmail, setCurrentEmail] = useState('');
  const [currentAvatar, setCurrentAvatar] = useState('');
  const [currentPhone, setCurrentPhone] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state from auth/context only on user change (initial load)
  // NOT on every context update to avoid overwriting user edits
  useEffect(() => {
    setCurrentName(user?.displayName || name || '');
    setCurrentEmail(user?.email || email || '');
    setCurrentAvatar(user?.photoURL || avatar || '');
    setCurrentPhone(phone || '');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // ── Save profile text fields ─────────────────────────────────────────────
  const handleSave = async () => {
    if (!user || !firestore) {
      toast({ variant: 'destructive', title: 'Not Authenticated', description: 'You must be logged in to update your profile.' });
      return;
    }

    if (!currentName.trim()) {
      toast({ variant: 'destructive', title: 'Name Required', description: 'Please enter your name.' });
      return;
    }

    setIsSaving(true);
    try {
      const userRef = doc(firestore, 'users', user.uid);
      await setDoc(userRef, {
        name: currentName.trim(),
        email: currentEmail.trim(),
        phone: currentPhone.trim(),
      }, { merge: true });

      await updateProfile(user, {
        displayName: currentName.trim(),
      });

      // Update context to reflect saved changes immediately
      setName(currentName.trim());
      setEmail(currentEmail.trim());
      setPhone(currentPhone.trim());

      toast({
        title: '✅ Profile Saved',
        description: 'Your profile has been updated successfully.',
      });

      setTimeout(() => router.push('/dashboard'), 1200);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Save Failed',
        description: error?.message || 'Could not save your profile. Please try again.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // ── Upload avatar ────────────────────────────────────────────────────────
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !firestore) {
      toast({ variant: 'destructive', title: 'Not Authenticated', description: 'You must be logged in to upload an image.' });
      return;
    }

    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({ variant: 'destructive', title: 'Invalid File', description: 'Please select an image file (JPG, PNG, WebP, etc.).' });
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast({ variant: 'destructive', title: 'File Too Large', description: 'Image must be smaller than 5 MB.' });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const storage = getStorage(app);
      const storageRef = ref(storage, `avatars/${user.uid}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          console.error('Avatar upload error:', error);
          toast({
            variant: 'destructive',
            title: 'Upload Failed',
            description: error?.message || 'Could not upload your avatar. Check Storage rules.',
          });
          setIsUploading(false);
          setUploadProgress(0);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

            // Update local preview immediately
            setCurrentAvatar(downloadURL);

            // Update context so avatar updates everywhere
            setAvatar(downloadURL);

            // Persist to Firestore
            const userRef = doc(firestore, 'users', user.uid);
            await setDoc(userRef, { photoURL: downloadURL }, { merge: true });

            await updateProfile(user, {
              photoURL: downloadURL
            });

            toast({ title: '✅ Avatar Updated', description: 'Your new profile picture has been saved.' });
          } catch (error: any) {
            console.error('Avatar save error:', error);
            toast({
              variant: 'destructive',
              title: 'Save Failed',
              description: error?.message || 'Could not save avatar URL.',
            });
          } finally {
            setIsUploading(false);
            setUploadProgress(0);
            if (fileInputRef.current) fileInputRef.current.value = '';
          }
        }
      );
    } catch (error: any) {
      console.error('Avatar upload error:', error);
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: error?.message || 'Could not upload your avatar.',
      });
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const getInitials = (n: string) => {
    if (!n) return 'U';
    return n.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <Card className="animate-energy-wave">
      <CardHeader>
        <div className="flex items-center gap-3 mb-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground -ml-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
        <CardTitle>My Profile</CardTitle>
        <CardDescription>Update your personal information and profile picture.</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Avatar section */}
        <div className="flex items-center gap-6">
          <div className="relative group">
            <Avatar className="h-20 w-20">
              <AvatarImage src={currentAvatar} alt="User Avatar" />
              <AvatarFallback className="text-lg font-semibold">{getInitials(currentName)}</AvatarFallback>
            </Avatar>
            {/* Overlay hint */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
              aria-label="Change avatar"
            >
              <Camera className="h-6 w-6 text-white" />
            </button>
          </div>

          <div className="space-y-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              className="hidden"
              accept="image/*"
              disabled={isUploading}
            />
            <Button
              id="upload-avatar-btn"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading
                ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Uploading...</>
                : <><Upload className="mr-2 h-4 w-4" />Upload Avatar</>
              }
            </Button>
            <p className="text-xs text-muted-foreground">JPG, PNG or WebP · Max 5 MB</p>
            {isUploading && (
              <div className="w-40">
                <Progress value={uploadProgress} />
                <p className="text-xs text-muted-foreground mt-1">{Math.round(uploadProgress)}%</p>
              </div>
            )}
          </div>
        </div>

        {/* Text fields */}
        <div className="space-y-2">
          <Label htmlFor="profile-name">Name</Label>
          <Input
            id="profile-name"
            value={currentName}
            onChange={e => setCurrentName(e.target.value)}
            disabled={isSaving}
            placeholder="Your display name"
            onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); }}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="profile-email">Email</Label>
          <Input
            id="profile-email"
            type="email"
            value={currentEmail}
            onChange={e => setCurrentEmail(e.target.value)}
            disabled={isSaving}
            placeholder="you@example.com"
            onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); }}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="profile-phone">Phone Number</Label>
          <Input
            id="profile-phone"
            type="tel"
            value={currentPhone}
            onChange={e => setCurrentPhone(e.target.value)}
            placeholder="+91 98765 43210"
            disabled={isSaving}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); }}
          />
        </div>
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button variant="ghost" onClick={() => router.push('/dashboard')} disabled={isSaving}>
          Cancel
        </Button>
        <Button id="save-profile-btn" onClick={handleSave} disabled={isSaving || isUploading}>
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </CardFooter>
    </Card>
  );
}
