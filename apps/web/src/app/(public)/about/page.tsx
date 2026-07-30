"use client";

import Link from "next/link";
import { PageHero } from "@/components/public/page-hero";
import { Section } from "@/components/public/section";
import { strategicDirection } from "@/data/content";
import { pageCopy, pickLocalized } from "@/data/localized-pages";
import { useLocale } from "@/hooks/use-locale";
import { useLocaleContent } from "@/hooks/use-locale-content";
import { org } from "@/lib/org";

export default function AboutPage() {
  const { locale, t, href } = useLocale();
  const { get } = useLocaleContent(["about_intro"]);
  const introFallback = pickLocalized(pageCopy.aboutIntro, locale);
  const intro = get("about_intro", introFallback.title, introFallback.body);

  const labels = {
    en: {
      profile: "Institutional profile",
      hq: "Headquarters",
      legal: "Legal basis",
      contact: "Contact",
      legalLine: `The Federation operates under ${org.proclamation} and is guided by the OWUF Strategic Plan ${org.strategicPlanPeriod}, aligned with MoWE priorities, SDG 6, and Africa Agenda 2063.`,
    },
    om: {
      profile: "Ibsa Dhaabbataa",
      hq: "Tajaajila",
      legal: "Hundee seeraa",
      contact: "Qunnamtii",
      legalLine: `Waldaan Labsii ${org.proclamation} jalatti hojjeta; Karoora Tooraawaa ${org.strategicPlanPeriod} irratti hundaa'a.`,
    },
    am: {
      profile: "\u1270\u124b\u121b\u12ca \u1218\u1308\u1208\u132b",
      hq: "\u1218\u1240\u1218\u132b",
      legal: "\u1215\u130b\u12ca \u1218\u1230\u1228\u1275",
      contact: "\u1218\u1308\u129b",
      legalLine: `\u134c\u12f4\u122c\u123d\u1291 \u1260${org.proclamation} \u1235\u122d \u12ed\u1230\u122b\u120d\u1362 \u1260${org.strategicPlanPeriod} \u1235\u1275\u122b\u1274\u1302\u12ad \u12a5\u1245\u12f5 \u12ed\u1218\u122b\u120d\u1362`,
    },
  }[locale];

  return (
    <>
      <PageHero
        title={intro.title}
        description={intro.body}
        breadcrumbs={[
          { label: t.home, href: href("/") },
          { label: t.about },
        ]}
      />
      <Section>
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_16rem]">
          <article>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ocean-700">
              {labels.profile}
            </p>
            <h2 className="mt-2 font-display text-3xl text-navy-950">
              {org.name[locale] ?? org.name.en}
            </h2>
            <p className="mt-3 text-sm text-slate-600">{org.name.en}</p>
            <p className="mt-1 text-sm text-slate-600">{org.name.om}</p>
            <p className="mt-1 text-sm text-slate-600">{org.name.am}</p>
            <div className="mt-6 max-w-2xl space-y-4 text-base leading-relaxed text-slate-700">
              <p>{intro.body}</p>
              {locale === "en" ? (
                <>
                  <p>{strategicDirection.background}</p>
                  <p>{strategicDirection.history}</p>
                </>
              ) : null}
              <p>{labels.legalLine}</p>
            </div>
            <dl className="mt-8 grid gap-6 border-t border-border pt-6 sm:grid-cols-3">
              {[
                [labels.hq, org.address[locale] ?? org.address.en],
                [labels.legal, org.proclamation],
                [labels.contact, org.email],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-ocean-700">
                    {label}
                  </dt>
                  <dd className="mt-1 text-sm text-navy-900">{value}</dd>
                </div>
              ))}
            </dl>
          </article>
          <aside className="surface-card h-fit p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
              {locale === "om"
                ? "Fuula walqabatan"
                : locale === "am"
                  ? "\u12e8\u1270\u12ab\u12a8\u1209 \u1308\u133d\u1276\u127d"
                  : "Related pages"}
            </p>
            <nav className="mt-4 flex flex-col gap-1" aria-label={t.about}>
              {[
                ["/mandate", t.mandate],
                ["/about/mission-vision", t.missionVision],
                ["/about/leadership", t.leadership],
                ["/partnerships", t.partnerships],
                ["/knowledge", t.knowledge],
                ["/services", t.services],
                ["/contact", t.contactUs],
              ].map(([path, label]) => (
                <Link
                  key={path}
                  href={href(path)}
                  className="rounded-md border-l-2 border-transparent py-2.5 pl-3 text-sm font-semibold text-ocean-700 hover:border-ocean-600 hover:bg-sky-50 focus-ring"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </aside>
        </div>
      </Section>
    </>
  );
}
