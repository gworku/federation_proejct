"use client";

import { motion, useReducedMotion } from "framer-motion";
import { PageHero } from "@/components/public/page-hero";
import { Section } from "@/components/public/section";
import { FadeIn } from "@/components/motion/fade-in";
import { JsonLd } from "@/components/seo/json-ld";
import { pickChrome } from "@/data/public-chrome";
import { faqsByLocale } from "@/data/localized-pages";
import { useLocale } from "@/hooks/use-locale";

export default function FaqPage() {
  const { locale, t, href } = useLocale();
  const faqs = faqsByLocale[locale] ?? faqsByLocale.en;
  const chrome = pickChrome("faq", locale);
  const reduce = useReducedMotion();

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((item) => ({
            "@type": "Question",
            name: item.q,
            acceptedAnswer: {
              "@type": "Answer",
              text: item.a,
            },
          })),
        }}
      />
      <PageHero
        title={chrome.title}
        description={chrome.description}
        breadcrumbs={[
          { label: t.home, href: href("/") },
          { label: t.faq },
        ]}
      />
      <Section>
        <FadeIn className="mx-auto max-w-3xl space-y-3">
          {faqs.map((item) => (
            <details key={item.q} className="surface-card group p-5">
              <summary className="cursor-pointer list-none font-semibold text-navy-950 focus-ring">
                {item.q}
              </summary>
              {reduce ? (
                <p className="mt-3 text-sm leading-relaxed text-slate-700">{item.a}</p>
              ) : (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-3 overflow-hidden text-sm leading-relaxed text-slate-700"
                >
                  {item.a}
                </motion.p>
              )}
            </details>
          ))}
        </FadeIn>
      </Section>
    </>
  );
}
