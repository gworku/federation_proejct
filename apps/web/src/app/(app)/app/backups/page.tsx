"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createBackup,
  deleteBackup,
  downloadBackup,
  fetchBackups,
  restoreBackup,
} from "@/lib/api";
import { getSession } from "@/lib/auth";
import { canAccess } from "@/lib/roles";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function BackupsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { push } = useToast();
  const [label, setLabel] = useState("manual");
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (!session || !canAccess(session.role, "backups")) {
      router.replace("/app/dashboard");
      return;
    }
    setAllowed(true);
  }, [router]);

  const listQuery = useQuery({
    queryKey: ["backups"],
    queryFn: fetchBackups,
    enabled: allowed,
  });

  const createMutation = useMutation({
    mutationFn: () => createBackup(label.trim() || "manual"),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["backups"] });
      push("Backup created.", "success");
    },
    onError: (error: Error) => push(error.message, "error"),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBackup,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["backups"] });
      push("Backup deleted.", "success");
    },
    onError: (error: Error) => push(error.message, "error"),
  });

  const restoreMutation = useMutation({
    mutationFn: restoreBackup,
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: ["backups"] });
      push(
        `Restore complete: ${result.rows_total.toLocaleString()} rows from ${result.filename}.`,
        "success",
      );
    },
    onError: (error: Error) => push(error.message, "error"),
  });

  if (!allowed) {
    return (
      <p className="text-sm text-slate-600">Checking backup access…</p>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-white p-5 shadow-sm">
        <h2 className="font-display text-2xl text-navy-950">System backups</h2>
        <p className="mt-1 text-sm text-slate-600">
          Administrator-only ZIP exports of OWUF application data. Create a
          backup before major changes, then restore from this page if you need
          to roll back. Uploaded media files are not included — keep those
          separately.
        </p>
        <form
          className="mt-4 flex flex-wrap items-end gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate();
          }}
        >
          <label className="min-w-48 flex-1">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">
              Label
            </span>
            <Input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="manual"
            />
          </label>
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? "Creating…" : "Create backup"}
          </Button>
        </form>
      </section>

      {listQuery.isError ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-danger">
          Unable to load backups. Administrator access is required.
        </p>
      ) : null}

      {listQuery.isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
      ) : !listQuery.data?.length ? (
        <EmptyState
          title="No backups yet"
          description="Create your first backup before major content or deployment changes."
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-sky-50">
              <tr>
                <th className="px-4 py-3">Filename</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3">Size</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {listQuery.data.map((row) => (
                <tr key={row.filename} className="border-t border-border">
                  <td className="px-4 py-3 font-medium">{row.filename}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {new Date(row.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {formatBytes(row.size_bytes)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={async () => {
                          try {
                            await downloadBackup(row.filename);
                            push("Download started.", "success");
                          } catch (error) {
                            push(
                              error instanceof Error
                                ? error.message
                                : "Download failed.",
                              "error",
                            );
                          }
                        }}
                      >
                        Download
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        disabled={restoreMutation.isPending}
                        onClick={() => {
                          const ok = window.confirm(
                            `Restore from ${row.filename}?\n\nThis replaces current application data with the backup. Create a fresh backup first if you are unsure.`,
                          );
                          if (!ok) return;
                          const typed = window.prompt(
                            'Type RESTORE to confirm you want to replace live data:',
                          );
                          if (typed?.trim().toUpperCase() !== "RESTORE") {
                            push("Restore cancelled.", "error");
                            return;
                          }
                          restoreMutation.mutate(row.filename);
                        }}
                      >
                        {restoreMutation.isPending ? "Restoring…" : "Restore"}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="danger"
                        onClick={() => {
                          if (
                            window.confirm(
                              "Delete this backup file permanently?",
                            )
                          ) {
                            deleteMutation.mutate(row.filename);
                          }
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
