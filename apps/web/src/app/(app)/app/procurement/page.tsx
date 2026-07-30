"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  exportRequestsCsv,
  fetchProcurementInterests,
  fetchProcurementNotices,
  updateProcurementInterest,
} from "@/lib/api";
import { Badge, statusTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";

const interestStatuses = [
  "submitted",
  "under_review",
  "shortlisted",
  "declined",
] as const;

export default function ProcurementPage() {
  const queryClient = useQueryClient();
  const { push } = useToast();
  const [notes, setNotes] = useState<Record<number, string>>({});

  const noticesQuery = useQuery({
    queryKey: ["procurement-notices-admin"],
    queryFn: fetchProcurementNotices,
  });

  const interestsQuery = useQuery({
    queryKey: ["procurement-interests"],
    queryFn: fetchProcurementInterests,
  });

  const mutation = useMutation({
    mutationFn: ({
      id,
      status,
      staff_notes,
    }: {
      id: number;
      status: string;
      staff_notes?: string;
    }) => updateProcurementInterest(id, status, { staff_notes }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["procurement-interests"],
      });
      push("Interest status updated.", "success");
    },
    onError: (error: Error) => push(error.message, "error"),
  });

  const notices = noticesQuery.data ?? [];
  const interests = interestsQuery.data ?? [];

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <div>
          <h2 className="font-display text-xl text-navy-950">
            Notices summary
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Public procurement notices currently available to suppliers.
          </p>
        </div>

        {noticesQuery.isError ? (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-danger">
            Unable to load procurement notices.
          </p>
        ) : null}

        {noticesQuery.isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </div>
        ) : notices.length === 0 ? (
          <EmptyState
            title="No procurement notices"
            description="Published notices will appear here."
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {notices.map((notice) => (
              <article
                key={notice.id}
                className="rounded-2xl border border-border bg-white p-4 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h3 className="font-display text-lg text-navy-950">
                    {notice.title}
                  </h3>
                  <Badge tone={statusTone(notice.status)}>
                    {notice.status.replaceAll("_", " ")}
                  </Badge>
                </div>
                <p className="mt-2 text-xs text-slate-600">
                  {notice.category}
                  {notice.reference_code
                    ? ` · Ref ${notice.reference_code}`
                    : ""}
                  {notice.closing_at
                    ? ` · Closes ${new Date(notice.closing_at).toLocaleDateString()}`
                    : ""}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="font-display text-xl text-navy-950">
            Interest inbox
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Expressions of interest from the public Procurement page.
          </p>
          <Button
            type="button"
            variant="outline"
            className="mt-3"
            onClick={async () => {
              try {
                await exportRequestsCsv("procurement-interests");
                push("Procurement interests report downloaded.", "success");
              } catch (error) {
                push(
                  error instanceof Error ? error.message : "Export failed.",
                  "error",
                );
              }
            }}
          >
            Export interests CSV
          </Button>
        </div>

        {interestsQuery.isError ? (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-danger">
            Unable to load procurement interests. Administrator, management, or
            procurement officer access is required.
          </p>
        ) : null}

        {interestsQuery.isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
        ) : interests.length === 0 ? (
          <EmptyState
            title="No procurement interests yet"
            description="Interests submitted from /procurement will appear here."
          />
        ) : (
          <div className="space-y-3">
            {interests.map((item) => (
              <article
                key={item.id}
                className="rounded-2xl border border-border bg-white p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display text-xl text-navy-950">
                      {item.notice_title}
                    </h3>
                    <p className="mt-1 text-sm text-slate-600">
                      {item.organization} · {item.contact_name} · {item.email}
                      {item.phone ? ` · ${item.phone}` : ""}
                    </p>
                  </div>
                  <Badge tone={statusTone(item.status)}>
                    {item.status.replaceAll("_", " ")}
                  </Badge>
                </div>
                {item.message ? (
                  <p className="mt-3 text-sm text-slate-600">{item.message}</p>
                ) : null}
                <p className="mt-2 text-xs text-slate-600">
                  {new Date(item.created_at).toLocaleString()}
                </p>
                <label className="mt-3 block">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Staff processing notes
                  </span>
                  <textarea
                    className="min-h-20 w-full rounded-xl border border-border px-3 py-2 text-sm"
                    value={notes[item.id] ?? item.staff_notes ?? ""}
                    onChange={(e) =>
                      setNotes((prev) => ({
                        ...prev,
                        [item.id]: e.target.value,
                      }))
                    }
                    placeholder="Add internal notes while processing this interest…"
                  />
                </label>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={mutation.isPending}
                    onClick={() =>
                      mutation.mutate({
                        id: item.id,
                        status: item.status,
                        staff_notes:
                          notes[item.id] ?? item.staff_notes ?? "",
                      })
                    }
                  >
                    Save notes
                  </Button>
                  {interestStatuses
                    .filter((status) => status !== item.status)
                    .map((status) => (
                      <button
                        key={status}
                        type="button"
                        className="rounded-xl border border-ocean-600/30 px-4 py-2 text-sm font-semibold text-ocean-700 hover:bg-sky-50 focus-ring"
                        onClick={() =>
                          mutation.mutate({
                            id: item.id,
                            status,
                            staff_notes:
                              notes[item.id] ?? item.staff_notes ?? "",
                          })
                        }
                      >
                        {status.replaceAll("_", " ")}
                      </button>
                    ))}
                </div>              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
