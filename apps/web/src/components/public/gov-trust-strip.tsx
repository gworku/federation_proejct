"use client";

import { Building2, FileText, Globe2, Scale } from "lucide-react";
import { useLocale } from "@/hooks/use-locale";
import { org } from "@/lib/org";

const supervising = {
  en: "Aligned with OWEB and MoWE",
  om: "OWEB fi MoWE wajjin walqabata",
  am: "\u12a8 OWEB \u12a5\u1293 MoWE \u130b\u122d \u12e8\u1270\u1323\u1323\u1218",
} as const;

export function GovTrustStrip() {
  const { locale, t } = useLocale();

  const items = [
    {
      icon: Globe2,
      label: t.officialWebsite,
      value: org.shortName,
    },
    {
      icon: Scale,
      label: t.legalMandate,
      value: org.proclamation,
    },
    {
      icon: FileText,
      label: t.strategicPlan,
      value: org.strategicPlanPeriod,
    },
    {
      icon: Building2,
      label: t.languagesAvailable,
      value: supervising[locale],
    },
  ];

  return (
    <section
      aria-label={t.officialWebsite}
      className="border-b border-border bg-white"
    >
      <div className="h-0.5 bg-gradient-to-r from-ocean-700 via-ocean-500 to-aqua-400" aria-hidden />
      <div className="mx-auto grid max-w-7xl gap-0 divide-y divide-border px-4 sm:grid-cols-2 sm:divide-x sm:divide-y-0 sm:px-6 lg:grid-cols-4 lg:px-8">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="flex gap-3 px-0 py-5 sm:px-5 lg:px-6"
            >
              <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-sky-100 text-ocean-700">
                <Icon className="h-4 w-4" aria-hidden />
              </span>
              <p>
                <span className="block text-[11px] font-bold uppercase tracking-[0.12em] text-ocean-700">
                  {item.label}
                </span>
                <span className="mt-1 block text-sm font-semibold text-navy-950">
                  {item.value}
                </span>
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
