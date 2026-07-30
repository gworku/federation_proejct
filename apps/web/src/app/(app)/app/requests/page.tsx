"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  exportRequestsCsv,
  fetchRequestsFeed,
  fetchRequestsSummary,
} from "@/lib/api";
import { Badge, statusTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";

export default function RequestsReportPage() {
  const { push } = useToast();
  const summary = useQuery({
    queryKey: ["requests-summary"],
    queryFn: fetchRequestsSummary,
  });
  const feed = useQuery({
    queryKey: ["requests-feed"],
    queryFn: fetchRequestsFeed,
  });

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-white p-5 shadow-sm">
        <h1 className="font-display text-2xl text-navy-950">
          Requests feed & reports
        </h1>
        <p className="mt-1 max-w-3xl text-sm text-slate-600">
          All public website forms (technical support, contact, membership,
          training, events, partnerships, procurement, access) save into the
          backend. Administrators process them here and generate CSV reports.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            type="button"
            onClick={async () => {
              try {
                await exportRequestsCsv("all");
                push("Full requests report downloaded.", "success");
              } catch (error) {
                push(
                  error instanceof Error ? error.message : "Export failed.",
                  "error",
                );
              }
            }}
          >
            Export all requests (CSV)
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={async () => {
              try {
                await exportRequestsCsv("service-requests");
                push("Service request report downloaded.", "success");
              } catch (error) {
                push(
                  error instanceof Error ? error.message : "Export failed.",
                  "error",
                );
              }
            }}
          >
            Export technical support only
          </Button>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <article className="rounded-2xl border border-border bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Open requests
          </p>
          <p className="mt-2 font-display text-3xl text-ocean-700">
            {summary.isLoading ? "…" : summary.data?.open_total ?? 0}
          </p>
        </article>
        {(summary.data?.by_type ?? []).map((row) => (
          <article
            key={row.resource}
            className="rounded-2xl border border-border bg-white p-5 shadow-sm"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {row.label}
            </p>
            <p className="mt-2 font-display text-2xl text-navy-950">
              {row.open}{" "}
              <span className="text-sm font-sans font-normal text-slate-500">
                open / {row.total} total
              </span>
            </p>
            <Link
              href={row.href}
              className="mt-3 inline-block text-sm font-semibold text-ocean-700"
            >
              Process queue →
            </Link>
          </article>
        ))}
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-xl text-navy-950">Live request feed</h2>
        {feed.isLoading ? (
          <Skeleton className="h-28" />
        ) : !feed.data?.results.length ? (
          <EmptyState
            title="No open requests"
            description="New end-user submissions will appear here automatically."
          />
        ) : (
          feed.data.results.map((item) => (
            <article
              key={`${item.resource}-${item.id}`}
              className="rounded-2xl border border-border bg-white p-4 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {item.label}
                  </p>
                  <h3 className="font-display text-lg text-navy-950">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-600">{item.requester}</p>
                </div>
                <Badge tone={statusTone(item.status)}>
                  {item.status.replaceAll("_", " ")}
                </Badge>
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs text-slate-500">
                  {item.created_at
                    ? new Date(item.created_at).toLocaleString()
                    : "—"}
                </p>
                <Link
                  href={item.href}
                  className="text-sm font-semibold text-ocean-700"
                >
                  Open & process
                </Link>
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  );
}
