"use client";
import { Bell, Menu, LayoutDashboard, BarChart3, PanelTop, Lightbulb, Settings, User, LogOut, Wifi, WifiOff, Download, Box } from 'lucide-react';
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
import { useAppState } from '@/context/app-state-provider';
import { useDeviceStatus } from '@/hooks/use-device-status';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import Papa from 'papaparse';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

const menuItems = [
  { path: '#overview', label: 'Overview', icon: LayoutDashboard },
  { path: '#analytics', label: 'Analytics', icon: BarChart3 },
  { path: '#devices', label: 'Devices', icon: PanelTop },
  { path: '#insights', label: 'Insights', icon: Lightbulb },
  { path: '#digital-twin', label: 'Digital Twin', icon: Box },
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
  const { activeSection, setShouldShowLoader } = useAppState();
  const { user } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const { data: devices, loading } = useRealtimeData();
  
  const highPriorityAlerts = React.useMemo(() => 
    alerts.filter(a => a.severity === 'High').length, 
  []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id.substring(1));
    if (!element) return;
    // Use Lenis if available so easing stays consistent — avoids two scroll
    // engines fighting each other and producing jitter.
    const lenis = (window as any).__lenis as { scrollTo: (el: HTMLElement, opts: object) => void } | undefined;
    if (lenis) {
      lenis.scrollTo(element, { offset: -80, duration: 1.0 });
    } else {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Heartbeat logic using standardized hook
  const status = useDeviceStatus(devices[0]?.lastSeen);
  const isConnected = status.isOnline;

  const handleSignOut = async () => {
    setShouldShowLoader(true);
    // Give time for the loader to animate in before final sign out and redirect
    setTimeout(async () => {
        const auth = getAuth();
        await signOut(auth);
        sessionStorage.removeItem('hasSeenSolarLoader');
        router.push('/login');
    }, 2500);
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
    <header className="sticky top-0 h-16 border-b bg-[#0B1220]/80 backdrop-blur-md px-4 md:px-6 z-50 flex items-center justify-between border-slate-800">
      <div className="flex items-center gap-6">
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-slate-300"
              >
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="bg-[#0B1220] border-slate-800">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <SheetDescription className="sr-only">Main navigation links for the application.</SheetDescription>
              <nav className="grid gap-6 text-lg font-medium mt-6">
                 <Link
                    href="/dashboard"
                    onClick={handleLinkClick}
                    className="flex items-center gap-2 text-lg font-semibold mb-4"
                 >
                    <Logo className="size-8 text-[#22D3EE] animate-logo-spin" />
                    <span className="text-xl font-bold text-white tracking-tight">SolarSync</span>
                </Link>
                 {menuItems.map((item) => (
                    <button
                      key={item.path}
                      onClick={() => {
                        scrollToSection(item.path);
                        handleLinkClick();
                      }}
                      className={cn(
                          'flex items-center gap-4 px-2.5 py-2 rounded-lg transition-all duration-200 w-full text-left',
                          activeSection === item.path.substring(1)
                          ? 'text-[#22D3EE] bg-[#22D3EE]/5 border border-[#22D3EE]/10'
                          : 'text-slate-400 hover:text-white hover:bg-white/5'
                      )}
                      >
                      <item.icon className="h-5 w-5" />
                      {item.label}
                    </button>
                ))}
                 <button
                    onClick={handleDownloadCsv}
                    className="flex items-center gap-4 px-2.5 py-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200 text-left w-full"
                    >
                    <Download className="h-5 w-5" />
                    Download CSV
                 </button>
                 <Link
                      href={'/dashboard/settings'}
                      onClick={handleLinkClick}
                      className={cn(
                          'flex items-center gap-4 px-2.5 py-2 transition-all duration-200 rounded-lg',
                          pathname === '/dashboard/settings'
                          ? 'text-[#22D3EE] bg-[#22D3EE]/5 border border-[#22D3EE]/10'
                          : 'text-slate-400 hover:text-white hover:bg-white/5'
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
            className="flex items-center gap-2 text-lg font-bold"
          >
            <Logo className="size-8 text-[#22D3EE] animate-logo-spin" />
            <span className="text-xl font-bold text-white tracking-tighter hidden sm:block">SolarSync</span>
          </Link>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 border-l border-slate-800 ml-4 pl-4 h-8">
            {menuItems.map((item) => {
              const isActive = activeSection === item.path.substring(1);
              return (
                <button
                  key={item.path}
                  onClick={() => scrollToSection(item.path)}
                  className={cn(
                    "relative flex items-center gap-2 px-5 py-2.5 text-sm font-bold transition-all duration-300 rounded-full",
                    isActive ? "text-[#22D3EE] drop-shadow-[0_0_12px_rgba(34,211,238,0.5)]" : "text-slate-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  <motion.div 
                    className="flex items-center gap-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <item.icon className={cn("h-4 w-4 transition-all", isActive && "stroke-[2.5]")} />
                    {item.label}
                  </motion.div>
                  {isActive && (
                    <motion.div
                      layoutId="activeTabUnderline"
                      className="absolute -bottom-[21px] left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#22D3EE] to-transparent shadow-[0_0_15px_rgba(34,211,238,0.8)]"
                      transition={{ type: "spring", bounce: 0.25, duration: 0.6 }}
                    />
                  )}
                </button>
              );
            })}
          </nav>
      </div>

      <div className="flex items-center gap-3">
        {/* WiFi Status Indicator with Pulse Animation */}
        <TooltipProvider>
           <Tooltip>
            <TooltipTrigger asChild>
                <div className="flex items-center">
                    <motion.div
                      animate={isConnected ? { 
                        boxShadow: ["0 0 0px rgba(34,197,94,0)", "0 0 12px rgba(34,197,94,0.4)", "0 0 0px rgba(34,197,94,0)"],
                        scale: [1, 1.05, 1]
                      } : {}}
                      transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full transition-all duration-500 border",
                        isConnected 
                          ? "bg-[#22C55E]/10 border-[#22C55E]/20" 
                          : "bg-destructive/10 border-destructive/20"
                      )}
                    >
                      <Link href="/dashboard/connectivity">
                        {isConnected ? (
                          <Wifi className="h-4 w-4 text-[#22C55E]" />
                        ) : (
                          <WifiOff className="h-4 w-4 text-destructive" />
                        )}
                        <span className="sr-only">Connectivity Status</span>
                      </Link>
                    </motion.div>
                </div>
            </TooltipTrigger>
            <TooltipContent className="bg-slate-900 border-slate-800 text-white">
              <p className="font-semibold">{isConnected ? "Device Online" : "Device Offline"}</p>
              <p className="text-xs text-slate-400">{isConnected ? "ESP is actively sending data" : "No data received in 15s"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <div className="h-6 w-px bg-slate-800 mx-1 hidden sm:block" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative rounded-full hover:bg-white/5 text-slate-300">
              <Bell className="h-5 w-5" />
            </Button>

          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-96 bg-[#0B1220] border-slate-800 text-white shadow-2xl">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-800" />
            <div className="flex flex-col gap-2 p-2 max-h-[400px] overflow-y-auto">
            {alerts.slice(0, 5).map((alert, i) => (
               <div key={alert.id && alert.id !== "" ? alert.id : `header-alert-${i}`} className="grid grid-cols-[25px_1fr] items-start gap-3 rounded-md p-2 transition-colors hover:bg-white/5">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-800">
                    <Bell className="h-3 w-3 text-slate-400" />
                </div>
                 <div className="grid gap-1">
                   <div className="flex items-center justify-between">
                     <p className="font-medium text-sm">{alert.title}</p>
                     <Badge variant="outline" className={cn('text-[10px] py-0 px-1', getSeverityBadgeClass(alert.severity))}>{alert.severity}</Badge>
                   </div>
                   <p className="text-xs text-slate-400 leading-relaxed">{alert.description}</p>
                   <p className="text-[10px] text-slate-500">{alert.timestamp}</p>
                </div>
              </div>
            ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full ring-1 ring-slate-800 p-0.5 hover:ring-[#22D3EE]/50 transition-all">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.photoURL || undefined} alt={user?.displayName || "User"} />
                        <AvatarFallback className="bg-slate-800 text-slate-300">{getInitials(user?.displayName)}</AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[#0B1220] border-slate-800 text-white shadow-2xl">
                <DropdownMenuLabel className="font-bold">My Account</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-800" />
                <DropdownMenuItem asChild className="hover:bg-white/5 cursor-pointer">
                  <Link href="/dashboard/profile">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="hover:bg-white/5 cursor-pointer">
                  <Link href="/dashboard/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-800" />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive hover:bg-destructive/10 cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>

      </div>
    </header>
  );
}

