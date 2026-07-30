"use client";

import Link from "next/link";
import { Bell, LogOut, Menu } from "lucide-react";
import { useLogout } from "@/hooks/use-logout";
import type { AuthUser } from "@/lib/auth";

export function AppTopbar({
  title,
  user,
  onMenu,
}: {
  title: string;
  user: AuthUser;
  onMenu: () => void;
}) {
  const { logout, pending } = useLogout();

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-white/90 backdrop-blur">
      <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border lg:hidden focus-ring"
            onClick={onMenu}
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            <p className="text-xs text-slate-600">OWUF Platform</p>
            <h1 className="truncate font-display text-xl font-semibold text-navy-950">
              {title}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/app/notifications"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border focus-ring"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
          </Link>
          <div className="hidden rounded-xl bg-sky-50 px-3 py-2 text-right sm:block">
            <p className="text-xs font-semibold text-navy-950">{user.name}</p>
            <p className="text-[11px] capitalize text-slate-600">
              {user.role.replaceAll("_", " ")}
            </p>
          </div>
          <button
            type="button"
            onClick={logout}
            disabled={pending}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-white px-3 text-sm font-semibold text-navy-950 transition hover:bg-sky-50 focus-ring disabled:opacity-60"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">{pending ? "…" : "Logout"}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
