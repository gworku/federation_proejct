"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AppSidebar } from "@/components/app/app-sidebar";
import { AppTopbar } from "@/components/app/app-topbar";
import { getSession, type AuthUser } from "@/lib/auth";
import { moduleForPath } from "@/lib/app-routes";
import { canAccess } from "@/lib/roles";

const titles: Record<string, string> = {
  "/app/dashboard": "Dashboard",
  "/app/utilities": "Utilities",
  "/app/projects": "Projects",
  "/app/documents": "Documents",
  "/app/cms": "Content Management",
  "/app/backups": "Backups",
  "/app/users": "Users",
  "/app/change-password": "Change password",
  "/app/access": "Access Requests",
  "/app/messages": "Contact Messages",
  "/app/service-requests": "Technical Support",
  "/app/requests": "Requests & Reports",
  "/app/consultancy": "Consultancy",
  "/app/membership": "Membership",
  "/app/training": "Training Registrations",
  "/app/event-registrations": "Event Registrations",
  "/app/partnerships": "Partnerships",
  "/app/audit": "Audit & Compliance",
  "/app/finance": "Finance",
  "/app/procurement": "Procurement",
  "/app/risk": "Risk Register",
  "/app/me": "Monitoring & Evaluation",
  "/app/benchmarking": "Benchmarking",
  "/app/notifications": "Notifications",
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.replace("/login");
      return;
    }
    setUser(session);
    const stored = localStorage.getItem("opwssf_sidebar_collapsed");
    if (stored === "1") setCollapsed(true);

    if (
      session.mustChangePassword &&
      pathname !== "/app/change-password"
    ) {
      router.replace("/app/change-password");
      return;
    }

    if (pathname === "/app/change-password") {
      setDenied(false);
      return;
    }

    const module = moduleForPath(pathname);
    if (module && !canAccess(session.role, module)) {
      setDenied(true);
      router.replace("/app/dashboard");
      return;
    }
    setDenied(false);
  }, [router, pathname]);

  const title =
    Object.entries(titles)
      .sort(([a], [b]) => b.length - a.length)
      .find(
        ([path]) => pathname === path || pathname.startsWith(`${path}/`),
      )?.[1] ?? "Workspace";

  if (!user || denied) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-sky-50 text-slate-600">
        Checking session…
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-sky-50">
      <AppSidebar
        user={user}
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        onToggle={() => {
          setCollapsed((value) => {
            const next = !value;
            localStorage.setItem("opwssf_sidebar_collapsed", next ? "1" : "0");
            return next;
          });
        }}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppTopbar
          title={title}
          user={user}
          onMenu={() => setMobileOpen(true)}
        />
        <main className="flex-1 px-4 py-6 sm:px-6">{children}</main>
      </div>
    </div>
  );
}
