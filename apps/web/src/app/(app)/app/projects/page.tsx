"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { fetchProjects } from "@/lib/api";
import { cmsHref } from "@/lib/app-routes";
import { Badge, statusTone } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function AppProjectsPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["app-projects"],
    queryFn: () => fetchProjects(),
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-600">
          Live programme status from the API. Administrators and editors can
          create, update, or delete public project pages in CMS.
        </p>
        <Link
          href={cmsHref("Projects")}
          className={cn(buttonVariants({ variant: "primary" }))}
        >
          Manage projects
        </Link>
      </div>

      {isError ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-danger">
          Could not load projects from the API.
        </p>
      ) : null}

      {isLoading ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      ) : !data?.length ? (
        <EmptyState
          title="No projects yet"
          description="Create programmes from the CMS Projects tab."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {data.map((project) => (
            <article
              key={project.slug}
              className="rounded-2xl border border-border bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-display text-xl text-navy-950">
                  {project.title}
                </h2>
                <Badge tone={statusTone(project.status)}>{project.status}</Badge>
              </div>
              <p className="mt-2 text-sm text-slate-600">
                {project.location} · {project.category}
              </p>
              <p className="mt-3 text-sm text-slate-600">{project.description}</p>
              <div className="mt-4 h-2 rounded-full bg-sky-100">
                <div
                  className="h-full rounded-full bg-ocean-600"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
              <div className="mt-3 flex items-center justify-between gap-3">
                <p className="text-xs font-semibold text-ocean-700">
                  {project.progress}% complete
                </p>
                <Link
                  href={cmsHref("Projects")}
                  className="text-xs font-semibold text-navy-800"
                >
                  Edit in CMS
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
