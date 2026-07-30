"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchAuditEvents } from "@/lib/api";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { FadeIn } from "@/components/motion/fade-in";

export default function AuditPage() {
  const [action, setAction] = useState("");
  const [entityType, setEntityType] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [applied, setApplied] = useState({
    action: "",
    entity_type: "",
    from: "",
    to: "",
  });

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["audit-events", applied],
    queryFn: () =>
      fetchAuditEvents({
        action: applied.action || undefined,
        entity_type: applied.entity_type || undefined,
        from: applied.from || undefined,
        to: applied.to || undefined,
      }),
  });

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Immutable audit trail of authentication and content/project changes.
      </p>

      <form
        className="flex flex-wrap items-end gap-2 rounded-md border border-border bg-white p-4"
        onSubmit={(e) => {
          e.preventDefault();
          setApplied({
            action: action.trim(),
            entity_type: entityType.trim(),
            from,
            to,
          });
        }}
      >
        <div>
          <label htmlFor="audit-action" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">
            Action
          </label>
          <Input
            id="audit-action"
            value={action}
            onChange={(e) => setAction(e.target.value)}
            placeholder="login, cms…"
            className="w-40"
          />
        </div>
        <div>
          <label htmlFor="audit-entity" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">
            Entity
          </label>
          <Input
            id="audit-entity"
            value={entityType}
            onChange={(e) => setEntityType(e.target.value)}
            placeholder="user, news…"
            className="w-36"
          />
        </div>
        <div>
          <label htmlFor="audit-from" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">
            From
          </label>
          <Input
            id="audit-from"
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="audit-to" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">
            To
          </label>
          <Input
            id="audit-to"
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className="inline-flex h-11 items-center rounded-md bg-ocean-600 px-4 text-sm font-semibold text-white hover:bg-ocean-500 focus-ring"
        >
          {isFetching ? "Filtering…" : "Apply filters"}
        </button>
      </form>

      {isError ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-danger">
          Unable to load audit events. Auditor or administrator role required.{" "}
          <button type="button" className="font-semibold underline" onClick={() => void refetch()}>
            Retry
          </button>
        </p>
      ) : null}

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-14" />
          <Skeleton className="h-14" />
          <Skeleton className="h-14" />
        </div>
      ) : !data?.length ? (
        <EmptyState
          title="No audit events yet"
          description="Login, CMS, and project actions will appear here."
        />
      ) : (
        <FadeIn className="rounded-md border border-border bg-white shadow-sm">
          <ul className="divide-y divide-border">
            {data.map((event) => (
              <li key={event.id} className="px-4 py-3 text-sm">
                <p className="font-semibold text-navy-950">{event.action}</p>
                <p className="text-slate-600">
                  {new Date(event.created_at).toLocaleString()} ·{" "}
                  {event.actor_email || "system"}
                  {event.ip_address ? ` · ${event.ip_address}` : ""}
                  {event.entity_type
                    ? ` · ${event.entity_type}${event.entity_id != null ? `#${event.entity_id}` : ""}`
                    : ""}
                </p>
              </li>
            ))}
          </ul>
        </FadeIn>
      )}
    </div>
  );
}
