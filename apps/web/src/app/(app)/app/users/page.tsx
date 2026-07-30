"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  exportAdminUsersCsv,
  fetchAdminUsers,
  updateAdminUser,
  type AdminUserItem,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";

const ROLES = [
  "all",
  "administrator",
  "management",
  "content_editor",
  "project_officer",
  "finance_officer",
  "procurement_officer",
  "utility_user",
  "auditor",
];

export default function UsersAdminPage() {
  const { push } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [debounced, setDebounced] = useState("");

  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(search), 300);
    return () => window.clearTimeout(id);
  }, [search]);

  const query = useQuery({
    queryKey: ["admin-users", debounced, role],
    queryFn: () =>
      fetchAdminUsers({
        search: debounced || undefined,
        role,
      }),
  });

  const mutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: Parameters<typeof updateAdminUser>[1];
    }) => updateAdminUser(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      push("User updated.", "success");
    },
    onError: (error: Error) => push(error.message, "error"),
  });

  const rows = useMemo(() => query.data ?? [], [query.data]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <p className="text-sm text-slate-600">
          Activate accounts, assign roles, and require password changes for
          platform users.
        </p>
        <div className="flex flex-wrap gap-2">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search email or name…"
            className="w-56"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="h-11 rounded-md border border-border bg-white px-3 text-sm focus-ring"
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r === "all" ? "All roles" : r}
              </option>
            ))}
          </select>
          <Button
            type="button"
            variant="outline"
            onClick={async () => {
              try {
                const blob = await exportAdminUsersCsv();
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "owuf-users.csv";
                a.click();
                URL.revokeObjectURL(url);
              } catch (error) {
                push(
                  error instanceof Error ? error.message : "Export failed.",
                  "error",
                );
              }
            }}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {query.isError ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-danger">
          Unable to load users. Administrator role required.
        </p>
      ) : null}

      {query.isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-14" />
          <Skeleton className="h-14" />
        </div>
      ) : !rows.length ? (
        <EmptyState
          title="No users found"
          description="Adjust filters or approve an access request to create accounts."
        />
      ) : (
        <div className="overflow-x-auto rounded-md border border-border bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-border bg-sky-50 text-xs uppercase tracking-wide text-slate-600">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Active</th>
                <th className="px-4 py-3">Must change password</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((user: AdminUserItem) => (
                <tr key={user.id}>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-navy-950">{user.email}</p>
                    <p className="text-xs text-slate-600">
                      {user.username} · {[user.first_name, user.last_name]
                        .filter(Boolean)
                        .join(" ")}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={String(user.role)}
                      className="h-9 rounded-md border border-border bg-white px-2 text-sm focus-ring"
                      onChange={(e) =>
                        mutation.mutate({
                          id: user.id,
                          payload: { role: e.target.value },
                        })
                      }
                    >
                      {ROLES.filter((r) => r !== "all").map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={Boolean(user.is_active)}
                      onChange={(e) =>
                        mutation.mutate({
                          id: user.id,
                          payload: { is_active: e.target.checked },
                        })
                      }
                      aria-label={`Active ${user.email}`}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={Boolean(user.must_change_password)}
                      onChange={(e) =>
                        mutation.mutate({
                          id: user.id,
                          payload: { must_change_password: e.target.checked },
                        })
                      }
                      aria-label={`Must change password ${user.email}`}
                    />
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
