"use client";
import { Bell, Menu } from 'lucide-react';
import { usePathname } from 'next/navigation';
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
import { SidebarTrigger } from '@/components/ui/sidebar';
import { alerts } from '@/lib/data';
import { cn } from '@/lib/utils';

const menuItems = [
  { path: '/dashboard', label: 'Overview' },
  { path: '/dashboard/analytics', label: 'Analytics' },
  { path: '/dashboard/devices', label: 'Devices' },
  { path: '/dashboard/insights', label: 'Insights' },
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
  const pathname = usePathname();
  const currentPage = menuItems.find(item => pathname.startsWith(item.path));
  const highPriorityAlerts = alerts.filter(a => a.severity === 'High').length;

  return (
    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
      <SidebarTrigger />
      <h1 className="text-xl font-semibold">{currentPage?.label}</h1>

      <div className="ml-auto flex items-center gap-2">
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
      </div>
    </header>
  );
}
