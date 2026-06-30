import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import AboutContent from '@/components/AboutContent';

const BASE_URL = 'https://solar-sync-x.vercel.app';

export const metadata: Metadata = {
  title: 'About SolarSyncX — AI-Powered Solar Energy Solutions',
  description:
    "Learn about SolarSyncX's mission to revolutionize solar energy management through artificial intelligence and innovative technology.",
  keywords: [
    'about SolarSyncX',
    'solar energy company',
    'AI solar technology',
    'renewable energy mission',
    'solar panel analytics company',
    'SolarSyncX team',
  ],
  alternates: {
    canonical: `${BASE_URL}/about`,
  },
  openGraph: {
    title: 'About SolarSyncX — AI-Powered Solar Energy Solutions',
    description:
      "Learn about SolarSyncX's mission to revolutionize solar energy management through artificial intelligence and innovative technology.",
    url: `${BASE_URL}/about`,
    siteName: 'SolarSyncX',
    images: [
      {
        url: `${BASE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'SolarSyncX — AI-powered solar energy monitoring and optimization platform',
        type: 'image/png',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About SolarSyncX — AI-Powered Solar Energy Solutions',
    description:
      "Learn about SolarSyncX's mission to revolutionize solar energy management through artificial intelligence and innovative technology.",
    images: [`${BASE_URL}/og-image.png`],
  },
};

// Server Component: renders metadata + JSON-LD, delegates UI to client component
export default function AboutPage() {
  return (
    <>
      <JsonLd />
      <AboutContent />
    </>
  );
}