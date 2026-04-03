"use client";

import { FirebaseClientProvider } from "@/firebase/client-provider";
import { SmoothScrollProvider } from "@/components/smooth-scroll-provider";
import { Toaster } from "@/components/ui/toaster";

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <FirebaseClientProvider>
            <SmoothScrollProvider>
                {children}
                <Toaster />
            </SmoothScrollProvider>
        </FirebaseClientProvider>
    );
}