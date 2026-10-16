import type { Metadata } from "next";
import { APP_URL, BASE_DOMAIN } from "@/lib/domain";

export const SITE_NAME = "Uniflow";
export const SITE_TAGLINE =
  "University Timetable & Campus Coordination Platform | by EmannCode";
export const DEFAULT_TITLE = `${SITE_NAME} — ${SITE_TAGLINE}`;
export const DEFAULT_DESCRIPTION =
  "Uniflow (uniflowapp.xyz) is the all-in-one university timetable and campus coordination platform engineered by EmannCode. Class schedules, lecturer assignments, and real-time campus updates.";

export const SEO_KEYWORDS = [
  "uniflow",
  "uniflowapp",
  "uniflow app",
  "uniflowapp.xyz",
  "university timetable",
  "EmannCode",
  "EmannCode Uniflow",
  "Ifeoluwa Olajubaje",
  "university management system",
  "campus management platform",
  "student timetable app",
  "lecturer timetable",
  "Nigeria university software",
  "academic scheduling",
  "course management",
];

export const TWITTER_HANDLE = "@uniflowapp";

export function getSiteUrl(): string {
  return APP_URL;
}

export function getMarketingMetadata(overrides?: Partial<Metadata>): Metadata {
  const siteUrl = getSiteUrl();

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: DEFAULT_TITLE,
      template: `%s | ${SITE_NAME}`,
    },
    description: DEFAULT_DESCRIPTION,
    keywords: SEO_KEYWORDS,
    applicationName: SITE_NAME,
    authors: [{ name: "EmannCode (Ifeoluwa Olajubaje)", url: "https://emanncode.work" }],
    creator: "EmannCode (Ifeoluwa Olajubaje)",
    publisher: SITE_NAME,
    category: "education",
    alternates: {
      canonical: "/",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: siteUrl,
      siteName: SITE_NAME,
      title: DEFAULT_TITLE,
      description: DEFAULT_DESCRIPTION,
      images: [
        {
          url: "/opengraph-image",
          width: 1200,
          height: 630,
          alt: `${SITE_NAME} — ${SITE_TAGLINE}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: DEFAULT_TITLE,
      description: DEFAULT_DESCRIPTION,
      creator: TWITTER_HANDLE,
      images: ["/opengraph-image"],
    },
    icons: {
      icon: "/favicon.ico",
      apple: "/apple-icon",
    },
    verification: {
      // Paste tokens from Search Console / Bing after you verify (see SEO-CHECKLIST.md)
      google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
      other: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION
        ? {
            "msvalidate.01": process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION,
          }
        : undefined,
    },
    other: {
      "apple-mobile-web-app-title": SITE_NAME,
      "format-detection": "telephone=no",
    },
    ...overrides,
  };
}

export const PRIVATE_PORTAL_METADATA: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
};

export const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  alternateName: ["UniflowApp", "Uniflow App", "uniflowapp"],
  url: getSiteUrl(),
  logo: `${getSiteUrl()}/favicon.ico`,
  description: DEFAULT_DESCRIPTION,
  founder: {
    "@type": "Person",
    name: "EmannCode",
    alternateName: "Ifeoluwa Olajubaje",
    url: "https://emanncode.work",
  },
  sameAs: [
    "https://emanncode.work",
    process.env.NEXT_PUBLIC_SOCIAL_GITHUB,
    process.env.NEXT_PUBLIC_SOCIAL_LINKEDIN,
    process.env.NEXT_PUBLIC_SOCIAL_TWITTER,
  ].filter(Boolean),
};

export const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  alternateName: ["UniflowApp", "uniflowapp.xyz"],
  url: getSiteUrl(),
  description: DEFAULT_DESCRIPTION,
  publisher: {
    "@type": "Person",
    name: "EmannCode",
    alternateName: "Ifeoluwa Olajubaje",
    url: "https://emanncode.work",
  },
};

export const softwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: SITE_NAME,
  alternateName: "UniflowApp",
  applicationCategory: "EducationalApplication",
  operatingSystem: "Web, iOS, Android",
  url: getSiteUrl(),
  description: DEFAULT_DESCRIPTION,
  creator: {
    "@type": "Person",
    name: "EmannCode",
    alternateName: "Ifeoluwa Olajubaje",
    url: "https://emanncode.work",
  },
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    description: "Free tier available for universities",
  },
  featureList: [
    "University timetable management",
    "Multi-lecturer course assignments",
    "Student mobile app",
    "Real-time class updates",
    "Department and faculty portals",
  ],
};

export const publicSitemapPaths = ["/", "/register", "/about", "/contact", "/privacy", "/terms", "/cookies", "/security"] as const;

export { BASE_DOMAIN };