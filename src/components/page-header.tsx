
"use client";
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { alerts } from '@/lib/data';
import { cn } from '@/lib/utils';
import { Navbar } from '@/components/navbar';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { User, Settings, LogOut } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const getSeverityBadgeClass = (severity: 'High' | 'Medium' | 'Low') => {
  switch (severity) {
    case 'High':
      return 'bg-destructive/20 border-destructive/30 text-destructive';
    case 'Medium':
      return 'bg-accent/20 border-accent/30 text-accent';
    case 'Low':
      return 'bg-primary/20 border-primary/30 text-primary';
  }
};


export function PageHeader() {
  const highPriorityAlerts = alerts.filter(a => a.severity === 'High').length;
  const userAvatar = PlaceHolderImages.find(p => p.id === 'user-avatar');

  return (
    <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background/80 px-4 md:px-6 z-10 backdrop-blur-sm">
      <Navbar />
      <div className="ml-auto flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative rounded-full">
              <Bell />
              {highPriorityAlerts > 0 && (
                 <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground">
                   {highPriorityAlerts}
                 </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-96">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="flex flex-col gap-2 p-2">
            {alerts.map(alert => (
               <div key={alert.id} className="grid grid-cols-[25px_1fr] items-start gap-3 rounded-md p-2 transition-colors hover:bg-muted/50">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-muted">
                    <Bell className="h-3 w-3" />
                </div>
                 <div className="grid gap-1">
                   <div className="flex items-center justify-between">
                     <p className="font-medium">{alert.title}</p>
                     <Badge variant="outline" className={cn('text-xs', getSeverityBadgeClass(alert.severity))}>{alert.severity}</Badge>
                   </div>
                   <p className="text-sm text-muted-foreground">{alert.description}</p>
                   <p className="text-xs text-muted-foreground/80">{alert.timestamp}</p>
                </div>
              </div>
            ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
         <DropdownMenu>
            <DropdownMenuTrigger asChild>
               <button className="flex items-center gap-2 rounded-full text-left text-sm outline-none ring-ring transition-colors focus-visible:ring-2">
                <Avatar className="h-8 w-8">
                  {userAvatar && <AvatarImage src={userAvatar.imageUrl} alt="User Avatar" />}
                  <AvatarFallback>AU</AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="bottom" align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
      </div>
    </header>
  );
}
