import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import HomeContent from '@/components/HomeContent';

const BASE_URL = 'https://solar-sync-x.vercel.app';

export const metadata: Metadata = {
  title: 'SolarSyncX — AI-Powered Solar Efficiency Dashboard',
  description:
    'SolarSyncX monitors, analyzes, and optimizes your solar panel performance with AI-powered insights. Real-time energy data, predictive maintenance alerts, and automated efficiency recommendations.',
  keywords: [
    'SolarSyncX',
    'solar monitoring app',
    'AI solar dashboard',
    'solar panel efficiency',
    'solar energy monitoring',
    'renewable energy analytics',
    'solar power optimization',
    'solar panel analytics',
    'real-time solar data',
  ],
  alternates: {
    canonical: BASE_URL,
  },
  openGraph: {
    title: 'SolarSyncX — AI-Powered Solar Efficiency Dashboard',
    description:
      'Monitor, analyze, and optimize your solar panel performance with AI-powered insights. Real-time data, predictive analytics, and automated maintenance alerts.',
    url: BASE_URL,
    siteName: 'SolarSyncX',
    images: [
      {
        url: `${BASE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'SolarSyncX AI-powered solar dashboard showing real-time energy production and efficiency metrics',
        type: 'image/png',
      },
    ],
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SolarSyncX — AI-Powered Solar Efficiency Dashboard',
    description:
      'Monitor, analyze, and optimize your solar panel performance with AI-powered insights.',
    images: [`${BASE_URL}/og-image.png`],
    creator: '@solarsyncx',
  },
};

// Server Component: renders metadata + JSON-LD, delegates UI to client component
export default function Home() {
  return (
    <>
      <JsonLd />
      <HomeContent />
    </>
  );
}