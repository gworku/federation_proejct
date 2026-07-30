"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Suspense } from "react";
import {
  fetchEvents,
  fetchNews,
  fetchProjects,
  fetchPublications,
  fetchUtilities,
} from "@/lib/api";
import { PageHero } from "@/components/public/page-hero";
import { Section } from "@/components/public/section";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { pickChrome } from "@/data/public-chrome";
import { useLocale } from "@/hooks/use-locale";

function SearchResults() {
  const params = useSearchParams();
  const q = (params.get("q") || "").trim();
  const { locale, t, href } = useLocale();
  const chrome = pickChrome("search", locale);

  const utilities = useQuery({
    queryKey: ["search-utilities", q],
    queryFn: () => fetchUtilities({ search: q }),
    enabled: q.length > 0,
    staleTime: 60_000,
  });
  const projects = useQuery({
    queryKey: ["search-projects", q],
    queryFn: () => fetchProjects({ search: q }),
    enabled: q.length > 0,
    staleTime: 60_000,
  });
  const news = useQuery({
    queryKey: ["search-news", q],
    queryFn: () => fetchNews(false, { search: q }),
    enabled: q.length > 0,
    staleTime: 60_000,
  });
  const events = useQuery({
    queryKey: ["search-events", q],
    queryFn: () => fetchEvents({ search: q }),
    enabled: q.length > 0,
    staleTime: 60_000,
  });
  const publications = useQuery({
    queryKey: ["search-publications", q],
    queryFn: () => fetchPublications({ search: q }),
    enabled: q.length > 0,
    staleTime: 60_000,
  });

  const loading =
    utilities.isLoading ||
    projects.isLoading ||
    news.isLoading ||
    events.isLoading ||
    publications.isLoading;
  const total =
    (utilities.data?.length ?? 0) +
    (projects.data?.length ?? 0) +
    (news.data?.length ?? 0) +
    (events.data?.length ?? 0) +
    (publications.data?.length ?? 0);

  const labels = {
    utilities: t.memberUtilities,
    projects: t.projects,
    news: t.newsMedia,
    events: t.events,
    publications: t.resources,
    results: t.searchResults,
    startTitle: t.searchStartTitle,
    startBody: t.searchStartBody,
    emptyTitle: t.searchEmptyTitle,
    emptyBody: t.searchEmptyBody,
  };

  return (
    <>
      <PageHero
        title={chrome.title}
        description={
          q
            ? chrome.descriptionWithQuery.replace("{q}", q)
            : chrome.description
        }
        breadcrumbs={[
          { label: t.home, href: href("/") },
          { label: chrome.title },
        ]}
      />
      <Section>
        {!q ? (
          <EmptyState title={labels.startTitle} description={labels.startBody} />
        ) : loading ? (
          <div className="space-y-3">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </div>
        ) : total === 0 ? (
          <EmptyState title={labels.emptyTitle} description={labels.emptyBody} />
        ) : (
          <div className="space-y-8">
            <p className="text-sm text-slate-600">
              {labels.results.replace("{n}", String(total))}
            </p>

            {utilities.data && utilities.data.length > 0 ? (
              <ResultSection title={labels.utilities}>
                {utilities.data.slice(0, 12).map((item) => (
                  <ResultLink
                    key={item.slug}
                    href={href(`/utilities/${item.slug}`)}
                    title={item.name}
                    meta={`${item.city} · ${item.zone}`}
                  />
                ))}
              </ResultSection>
            ) : null}

            {projects.data && projects.data.length > 0 ? (
              <ResultSection title={labels.projects}>
                {projects.data.map((item) => (
                  <ResultLink
                    key={item.slug}
                    href={href(`/projects/${item.slug}`)}
                    title={item.title}
                    meta={`${item.location} · ${item.category}`}
                  />
                ))}
              </ResultSection>
            ) : null}

            {news.data && news.data.length > 0 ? (
              <ResultSection title={labels.news}>
                {news.data.map((item) => (
                  <ResultLink
                    key={item.slug}
                    href={href(`/news/${item.slug}`)}
                    title={item.title}
                    meta={item.category}
                  />
                ))}
              </ResultSection>
            ) : null}

            {events.data && events.data.length > 0 ? (
              <ResultSection title={labels.events}>
                {events.data.map((item) => (
                  <ResultLink
                    key={item.slug}
                    href={href("/events")}
                    title={item.title}
                    meta={`${item.location} · ${new Date(item.starts_at).toLocaleDateString(
                      locale === "am" ? "am-ET" : locale === "om" ? "om-ET" : "en-GB",
                    )}`}
                  />
                ))}
              </ResultSection>
            ) : null}

            {publications.data && publications.data.length > 0 ? (
              <ResultSection title={labels.publications}>
                {publications.data.map((item) => (
                  <ResultLink
                    key={item.slug}
                    href={href("/knowledge")}
                    title={item.title}
                    meta={item.category}
                  />
                ))}
              </ResultSection>
            ) : null}
          </div>
        )}
      </Section>
    </>
  );
}

function ResultSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="font-display text-2xl text-navy-950">{title}</h2>
      <ul className="mt-3 space-y-2">{children}</ul>
    </section>
  );
}

function ResultLink({
  href,
  title,
  meta,
}: {
  href: string;
  title: string;
  meta: string;
}) {
  return (
    <li>
      <Link
        href={href}
        className="block border border-border bg-white px-4 py-3 text-sm font-semibold text-ocean-700 hover:bg-sky-50 focus-ring"
      >
        {title}
        <span className="mt-0.5 block font-normal text-slate-600">{meta}</span>
      </Link>
    </li>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <Section>
          <Skeleton className="h-40" />
        </Section>
      }
    >
      <SearchResults />
    </Suspense>
  );
}
