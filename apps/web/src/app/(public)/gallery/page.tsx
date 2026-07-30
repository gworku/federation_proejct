"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { pickChrome } from "@/data/public-chrome";
import { fetchGallery } from "@/lib/api";
import { useLocale } from "@/hooks/use-locale";
import { GalleryGrid } from "@/components/public/gallery-grid";
import { PageHero } from "@/components/public/page-hero";
import { Section } from "@/components/public/section";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";

export default function GalleryPage() {
  const { locale, t, href } = useLocale();
  const chrome = pickChrome("gallery", locale);
  const { data, isLoading } = useQuery({
    queryKey: ["public-gallery"],
    queryFn: () => fetchGallery(),
    staleTime: 60_000,
  });

  const items = (data ?? [])
    .slice()
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

  return (
    <>
      <PageHero
        title={chrome.title}
        description={chrome.description}
        breadcrumbs={[
          { label: t.home, href: href("/") },
          { label: t.gallery },
        ]}
      />
      <Section>
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="aspect-[4/3] rounded-md" />
            <Skeleton className="aspect-[4/3] rounded-md" />
            <Skeleton className="aspect-[4/3] rounded-md" />
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            title={
              locale === "om"
                ? "Suuraan hin maxxanfamin"
                : locale === "am"
                  ? "\u12a5\u1235\u12ab \u12e8\u1270\u12d8\u1218\u1290 \u134d\u1276 \u12e8\u1208\u121d"
                  : "No gallery images published yet"
            }
          />
        ) : (
          <GalleryGrid items={items} />
        )}
        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href={href("/news")}
            className="text-sm font-semibold text-ocean-700 focus-ring"
          >
            {t.newsMedia} →
          </Link>
          <Link
            href={href("/events")}
            className="text-sm font-semibold text-ocean-700 focus-ring"
          >
            {t.events} →
          </Link>
        </div>
      </Section>
    </>
  );
}
