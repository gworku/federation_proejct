import type { Metadata, Viewport } from "next";
import {
  Noto_Sans_Ethiopic,
  Source_Sans_3,
  Source_Serif_4,
} from "next/font/google";
import { Providers } from "@/components/providers";
import { SkipToContent } from "@/components/public/skip-to-content";
import { JsonLd } from "@/components/seo/json-ld";
import { org } from "@/lib/org";
import {
  getRequestLocale,
  htmlLangFor,
  ogLocaleFor,
} from "@/lib/request-locale";
import {
  DEFAULT_OG_IMAGE,
  SITE_URL,
  buildMetadata,
  organizationJsonLd,
  siteConfig,
  websiteJsonLd,
} from "@/lib/seo";
import "./globals.css";

const display = Source_Serif_4({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

const body = Source_Sans_3({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const ethiopic = Noto_Sans_Ethiopic({
  variable: "--font-ethiopic",
  subsets: ["ethiopic"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: false,
});

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const base = buildMetadata({
    title: `${org.shortName} — Oromia Water Utilities Federation`,
    description: siteConfig.description,
    path: "/",
    contentLocale: locale,
  });

  return {
    ...base,
    metadataBase: new URL(SITE_URL),
    applicationName: org.shortName,
    title: {
      default: `${org.shortName} — Oromia Water Utilities Federation`,
      template: `%s | ${org.shortName}`,
    },
    icons: {
      icon: [
        { url: "/brand/logo-owuf.png", type: "image/png" },
        { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
        { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
      ],
      apple: [
        { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      ],
    },
    openGraph: {
      ...base.openGraph,
      locale: ogLocaleFor(locale),
      images: [
        { url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: org.name.en },
      ],
    },
    verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
      ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
      : undefined,
    other: {
      "geo.region": "ET-OR",
      "geo.placename": "Finfinnee / Addis Ababa",
      "geo.position": "9.03;38.74",
      ICBM: "9.03, 38.74",
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#0b1f3a",
  width: "device-width",
  initialScale: 1,
  colorScheme: "light",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getRequestLocale();
  const lang = htmlLangFor(locale);
  const fontClass =
    locale === "am"
      ? `${display.variable} ${body.variable} ${ethiopic.variable}`
      : `${display.variable} ${body.variable}`;

  return (
    <html
      lang={lang}
      data-scroll-behavior="smooth"
      className={`${fontClass} h-full`}
    >
      <body className="min-h-full font-sans antialiased">
        <Providers>
          <SkipToContent />
          <JsonLd data={organizationJsonLd()} />
          <JsonLd data={websiteJsonLd()} />
          {children}
        </Providers>
      </body>
    </html>
  );
}
