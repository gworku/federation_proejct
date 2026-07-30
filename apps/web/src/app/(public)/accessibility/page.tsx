"use client";

import { PageHero } from "@/components/public/page-hero";
import { Section } from "@/components/public/section";
import { useLocale } from "@/hooks/use-locale";
import { org } from "@/lib/org";

export default function AccessibilityPage() {
  const { locale, t, href } = useLocale();

  const copy = {
    en: {
      title: "Accessibility Statement",
      description: `${org.shortName} is committed to accessible public digital services.`,
      body: [
        "We aim to conform to WCAG 2.1 Level AA for public pages: keyboard access, visible focus, sufficient contrast, skip links, and meaningful landmarks.",
        "The site supports English, Afaan Oromo, and Amharic. Amharic uses Noto Sans Ethiopic for readable Ethiopic script.",
        "If you encounter an accessibility barrier, contact us and we will respond as quickly as practicable.",
      ],
    },
    om: {
      title: "Ibsa Argamummaa",
      description: `${org.shortName} tajaajila dijitaalaa hundaaf mijataa taasisuuf kutateera.`,
      body: [
        "Fuulota ummataa WCAG 2.1 AA wajjin walsimsiisuuf ni carraaqna.",
        "Website n Afaan Ingilizii, Afaan Oromoo, fi Amaariffaa deeggara.",
        "Yoo rakkoo argamummaa argitan, nu qunnamaa — akka dandeenyutti ni deebisna.",
      ],
    },
    am: {
      title: "\u12e8\u1270\u12f0\u122b\u123a\u1290\u1275 \u1218\u130d\u1208\u133b",
      description: `${org.shortName} \u12e8\u12ed\u134b\u12ca \u12f2\u1302\u1273\u120d \u12a0\u1308\u120d\u130d\u120e\u1276\u127d \u1208\u1201\u1209\u121d \u12a5\u1295\u12f2\u12f0\u1228\u1231 \u1270\u132b\u1276\u120d\u1362`,
      body: [
        "\u12e8\u12ed\u134b\u12ca \u1308\u1338\u1276\u127d \u12a8WCAG 2.1 AA \u130b\u122d \u12a5\u1295\u12f2\u1230\u121b\u1219 \u12a5\u1295\u1235\u122b\u1208\u1295\u1362",
        "\u12f0\u1205\u1228\u1308\u1271 \u12a5\u1295\u130d\u120a\u12dd\u129b\u1363 \u12a0\u134b\u1295 \u12a6\u122e\u121e \u12a5\u1293 \u12a0\u121b\u122d\u129b\u1295 \u12ed\u12f0\u130d\u134b\u120d\u1362",
        "\u12e8\u1270\u12f0\u122b\u123a\u1290\u1275 \u12a5\u1295\u1245\u134d\u1275 \u12a8\u1308\u1320\u1219 \u12eb\u130d\u1299\u1295\u1362",
      ],
    },
  }[locale];

  return (
    <>
      <PageHero
        title={copy.title}
        description={copy.description}
        breadcrumbs={[
          { label: t.home, href: href("/") },
          { label: copy.title },
        ]}
      />
      <Section>
        <div className="prose mx-auto max-w-3xl text-slate-700">
          {copy.body.map((paragraph) => (
            <p key={paragraph} className="mt-4 leading-relaxed">
              {paragraph}
            </p>
          ))}
          <p className="mt-6">
            <a
              className="font-semibold text-ocean-700 focus-ring rounded"
              href={`mailto:${org.email}`}
            >
              {org.email}
            </a>
          </p>
        </div>
      </Section>
    </>
  );
}
