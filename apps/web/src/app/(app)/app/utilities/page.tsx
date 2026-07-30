"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchUtilities } from "@/lib/api";
import { cmsHref } from "@/lib/app-routes";
import { Badge, statusTone } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function AppUtilitiesPage() {
  const [query, setQuery] = useState("");
  const { data, isLoading, isError } = useQuery({
    queryKey: ["app-utilities", query],
    queryFn: () => fetchUtilities({ search: query || undefined }),
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <p className="text-sm text-slate-600">
          Live member utility directory. Administrators and editors can add,
          update, or remove utilities from CMS.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter utilities…"
            className="sm:max-w-xs"
          />
          <Link
            href={cmsHref("Utilities")}
            className={cn(buttonVariants({ variant: "primary" }))}
          >
            Manage utilities
          </Link>
        </div>
      </div>

      {isError ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-danger">
          Could not load utilities from the API.
        </p>
      ) : null}

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-12" />
          <Skeleton className="h-12" />
          <Skeleton className="h-12" />
        </div>
      ) : !data?.length ? (
        <EmptyState
          title="No utilities found"
          description="Adjust your filter or add utilities in the CMS Utilities tab."
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-sky-50 text-navy-800">
              <tr>
                <th className="px-4 py-3">Utility</th>
                <th className="px-4 py-3">Zone</th>
                <th className="px-4 py-3">Grade</th>
                <th className="px-4 py-3">Customers</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.slug} className="border-t border-border">
                  <td className="px-4 py-3 font-medium text-navy-950">
                    {row.name}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{row.zone}</td>
                  <td className="px-4 py-3 text-slate-600">{row.grade}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {row.customers?.toLocaleString() ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={statusTone(row.status)}>{row.status}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={cmsHref("Utilities")}
                      className="text-sm font-semibold text-ocean-700"
                    >
                      Edit in CMS
                    </Link>
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
