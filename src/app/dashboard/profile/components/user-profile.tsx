
'use client';

import { useRef, useState, useEffect } from 'react';
import { useAppState } from '@/context/app-state-provider';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Upload, Loader2, ArrowLeft, Pencil, X, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase/auth/use-user';
import { getStorage, ref, uploadString, getDownloadURL } from "firebase/storage";


export function UserProfile() {
  const { name, email, avatar, phone } = useAppState();
  const router = useRouter();
  const { user } = useUser();

  const [currentName, setCurrentName] = useState(name);
  const [currentEmail, setCurrentEmail] = useState(email);
  const [currentAvatar, setCurrentAvatar] = useState(avatar);
  const [currentPhone, setCurrentPhone] = useState(phone);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user && !isEditing) {
        setCurrentName(user.displayName || name);
        setCurrentEmail(user.email || email);
        setCurrentAvatar(user.photoURL || avatar);
        setCurrentPhone(phone);
    }
  }, [user, name, email, avatar, phone, isEditing]);

  const handleSave = async () => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to update your profile.' });
      return;
    }
    
    if (!currentName || currentName.trim().length < 2) {
      toast({ variant: 'destructive', title: 'Validation Error', description: 'Name must be at least 2 characters.' });
      return;
    }

    setIsSaving(true);
    
    try {
      const idToken = await user.getIdToken();
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          name: currentName.trim(),
          email: currentEmail.trim(),
          phone: currentPhone?.trim() || '',
        }),
      });

      const contentType = response.headers.get('content-type');
      let result;
      if (contentType && contentType.includes('application/json')) {
        result = await response.json();
      } else {
        const text = await response.text();
        console.error("Non-JSON response received:", text);
        throw new Error(`Server returned unexpected response type: ${contentType}`);
      }

      if (!response.ok) {
        const errorMsg = result.details ? `${result.error}: ${result.details}` : (result.error || 'Failed to update profile');
        throw new Error(errorMsg);
      }

      toast({
        title: 'Profile Updated',
        description: 'Your changes have been saved successfully.',
      });
      setIsEditing(false);
    } catch (error: any) {
      console.error("Save error:", error);
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: error.message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setCurrentName(name);
    setCurrentEmail(email);
    setCurrentPhone(phone);
    setIsEditing(false);
  };
  
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) {
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
          
          const idToken = await user.getIdToken();
          const response = await fetch('/api/user/profile', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${idToken}`
            },
            body: JSON.stringify({ avatar: downloadURL }),
          });

          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Failed to sync avatar');
          } else {
            const text = await response.text();
            console.error("Non-JSON avatar response:", text);
          }

          toast({ title: 'Avatar Updated', description: 'Your new avatar has been saved.' });
        } catch (error: any) {
          console.error("Avatar upload/save error:", error);
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
        <div className="flex items-center gap-3 mb-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground -ml-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>My Profile</CardTitle>
            <CardDescription>Update your personal information and avatar.</CardDescription>
          </div>
          {!isEditing && (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="flex items-center gap-2">
              <Pencil className="h-4 w-4" />
              Edit Profile
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-6">
          <Avatar className="h-24 w-24 ring-2 ring-primary/20 ring-offset-4 ring-offset-background transition-all">
            <AvatarImage src={currentAvatar} alt="User Avatar" />
            <AvatarFallback className="text-xl font-bold bg-primary/10 text-primary">{getInitials(currentName)}</AvatarFallback>
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
            <Button variant="secondary" size="sm" onClick={handleUploadClick} disabled={isUploading} className="glass-panel">
                {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                {isUploading ? 'Uploading...' : 'Update Photo'}
            </Button>
           </div>
        </div>

        <div className="grid gap-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-muted-foreground">Full Name</Label>
            {isEditing ? (
              <Input id="name" value={currentName} onChange={(e) => setCurrentName(e.target.value)} disabled={isSaving} placeholder="Your Name" />
            ) : (
              <div className="text-lg font-medium py-2 px-1 border-b border-white/5">{currentName || 'Not set'}</div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-muted-foreground">Email Address</Label>
            {isEditing ? (
              <Input id="email" type="email" value={currentEmail} onChange={(e) => setCurrentEmail(e.target.value)} disabled={isSaving} placeholder="your@email.com" />
            ) : (
              <div className="text-lg font-medium py-2 px-1 border-b border-white/5">{currentEmail || 'Not set'}</div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-muted-foreground">Phone Number</Label>
            {isEditing ? (
              <Input id="phone" type="tel" value={currentPhone} onChange={(e) => setCurrentPhone(e.target.value)} placeholder="+91 98765 43210" disabled={isSaving} />
            ) : (
              <div className="text-lg font-medium py-2 px-1 border-b border-white/5">{currentPhone || 'Not set'}</div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex gap-3 pt-2">
        {isEditing ? (
          <>
            <Button onClick={handleSave} disabled={isSaving} className="bg-primary hover:bg-primary/90">
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button variant="ghost" onClick={handleCancel} disabled={isSaving}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          </>
        ) : (
          <div className="text-xs text-muted-foreground">
            Changes are saved securely using your account data.
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
