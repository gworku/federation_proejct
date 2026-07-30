import type { AppModule } from "@/lib/roles";

/** Map authenticated app paths to role modules for access control. */
export const appPathModules: Array<{ path: string; module: AppModule }> = [
  { path: "/app/dashboard", module: "dashboard" },
  { path: "/app/utilities", module: "utilities" },
  { path: "/app/projects", module: "projects" },
  { path: "/app/documents", module: "documents" },
  { path: "/app/cms", module: "cms" },
  { path: "/app/backups", module: "backups" },
  { path: "/app/users", module: "users" },
  { path: "/app/access", module: "access" },
  { path: "/app/messages", module: "messages" },
  { path: "/app/service-requests", module: "service_requests" },
  { path: "/app/requests", module: "requests" },
  { path: "/app/consultancy", module: "consultancy" },
  { path: "/app/membership", module: "membership" },
  { path: "/app/training", module: "training" },
  { path: "/app/event-registrations", module: "events_admin" },
  { path: "/app/partnerships", module: "partnerships" },
  { path: "/app/audit", module: "audit" },
  { path: "/app/finance", module: "finance" },
  { path: "/app/procurement", module: "procurement" },
  { path: "/app/risk", module: "risk" },
  { path: "/app/me", module: "me" },
  { path: "/app/benchmarking", module: "benchmarking" },
  { path: "/app/notifications", module: "notifications" },
];

export function moduleForPath(pathname: string): AppModule | null {
  const match = appPathModules
    .slice()
    .sort((a, b) => b.path.length - a.path.length)
    .find(
      (row) => pathname === row.path || pathname.startsWith(`${row.path}/`),
    );
  return match?.module ?? null;
}

export type CmsTab =
  | "News"
  | "Publications"
  | "Events"
  | "Gallery"
  | "Leadership"
  | "Partners"
  | "Training"
  | "Procurement"
  | "Knowledge"
  | "Projects"
  | "Utilities"
  | "Stats"
  | "Translations"
  | "Newsletter";

export const cmsTabs: CmsTab[] = [
  "News",
  "Publications",
  "Events",
  "Gallery",
  "Leadership",
  "Partners",
  "Training",
  "Procurement",
  "Knowledge",
  "Projects",
  "Utilities",
  "Stats",
  "Translations",
  "Newsletter",
];

export const cmsTabGroups: Array<{ label: string; tabs: CmsTab[] }> = [
  {
    label: "Website content",
    tabs: ["News", "Events", "Gallery", "Leadership", "Partners", "Stats", "Translations"],
  },
  {
    label: "Documents & programmes",
    tabs: ["Publications", "Knowledge", "Projects", "Utilities", "Training", "Procurement"],
  },
  {
    label: "Audience",
    tabs: ["Newsletter"],
  },
];

export function cmsHref(tab: CmsTab) {
  return `/app/cms?tab=${encodeURIComponent(tab)}`;
}

export function parseCmsTab(value: string | null | undefined): CmsTab {
  if (value && (cmsTabs as string[]).includes(value)) {
    return value as CmsTab;
  }
  return "News";
}
