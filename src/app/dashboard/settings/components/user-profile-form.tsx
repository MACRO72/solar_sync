
'use client';

import { GlassCard, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/glass-card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { User } from "lucide-react";

export function UserProfileForm() {
    const userAvatar = PlaceHolderImages.find(p => p.id === 'user-avatar');

    return (
        <GlassCard>
            <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>Manage your account settings and profile information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                    <Avatar className="h-20 w-20">
                        {userAvatar && <AvatarImage src={userAvatar.imageUrl} alt="User Avatar" />}
                        <AvatarFallback><User className="h-10 w-10" /></AvatarFallback>
                    </Avatar>
                    <div className="space-y-2">
                         <Label htmlFor="profile-picture">Profile Picture</Label>
                         <Input id="profile-picture" type="file" />
                         <p className="text-sm text-muted-foreground">Upload a new profile picture.</p>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" defaultValue="Solar Admin" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" defaultValue="admin@solarintel.com" disabled />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input id="current-password" type="password" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input id="new-password" type="password" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input id="confirm-password" type="password" />
                </div>

            </CardContent>
            <CardFooter>
                <Button>Save Changes</Button>
            </CardFooter>
        </GlassCard>
    );
}
