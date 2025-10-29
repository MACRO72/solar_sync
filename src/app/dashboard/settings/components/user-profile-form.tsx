
'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { User, Loader2 } from "lucide-react";
import { useToast } from '@/hooks/use-toast';

export function UserProfileForm() {
    const originalUserAvatar = PlaceHolderImages.find(p => p.id === 'user-avatar');
    
    const [name, setName] = useState('Solar Admin');
    const [email, setEmail] = useState('admin@solarintel.com');
    const [mobile, setMobile] = useState('+1 (555) 123-4567');
    const [avatar, setAvatar] = useState(originalUserAvatar?.imageUrl || '');
    const [isSaving, setIsSaving] = useState(false);

    const { toast } = useToast();

    const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            setAvatar(URL.createObjectURL(file));
        }
    };

    const handleSaveChanges = () => {
        setIsSaving(true);
        // Simulate an API call
        setTimeout(() => {
            setIsSaving(false);
            toast({
                title: 'Profile Updated',
                description: 'Your changes have been saved successfully.',
            });
        }, 1500);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>Manage your account settings and profile information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                    <Avatar className="h-20 w-20">
                        <AvatarImage src={avatar} alt="User Avatar" />
                        <AvatarFallback><User className="h-10 w-10" /></AvatarFallback>
                    </Avatar>
                    <div className="space-y-2">
                         <Label htmlFor="profile-picture">Profile Picture</Label>
                         <Input id="profile-picture" type="file" accept="image/*" onChange={handleAvatarChange} />
                         <p className="text-sm text-muted-foreground">Upload a new profile picture.</p>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="mobile">Mobile Number</Label>
                    <Input id="mobile" type="tel" value={mobile} disabled />
                     <p className="text-sm text-muted-foreground">Mobile number is not editable at the moment.</p>
                </div>

            </CardContent>
            <CardFooter>
                <Button onClick={handleSaveChanges} disabled={isSaving}>
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
            </CardFooter>
        </Card>
    );
}
