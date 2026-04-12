
"use client";
export const runtime = 'nodejs';
import * as React from 'react';
import { PageHeader } from '@/components/page-header';
import { PageTransition } from '@/components/page-transition';
import { AppStateProvider } from '@/context/app-state-provider';
import { RouteGuard } from '@/components/auth/route-guard';
import { PhoneNumberRequirementModal } from '@/components/auth/phone-number-requirement-modal';
import { useFCM } from '@/hooks/use-fcm';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Initialize FCM for push notifications
  useFCM();

  return (
    <RouteGuard>
      <AppStateProvider>
        <div className="flex min-h-screen w-full flex-col">
          <PageHeader />
          <main className="flex flex-1 flex-col gap-3 p-3 mt-14 sm:mt-16 sm:gap-4 sm:p-4 md:gap-6 md:p-6 lg:gap-8 lg:p-8 overflow-x-hidden">
            <PageTransition>{children}</PageTransition>
          </main>
          <PhoneNumberRequirementModal />
        </div>
      </AppStateProvider>
    </RouteGuard>
  );
}
