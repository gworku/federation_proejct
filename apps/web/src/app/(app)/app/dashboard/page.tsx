"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  fetchAuditEvents,
  fetchCoverage,
  fetchDashboardSummary,
  fetchProjects,
  fetchUtilities,
} from "@/lib/api";
import { getSession } from "@/lib/auth";
import { FadeIn, Stagger, StaggerItem } from "@/components/motion/fade-in";
import { Badge, statusTone } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const [name, setName] = useState("User");

  useEffect(() => {
    const session = getSession();
    if (session) setName(session.name);
  }, []);

  const summary = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: fetchDashboardSummary,
  });
  const projects = useQuery({
    queryKey: ["dashboard-projects"],
    queryFn: () => fetchProjects(),
  });
  const utilities = useQuery({
    queryKey: ["dashboard-utilities"],
    queryFn: () => fetchUtilities(),
  });
  const coverage = useQuery({
    queryKey: ["dashboard-coverage"],
    queryFn: fetchCoverage,
  });
  const audit = useQuery({
    queryKey: ["dashboard-audit"],
    queryFn: () => fetchAuditEvents(),
  });

  const chartData = useMemo(
    () =>
      (coverage.data?.zones ?? [])
        .slice()
        .sort((a, b) => b.total - a.total)
        .slice(0, 8)
        .map((zone) => ({
          zone: zone.zone.replace("Shewa", "Sh."),
          total: zone.total,
        })),
    [coverage.data],
  );

  const kpi = [
    { label: "Member utilities", value: summary.data?.utilities },
    { label: "Projects", value: summary.data?.projects },
    { label: "Published news", value: summary.data?.published_news },
    { label: "Pending access", value: summary.data?.pending_access_requests },
    ...(summary.data?.open_service_requests != null
      ? [
          {
            label: "Open service requests",
            value: summary.data.open_service_requests,
          },
        ]
      : []),
    ...(summary.data?.open_risks != null
      ? [{ label: "Open risks", value: summary.data.open_risks }]
      : []),
    ...(summary.data?.contributions_overdue != null
      ? [
          {
            label: "Contributions overdue",
            value: summary.data.contributions_overdue,
          },
        ]
      : []),
    ...(summary.data?.unread_notifications != null
      ? [
          {
            label: "Unread notifications",
            value: summary.data.unread_notifications,
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-6">
      <FadeIn>
      <section className="rounded-md bg-gradient-to-r from-navy-950 via-navy-800 to-ocean-600 p-6 text-white shadow-[var(--shadow-soft)]">
        <p className="text-sm text-aqua-400">Welcome</p>
        <h2 className="mt-1 font-display text-3xl font-semibold">{name}</h2>
        <p className="mt-2 max-w-2xl text-sm text-white/75">
          Live operational view of utilities, projects, content, and recent
          system activity.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href="/app/requests"
            className="rounded-xl bg-white/15 px-4 py-2 text-sm font-semibold hover:bg-white/25 focus-ring"
          >
            Requests & reports
          </Link>
          <Link
            href="/app/projects"
            className="rounded-xl bg-white/15 px-4 py-2 text-sm font-semibold hover:bg-white/25 focus-ring"
          >
            Projects
          </Link>
          <Link
            href="/app/cms"
            className="rounded-xl bg-white/15 px-4 py-2 text-sm font-semibold hover:bg-white/25 focus-ring"
          >
            CMS
          </Link>
          <Link
            href="/app/utilities"
            className="rounded-xl bg-white/15 px-4 py-2 text-sm font-semibold hover:bg-white/25 focus-ring"
          >
            Utilities
          </Link>
          <Link
            href="/app/risk"
            className="rounded-xl bg-white/15 px-4 py-2 text-sm font-semibold hover:bg-white/25 focus-ring"
          >
            Risk
          </Link>
          <Link
            href="/app/me"
            className="rounded-xl bg-white/15 px-4 py-2 text-sm font-semibold hover:bg-white/25 focus-ring"
          >
            M&E
          </Link>
          <Link
            href="/app/benchmarking"
            className="rounded-xl bg-white/15 px-4 py-2 text-sm font-semibold hover:bg-white/25 focus-ring"
          >
            Benchmarking
          </Link>
          <Link
            href="/app/finance"
            className="rounded-xl bg-white/15 px-4 py-2 text-sm font-semibold hover:bg-white/25 focus-ring"
          >
            Finance
          </Link>
          <Link
            href="/app/notifications"
            className="rounded-xl bg-white/15 px-4 py-2 text-sm font-semibold hover:bg-white/25 focus-ring"
          >
            Notifications
          </Link>
        </div>
      </section>
      </FadeIn>

      <Stagger className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpi.map((item) => (
          <StaggerItem key={item.label}>
          <article className="surface-card p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
              {item.label}
            </p>
            {summary.isLoading ? (
              <Skeleton className="mt-3 h-9 w-20" />
            ) : summary.isError ? (
              <p className="mt-2 text-sm text-danger">Unavailable</p>
            ) : (
              <p className="mt-2 font-display text-3xl font-semibold text-ocean-700">
                {(item.value ?? 0).toLocaleString()}
              </p>
            )}
          </article>
          </StaggerItem>
        ))}
      </Stagger>

      <section className="grid gap-4 xl:grid-cols-[1.3fr_1fr]">
        <article className="rounded-2xl border border-border bg-white p-5 shadow-sm">
          <h3 className="font-display text-xl text-navy-950">
            Utilities by zone
          </h3>
          <p className="mt-1 text-sm text-slate-600">Top zones by member count</p>
          <div className="mt-4 h-72">
            {coverage.isLoading ? (
              <Skeleton className="h-full" />
            ) : chartData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#d7e6ef" />
                  <XAxis dataKey="zone" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="total" fill="#0b6e99" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-slate-600">No coverage data.</p>
            )}
          </div>
        </article>

        <article className="rounded-2xl border border-border bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-xl text-navy-950">Recent activity</h3>
            <Link
              href="/app/audit"
              className="text-sm font-semibold text-ocean-700 focus-ring rounded"
            >
              Audit log
            </Link>
          </div>
          {audit.isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-12" />
              <Skeleton className="h-12" />
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {(audit.data ?? []).slice(0, 6).map((event) => (
                <li key={event.id} className="py-3 text-sm">
                  <p className="font-semibold text-navy-950">{event.action}</p>
                  <p className="text-xs text-slate-600">
                    {new Date(event.created_at).toLocaleString()} ·{" "}
                    {event.actor_email || "system"}
                  </p>
                </li>
              ))}
              {!audit.data?.length ? (
                <li className="py-3 text-sm text-slate-600">No recent events.</li>
              ) : null}
            </ul>
          )}
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <article className="rounded-2xl border border-border bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-xl text-navy-950">Project progress</h3>
            <Link
              href="/app/projects"
              className="text-sm font-semibold text-ocean-700 focus-ring rounded"
            >
              View all
            </Link>
          </div>
          {projects.isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-12" />
              <Skeleton className="h-12" />
            </div>
          ) : (
            <ul className="space-y-4">
              {(projects.data ?? []).slice(0, 5).map((project) => (
                <li key={project.slug}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-navy-950">
                      {project.title}
                    </p>
                    <Badge tone={statusTone(project.status)}>{project.status}</Badge>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-sky-100">
                    <div
                      className="h-full rounded-full bg-ocean-600"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className="rounded-2xl border border-border bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-xl text-navy-950">Utility status</h3>
            <Link
              href="/app/utilities"
              className="text-sm font-semibold text-ocean-700 focus-ring rounded"
            >
              Directory
            </Link>
          </div>
          {utilities.isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-12" />
              <Skeleton className="h-12" />
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {(utilities.data ?? []).slice(0, 6).map((utility) => (
                <li
                  key={utility.slug}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-navy-950">
                      {utility.name}
                    </p>
                    <p className="text-xs text-slate-600">{utility.zone}</p>
                  </div>
                  <Badge tone={statusTone(utility.status)}>{utility.status}</Badge>
                </li>
              ))}
            </ul>
          )}
        </article>
      </section>
    </div>
  );
}
