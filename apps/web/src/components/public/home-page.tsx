"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CalendarDays, MapPin } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import ceoPhoto from "@/assets/ceo.png";
import { strategicDirection } from "@/data/content";
import { getLocalizedServices } from "@/data/localized-services";
import {
  fetchCoverage,
  fetchEvents,
  fetchGallery,
  fetchNews,
  fetchPartners,
  fetchProjects,
  fetchStatistics,
} from "@/lib/api";
import { useLocale } from "@/hooks/use-locale";
import { useLocaleContent } from "@/hooks/use-locale-content";
import { org } from "@/lib/org";
import { GovTrustStrip } from "@/components/public/gov-trust-strip";
import dynamic from "next/dynamic";
import { HomeHero } from "@/components/public/home-hero";
import { PartnerLogoStrip } from "@/components/public/partner-logo-strip";
import { ServiceIcon } from "@/components/public/service-icon";
import { StatCounter } from "@/components/public/stat-counter";
import { Section, SectionHeading } from "@/components/public/section";
import { FadeIn } from "@/components/motion/fade-in";
import { Badge, statusTone } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const CoverageMap = dynamic(
  () => import("@/components/public/coverage-map").then((mod) => mod.CoverageMap),
  {
    ssr: false,
    loading: () => <Skeleton className="h-80 rounded-md" />,
  },
);

function sectionEnabled(
  map: { get: (key: string) => { body?: string } | undefined },
  key: string,
  fallback = true,
) {
  const raw = map.get(key)?.body?.trim().toLowerCase();
  if (raw == null || raw === "") return fallback;
  return !["0", "false", "off", "no", "hidden"].includes(raw);
}

export function HomePage() {
  const { locale, t, href } = useLocale();
  const { map: localeMap } = useLocaleContent([
    "home_show_partners",
    "home_show_gallery",
    "home_show_map",
  ]);

  const showPartners = sectionEnabled(localeMap, "home_show_partners");
  const showGallery = sectionEnabled(localeMap, "home_show_gallery");
  const showMap = sectionEnabled(localeMap, "home_show_map");

  const [loadLiveContent, setLoadLiveContent] = useState(false);

  useEffect(() => {
    const handle = window.setTimeout(() => setLoadLiveContent(true), 250);
    return () => window.clearTimeout(handle);
  }, []);

  const queryDefaults = {
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    retry: false,
  } as const;

  const statsQuery = useQuery({
    queryKey: ["home-stats"],
    queryFn: fetchStatistics,
    enabled: loadLiveContent,
    ...queryDefaults,
  });
  const newsQuery = useQuery({
    queryKey: ["home-news"],
    queryFn: () => fetchNews(false),
    enabled: loadLiveContent,
    ...queryDefaults,
  });
  const projectsQuery = useQuery({
    queryKey: ["home-projects"],
    queryFn: () => fetchProjects(),
    enabled: loadLiveContent,
    ...queryDefaults,
  });
  const eventsQuery = useQuery({
    queryKey: ["home-events"],
    queryFn: () => fetchEvents(),
    enabled: loadLiveContent,
    ...queryDefaults,
  });
  const partnersQuery = useQuery({
    queryKey: ["home-partners"],
    queryFn: fetchPartners,
    enabled: loadLiveContent && showPartners,
    ...queryDefaults,
  });
  const galleryQuery = useQuery({
    queryKey: ["home-gallery"],
    queryFn: () => fetchGallery(),
    enabled: loadLiveContent && showGallery,
    ...queryDefaults,
  });
  const coverageQuery = useQuery({
    queryKey: ["home-coverage"],
    queryFn: fetchCoverage,
    enabled: loadLiveContent && showMap,
    ...queryDefaults,
  });

  const services = useMemo(() => getLocalizedServices(locale).slice(0, 6), [locale]);
  const stats = useMemo(
    () =>
      (statsQuery.data ?? [])
        .slice()
        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
        .slice(0, 4),
    [statsQuery.data],
  );
  const news = useMemo(() => newsQuery.data ?? [], [newsQuery.data]);
  const featured = useMemo(
    () => news.find((n) => n.featured) ?? news[0],
    [news],
  );
  const secondary = useMemo(
    () => news.filter((item) => item.slug !== featured?.slug).slice(0, 3),
    [featured?.slug, news],
  );
  const projects = useMemo(() => (projectsQuery.data ?? []).slice(0, 3), [projectsQuery.data]);
  const upcomingEvents = useMemo(
    () =>
      (eventsQuery.data ?? [])
        .filter((event) => new Date(event.starts_at).getTime() >= Date.now() - 86400000)
        .slice(0, 3),
    [eventsQuery.data],
  );
  const partners = useMemo(() => partnersQuery.data ?? [], [partnersQuery.data]);
  const gallery = useMemo(
    () =>
      (galleryQuery.data ?? [])
        .slice()
        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
        .slice(0, 4),
    [galleryQuery.data],
  );

  const dateLocale = locale === "am" ? "am-ET" : "en-GB";

  return (
    <>
      <HomeHero locale={locale} href={href} />

      <GovTrustStrip />

      {(statsQuery.isError ||
        projectsQuery.isError ||
        newsQuery.isError ||
        eventsQuery.isError) && (
        <Section className="!py-6">
          <div
            role="alert"
            className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
          >
            Some live content could not be loaded. Refresh the page or try again
            shortly.
            <button
              type="button"
              className="ml-3 font-semibold text-ocean-700 underline focus-ring"
              onClick={() => {
                void statsQuery.refetch();
                void projectsQuery.refetch();
                void newsQuery.refetch();
                void eventsQuery.refetch();
              }}
            >
              Retry
            </button>
          </div>
        </Section>
      )}

      <Section>
        <FadeIn className="grid items-start gap-10 lg:grid-cols-[1.35fr_1fr] lg:gap-14">
          <div>
            <SectionHeading
              eyebrow={locale === "en" ? "About the federation" : undefined}
              title={t.whoWeAre}
              description={strategicDirection.background}
            />
            <dl className="space-y-5">
              <div>
                <dt className="text-sm font-semibold text-navy-950">
                  {locale === "om"
                    ? "Kaayyoo"
                    : locale === "am"
                      ? "\u1270\u120d\u12d5\u12ae"
                      : "Mission"}
                </dt>
                <dd className="mt-1 max-w-2xl text-slate-700">
                  {strategicDirection.mission}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-semibold text-navy-950">
                  {locale === "om"
                    ? "Aangoo"
                    : locale === "am"
                      ? "\u12a0\u12f5\u122b\u130a"
                      : "Mandate"}
                </dt>
                <dd className="mt-1 max-w-2xl text-slate-700">
                  {org.proclamation}: coordinate members, build capacity,
                  advocate with OWEB and MoWE, and advance potable water and
                  sewage services across Oromia.
                </dd>
              </div>
            </dl>
            <div className="mt-8 flex flex-wrap gap-5">
              <Link
                href={href("/about")}
                className="inline-flex items-center gap-2 text-sm font-semibold text-ocean-700 hover:text-ocean-500 focus-ring"
              >
                {t.learnMore} <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href={href("/about/mission-vision")}
                className="inline-flex items-center gap-2 text-sm font-semibold text-ocean-700 hover:text-ocean-500 focus-ring"
              >
                {t.missionVision} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <aside className="surface-card border-l-4 border-l-ocean-600 bg-sky-50 p-6 sm:p-7">
            <p className="section-eyebrow">{t.strategicPlan}</p>
            <p className="mt-3 font-display text-xl font-semibold text-navy-950">
              {org.strategicPlanPeriod}
            </p>
            <p className="mt-3 text-base leading-relaxed text-slate-700">
              {locale === "om"
                ? "KRA sadii: dandeettii waldaa, miseensummaa, fi afgaaffii."
                : locale === "am"
                  ? "\u1226\u1235\u1275 \u1241\u120d\u134d \u12cd\u1324\u1275 \u1266\u1273\u12ce\u127d\u1363 \u12e8\u134c\u12f4\u122c\u123d\u1295 \u12a0\u1245\u121d\u1363 \u12e8\u12a0\u1263\u120b\u1275 \u1270\u1233\u1275\u134e \u12a5\u1293 \u12f0\u130d\u134d\u1362"
                  : "Three Key Result Areas: Federation Capacity, Members Engagement, and Communication & Advocacy."}
            </p>
            <Link
              href={href("/about/mission-vision")}
              className="mt-5 inline-flex text-sm font-semibold text-ocean-700 hover:text-ocean-500 focus-ring"
            >
              {t.missionVision}
            </Link>
          </aside>
        </FadeIn>
      </Section>

      <Section tone="water">
        <FadeIn>
        <SectionHeading
          eyebrow={locale === "en" ? "What we offer" : undefined}
          title={t.services}
          description={
            locale === "om"
              ? "Tajaajila ijoo miseensotaaf kenname."
              : locale === "am"
                ? "\u1208\u12a0\u1263\u120b\u1275 \u12e8\u121a\u1240\u122d\u1261 \u12d3\u1263\u122a \u12a0\u1308\u120d\u130d\u120e\u1276\u127d\u1362"
                : "Professional programmes that strengthen Water Service Providers and improve service delivery."
          }
          action={
            <Link
              href={href("/services")}
              className="inline-flex items-center gap-2 text-sm font-semibold text-ocean-700 focus-ring"
            >
              {t.viewAllServices} <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <li key={service.slug}>
              <Link
                href={href(`/services/${service.slug}`)}
                className="surface-card surface-card-interactive group flex h-full flex-col p-6 focus-ring"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-sky-100 text-ocean-700">
                  <ServiceIcon name={service.icon} className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-display text-lg text-navy-950 group-hover:text-ocean-700">
                  {service.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">
                  {service.description}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-ocean-700">
                  {t.learnMore} <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
        </FadeIn>
      </Section>

      {statsQuery.isLoading || stats.length > 0 ? (
        <Section>
          <FadeIn>
          <SectionHeading
            eyebrow={locale === "en" ? "Results" : undefined}
            title={
              locale === "om"
                ? "Bu'aa fi dhiibbaa"
                : locale === "am"
                  ? "\u12cd\u1324\u1275 \u12a5\u1293 \u1270\u133d\u12d3\u1296"
                  : "Impact across Oromia"
            }
            description={
              locale === "en"
                ? "Measurable outcomes from federation programmes and member utilities."
                : undefined
            }
          />
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {statsQuery.isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-28 rounded-md" />
                ))
              : stats.map((stat) => (
                  <div
                    key={stat.id}
                    className="surface-card border-t-4 border-t-ocean-600 p-5"
                  >
                    <dt className="text-sm text-slate-600">{stat.label}</dt>
                    <dd className="mt-2 font-display text-3xl font-semibold text-navy-950 sm:text-4xl">
                      <StatCounter
                        value={Number(stat.value)}
                        suffix={stat.suffix ?? ""}
                      />
                    </dd>
                  </div>
                ))}
          </dl>
          </FadeIn>
        </Section>
      ) : null}

      {(projectsQuery.isLoading || projects.length > 0) && (
        <Section tone="sky">
          <FadeIn>
          <SectionHeading
            eyebrow={locale === "en" ? "Programmes" : undefined}
            title={t.projects}
            description={
              locale === "en"
                ? "Active and recent programmes coordinated with member utilities."
                : undefined
            }
            action={
              <Link
                href={href("/projects")}
                className="inline-flex items-center gap-2 text-sm font-semibold text-ocean-700 focus-ring"
              >
                {t.viewProjects} <ArrowRight className="h-4 w-4" />
              </Link>
            }
          />
          {projectsQuery.isLoading ? (
            <div className="grid gap-4 md:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-44 rounded-md" />
              ))}
            </div>
          ) : (
            <ul className="grid gap-4 md:grid-cols-3">
              {projects.map((project) => (
                <li key={project.slug}>
                  <article className="surface-card surface-card-interactive flex h-full flex-col p-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone={statusTone(project.status)}>
                        {project.status}
                      </Badge>
                      <span className="text-xs text-slate-600">
                        {project.category}
                      </span>
                    </div>
                    <h3 className="mt-3 font-display text-xl text-navy-950">
                      {project.title}
                    </h3>
                    <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-600">
                      <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
                      {project.location}
                    </p>
                    <div className="mt-4">
                      <div className="mb-1 flex justify-between text-xs text-slate-600">
                        <span>Progress</span>
                        <span>{project.progress}%</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-sky-200">
                        <div
                          className="h-full rounded-full bg-ocean-600"
                          style={{
                            width: `${Math.min(100, Math.max(0, project.progress))}%`,
                          }}
                        />
                      </div>
                    </div>
                    <Link
                      href={href(`/projects/${project.slug}`)}
                      className="mt-4 inline-flex text-sm font-semibold text-ocean-700 focus-ring"
                    >
                      {t.viewDetails}
                    </Link>
                  </article>
                </li>
              ))}
            </ul>
          )}
          </FadeIn>
        </Section>
      )}

      {showMap &&
      (coverageQuery.isLoading || (coverageQuery.data?.zones?.length ?? 0) > 0) ? (
        <Section>
          <SectionHeading
            eyebrow={locale === "en" ? "Coverage" : undefined}
            title={t.memberUtilities}
            description={
              locale === "en"
                ? "Interactive coverage of member utilities across Oromia zones."
                : undefined
            }
            action={
              <Link
                href={href("/utilities")}
                className="inline-flex items-center gap-2 text-sm font-semibold text-ocean-700 focus-ring"
              >
                {t.viewDetails} <ArrowRight className="h-4 w-4" />
              </Link>
            }
          />
          {coverageQuery.isLoading ? (
            <Skeleton className="h-80 rounded-md" />
          ) : coverageQuery.data?.zones?.length ? (
            <CoverageMap zones={coverageQuery.data.zones} />
          ) : null}
        </Section>
      ) : null}

      <Section>
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <div className="relative grid grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] gap-3 sm:gap-4">
            <div className="ceo-portrait-frame relative aspect-[4/5] overflow-hidden rounded-md ring-1 ring-ocean-500/20">
              <Image
                src={ceoPhoto}
                alt={t.ceoTitle}
                fill
                sizes="(max-width: 1024px) 45vw, 320px"
                quality={90}
                placeholder="blur"
                className="object-cover object-top"
                loading="lazy"
              />
            </div>
            <div className="relative aspect-[4/5] self-end overflow-hidden rounded-md bg-navy-950 shadow-[var(--shadow-card)]">
              <Image
                src="/brand/photos/board.png"
                alt={t.boardTitle}
                fill
                sizes="(max-width: 1024px) 55vw, 360px"
                className="object-cover"
                loading="lazy"
              />
            </div>
          </div>
          <div>
            <p className="section-eyebrow">
              {locale === "en" ? "Governance" : t.leadership}
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold text-navy-950 sm:text-4xl">
              {t.ceoTitle}
            </h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-700">
              {t.ceoCaption}
            </p>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-600">
              {t.boardCaption}
            </p>
            <Link
              href={href("/about/leadership")}
              className="mt-6 inline-flex h-11 items-center gap-2 rounded-md bg-ocean-600 px-5 text-sm font-semibold text-white hover:bg-ocean-500 focus-ring"
            >
              {t.meetLeadership} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </Section>

      {(featured || upcomingEvents.length > 0) && (
        <Section tone="water">
          <SectionHeading
            eyebrow={locale === "en" ? "Insights" : undefined}
            title={t.latestUpdates}
            description={
              locale === "om"
                ? "Beeksisa, oduu, fi taateewwan waldaa."
                : locale === "am"
                  ? "\u12a8\u134c\u12f4\u122c\u123d\u1291 \u12e8\u1245\u122d\u1265 \u121b\u1235\u1273\u12c8\u1242\u12eb\u12ce\u127d\u1363 \u12dc\u1293 \u12a5\u1293 \u12dd\u130d\u1305\u1276\u127d\u1362"
                  : "Official announcements, news, and upcoming events from the federation."
            }
          />
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              {featured ? (
                <article className="surface-card p-6">
                  <p className="text-xs font-semibold text-ocean-700">
                    {featured.category}
                  </p>
                  <h3 className="mt-2 font-display text-2xl text-navy-950">
                    {featured.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-600">
                    {new Date(
                      featured.published_at ?? Date.now(),
                    ).toLocaleDateString(dateLocale, {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                  <p className="mt-4 text-sm leading-relaxed text-slate-700">
                    {featured.excerpt}
                  </p>
                  <Link
                    href={href(`/news/${featured.slug}`)}
                    className="mt-5 inline-flex text-sm font-semibold text-ocean-700 focus-ring"
                  >
                    {t.readMore}
                  </Link>
                </article>
              ) : null}
              {secondary.length > 0 ? (
                <ul className="mt-4 divide-y divide-border rounded-md border border-border bg-white">
                  {secondary.map((item) => (
                    <li key={item.slug} className="px-5 py-4">
                      <p className="text-xs font-semibold text-ocean-700">
                        {item.category}
                      </p>
                      <h3 className="mt-1 font-display text-lg text-navy-950">
                        {item.title}
                      </h3>
                      <Link
                        href={href(`/news/${item.slug}`)}
                        className="mt-2 inline-flex text-sm font-semibold text-ocean-700 focus-ring"
                      >
                        {t.readMore}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
              <Link
                href={href("/news")}
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-ocean-700 focus-ring"
              >
                {t.viewAllNews} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div>
              <h3 className="font-display text-xl text-navy-950">{t.events}</h3>
              {upcomingEvents.length === 0 ? (
                <p className="mt-3 text-sm text-slate-600">
                  {locale === "en"
                    ? "No upcoming events published yet."
                    : t.events}
                </p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {upcomingEvents.map((event) => (
                    <li key={event.slug} className="surface-card p-4">
                      <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-ocean-700">
                        <CalendarDays className="h-3.5 w-3.5" aria-hidden />
                        {new Date(event.starts_at).toLocaleDateString(dateLocale, {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                      <h4 className="mt-2 font-display text-lg text-navy-950">
                        {event.title}
                      </h4>
                      <p className="mt-1 text-sm text-slate-600">
                        {event.location}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
              <Link
                href={href("/events")}
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-ocean-700 focus-ring"
              >
                {t.events} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </Section>
      )}

      {showPartners && partners.length > 0 ? (
        <Section>
          <SectionHeading
            eyebrow={locale === "en" ? "Collaboration" : undefined}
            title={t.partnerships}
            description={
              locale === "en"
                ? "Institutions and partners supporting water and sanitation services."
                : undefined
            }
          />
          <PartnerLogoStrip
            partners={partners}
            viewAllHref={href("/partnerships")}
            viewAllLabel={t.partnerships}
          />
        </Section>
      ) : null}

      {showGallery && gallery.length > 0 ? (
        <Section tone="sky">
          <SectionHeading
            eyebrow={locale === "en" ? "In the field" : undefined}
            title={t.gallery}
            description={
              locale === "en"
                ? "Moments from federation forums, training, and field programmes."
                : undefined
            }
            action={
              <Link
                href={href("/gallery")}
                className="inline-flex items-center gap-2 text-sm font-semibold text-ocean-700 focus-ring"
              >
                {t.gallery} <ArrowRight className="h-4 w-4" />
              </Link>
            }
          />
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {gallery.map((item) => (
              <li key={item.id} className="surface-card overflow-hidden">
                <div className="relative aspect-[4/3] bg-navy-950">
                  {item.image_url ? (
                    <Image
                      src={item.image_url}
                      alt={item.title}
                      fill
                      sizes="(max-width: 1024px) 50vw, 25vw"
                      className="object-cover"
                      loading="lazy"
                    />
                  ) : null}
                </div>
                <div className="p-3">
                  <p className="line-clamp-2 text-sm font-semibold text-navy-950">
                    {item.title}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      <Section tone="navy" className="!py-16 sm:!py-20">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <div>
            <p className="section-eyebrow text-aqua-400 before:bg-aqua-400">
              {locale === "en" ? "Work with us" : t.contactUs}
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold text-white sm:text-4xl">
              {locale === "en"
                ? "Partner for stronger water utilities"
                : t.accessPlatform}
            </h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-white/80">
              {locale === "en"
                ? "Members, development partners, and institutions can access programmes, request collaboration, or sign in to the federation workspace."
                : t.accessPlatformBlurb}
            </p>
            <p className="mt-5 text-sm text-white/60">
              {org.email} · {org.address[locale] ?? org.address.en}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap lg:justify-end">
            <Link
              href={href("/partnerships")}
              className="inline-flex h-12 items-center justify-center rounded-md bg-ocean-600 px-6 text-sm font-semibold text-white hover:bg-ocean-500 focus-ring"
            >
              {t.partnerships}
            </Link>
            <Link
              href={href("/contact")}
              className="inline-flex h-12 items-center justify-center rounded-md border border-white/40 px-6 text-sm font-semibold text-white hover:bg-white/10 focus-ring"
            >
              {t.contactUs}
            </Link>
            <Link
              href="/login"
              className="inline-flex h-12 items-center justify-center rounded-md border border-white/40 px-6 text-sm font-semibold text-white hover:bg-white/10 focus-ring"
            >
              {t.memberPortal}
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}
