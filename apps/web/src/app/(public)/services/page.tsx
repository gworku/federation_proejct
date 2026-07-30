"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { pickChrome } from "@/data/public-chrome";
import { getLocalizedServices } from "@/data/localized-services";
import { useLocale } from "@/hooks/use-locale";
import { PageHero } from "@/components/public/page-hero";
import { Section } from "@/components/public/section";
import { ServiceIcon } from "@/components/public/service-icon";

export default function ServicesPage() {
  const { locale, t, href } = useLocale();
  const chrome = pickChrome("services", locale);
  const services = getLocalizedServices(locale);

  return (
    <>
      <PageHero
        title={chrome.title}
        description={chrome.description}
        breadcrumbs={[
          { label: t.home, href: href("/") },
          { label: t.services },
        ]}
      />
      <Section>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <li key={service.slug}>
              <Link
                href={href(`/services/${service.slug}`)}
                className="surface-card surface-card-interactive group flex h-full flex-col p-6 focus-ring"
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-md bg-sky-100 text-ocean-700">
                  <ServiceIcon name={service.icon} className="h-5 w-5" />
                </span>
                <h2 className="mt-4 font-display text-xl text-navy-950 group-hover:text-ocean-700">
                  {service.title}
                </h2>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-700">
                  {service.description}
                </p>
                <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-ocean-700">
                  {t.learnMore}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
