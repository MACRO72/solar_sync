
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BarChart3,
  PanelTop,
  Lightbulb,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/icons';

const menuItems = [
  { path: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { path: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/dashboard/devices', label: 'Devices', icon: PanelTop },
  { path: '/dashboard/insights', label: 'Insights', icon: Lightbulb },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-6 text-sm font-medium">
        <Link
            href="/dashboard"
            className="flex items-center gap-2 text-lg font-semibold"
        >
            <Logo className="size-8 text-primary" />
            <span className="text-xl font-semibold">solarsync</span>
        </Link>
        {menuItems.map((item) => (
            <Link
            key={item.path}
            href={item.path}
            className={cn(
                'transition-colors hover:text-foreground',
                pathname === item.path
                ? 'text-foreground'
                : 'text-muted-foreground'
            )}
            >
            {item.label}
            </Link>
        ))}
    </nav>
  );
}
