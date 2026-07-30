"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge, statusTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";

type InboxItem = {
  id: number;
  status: string;
  created_at: string;
  title: string;
  meta: string;
  body?: string;
  badge?: string;
  staff_notes?: string;
};

type Status = "new" | "in_progress" | "closed" | string;

export function StatusInbox({
  queryKey,
  description,
  emptyTitle,
  emptyDescription,
  errorMessage,
  fetchItems,
  updateStatus,
  deleteItem,
  exportCsv,
  statuses = ["new", "in_progress", "closed"] as const,
}: {
  queryKey: string;
  description: string;
  emptyTitle: string;
  emptyDescription: string;
  errorMessage: string;
  fetchItems: () => Promise<InboxItem[]>;
  updateStatus: (
    id: number,
    status: Status,
    extra?: { staff_notes?: string },
  ) => Promise<unknown>;
  deleteItem?: (id: number) => Promise<unknown>;
  exportCsv?: () => Promise<void> | void;
  statuses?: readonly string[];
}) {
  const queryClient = useQueryClient();
  const { push } = useToast();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [notes, setNotes] = useState<Record<number, string>>({});

  const { data, isLoading, isError } = useQuery({
    queryKey: [queryKey],
    queryFn: fetchItems,
  });

  const mutation = useMutation({
    mutationFn: ({
      id,
      status,
      staff_notes,
    }: {
      id: number;
      status: Status;
      staff_notes?: string;
    }) => updateStatus(id, status, { staff_notes }),
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: [queryKey] });
      const setupUrl =
        result &&
        typeof result === "object" &&
        "setup_url" in result &&
        typeof (result as { setup_url?: string }).setup_url === "string"
          ? (result as { setup_url: string }).setup_url
          : null;
      if (setupUrl) {
        push(
          `Approved. Share this one-time setup link with the user: ${setupUrl}`,
          "success",
        );
      } else {
        push("Request updated.", "success");
      }
    },
    onError: (error: Error) => push(error.message, "error"),
  });

  const remove = useMutation({
    mutationFn: (id: number) => {
      if (!deleteItem) throw new Error("Delete not available");
      return deleteItem(id);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [queryKey] });
      push("Deleted.", "success");
    },
    onError: (error: Error) => push(error.message, "error"),
  });

  const rows = useMemo(() => {
    const list = data ?? [];
    return list.filter((item) => {
      if (filter !== "all" && item.status !== filter) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.meta.toLowerCase().includes(q) ||
        (item.body ?? "").toLowerCase().includes(q)
      );
    });
  }, [data, filter, search]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <p className="text-sm text-slate-600">{description}</p>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search requests…"
            className="sm:w-56"
          />
          <select
            className="h-11 rounded-xl border border-border bg-white px-3 text-sm"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All statuses</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status.replaceAll("_", " ")}
              </option>
            ))}
          </select>
          {exportCsv ? (
            <Button
              type="button"
              variant="outline"
              onClick={async () => {
                try {
                  await exportCsv();
                  push("Report downloaded.", "success");
                } catch (error) {
                  push(
                    error instanceof Error ? error.message : "Export failed.",
                    "error",
                  );
                }
              }}
            >
              Export CSV report
            </Button>
          ) : null}
        </div>
      </div>

      {isError ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-danger">
          {errorMessage}
        </p>
      ) : null}
      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      ) : !rows.length ? (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      ) : (
        <div className="space-y-3">
          {rows.map((item) => (
            <article
              key={item.id}
              className="rounded-2xl border border-border bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-xl text-navy-950">
                    {item.title}
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">{item.meta}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {item.badge ? <Badge tone="info">{item.badge}</Badge> : null}
                  <Badge tone={statusTone(item.status)}>
                    {item.status.replaceAll("_", " ")}
                  </Badge>
                </div>
              </div>
              {item.body ? (
                <p className="mt-3 text-sm text-slate-600">{item.body}</p>
              ) : null}
              <p className="mt-2 text-xs text-slate-600">
                Received {new Date(item.created_at).toLocaleString()}
              </p>
              <label className="mt-3 block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Staff processing notes
                </span>
                <textarea
                  className="min-h-20 w-full rounded-xl border border-border px-3 py-2 text-sm"
                  value={notes[item.id] ?? item.staff_notes ?? ""}
                  onChange={(e) =>
                    setNotes((prev) => ({ ...prev, [item.id]: e.target.value }))
                  }
                  placeholder="Add internal notes while processing this request…"
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
                      staff_notes: notes[item.id] ?? item.staff_notes ?? "",
                    })
                  }
                >
                  Save notes
                </Button>
                {statuses
                  .filter((status) => status !== item.status)
                  .map((status) => (
                    <button
                      key={status}
                      type="button"
                      className="rounded-xl border border-ocean-600/30 px-3 py-2 text-sm font-semibold text-ocean-700 hover:bg-sky-50 focus-ring"
                      onClick={() =>
                        mutation.mutate({
                          id: item.id,
                          status,
                          staff_notes: notes[item.id] ?? item.staff_notes ?? "",
                        })
                      }
                    >
                      Mark {status.replaceAll("_", " ")}
                    </button>
                  ))}
                {deleteItem ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="danger"
                    onClick={() => {
                      if (window.confirm("Delete permanently?")) {
                        remove.mutate(item.id);
                      }
                    }}
                  >
                    Delete
                  </Button>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
