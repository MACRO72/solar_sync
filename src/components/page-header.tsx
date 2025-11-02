
"use client";
import { Bell, Menu, LayoutDashboard, BarChart3, PanelTop, Lightbulb, Settings, User, LogOut, Wifi, WifiOff, Download } from 'lucide-react';
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
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { Badge } from '@/components/ui/badge';
import { alerts } from '@/lib/data';
import { cn } from '@/lib/utils';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Logo } from './icons';
import { useUser } from '@/firebase/auth/use-user';
import { getAuth, signOut } from 'firebase/auth';
import { useRealtimeData } from '@/firebase/firestore/use-realtime-data';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import Papa from 'papaparse';
import { useToast } from '@/hooks/use-toast';

const menuItems = [
  { path: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { path: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/dashboard/devices', label: 'Devices', icon: PanelTop },
  { path: '/dashboard/connectivity', label: 'Connectivity', icon: Wifi },
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
  const pathname = usePathname();
  const { user } = useUser();
  const router = useRouter();
  const { data: devices, loading } = useRealtimeData();
  const { toast } = useToast();

  const isConnected = !loading && devices.some(d => d.status === 'Online');

  const handleSignOut = async () => {
    const auth = getAuth();
    await signOut(auth);
    // After signOut, onAuthStateChanged in useUser will trigger, and the RouteGuard will redirect to login.
    router.push('/login');
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  const handleLinkClick = () => {
    setIsSheetOpen(false);
  };
  
  const handleDownloadCsv = () => {
    if (devices.length === 0) {
        toast({
            variant: 'destructive',
            title: 'No Data Available',
            description: 'There is no data to download yet.',
        });
        return;
    }

    const csv = Papa.unparse(devices);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'solarsync_data.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
        title: 'Download Started',
        description: 'Your data is being downloaded as solarsync_data.csv.',
    });
    handleLinkClick();
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
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <SheetDescription className="sr-only">Main navigation links for the application.</SheetDescription>
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
                 <button
                    onClick={handleDownloadCsv}
                    className={cn(
                        'flex items-center gap-4 px-2.5 transition-colors hover:text-foreground text-muted-foreground'
                    )}
                    >
                    <Download className="h-5 w-5" />
                    Download CSV
                 </button>
                 <Link
                      href={'/dashboard/settings'}
                      onClick={handleLinkClick}
                      className={cn(
                          'flex items-center gap-4 px-2.5 transition-colors hover:text-foreground',
                          pathname === '/dashboard/settings'
                          ? 'text-foreground'
                          : 'text-muted-foreground'
                      )}
                      >
                      <Settings className="h-5 w-5" />
                      Settings
                    </Link>
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
      <div className="ml-auto flex items-center gap-2">
        <TooltipProvider>
           <Tooltip>
            <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full as-child">
                  <Link href="/dashboard/connectivity">
                    {isConnected ? (
                      <Wifi className="text-status-positive" />
                    ) : (
                      <WifiOff className="text-destructive" />
                    )}
                    <span className="sr-only">Connectivity Status</span>
                  </Link>
                </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isConnected ? "Sensors Connected" : "Sensors Disconnected"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

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
                <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.photoURL || undefined} alt={user?.displayName || "User"} />
                        <AvatarFallback>{getInitials(user?.displayName)}</AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/profile">
                    <User className="mr-2" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings">
                    <Settings className="mr-2" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2" />
                    Sign Out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>

      </div>
    </header>
  );
}
