"use client";

import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import ceoPhoto from "@/assets/ceo.png";
import { fetchLeadership } from "@/lib/api";
import { PageHero } from "@/components/public/page-hero";
import { Section } from "@/components/public/section";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocale } from "@/hooks/use-locale";

export default function LeadershipPage() {
  const { t, href } = useLocale();
  const { data, isLoading } = useQuery({
    queryKey: ["leadership"],
    queryFn: fetchLeadership,
  });

  const leaders = data ?? [];

  return (
    <>
      <PageHero
        title="Leadership and Team"
        description="Governance and professional teams guiding federation priorities across Oromia."
        breadcrumbs={[
          { label: t.home, href: href("/") },
          { label: t.about, href: href("/about") },
          { label: t.leadership },
        ]}
      />

      <Section>
        <div className="grid items-center gap-10 border-b border-border pb-14 lg:grid-cols-[minmax(0,28rem)_minmax(0,1fr)] lg:gap-16">
          <div className="ceo-portrait-frame relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-md ring-1 ring-ocean-500/25 lg:mx-0 lg:max-w-none">
            <Image
              src={ceoPhoto}
              alt="Eng. Andualem Ayyano, Chief Executive Officer of OWUF"
              fill
              className="object-cover object-top"
              sizes="(max-width: 1024px) 100vw, 448px"
              quality={92}
              placeholder="blur"
              priority
            />
          </div>
          <div className="max-w-xl text-center lg:text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ocean-700">
              Chief Executive Officer
            </p>
            <h2 className="mt-3 font-display text-3xl text-navy-950 sm:text-4xl">
              {t.ceoTitle}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-700 sm:text-lg">
              {t.ceoCaption}
            </p>
            <dl className="mt-8 grid gap-4 text-left sm:grid-cols-2">
              <div className="border-t border-border pt-4">
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Focus
                </dt>
                <dd className="mt-1.5 text-sm leading-relaxed text-slate-700">
                  Utility performance, shared standards, and reliable service delivery
                </dd>
              </div>
              <div className="border-t border-border pt-4">
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Region
                </dt>
                <dd className="mt-1.5 text-sm leading-relaxed text-slate-700">
                  Member Water Service Providers across Oromia, Ethiopia
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </Section>

      <Section>
        <h2 className="font-display text-2xl text-navy-950 sm:text-3xl">
          Governance team
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">
          Published profiles of board and management leaders.
        </p>

        {isLoading ? (
          <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        ) : leaders.length === 0 ? (
          <div className="mt-8">
            <EmptyState title="No leadership profiles published yet" />
          </div>
        ) : (
          <ul className="mt-8 divide-y divide-border border-y border-border">
            {leaders.map((person) => (
              <li
                key={person.name}
                className="grid gap-5 py-7 sm:grid-cols-[7rem_minmax(0,1fr)] sm:items-start"
              >
                <div className="relative aspect-square w-28 overflow-hidden bg-sky-100">
                  {person.photo_url ? (
                    <Image
                      src={person.photo_url}
                      alt={person.name}
                      fill
                      className="object-cover"
                      sizes="112px"
                    />
                  ) : null}
                </div>
                <div>
                  <h3 className="font-display text-xl text-navy-950">
                    {person.name}
                  </h3>
                  <p className="mt-1 text-sm font-semibold text-ocean-700">
                    {person.role}
                  </p>
                  <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">
                    {person.bio}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </>
  );
}
