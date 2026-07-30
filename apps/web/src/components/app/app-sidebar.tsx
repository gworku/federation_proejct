"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Droplets,
  FolderKanban,
  FileText,
  Newspaper,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield,
  UserPlus,
  Mail,
  Wrench,
  Users,
  Briefcase,
  GraduationCap,
  CalendarCheck,
  Handshake,
  ShoppingCart,
  Wallet,
  AlertTriangle,
  Target,
  BarChart3,
  Bell,
  DatabaseBackup,
  Inbox,
  UserCog,
  type LucideIcon,
} from "lucide-react";
import { useLogout } from "@/hooks/use-logout";
import { org } from "@/lib/org";
import { cn } from "@/lib/utils";
import type { AuthUser } from "@/lib/auth";
import { canAccess, type AppModule } from "@/lib/roles";

const links: Array<{
  href: string;
  label: string;
  icon: LucideIcon;
  module: AppModule;
}> = [
  { href: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard, module: "dashboard" },
  { href: "/app/utilities", label: "Utilities", icon: Droplets, module: "utilities" },
  { href: "/app/projects", label: "Projects", icon: FolderKanban, module: "projects" },
  { href: "/app/documents", label: "Documents", icon: FileText, module: "documents" },
  { href: "/app/cms", label: "CMS", icon: Newspaper, module: "cms" },
  {
    href: "/app/backups",
    label: "Backups",
    icon: DatabaseBackup,
    module: "backups",
  },
  { href: "/app/users", label: "Users", icon: UserCog, module: "users" },
  { href: "/app/access", label: "Access Requests", icon: UserPlus, module: "access" },
  {
    href: "/app/requests",
    label: "Requests & Reports",
    icon: Inbox,
    module: "requests",
  },
  { href: "/app/messages", label: "Messages", icon: Mail, module: "messages" },
  {
    href: "/app/service-requests",
    label: "Technical Support",
    icon: Wrench,
    module: "service_requests",
  },
  {
    href: "/app/consultancy",
    label: "Consultancy",
    icon: Briefcase,
    module: "consultancy",
  },
  {
    href: "/app/membership",
    label: "Membership",
    icon: Users,
    module: "membership",
  },
  {
    href: "/app/training",
    label: "Training",
    icon: GraduationCap,
    module: "training",
  },
  {
    href: "/app/event-registrations",
    label: "Event Registrations",
    icon: CalendarCheck,
    module: "events_admin",
  },
  {
    href: "/app/partnerships",
    label: "Partnerships",
    icon: Handshake,
    module: "partnerships",
  },
  {
    href: "/app/procurement",
    label: "Procurement",
    icon: ShoppingCart,
    module: "procurement",
  },
  { href: "/app/finance", label: "Finance", icon: Wallet, module: "finance" },
  {
    href: "/app/risk",
    label: "Risk Register",
    icon: AlertTriangle,
    module: "risk",
  },
  { href: "/app/me", label: "M&E", icon: Target, module: "me" },
  {
    href: "/app/benchmarking",
    label: "Benchmarking",
    icon: BarChart3,
    module: "benchmarking",
  },
  {
    href: "/app/notifications",
    label: "Notifications",
    icon: Bell,
    module: "notifications",
  },
  { href: "/app/audit", label: "Audit", icon: Shield, module: "audit" },
];

export function AppSidebar({
  user,
  collapsed,
  onToggle,
  mobileOpen,
  onMobileClose,
}: {
  user: AuthUser;
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}) {
  const pathname = usePathname();
  const { logout, pending } = useLogout();
  const visibleLinks = links.filter((link) => canAccess(user.role, link.module));

  const content = (
    <div className="flex h-full flex-col bg-navy-950 text-white">
      <div className="flex items-center gap-3 border-b border-white/10 px-4 py-4">
        <Image
          src={org.logo}
          alt={`${org.shortName} emblem`}
          width={40}
          height={40}
          className="h-10 w-10 shrink-0 rounded-full bg-white object-contain p-0.5"
        />
        {!collapsed ? (
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">{org.shortName}</p>
            <p className="truncate text-[11px] text-white/60">Management</p>
          </div>
        ) : null}
      </div>

      <nav className="flex-1 space-y-1 p-3" aria-label="Application">
        {visibleLinks.map((link) => {
          const active =
            pathname === link.href || pathname.startsWith(`${link.href}/`);
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              title={collapsed ? link.label : undefined}
              onClick={onMobileClose}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition focus-ring",
                active
                  ? "bg-ocean-600 text-white"
                  : "text-white/75 hover:bg-white/10 hover:text-white",
                collapsed && "justify-center px-2",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed ? <span>{link.label}</span> : null}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-3">
        {!collapsed ? (
          <div className="mb-3 rounded-xl bg-white/5 px-3 py-2">
            <p className="truncate text-sm font-semibold">{user.name}</p>
            <p className="truncate text-xs text-white/60">
              {user.role.replaceAll("_", " ")}
            </p>
          </div>
        ) : null}
        <button
          type="button"
          onClick={onToggle}
          className="mb-2 flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm text-white/70 hover:bg-white/10 focus-ring"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
          {!collapsed ? "Collapse" : null}
        </button>
        <button
          type="button"
          onClick={logout}
          disabled={pending}
          className={cn(
            "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/80 hover:bg-white/10 focus-ring disabled:opacity-60",
            collapsed && "justify-center",
          )}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed ? (pending ? "Signing out…" : "Logout") : null}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside
        className={cn(
          "sticky top-0 hidden h-screen shrink-0 transition-all duration-200 lg:block",
          collapsed ? "w-[76px]" : "w-64",
        )}
      >
        {content}
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-navy-950/50"
            aria-label="Close menu"
            onClick={onMobileClose}
          />
          <div className="absolute inset-y-0 left-0 w-72 shadow-2xl">{content}</div>
        </div>
      ) : null}
    </>
  );
}
