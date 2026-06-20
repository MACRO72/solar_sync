'use client';

import * as React from 'react';
import { useUser } from '@/firebase/auth/use-user';
import { useRouter } from 'next/navigation';
import { AdminDevicesPanel } from '@/components/dashboard/admin-devices-panel';
import { Loader2, ShieldAlert } from 'lucide-react';
import { GlassCard, CardContent } from '@/components/glass-card';

export default function AdminDevicesPage() {
    const { user, loading } = useUser();
    const router = useRouter();

    React.useEffect(() => {
        if (!loading && (!user || user.email !== 'nrjytube9@gmail.com')) {
            router.push('/dashboard');
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#22D3EE]" />
            </div>
        );
    }

    if (!user || user.email !== 'nrjytube9@gmail.com') {
        return (
            <div className="flex min-h-[50vh] items-center justify-center p-4">
                <GlassCard className="max-w-md w-full border-red-500/20 bg-red-500/5">
                    <CardContent className="pt-6 flex flex-col items-center text-center space-y-4">
                        <ShieldAlert className="h-12 w-12 text-red-500" />
                        <h2 className="text-xl font-bold text-white">Access Denied</h2>
                        <p className="text-slate-400">You do not have administrator privileges to view this page.</p>
                    </CardContent>
                </GlassCard>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-[1200px] mx-auto w-full pb-20">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight text-white">Admin Controls</h1>
                <p className="text-slate-400">System-wide device and pairing management.</p>
            </div>
            <AdminDevicesPanel />
        </div>
    );
}
