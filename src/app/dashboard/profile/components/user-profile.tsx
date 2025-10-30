'use client';

import { useState } from 'react';
import { useAppState } from '@/context/app-state-provider';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Upload } from 'lucide-react';

export function UserProfile() {
  const { name, setName, email, setEmail, avatar, setAvatar } = useAppState();
  const [currentName, setCurrentName] = useState(name);
  const [currentEmail, setCurrentEmail] = useState(email);
  const [currentAvatar, setCurrentAvatar] = useState(avatar);
  const { toast } = useToast();

  const handleSave = () => {
    setName(currentName);
    setEmail(currentEmail);
    setAvatar(currentAvatar);
    toast({
      title: 'Profile Updated',
      description: 'Your profile information has been successfully saved.',
    });
  };

  return (
    <Card>
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
            <Label htmlFor="avatarUrl">Avatar URL</Label>
            <div className="flex gap-2">
              <Input
                id="avatarUrl"
                value={currentAvatar}
                onChange={(e) => setCurrentAvatar(e.target.value)}
                placeholder="https://example.com/avatar.png"
              />
            </div>
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
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave}>Save Changes</Button>
      </CardFooter>
    </Card>
  );
}
