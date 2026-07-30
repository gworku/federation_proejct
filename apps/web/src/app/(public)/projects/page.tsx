"use client";

import Link from "next/link";
import { MapPin } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { pickChrome } from "@/data/public-chrome";
import { fetchProjects } from "@/lib/api";
import { useLocale } from "@/hooks/use-locale";
import { PageHero } from "@/components/public/page-hero";
import { Section } from "@/components/public/section";
import { Badge, statusTone } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProjectsPage() {
  const { locale, t, href } = useLocale();
  const chrome = pickChrome("projects", locale);
  const { data, isLoading } = useQuery({
    queryKey: ["public-projects"],
    queryFn: () => fetchProjects(),
  });

  const items = data ?? [];

  return (
    <>
      <PageHero
        title={chrome.title}
        description={chrome.description}
        breadcrumbs={[
          { label: t.home, href: href("/") },
          { label: t.projects },
        ]}
      />
      <Section>
        {isLoading ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-48 rounded-md" />
            <Skeleton className="h-48 rounded-md" />
            <Skeleton className="h-48 rounded-md" />
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            title={
              locale === "om"
                ? "Pirojektiin hin maxxanfamin"
                : locale === "am"
                  ? "\u12a5\u1235\u12ab \u12e8\u1270\u12d8\u1218\u1290 \u1355\u122e\u1300\u12ad\u1275 \u12e8\u1208\u121d"
                  : "No public projects yet"
            }
          />
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {items.map((project) => (
              <article key={project.slug} className="surface-card flex flex-col p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={statusTone(project.status)}>{project.status}</Badge>
                  <span className="text-xs text-slate-600">{project.category}</span>
                </div>
                <h2 className="mt-3 font-display text-xl text-navy-950">
                  {project.title}
                </h2>
                <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-slate-600">
                  <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  {project.location}
                </p>
                <p className="mt-3 line-clamp-3 flex-1 text-sm text-slate-600">
                  {project.description}
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
            ))}
          </div>
        )}
      </Section>
    </>
  );
}
