"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { pickChrome } from "@/data/public-chrome";
import { useDebounce } from "@/hooks/use-debounce";
import { useLocale } from "@/hooks/use-locale";
import { fetchCoverage, fetchUtilities } from "@/lib/api";
import { CoverageMap } from "@/components/public/coverage-map";
import { PageHero } from "@/components/public/page-hero";
import { Section } from "@/components/public/section";
import { Badge, statusTone } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { FadeIn, Stagger, StaggerItem } from "@/components/motion/fade-in";
import { StatCounter } from "@/components/public/stat-counter";

export default function UtilitiesPage() {
  const { locale, t, href } = useLocale();
  const chrome = pickChrome("utilities", locale);
  const [query, setQuery] = useState("");
  const [zone, setZone] = useState("all");
  const [status, setStatus] = useState("all");
  const [grade, setGrade] = useState("all");
  const [view, setView] = useState<"analytics" | "list" | "map">("analytics");
  const debouncedQuery = useDebounce(query, 350);
  const reduceMotion = useReducedMotion();

  const coverageQuery = useQuery({
    queryKey: ["utilities-coverage"],
    queryFn: fetchCoverage,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["utilities", debouncedQuery, zone, status, grade],
    queryFn: () =>
      fetchUtilities({
        search: debouncedQuery || undefined,
        zone,
        status,
        grade,
      }),
  });

  const rows = data ?? [];

  const zones = useMemo(() => {
    const source =
      coverageQuery.data?.zones.map((z) => z.zone) ??
      (data?.length ? data.map((u) => u.zone) : []);
    return ["all", ...Array.from(new Set(source)).sort()];
  }, [coverageQuery.data, data]);

  return (
    <>
      <PageHero
        title={chrome.title}
        description={chrome.description}
        breadcrumbs={[
          { label: t.home, href: href("/") },
          { label: t.memberUtilities },
        ]}
      />
      <Section>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex border border-border bg-white">
            <button
              type="button"
              onClick={() => setView("analytics")}
              className={`px-4 py-2 text-sm font-semibold focus-ring ${
                view === "analytics" ? "bg-navy-950 text-white" : "text-navy-800"
              }`}
            >
              Analytics
            </button>
            <button
              type="button"
              onClick={() => setView("list")}
              className={`border-l border-border px-4 py-2 text-sm font-semibold focus-ring ${
                view === "list" ? "bg-navy-950 text-white" : "text-navy-800"
              }`}
            >
              List
            </button>
            <button
              type="button"
              onClick={() => setView("map")}
              className={`border-l border-border px-4 py-2 text-sm font-semibold focus-ring ${
                view === "map" ? "bg-navy-950 text-white" : "text-navy-800"
              }`}
            >
              Map
            </button>
          </div>
          {coverageQuery.data ? (
            <p className="text-sm text-slate-600">
              {coverageQuery.data.count.toLocaleString()} utilities across{" "}
              {coverageQuery.data.zones.length} zones
            </p>
          ) : null}
        </div>

        <AnimatePresence mode="wait">
        {view === "analytics" ? (
          <motion.div
            key="analytics"
            className="mb-10"
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            {coverageQuery.isLoading ? (
              <div className="grid gap-4 md:grid-cols-2">
                <Skeleton className="h-80" />
                <Skeleton className="h-80" />
              </div>
            ) : coverageQuery.data ? (
              <AnalyticsDashboard data={coverageQuery.data} />
            ) : (
              <EmptyState
                title="Analytics unavailable"
                description="Utility analytics could not be loaded."
              />
            )}
          </motion.div>
        ) : null}
        </AnimatePresence>

        {view === "map" ? (
          <FadeIn className="mb-10">
            {coverageQuery.isLoading ? (
              <Skeleton className="h-80" />
            ) : coverageQuery.data?.zones?.length ? (
              <CoverageMap
                zones={coverageQuery.data.zones}
                selectedZone={zone === "all" ? undefined : zone}
                onSelectZone={(selected) => {
                  setZone(selected);
                  setView("list");
                }}
              />
            ) : (
              <EmptyState
                title="Coverage data unavailable"
                description="Start the API and seed utilities to view the map."
              />
            )}
          </FadeIn>
        ) : null}

        <div className="mb-6 grid gap-3 md:grid-cols-2 xl:grid-cols-[1fr_190px_190px_190px]">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by utility or city…"
            aria-label="Search utilities"
          />
          <select
            value={zone}
            onChange={(e) => setZone(e.target.value)}
            className="h-11 rounded-sm border border-border bg-white px-3 text-sm focus-ring"
            aria-label="Filter by zone"
          >
            {zones.map((item) => (
              <option key={item} value={item}>
                {item === "all" ? "All zones" : item}
              </option>
            ))}
          </select>
          <select
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            className="h-11 rounded-sm border border-border bg-white px-3 text-sm focus-ring"
            aria-label="Filter by utility level"
          >
            <option value="all">All levels</option>
            {(coverageQuery.data?.grades ?? []).map((item) => (
              <option key={item.grade} value={item.grade}>
                {item.grade}
              </option>
            ))}
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-11 rounded-sm border border-border bg-white px-3 text-sm focus-ring"
            aria-label="Filter by status"
          >
            <option value="all">All statuses</option>
            <option value="Active">Active</option>
            <option value="Digitizing">Digitizing</option>
            <option value="Support Needed">Support Needed</option>
          </select>
        </div>


        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-36" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <EmptyState
            title="No utilities match your filters"
            description="Try another zone, status, or search term."
          />
        ) : (
          <>
            <p className="mb-4 text-sm text-slate-600">
              Showing {rows.length} utilit{rows.length === 1 ? "y" : "ies"}
            </p>
            <Stagger className="grid gap-4 md:grid-cols-2">
              {rows.map((utility) => (
                <StaggerItem key={utility.slug} className="h-full">
                  <article className="surface-card flex h-full flex-col gap-3 p-5 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="font-display text-xl text-navy-950">
                          {utility.name}
                        </h2>
                        <Badge tone={statusTone(utility.status)}>
                          {utility.status}
                        </Badge>
                      </div>
                      <p className="mt-2 text-sm text-slate-600">
                        {utility.city} · {utility.zone} · Grade {utility.grade}
                      </p>
                      {"customers" in utility && utility.customers ? (
                        <p className="mt-1 text-sm text-slate-600">
                          ~{Number(utility.customers).toLocaleString()} customers
                        </p>
                      ) : null}
                    </div>
                    <Link
                      href={href(`/utilities/${utility.slug}`)}
                      className="inline-flex shrink-0 text-sm font-semibold text-ocean-700 focus-ring"
                    >
                      View details
                    </Link>
                  </article>
                </StaggerItem>
              ))}
            </Stagger>
          </>
        )}
      </Section>
    </>
  );
}

const CHART_COLORS = ["#075985", "#0284c7", "#0d9488", "#f59e0b", "#8b5cf6", "#475569"];

function AnalyticsDashboard({
  data,
}: {
  data: {
    count: number;
    active_count: number;
    member_count: number;
    zone_count: number;
    grades: { grade: string; total: number }[];
    zones: {
      zone: string;
      total: number;
      active: number;
      digitizing: number;
      support_needed: number;
    }[];
  };
}) {
  const topZones = [...data.zones]
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);
  const largestZone = topZones[0];
  const dominantLevel = [...data.grades].sort((a, b) => b.total - a.total)[0];
  const activeRate = data.count ? Math.round((data.active_count / data.count) * 100) : 0;

  return (
    <div className="space-y-6">
      <Stagger className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Registered utilities", value: data.count, note: "Public directory records" },
          { label: "Administrative zones", value: data.zone_count, note: "Coverage across Oromia" },
          { label: "Active utilities", value: data.active_count, note: `${activeRate}% of records` },
          { label: "Member utilities", value: data.member_count, note: "Federation membership" },
        ].map((card) => (
          <StaggerItem key={card.label}>
          <article className="group rounded-2xl border border-border bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-ocean-200 hover:shadow-lg">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{card.label}</p>
            <p className="mt-2 font-display text-3xl font-semibold text-ocean-700">
              <StatCounter value={card.value} />
            </p>
            <p className="mt-1 text-xs text-slate-500">{card.note}</p>
          </article>
          </StaggerItem>
        ))}
      </Stagger>

      <div className="grid gap-6 xl:grid-cols-2">
        <FadeIn>
        <article className="rounded-2xl border border-border bg-white p-5 shadow-sm transition-shadow duration-300 hover:shadow-md">
          <div>
            <h2 className="font-display text-xl text-navy-950">Utilities by level</h2>
            <p className="mt-1 text-sm text-slate-600">
              Distribution across the official utility classification.
            </p>
          </div>
          <div className="mt-5 h-80" aria-label="Pie chart showing utilities by level">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.grades}
                  dataKey="total"
                  nameKey="grade"
                  innerRadius={62}
                  outerRadius={105}
                  paddingAngle={2}
                >
                  {data.grades.map((item, index) => (
                    <Cell key={item.grade} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [Number(value).toLocaleString(), "Utilities"]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {data.grades.map((item, index) => (
              <div key={item.grade} className="flex items-center justify-between gap-3 text-sm">
                <span className="flex items-center gap-2 text-slate-700">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                  />
                  {item.grade}
                </span>
                <strong className="text-navy-950">{item.total}</strong>
              </div>
            ))}
          </div>
        </article>
        </FadeIn>

        <FadeIn delay={0.08}>
        <article className="rounded-2xl border border-border bg-white p-5 shadow-sm transition-shadow duration-300 hover:shadow-md">
          <div>
            <h2 className="font-display text-xl text-navy-950">Top zones by utility count</h2>
            <p className="mt-1 text-sm text-slate-600">
              The ten zones with the largest number of registered services.
            </p>
          </div>
          <div className="mt-5 h-[390px]" aria-label="Bar chart showing top zones">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topZones} layout="vertical" margin={{ left: 18, right: 18 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" allowDecimals={false} />
                <YAxis type="category" dataKey="zone" width={112} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value) => [Number(value).toLocaleString(), "Utilities"]} />
                <Bar dataKey="total" fill="#0284c7" radius={[0, 5, 5, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
        </FadeIn>
      </div>

      <FadeIn>
      <article className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
        <h2 className="font-display text-lg text-navy-950">Key dataset insights</h2>
        <ul className="mt-3 grid gap-3 text-sm text-slate-700 md:grid-cols-3">
          <li>
            <strong className="block text-navy-950">{dominantLevel?.grade ?? "—"}</strong>
            Largest classification with {dominantLevel?.total ?? 0} utilities.
          </li>
          <li>
            <strong className="block text-navy-950">{largestZone?.zone ?? "—"}</strong>
            Highest recorded zone with {largestZone?.total ?? 0} utilities.
          </li>
          <li>
            <strong className="block text-navy-950">{activeRate}% active</strong>
            Share of directory records currently marked active.
          </li>
        </ul>
      </article>
      </FadeIn>
    </div>
  );
}
