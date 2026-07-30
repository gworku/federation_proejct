"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { fetchPublicationsAuth } from "@/lib/api";
import { cmsHref } from "@/lib/app-routes";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function DocumentsPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["app-documents"],
    queryFn: () => fetchPublicationsAuth(),
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-600">
          Document registry from CMS publications. Create, update, upload, or
          delete files in Content Management.
        </p>
        <Link
          href={cmsHref("Publications")}
          className={cn(buttonVariants({ variant: "primary" }))}
        >
          Manage publications
        </Link>
      </div>

      {isError ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-danger">
          Could not load documents from the API.
        </p>
      ) : null}

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-12" />
          <Skeleton className="h-12" />
        </div>
      ) : !data?.length ? (
        <EmptyState
          title="No documents yet"
          description="Add publications from the CMS Publications tab."
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-sky-50">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Size</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((doc) => (
                <tr key={doc.slug} className="border-t border-border">
                  <td className="px-4 py-3 font-medium">{doc.title}</td>
                  <td className="px-4 py-3 text-slate-600">{doc.category}</td>
                  <td className="px-4 py-3 text-slate-600">{doc.file_type}</td>
                  <td className="px-4 py-3 text-slate-600">{doc.file_size}</td>
                  <td className="px-4 py-3 capitalize text-slate-600">
                    {doc.status}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {doc.file_url ? (
                        <a
                          href={doc.file_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm font-semibold text-ocean-700"
                        >
                          Open
                        </a>
                      ) : null}
                      <Link
                        href={cmsHref("Publications")}
                        className="text-sm font-semibold text-navy-800"
                      >
                        Edit in CMS
                      </Link>
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
