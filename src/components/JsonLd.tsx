const BASE_URL = "https://solar-sync-x.vercel.app";

const webApplicationSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "SolarSyncX",
  url: BASE_URL,
  description:
    "SolarSyncX is an AI-powered solar energy monitoring and optimization dashboard. Monitor solar panel performance in real-time, get predictive maintenance alerts, and maximize ROI with advanced analytics.",
  applicationCategory: "UtilityApplication",
  operatingSystem: "Web Browser",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    description: "Free to get started",
  },
  author: {
    "@type": "Organization",
    name: "SolarSyncX",
    url: BASE_URL,
  },
  screenshot: `${BASE_URL}/og-image.png`,
  featureList: [
    "Real-time solar panel monitoring",
    "AI-powered predictive maintenance",
    "Energy production analytics",
    "Weather-integrated forecasting",
    "Panel-level performance insights",
    "Mobile-responsive dashboard",
  ],
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "SolarSyncX",
  url: BASE_URL,
  logo: `${BASE_URL}/favicon.svg`,
  description:
    "SolarSyncX provides AI-powered solar energy monitoring and efficiency optimization tools for solar panel owners.",
  sameAs: [],
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "SolarSyncX",
  url: BASE_URL,
  description:
    "AI-powered solar efficiency dashboard — Monitor, analyze, and optimize your solar panel performance.",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${BASE_URL}/?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

export default function JsonLd() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webApplicationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
    </>
  );
}
