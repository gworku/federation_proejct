"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";

function levelTone(
  level: string,
): "info" | "success" | "warning" | "danger" | "default" {
  if (level === "success") return "success";
  if (level === "warning") return "warning";
  if (level === "danger") return "danger";
  if (level === "info") return "info";
  return "default";
}

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const { push } = useToast();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
  });

  const markReadMutation = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["notifications"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
    },
    onError: (error: Error) => push(error.message, "error"),
  });

  const markAllMutation = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["notifications"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      push("All notifications marked as read.", "success");
    },
    onError: (error: Error) => push(error.message, "error"),
  });

  const unreadCount = (data ?? []).filter((item) => !item.is_read).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-600">
          System alerts and workflow updates for your account.
          {unreadCount ? ` ${unreadCount} unread.` : ""}
        </p>
        {unreadCount > 0 ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={markAllMutation.isPending}
            onClick={() => markAllMutation.mutate()}
          >
            Mark all read
          </Button>
        ) : null}
      </div>

      {isError ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-danger">
          Unable to load notifications.
        </p>
      ) : null}

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
      ) : !data?.length ? (
        <EmptyState
          title="No notifications"
          description="You are all caught up. New alerts will appear here."
        />
      ) : (
        <div className="space-y-3">
          {data.map((item) => (
            <article
              key={item.id}
              className={`rounded-2xl border p-5 shadow-sm ${
                item.is_read
                  ? "border-border bg-white"
                  : "border-ocean-600/30 bg-sky-50/60"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-lg text-navy-950">
                    {item.title}
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">{item.body}</p>
                  <p className="mt-2 text-xs text-slate-600">
                    {new Date(item.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={levelTone(item.level)}>{item.level}</Badge>
                  {!item.is_read ? <Badge tone="info">Unread</Badge> : null}
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {!item.is_read ? (
                  <button
                    type="button"
                    className="rounded-xl border border-ocean-600/30 px-4 py-2 text-sm font-semibold text-ocean-700 hover:bg-sky-50 focus-ring"
                    onClick={() => markReadMutation.mutate(item.id)}
                  >
                    Mark read
                  </button>
                ) : null}
                {item.link ? (
                  <Link
                    href={item.link}
                    className="rounded-xl bg-ocean-600 px-4 py-2 text-sm font-semibold text-white hover:bg-ocean-500 focus-ring"
                  >
                    Open
                  </Link>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
