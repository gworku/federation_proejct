"use client";

import Link from "next/link";
import { PageHero } from "@/components/public/page-hero";
import { Section } from "@/components/public/section";
import { useLocale } from "@/hooks/use-locale";
import { useLocaleContent } from "@/hooks/use-locale-content";
import { org } from "@/lib/org";

const powersByLocale = {
  en: [
    "Coordinate member organizations and unions under regional water and sewage policy.",
    "Establish joint procurement systems for standardized water-sector inputs.",
    "Facilitate tax-exemption and related benefits for members with concerned bodies.",
    "Resolve disputes among members in collaboration with relevant authorities.",
    "Advise and represent members; litigate where problems exceed member capacity.",
    "Propose laws and manuals to modernize potable water and sewage services.",
    "Prepare and implement the Federation strategic plan to address supply challenges.",
    "Mobilize financial and technical assistance for federation success.",
    "Promote experience sharing, training, and performance improvement.",
    "Cause forums and meetings across organizations, associations, and unions.",
  ],
  om: [
    "Dhaabbilee miseensotaa imaammata bishaanii naannoo jalatti qindeessi.",
    "Sirna bittaa waliigalaa qabeenya bishaanii mijeessi.",
    "Gargaarsa gibiraa fi faayidaalee miseensotaaf mijeessi.",
    "Walitti bu'iinsa miseensotaa furuuf deeggarsi.",
    "Gorsaa fi bakka bu'ummaa kenni; yeroo barbaachisu himata geggeessi.",
    "Seeraa fi qajeelfama tajaajila bishaanii haaromsuuf dhiyeessi.",
    "Karoora tooraawaa waldaa qopheessi fi raawwadhu.",
    "Deeggarsa maallaqaa fi teeknikaa sassaabi.",
    "Leenjii, muuxannoo qooduu, fi fooyya'iinsa raawwii guddisi.",
    "Marii fi walga'iiwwan qindeessi.",
  ],
  am: [
    "\u12a0\u1263\u120d \u12f5\u122d\u1305\u1276\u127d\u1295 \u1260\u12a8\u120d\u120d \u12e8\u12cd\u1203 \u1356\u120a\u1232 \u1235\u122d \u12eb\u1240\u1293\u1305\u120d\u1362",
    "\u12e8\u130b\u122b \u130d\u12dd \u1235\u122d\u12d6\u127d\u1295 \u12eb\u1240\u1243\u121d\u1362",
    "\u12e8\u130d\u1265\u122d \u1290\u133b \u12a5\u1293 \u1270\u12db\u121b\u132a \u130d\u1245\u121e\u127d\u1295 \u12eb\u1240\u120b\u1245\u120d\u1362",
    "\u12e8\u12a0\u1263\u120b\u1275 \u12a0\u120d\u12eb\u1276\u127d\u1295 \u1208\u1218\u134d\u1273\u1275 \u12ed\u12f0\u130d\u134b\u120d\u1362",
    "\u121d\u12ad\u122d \u12a5\u1293 \u12cd\u12ad\u120d\u1293 \u12ed\u1230\u1323\u1363 \u12a0\u1235\u1348\u120b\u130a \u12ed\u12f0\u130d\u134b\u120d\u1362",
    "\u12e8\u12cd\u1203 \u12a0\u1308\u120d\u130d\u120e\u1275 \u1208\u121b\u12d8\u1218\u1295 \u1205\u130e\u127d \u12ed\u12d0\u1245\u122d\u1263\u120d\u1362",
    "\u12e8\u134c\u12f4\u122c\u123d\u1295 \u1235\u1275\u122b\u1274\u1302\u12ad \u12a5\u1245\u12f5 \u12eb\u12d8\u130b\u1305\u120d\u1362",
    "\u12e8\u1308\u1295\u12d8\u1265\u1293 \u1274\u12ad\u1292\u12ab\u120d \u12f0\u130b\u134d \u12eb\u1230\u1263\u1235\u1263\u120d\u1362",
    "\u1235\u120d\u1320\u1293\u1293 \u120d\u121d\u12f5 \u1218\u130b\u122b\u1275\u1295 \u12eb\u1233\u12f5\u130b\u120d\u1362",
    "\u12e8\u12a0\u1263\u120b\u1275 \u12a5\u1293 \u12a0\u130b\u122e\u127d \u1218\u12f0\u1228\u12ab\u12ce\u127d\u1295 \u12eb\u12d8\u130b\u1303\u120d\u1362",
  ],
} as const;

const activitiesByLocale = {
  en: [
    "Technical assistance to Water Service Providers (WSPs)",
    "Capacity building programmes for WSPs",
    "Networking and advocacy for WSPs",
    "Industry insights and analysis for WSPs",
    "Forums for linkage with partners and development partners",
  ],
  om: [
    "Deeggarsa teeknikaa dhaabbilee tajaajila bishaanii",
    "Sagantaa ijaarsa dandeettii",
    "Cimdaa fi afgaaffii miseensotaa",
    "Xiinxala fi odeeffannoo industirii",
    "Marii michuuwwanii fi deeggartootaa misoomaa",
  ],
  am: [
    "\u12e8\u1274\u12ad\u1292\u12ab\u120d \u12f0\u130b\u134d \u1208\u12cd\u1203 \u12a0\u1308\u120d\u130d\u120e\u1275 \u1230\u1326\u12ce\u127d",
    "\u12e8\u12a0\u1245\u121d \u130d\u1295\u1263\u1273 \u1355\u122e\u130d\u122b\u121e\u127d",
    "\u12e8\u12a0\u1263\u120b\u1275 \u12f4\u130d\u134d \u12a5\u1293 \u1218\u122d\u1263\u122d",
    "\u12e8\u12a0\u1293\u12f1 \u1275\u1295\u1273\u1296\u127d \u12a5\u1293 \u1275\u1295\u1270\u1293",
    "\u12a8\u12a0\u130b\u122e\u127d \u130b\u122d \u12e8\u121a\u12f0\u1228\u1309 \u1218\u12f0\u1228\u12ab\u12ce\u127d",
  ],
} as const;

const introFallback = {
  en: `According to Proclamation No. 228/2020 (Megeleta Oromia), Part Five on the Potable Water and Sewage Services Federation, OWUF is mandated to coordinate member utilities, protect common interests, strengthen capacity, and advance safe water and sanitation services across Oromia.`,
  om: `Labsii Lak. 228/2020 (Labsii Oromiyaa) kutaa 5ffaa irratti hundaa'uun, OWUF dhaabbilee miseensotaa qindeessuu, fedhii waliigalaa eeguu, dandeettii cimsuu, fi tajaajila bishaanii nageenya qabu Oromiyaa keessatti guddisuuf aangoo qaba.`,
  am: `\u1260\u12a0\u12cb\u1305 \u1241\u1325\u122d 228/2020 \u1218\u1230\u1228\u1275 OWUF \u12a0\u1263\u120d \u1270\u124b\u121b\u1275\u1295 \u1208\u121b\u1240\u1293\u1300\u1275\u1363 \u12e8\u130b\u122b \u1325\u1245\u121d \u1208\u1218\u1320\u1260\u1245\u1363 \u12a0\u1245\u121d \u1208\u121b\u1320\u1293\u12a8\u122d \u12a5\u1293 \u12f0\u1205\u1295\u1290\u1271 \u12e8\u1270\u1320\u1260\u1240 \u12e8\u12cd\u1203 \u12a0\u1308\u120d\u130d\u120e\u1275 \u1260\u12a6\u122e\u121a\u12eb \u1208\u121b\u123b\u123b\u120d \u12a0\u12f5\u122b \u12a0\u1208\u12cd\u1362`,
} as const;

export default function MandatePage() {
  const { locale, t, href } = useLocale();
  const { get } = useLocaleContent(["mandate_intro"]);
  const intro = get(
    "mandate_intro",
    locale === "om"
      ? "Aangoo Seeraa"
      : locale === "am"
        ? "\u12a0\u12f5\u122b\u130a"
        : "Legal basis",
    introFallback[locale],
  );

  const titles = {
    en: "Mandate and Legal Framework",
    om: "Aangoo fi Caasaa Seeraa",
    am: "\u12a0\u12f5\u122b\u130a \u12a5\u1293 \u12e8\u1205\u130b \u121b\u12a5\u1240\u134d",
  } as const;

  const descriptions = {
    en: `Legal powers and duties of ${org.shortName} under ${org.proclamation}.`,
    om: `Aangoo fi dirqama ${org.shortName} Labsii ${org.proclamation} jalatti.`,
    am: `\u12e8${org.shortName} \u1205\u130b\u12ca \u12a0\u12f5\u122b\u12ce\u127d \u1260${org.proclamation} \u1235\u122d\u1362`,
  } as const;

  return (
    <>
      <PageHero
        title={titles[locale]}
        description={descriptions[locale]}
        breadcrumbs={[
          { label: t.home, href: href("/") },
          { label: t.mandate },
        ]}
      />
      <Section>
        <div className="grid gap-8 lg:grid-cols-3">
          <article className="border-y border-border py-8 lg:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
              {intro.title}
            </p>
            <h2 className="mt-2 font-display text-2xl text-navy-950">
              {org.proclamation}
            </h2>
            <p className="mt-4 leading-relaxed text-slate-600">{intro.body}</p>
            <p className="mt-4 leading-relaxed text-slate-600">
              {locale === "om"
                ? `Karoora Tooraawaa ${org.strategicPlanPeriod} raawwii waldaa wajjin MoWE fi OWEB, SDG 6, fi Agenda 2063 wajjin wal qunnamsiisa.`
                : locale === "am"
                  ? `\u12e8${org.strategicPlanPeriod} \u1235\u1275\u122b\u1274\u1302\u12ad \u12a5\u1245\u12f5 \u12a8 MoWE\u1363 OWEB\u1363 SDG 6 \u12a5\u1293 Agenda 2063 \u130b\u122d \u12ed\u1218\u122b\u120d\u1362`
                  : `The Strategic Plan ${org.strategicPlanPeriod} aligns federation delivery with MoWE and OWEB priorities, SDG 6, Africa Agenda 2063, and Ethiopia’s water-sector policy framework.`}
            </p>
            <h3 className="mt-8 font-display text-xl text-navy-950">
              {locale === "om"
                ? "Aangoo fi dirqama (gabaabina)"
                : locale === "am"
                  ? "\u12a0\u12f5\u122b\u12ce\u127d \u12a5\u1293 \u130d\u12f0\u12ed\u1276\u127d (\u1320\u1245\u1208\u120b)"
                  : "Powers and duties (summary)"}
            </h3>
            <ol className="mt-4 space-y-3">
              {powersByLocale[locale].map((item, index) => (
                <li key={item} className="flex gap-3 text-sm text-slate-700">
                  <span className="pt-0.5 font-mono text-xs font-semibold tabular-nums text-slate-600">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ol>
          </article>
          <aside className="space-y-4">
            <div className="border border-border bg-navy-950 p-6 text-white">
              <h2 className="font-display text-xl">
                {locale === "om"
                  ? "Hojiiwwan ijoo"
                  : locale === "am"
                    ? "\u12cb\u1293 \u12a5\u1295\u1245\u1235\u1246\u127d"
                    : "Core activities"}
              </h2>
              <ul className="mt-4 list-disc space-y-3 pl-5 text-sm text-white/80">
                {activitiesByLocale[locale].map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <Link
              href="/publications/owuf-strategic-plan-2026-2030.pdf"
              className="block border border-border bg-white px-4 py-3 text-sm font-semibold text-ocean-700 hover:bg-sky-50 focus-ring"
            >
              {locale === "om"
                ? "Karoora Tooraawaa PDF buusi"
                : locale === "am"
                  ? "\u1235\u1275\u122b\u1274\u1302\u12ad \u12a5\u1245\u12f5 PDF \u12a0\u12cd\u122d\u12f5"
                  : "Download Strategic Plan PDF"}
            </Link>
            <Link
              href={href("/about/mission-vision")}
              className="block border border-border bg-white px-4 py-3 text-sm font-semibold text-ocean-700 hover:bg-sky-50 focus-ring"
            >
              {t.missionVision}
            </Link>
          </aside>
        </div>
      </Section>
    </>
  );
}
