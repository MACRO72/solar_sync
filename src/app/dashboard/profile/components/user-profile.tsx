'use client';

import { useRef, useState } from 'react';
import { useAppState } from '@/context/app-state-provider';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Upload } from 'lucide-react';

export function UserProfile() {
  const { name, setName, email, setEmail, avatar, setAvatar, phone, setPhone } = useAppState();
  const [currentName, setCurrentName] = useState(name);
  const [currentEmail, setCurrentEmail] = useState(email);
  const [currentAvatar, setCurrentAvatar] = useState(avatar);
  const [currentPhone, setCurrentPhone] = useState(phone);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    setName(currentName);
    setEmail(currentEmail);
    setAvatar(currentAvatar);
    setPhone(currentPhone);
    toast({
      title: 'Profile Updated',
      description: 'Your profile information has been successfully saved.',
    });
  };
  
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === 'image/png') {
        const reader = new FileReader();
        reader.onloadend = () => {
          setCurrentAvatar(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        toast({
            variant: 'destructive',
            title: 'Invalid File Type',
            description: 'Please upload a PNG image.',
        });
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

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
            <AvatarFallback>{name.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
           <div className="space-y-2">
             <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                className="hidden"
                accept="image/png"
              />
            <Button variant="outline" onClick={handleUploadClick}>
                <Upload className="mr-2 h-4 w-4" />
                Upload your profile picture
            </Button>
           </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" value={currentName} onChange={(e) => setCurrentName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={currentEmail} onChange={(e) => setCurrentEmail(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input id="phone" type="tel" value={currentPhone} onChange={(e) => setCurrentPhone(e.target.value)} placeholder="+1 (555) 555-5555" />
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave}>Save Changes</Button>
      </CardFooter>
    </Card>
  );
}
