"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getLocalizedService, getLocalizedServices } from "@/data/localized-services";
import { useLocale } from "@/hooks/use-locale";
import { PageHero } from "@/components/public/page-hero";
import { Section } from "@/components/public/section";
import { ServiceIcon } from "@/components/public/service-icon";
import { JsonLd } from "@/components/seo/json-ld";
import { org } from "@/lib/org";

export function ServiceDetail({ slug }: { slug: string }) {
  const { locale, t, href } = useLocale();
  const service = getLocalizedService(slug, locale);
  if (!service) return null;

  const related = getLocalizedServices(locale)
    .filter((item) => item.slug !== slug)
    .slice(0, 3);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: service.title,
          description: service.description,
          provider: {
            "@type": "GovernmentOrganization",
            name: org.name.en,
            url: `https://${org.domain}`,
          },
          areaServed: "Oromia, Ethiopia",
          serviceType: service.title,
          availableLanguage: ["en", "om", "am"],
        }}
      />
      <PageHero
        title={service.title}
        description={service.description}
        breadcrumbs={[
          { label: t.home, href: href("/") },
          { label: t.services, href: href("/services") },
          { label: service.title },
        ]}
      />
      <Section>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <article>
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-md bg-sky-100 text-ocean-700">
              <ServiceIcon name={service.icon} className="h-6 w-6" />
            </div>
            <h2 className="mt-5 font-display text-2xl text-navy-950">
              {locale === "om"
                ? "Akkaataa deeggarsa"
                : locale === "am"
                  ? "\u12a5\u1295\u12f0\u12f0\u130d\u134d \u12a0\u1245\u122b\u122d\u1265"
                  : "How we support members"}
            </h2>
            <p className="prose-owuf mt-4 text-slate-700">{service.description}</p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="surface-card p-5">
                <h3 className="text-sm font-semibold text-navy-950">
                  {locale === "en" ? "Who it is for" : t.memberUtilities}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {locale === "en"
                    ? "Member Water Service Providers, utility leadership teams, and authorised federation staff coordinating delivery."
                    : service.description}
                </p>
              </div>
              <div className="surface-card p-5">
                <h3 className="text-sm font-semibold text-navy-950">
                  {locale === "en" ? "How to engage" : t.contactUs}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {locale === "en"
                    ? "Request support through the contact form, technical support channel, or your federation focal person."
                    : t.contactUs}
                </p>
              </div>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={href("/contact")}
                className="inline-flex h-11 items-center rounded-md bg-ocean-600 px-5 text-sm font-semibold text-white hover:bg-ocean-500 focus-ring"
              >
                {t.contactUs}
              </Link>
              <Link
                href={href("/technical-support")}
                className="inline-flex h-11 items-center rounded-md border border-border px-5 text-sm font-semibold text-ocean-700 hover:bg-sky-50 focus-ring"
              >
                {t.technicalSupport}
              </Link>
              <Link
                href={href("/services")}
                className="inline-flex h-11 items-center rounded-md border border-border px-5 text-sm font-semibold text-ocean-700 hover:bg-sky-50 focus-ring"
              >
                {t.viewAllServices}
              </Link>
            </div>
          </article>

          <aside>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
              {t.services}
            </p>
            <ul className="mt-3 space-y-2">
              {related.map((item) => (
                <li key={item.slug}>
                  <Link
                    href={href(`/services/${item.slug}`)}
                    className="surface-card flex items-start gap-3 p-3 transition hover:border-ocean-500/35 focus-ring"
                  >
                    <ServiceIcon
                      name={item.icon}
                      className="mt-0.5 h-4 w-4 shrink-0 text-ocean-700"
                    />
                    <span className="text-sm font-semibold text-navy-950">
                      {item.title}
                    </span>
                    <ArrowRight className="ml-auto mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </Section>
    </>
  );
}
