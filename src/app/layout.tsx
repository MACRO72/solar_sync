import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";

const BASE_URL = "https://solar-sync-x.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "SolarSyncX — AI-Powered Solar Efficiency Dashboard",
    template: "%s | SolarSyncX",
  },
  description:
    "SolarSyncX monitors, analyzes, and optimizes your solar panel performance with AI-powered insights. Real-time energy data, predictive maintenance alerts, and automated efficiency recommendations.",
  keywords: [
    "SolarSyncX",
    "solar monitoring app",
    "AI solar dashboard",
    "solar panel efficiency",
    "solar energy monitoring",
    "renewable energy analytics",
    "solar power optimization",
    "solar panel analytics",
    "real-time solar data",
    "solar predictive maintenance",
  ],
  authors: [{ name: "SolarSyncX Team", url: BASE_URL }],
  creator: "SolarSyncX",
  publisher: "SolarSyncX",
  applicationName: "SolarSyncX",
  category: "Technology",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: BASE_URL,
    siteName: "SolarSyncX",
    title: "SolarSyncX — AI-Powered Solar Efficiency Dashboard",
    description:
      "Monitor, analyze, and optimize your solar panel performance with AI-powered insights. Real-time data, predictive analytics, and automated maintenance alerts.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "SolarSyncX — AI-Powered Solar Efficiency Dashboard showing real-time energy production and efficiency metrics",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SolarSyncX — AI-Powered Solar Efficiency Dashboard",
    description:
      "Monitor, analyze, and optimize your solar panel performance with AI-powered insights.",
    images: ["/og-image.png"],
    creator: "@solarsyncx",
  },
  alternates: {
    canonical: BASE_URL,
  },
  verification: {
    google: "LhSeQjIt-xkV8y7MgMJfluUdxs7p2SIDaE3ZAxo_Xrg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}