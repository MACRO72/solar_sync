
"use client";
import { Bell, Menu, LayoutDashboard, BarChart3, PanelTop, Lightbulb, Settings, User, LogOut, Wifi } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Badge } from '@/components/ui/badge';
import { alerts } from '@/lib/data';
import { cn } from '@/lib/utils';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from './icons';

const menuItems = [
  { path: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { path: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/dashboard/devices', label: 'Devices', icon: PanelTop },
  { path: '/dashboard/insights', label: 'Insights', icon: Lightbulb },
];

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
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);
  const highPriorityAlerts = alerts.filter(a => a.severity === 'High').length;
  const userAvatar = PlaceHolderImages.find(p => p.id === 'user-avatar');
  const pathname = usePathname();

  const handleLinkClick = () => {
    setIsSheetOpen(false);
  };

  return (
    <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background/80 px-4 md:px-6 z-10 backdrop-blur-sm">
      <div className="flex items-center gap-4">
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <nav className="grid gap-6 text-lg font-medium">
                 <Link
                    href="/dashboard"
                    onClick={handleLinkClick}
                    className="flex items-center gap-2 text-lg font-semibold"
                 >
                    <Logo className="size-8 text-primary animate-logo-spin" />
                    <span className="text-xl font-semibold animate-logo-text">SolarSync</span>
                </Link>
                 {menuItems.map((item) => (
                    <Link
                      key={item.path}
                      href={item.path}
                      onClick={handleLinkClick}
                      className={cn(
                          'flex items-center gap-4 px-2.5 transition-colors hover:text-foreground',
                          pathname === item.path
                          ? 'text-foreground'
                          : 'text-muted-foreground'
                      )}
                      >
                      <item.icon className="h-5 w-5" />
                      {item.label}
                    </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
          <Link
            href="/dashboard"
            className="hidden md:flex items-center gap-2 text-lg font-semibold"
          >
            <Logo className="size-8 text-primary animate-logo-spin" />
            <span className="text-xl font-semibold animate-logo-text">SolarSync</span>
        </Link>
      </div>
      <div className="ml-auto flex items-center gap-4">
        <Button variant="ghost" size="icon" className="relative rounded-full">
            <Wifi className="text-status-positive" />
            <span className="sr-only">Sensor Status</span>
        </Button>
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
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                 <Link href="/dashboard/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                 </Link>
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
