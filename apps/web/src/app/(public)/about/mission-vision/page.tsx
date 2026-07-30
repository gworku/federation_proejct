"use client";

import { PageHero } from "@/components/public/page-hero";
import { Section } from "@/components/public/section";
import { strategicDirection } from "@/data/content";
import { pageCopy, pickLocalized } from "@/data/localized-pages";
import { useLocale } from "@/hooks/use-locale";
import { useLocaleContent } from "@/hooks/use-locale-content";
import { org } from "@/lib/org";

export default function MissionVisionPage() {
  const { locale, t, href } = useLocale();
  const { get } = useLocaleContent(["vision", "mission"]);
  const visionFallback = pickLocalized(pageCopy.vision, locale);
  const missionFallback = pickLocalized(pageCopy.mission, locale);
  const vision = get("vision", visionFallback.title, visionFallback.body);
  const mission = get("mission", missionFallback.title, missionFallback.body);

  const pageTitle = {
    en: "Mission, Vision and Values",
    om: "Kaayyoo, Mul'ata fi Gatiwwan",
    am: "\u1270\u120d\u12d5\u12ae\u1363 \u122b\u12d5\u12ed \u12a5\u1293 \u12a5\u1234\u1276\u127d",
  } as const;

  const pageDescription = {
    en: `Strategic direction of ${org.shortName} for ${org.strategicPlanPeriod}.`,
    om: `Tooraawwan tarsiimoo ${org.shortName} kan ${org.strategicPlanPeriod}.`,
    am: `\u12e8${org.shortName} \u12e8${org.strategicPlanPeriod} \u1235\u1275\u122b\u1274\u1302\u12ad \u12a0\u1245\u1323\u132b\u1362`,
  } as const;

  return (
    <>
      <PageHero
        title={pageTitle[locale]}
        description={pageDescription[locale]}
        breadcrumbs={[
          { label: t.home, href: href("/") },
          { label: t.about, href: href("/about") },
          { label: t.missionVision },
        ]}
      />
      <Section>
        <div className="grid gap-6 md:grid-cols-2">
          <article className="surface-card p-6">
            <h2 className="font-display text-2xl text-navy-950">{mission.title}</h2>
            <p className="mt-3 leading-relaxed text-slate-700">{mission.body}</p>
            {locale === "en" ? (
              <p className="mt-4 text-sm leading-relaxed text-slate-600">
                {strategicDirection.missionExtended}
              </p>
            ) : null}
          </article>
          <article className="surface-card p-6">
            <h2 className="font-display text-2xl text-navy-950">
              {vision.title}
            </h2>
            <p className="mt-3 leading-relaxed text-slate-700">{vision.body}</p>
          </article>
        </div>

        <div className="mt-10">
          <h2 className="font-display text-2xl text-navy-950">
            {locale === "om"
              ? "Gatiwwan Ijoo"
              : locale === "am"
                ? "\u12cb\u1293 \u12a5\u1234\u1276\u127d"
                : "Core Values"}
          </h2>
          <ul className="mt-6 divide-y divide-border border-y border-border">
            {strategicDirection.values.map((value) => (
              <li
                key={value.title}
                className="grid gap-2 py-5 sm:grid-cols-[12rem_1fr]"
              >
                <p className="text-sm font-semibold text-navy-950">
                  {value.title}
                </p>
                <p className="text-sm leading-relaxed text-slate-700">
                  {value.description}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-10">
          <h2 className="font-display text-2xl text-navy-950">
            {locale === "om"
              ? `Bu'aawwan Ijoo (${org.strategicPlanPeriod})`
              : locale === "am"
                ? `\u1241\u120d\u134d \u12e8\u12cd\u1324\u1275 \u12a0\u12ab\u1263\u1262\u12ce\u127d (${org.strategicPlanPeriod})`
                : `Key Result Areas (${org.strategicPlanPeriod})`}
          </h2>
          <ol className="mt-6 divide-y divide-border border-y border-border">
            {strategicDirection.keyResultAreas.map((kra, index) => (
              <li
                key={kra.id}
                className="grid gap-3 py-6 sm:grid-cols-[3rem_minmax(0,1fr)]"
              >
                <p className="pt-1 font-mono text-xs font-semibold tabular-nums text-slate-600">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <div>
                  <h3 className="font-display text-lg text-navy-950">
                    {kra.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-700">
                    {kra.objective}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </Section>
    </>
  );
}
