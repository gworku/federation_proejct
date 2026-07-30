"use client";

import Link from "next/link";
import { BrandLogo } from "@/components/public/brand-logo";
import { NewsletterForm } from "@/components/public/newsletter-form";
import { useLocale } from "@/hooks/use-locale";
import { useLocaleContent } from "@/hooks/use-locale-content";
import type { UiKey } from "@/lib/i18n";
import { org } from "@/lib/org";

const explore: Array<{ href: string; labelKey: UiKey }> = [
  { href: "/", labelKey: "home" },
  { href: "/about", labelKey: "about" },
  { href: "/projects", labelKey: "projects" },
  { href: "/utilities", labelKey: "memberUtilities" },
  { href: "/news", labelKey: "newsMedia" },
  { href: "/services", labelKey: "services" },
  { href: "/contact", labelKey: "contactUs" },
];

const resources: Array<{ href: string; labelKey: UiKey | "rss" }> = [
  { href: "/knowledge", labelKey: "knowledge" },
  { href: "/events", labelKey: "events" },
  { href: "/gallery", labelKey: "gallery" },
  { href: "/partnerships", labelKey: "partnerships" },
  { href: "/faq", labelKey: "faq" },
  { href: "/request-access", labelKey: "requestAccess" },
  { href: "/feed.xml", labelKey: "rss" },
];

export function SiteFooter() {
  const { locale, t, href } = useLocale();
  const { get } = useLocaleContent(["footer_blurb"]);

  const copy = {
    en: {
      tagline: "Oromia Water Utilities Federation",
      blurb:
        "Coordinating member utilities through professional standards, capacity building, and accountable public-service delivery across Oromia, Ethiopia.",
      explore: "Explore",
      resources: "Resources",
      stay: "Notices & updates",
      stayBlurb:
        "Subscribe for federation notices, publications, and service updates.",
      privacy: "Privacy Policy",
      terms: "Terms & Conditions",
      accessibility: "Accessibility Statement",
      rights: "All rights reserved.",
      official: "Official website",
      rss: "News RSS Feed",
    },
    om: {
      tagline: "Platformii waldaa seera qabeessa",
      blurb:
        "Dhaabbilee miseensotaa sadarkaa ogeessaa, leenjii, sirna dijitaalaa, fi tajaajila hawaasa amanamaa tiin Oromiyaa keessatti qindeessa.",
      explore: "Ilaali",
      resources: "Qabeenya",
      stay: "Odeeffannoo fudhadhu",
      stayBlurb:
        "Beeksisa, maxxansa, fi fooyya'iinsa tajaajilaa argachuuf galmaa'i.",
      privacy: "Imaammata Dhuunfaa",
      terms: "Haala fi Seera",
      accessibility: "Ibsa Argamummaa",
      rights: "Mirgi hundinuu eegameera.",
      official: "Website seera qabeessa",
      rss: "RSS Oduu",
    },
    am: {
      tagline: "\u12ed\u134b\u12ca \u12e8\u134c\u12f4\u122c\u123d\u1295 \u1218\u12f5\u1228\u12ab",
      blurb:
        "\u12a0\u1263\u120d \u1270\u124b\u121b\u1275\u1295 \u1260\u1219\u12eb\u12ca \u12f0\u1228\u1303\u12ce\u127d\u1363 \u12a0\u1245\u121d \u130d\u1295\u1263\u1273\u1363 \u12f2\u1302\u1273\u120d \u1235\u122d\u12d6\u127d \u12a5\u1293 \u1270\u1320\u12eb\u1322 \u12e8\u1205\u12dd\u1265 \u12a0\u1308\u120d\u130d\u120e\u1275 \u12a8\u12a6\u122e\u121a\u12eb \u12e8\u121a\u12a0\u1240\u1293\u1305\u120d\u1362",
      explore: "\u12ed\u1218\u120d\u12a8\u1271",
      resources: "\u1201\u1265\u1276\u127d",
      stay: "\u12ed\u1205\u1291",
      stayBlurb:
        "\u1208\u1218\u130d\u1208\u133b\u12ce\u127d\u1363 \u121d\u1225\u1206\u127d \u12a5\u1293 \u12e8\u12a0\u1308\u120d\u130d\u120e\u1275 \u12d3\u12f5\u1236\u127d \u12ed\u121d\u12dd\u1308\u1261\u1362",
      privacy: "\u12e8\u130d\u120d \u130a\u1290\u129b\u1290\u1275 \u1356\u120a\u1232",
      terms: "\u12cd\u120e\u127d \u12a5\u1293 \u1201\u1294\u1273",
      accessibility: "\u12e8\u1270\u12f0\u122b\u123a\u1290\u1275 \u1218\u130d\u1208\u133b",
      rights: "\u1219\u1209 \u1218\u1265\u1276\u127d \u1270\u1320\u1265\u1240\u12cb\u120d\u1362",
      official: "\u12ed\u134b\u12ca \u12f0\u1205\u1228\u1308\u1275",
      rss: "\u12e8\u12dc\u1293 RSS",
    },
  }[locale];

  const footerCms = get("footer_blurb", copy.tagline, copy.blurb);

  const resourceLabel = (key: (typeof resources)[number]["labelKey"]) => {
    if (key === "rss") return copy.rss;
    return t[key];
  };

  return (
    <footer className="bg-navy-950 text-white" role="contentinfo">
      <div className="h-1 bg-gradient-to-r from-ocean-700 via-ocean-500 to-aqua-400" aria-hidden />
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div className="lg:col-span-1">
          <div className="flex items-center gap-3">
            <BrandLogo size={52} />
            <div>
              <p className="font-bold">{org.shortName}</p>
              <p className="text-xs text-white/75">{footerCms.title}</p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-white/80">
            {footerCms.body}
          </p>
          <p className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-aqua-400">
            {org.proclamation}
          </p>
          <p className="mt-4 text-sm text-white/75">
            {org.address[locale] ?? org.address.en}
          </p>
          <p className="mt-1 text-sm text-white/75">{org.email}</p>
          <p className="mt-1 text-sm text-white/75">{org.domain}</p>
          <Link
            href={href("/contact")}
            className="mt-5 inline-flex h-10 items-center rounded-md bg-ocean-600 px-4 text-sm font-semibold text-white hover:bg-ocean-500 focus-ring"
          >
            {t.contactUs}
          </Link>
        </div>

        <div>
          <h2 className="font-display text-lg">{copy.explore}</h2>
          <ul className="mt-4 space-y-2 text-sm text-white/75">
            {explore.map((link) => (
              <li key={link.href}>
                <Link
                  href={href(link.href)}
                  className="underline-offset-4 hover:text-white hover:underline focus-ring"
                >
                  {t[link.labelKey]}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="font-display text-lg">{copy.resources}</h2>
          <ul className="mt-4 space-y-2 text-sm text-white/75">
            {resources.map((link) => (
              <li key={link.href}>
                <Link
                  href={
                    link.href.startsWith("/feed")
                      ? link.href
                      : href(link.href)
                  }
                  className="underline-offset-4 hover:text-white hover:underline focus-ring"
                >
                  {resourceLabel(link.labelKey)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="font-display text-lg">{copy.stay}</h2>
          <p className="mt-4 text-sm text-white/75">{copy.stayBlurb}</p>
          <NewsletterForm compact />
          <ul className="mt-6 flex flex-wrap gap-3 text-xs text-white/70">
            {[
              ["/privacy", copy.privacy],
              ["/terms", copy.terms],
              ["/accessibility", copy.accessibility],
            ].map(([path, label]) => (
              <li key={path}>
                <Link
                  href={href(path)}
                  className="hover:text-white focus-ring rounded"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-white/70 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>
            © {new Date().getFullYear()}{" "}
            {org.name[locale] ?? org.name.en}. {copy.rights}
          </p>
          <p>
            {copy.official} · {org.domain}
          </p>
        </div>
      </div>
    </footer>
  );
}
