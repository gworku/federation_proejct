"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, FileText, Newspaper, Scale } from "lucide-react";
import {
  fetchKnowledgeDocs,
  fetchPublications,
  trackKnowledgeDownload,
} from "@/lib/api";
import { pickChrome } from "@/data/public-chrome";
import { PageHero } from "@/components/public/page-hero";
import { Section } from "@/components/public/section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { useLocale } from "@/hooks/use-locale";
import type { Locale } from "@/lib/i18n";

const collectionsByLocale: Record<
  Locale,
  Array<{ title: string; description: string; href: string; icon: typeof BookOpen }>
> = {
  en: [
    {
      title: "Strategic plans & policies",
      description: "Federation strategy, sector policies, and planning frameworks.",
      href: "/knowledge",
      icon: BookOpen,
    },
    {
      title: "Legal instruments",
      description: "Proclamations, directives, and regulatory references.",
      href: "/mandate",
      icon: Scale,
    },
    {
      title: "Guidelines & manuals",
      description: "Technical guidelines, manuals, and utility standards.",
      href: "/knowledge",
      icon: FileText,
    },
    {
      title: "News & announcements",
      description: "Official updates, notices, and programme communications.",
      href: "/news",
      icon: Newspaper,
    },
  ],
  om: [
    {
      title: "Karoora tooraawaa fi imaammata",
      description: "Karoora waldaa, imaammata sektaraa, fi qaawwa karooraa.",
      href: "/knowledge",
      icon: BookOpen,
    },
    {
      title: "Meeshaalee seeraa",
      description: "Labsiiwwan, ajajaawwan, fi wabii seeraa.",
      href: "/mandate",
      icon: Scale,
    },
    {
      title: "Qajeelfama fi manaawwan",
      description: "Qajeelfama teeknikaa fi hangarduuwwan dhaabbataa.",
      href: "/knowledge",
      icon: FileText,
    },
    {
      title: "Oduu fi beeksisa",
      description: "Fooyya'iinsa seera qabeessa fi odeeffannoo sagantaa.",
      href: "/news",
      icon: Newspaper,
    },
  ],
  am: [
    {
      title: "\u1235\u1275\u122b\u1274\u1302\u12ad \u12a5\u1245\u12f6\u127d \u12a5\u1293 \u1355\u120a\u1232\u12ce\u127d",
      description: "\u12e8\u134c\u12f4\u122c\u123d\u1295 \u1235\u1275\u122b\u1274\u1302 \u12a5\u1293 \u12e8\u12d8\u122d\u134d \u1355\u120a\u1232\u12ce\u127d\u1362",
      href: "/knowledge",
      icon: BookOpen,
    },
    {
      title: "\u1205\u130b\u12ca \u1218\u1230\u1228\u1276\u127d",
      description: "\u12a0\u12cb\u1306\u127d\u1363 \u1218\u1218\u122a\u12eb\u12ce\u127d \u12a5\u1293 \u12f0\u1295\u1263\u129e\u127d\u1362",
      href: "/mandate",
      icon: Scale,
    },
    {
      title: "\u1218\u1218\u122a\u12eb\u12ce\u127d \u12a5\u1293 \u1218\u1218\u122a\u12eb\u12ce\u127d",
      description: "\u1274\u12ad\u1292\u12ab\u120d \u1218\u1218\u122a\u12eb\u12ce\u127d \u12a5\u1293 \u12f0\u1228\u1306\u127d\u1362",
      href: "/knowledge",
      icon: FileText,
    },
    {
      title: "\u12dc\u1293 \u12a5\u1293 \u121b\u1235\u1273\u12c8\u1242\u12eb\u12ce\u127d",
      description: "\u12ed\u134b\u12ca \u12dd\u121b\u1294\u12ce\u127d \u12a5\u1293 \u12e8\u1355\u122e\u130d\u122b\u121d \u1218\u1228\u1303\u12ce\u127d\u1362",
      href: "/news",
      icon: Newspaper,
    },
  ],
};

export default function KnowledgePage() {
  const { push } = useToast();
  const { locale, t, href } = useLocale();
  const chrome = pickChrome("knowledge", locale);
  const collections = collectionsByLocale[locale] ?? collectionsByLocale.en;
  const [q, setQ] = useState("");
  const [documentType, setDocumentType] = useState("");
  const [topic, setTopic] = useState("");
  const [language, setLanguage] = useState("");
  const [year, setYear] = useState("");
  const [downloading, setDownloading] = useState<string | null>(null);

  const filters = useMemo(
    () => ({
      q: q.trim() || undefined,
      document_type: documentType || undefined,
      topic: topic || undefined,
      language: language || undefined,
      year: year || undefined,
    }),
    [q, documentType, topic, language, year],
  );

  const hasActiveFilters = Boolean(
    filters.q ||
      filters.document_type ||
      filters.topic ||
      filters.language ||
      filters.year,
  );

  const { data: docs, isLoading, isError } = useQuery({
    queryKey: ["knowledge-docs", filters],
    queryFn: () => fetchKnowledgeDocs(filters),
    staleTime: 60_000,
  });

  const { data: facetDocs } = useQuery({
    queryKey: ["knowledge-docs-facets"],
    queryFn: () => fetchKnowledgeDocs(),
    enabled: hasActiveFilters,
    staleTime: 15 * 60_000,
  });

  const { data: publications, isLoading: pubsLoading } = useQuery({
    queryKey: ["knowledge-publications"],
    queryFn: () => fetchPublications(),
    staleTime: 5 * 60_000,
  });

  const facetSource = hasActiveFilters ? facetDocs : docs;

  const typeOptions = useMemo(() => {
    const values = new Set(
      (facetSource ?? []).map((d) => d.document_type).filter(Boolean),
    );
    return Array.from(values).sort();
  }, [facetSource]);

  const topicOptions = useMemo(() => {
    const values = new Set(
      (facetSource ?? []).map((d) => d.topic).filter(Boolean),
    );
    return Array.from(values).sort();
  }, [facetSource]);

  const featuredPubs =
    publications && publications.length > 0
      ? publications.slice(0, 4).map((doc) => ({
          slug: doc.slug,
          title: doc.title,
          category: doc.category,
          file_url: doc.file_url,
        }))
      : [];

  const handleDownload = async (slug: string) => {
    setDownloading(slug);
    try {
      const result = await trackKnowledgeDownload(slug);
      if (result.file_url) {
        window.open(result.file_url, "_blank", "noopener,noreferrer");
      } else {
        push("Download link unavailable for this document.", "error");
      }
    } catch (error) {
      push(
        error instanceof Error ? error.message : "Unable to download document.",
        "error",
      );
    } finally {
      setDownloading(null);
    }
  };

  return (
    <>
      <PageHero
        title={chrome.title}
        description={chrome.description}
        breadcrumbs={[
          { label: t.home, href: href("/") },
          { label: chrome.title },
        ]}
      />
      <Section>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {collections.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.title}
                href={href(item.href)}
                className="surface-card p-5 transition hover:border-ocean-500/35 focus-ring"
              >
                <Icon className="h-6 w-6 text-ocean-700" aria-hidden="true" />
                <h2 className="mt-3 font-display text-lg text-navy-950">
                  {item.title}
                </h2>
                <p className="mt-2 text-sm text-slate-600">{item.description}</p>
              </Link>
            );
          })}
        </div>

        <div className="mt-12">
          <h2 className="font-display text-2xl text-navy-950">
            Document library
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Search and filter federation knowledge documents. Downloads are
            tracked for library analytics.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <label htmlFor="knowledge-q" className="sr-only">
                Search documents
              </label>
              <Input
                id="knowledge-q"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by title or keyword…"
              />
            </div>
            <div>
              <label htmlFor="knowledge-type" className="sr-only">
                Document type
              </label>
              <select
                id="knowledge-type"
                className="w-full rounded-sm border border-border bg-white px-3.5 py-3 text-sm focus-ring"
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
              >
                <option value="">All types</option>
                {typeOptions.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="knowledge-topic" className="sr-only">
                Topic
              </label>
              <select
                id="knowledge-topic"
                className="w-full rounded-sm border border-border bg-white px-3.5 py-3 text-sm focus-ring"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              >
                <option value="">All topics</option>
                {topicOptions.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="knowledge-lang" className="sr-only">
                  Language
                </label>
                <select
                  id="knowledge-lang"
                  className="w-full rounded-sm border border-border bg-white px-3.5 py-3 text-sm focus-ring"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  <option value="">Lang</option>
                  <option value="en">English</option>
                  <option value="om">Afaan Oromo</option>
                  <option value="am">Amharic</option>
                </select>
              </div>
              <div>
                <label htmlFor="knowledge-year" className="sr-only">
                  Year
                </label>
                <Input
                  id="knowledge-year"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  placeholder="Year"
                  inputMode="numeric"
                />
              </div>
            </div>
          </div>

          {isError ? (
            <p className="mt-4 border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-warning">
              Unable to load knowledge documents.
            </p>
          ) : null}

          {isLoading ? (
            <div className="mt-6 space-y-3">
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
            </div>
          ) : !docs?.length ? (
            <div className="mt-6">
              <EmptyState
                title="No documents match your filters"
                description="Try clearing filters or browse publications below."
              />
            </div>
          ) : (
            <ul className="mt-6 divide-y divide-border border border-border bg-white">
              {docs.map((doc) => (
                <li
                  key={doc.slug}
                  className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-navy-950">{doc.title}</p>
                    <p className="mt-1 text-xs text-slate-600">
                      {[doc.document_type, doc.topic, doc.year, doc.language]
                        .filter(Boolean)
                        .join(" · ")}
                      {doc.summary ? ` — ${doc.summary}` : ""}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="info">{doc.file_type || "DOC"}</Badge>
                    <Button
                      type="button"
                      size="sm"
                      disabled={downloading === doc.slug || !doc.file_url}
                      onClick={() => handleDownload(doc.slug)}
                    >
                      {downloading === doc.slug ? "…" : t.download}
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-12">
          <h2 className="font-display text-2xl text-navy-950">
            Featured publications
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Secondary library of published federation resources.
          </p>
          {pubsLoading ? (
            <div className="mt-6 space-y-3">
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
            </div>
          ) : featuredPubs.length === 0 ? (
            <div className="mt-6">
              <EmptyState title="No publications published yet" />
            </div>
          ) : (
            <ul className="mt-6 divide-y divide-border border border-border bg-white">
              {featuredPubs.map((doc) => (
                <li key={doc.slug}>
                  <a
                    href={doc.file_url || "/knowledge"}
                    className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 text-sm hover:bg-sky-50 focus-ring"
                    target={
                      doc.file_url?.endsWith(".pdf") ? "_blank" : undefined
                    }
                    rel={
                      doc.file_url?.endsWith(".pdf")
                        ? "noopener noreferrer"
                        : undefined
                    }
                  >
                    <span className="font-medium text-navy-950">{doc.title}</span>
                    <span className="text-ocean-700">{doc.category}</span>
                  </a>
                </li>
              ))}
            </ul>
          )}
          <Link
            href="/knowledge"
            className="mt-6 inline-flex bg-ocean-600 px-5 py-3 text-sm font-semibold text-white hover:bg-ocean-500 focus-ring"
          >
            Browse knowledge resources
          </Link>
        </div>
      </Section>
    </>
  );
}
