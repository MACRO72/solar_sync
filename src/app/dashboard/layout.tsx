
import * as React from 'react';

import { PageHeader } from '@/components/page-header';
import { PageTransition } from '@/components/page-transition';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <PageHeader />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <PageTransition>{children}</PageTransition>
      </main>
    </div>
  );
}
