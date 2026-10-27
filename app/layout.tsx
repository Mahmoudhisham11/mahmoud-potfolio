import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, IBM_Plex_Sans_Arabic, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { CONFIG, SITE } from "@/lib/data";
import { jsonLd } from "@/lib/seo";

// self-hosted by Next.js (no request to Google at runtime, preloaded, no layout shift)
const display = Bricolage_Grotesque({ subsets: ["latin"], axes: ["opsz"], variable: "--font-display", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });
const arabic = IBM_Plex_Sans_Arabic({ subsets: ["arabic"], weight: ["400", "500", "700"], variable: "--font-arabic", display: "swap", preload: false });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: SITE.title, template: `%s | ${SITE.fullName}` },
  description: SITE.description,
  applicationName: SITE.fullName,
  authors: [{ name: SITE.fullName, url: SITE.url }],
  creator: SITE.fullName,
  publisher: SITE.fullName,
  keywords: [
    "Mahmoud Hisham", "محمود هشام", "Mahmoud Hisham software engineer", "محمود هشام مبرمج",
    "محمود هشام مهندس برمجيات", "Mahmoud Hisham portfolio", "Mahmoud Hisham Devora", "Devora",
    "software engineer Cairo", "مبرمج في القاهرة", "Next.js developer Egypt", "PHP developer", "Python developer",
    "JavaScript developer", "web developer Egypt",
  ],
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
  openGraph: {
    type: "profile",
    url: SITE.url,
    siteName: SITE.fullName,
    title: SITE.title,
    description: SITE.description,
    locale: "en_US",
    alternateLocale: ["ar_EG"],
    firstName: "Mahmoud",
    lastName: "Hisham",
    username: "mahmoudhisham",
    images: [
      { url: SITE.ogImage, width: 1200, height: 630, alt: `${SITE.fullName} (${SITE.fullNameAr}) — ${SITE.jobTitle}` },
      { url: CONFIG.photo, width: 768, height: 960, alt: `${SITE.fullName} (${SITE.fullNameAr})` },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.title,
    description: SITE.description,
    images: [SITE.ogImage],
  },
  formatDetection: { telephone: false },
  category: "technology",
  // After verifying in Google Search Console with the "HTML tag" method, paste the code here:
  // verification: { google: "PASTE-CODE-HERE" },
};

export const viewport: Viewport = {
  themeColor: "#0a0b0d",
  width: "device-width",
  initialScale: 1,
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" className={`${display.variable} ${mono.variable} ${arabic.variable}`} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd()).replace(/</g, "\\u003c") }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
