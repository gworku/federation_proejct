"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { pickChrome } from "@/data/public-chrome";
import { fetchNews } from "@/lib/api";
import { useLocale } from "@/hooks/use-locale";
import { PageHero } from "@/components/public/page-hero";
import { Section } from "@/components/public/section";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";

export default function NewsPage() {
  const { locale, t, href } = useLocale();
  const chrome = pickChrome("news", locale);
  const { data, isLoading } = useQuery({
    queryKey: ["public-news"],
    queryFn: () => fetchNews(false),
  });

  const items = data ?? [];

  return (
    <>
      <PageHero
        title={chrome.title}
        description={chrome.description}
        breadcrumbs={[
          { label: t.home, href: href("/") },
          { label: t.newsMedia },
        ]}
      />
      <Section>
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-600">
            {locale === "om"
              ? "Fooyya'iinsa seera qabeessa RSS tiin fudhadhu."
              : locale === "am"
                ? "\u12ed\u134b\u12ca \u12d8\u121b\u1294\u12ce\u127d\u1295 \u1260RSS \u12ed\u12ad\u1270\u1209\u1362"
                : "Subscribe to official updates via RSS for syndication and monitoring."}
          </p>
          <a
            href="/feed.xml"
            className="inline-flex items-center rounded-md border border-border px-4 py-2 text-sm font-semibold text-ocean-700 hover:bg-sky-50 focus-ring"
          >
            {t.rssFeed}
          </a>
        </div>

        {isLoading ? (
          <div className="grid gap-5 md:grid-cols-2">
            <Skeleton className="h-48 rounded-md" />
            <Skeleton className="h-48 rounded-md" />
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            title={
              locale === "om"
                ? "Oduun hin maxxanfamin"
                : locale === "am"
                  ? "\u12a5\u1235\u12ab \u12e8\u1270\u12d8\u1218\u1290 \u12dc\u1293 \u12e8\u1208\u121d"
                  : "No published news yet"
            }
          />
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {items.map((item) => (
              <article key={item.slug} className="surface-card p-6">
                <Badge>{item.category}</Badge>
                <h2 className="mt-3 font-display text-2xl text-navy-950">
                  {item.title}
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  {item.published_at
                    ? new Date(item.published_at).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : "—"}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  {item.excerpt}
                </p>
                <Link
                  href={href(`/news/${item.slug}`)}
                  className="mt-4 inline-flex text-sm font-semibold text-ocean-700 focus-ring"
                >
                  {t.readMore}
                </Link>
              </article>
            ))}
          </div>
        )}
        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href={href("/events")}
            className="text-sm font-semibold text-ocean-700 focus-ring"
          >
            {t.events} →
          </Link>
          <Link
            href={href("/gallery")}
            className="text-sm font-semibold text-ocean-700 focus-ring"
          >
            {t.gallery} →
          </Link>
        </div>
      </Section>
    </>
  );
}
