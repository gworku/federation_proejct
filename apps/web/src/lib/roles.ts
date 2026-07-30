import type { UserRole } from "@/lib/auth";

export type AppModule =
  | "dashboard"
  | "utilities"
  | "projects"
  | "documents"
  | "cms"
  | "audit"
  | "access"
  | "messages"
  | "service_requests"
  | "requests"
  | "consultancy"
  | "membership"
  | "training"
  | "events_admin"
  | "partnerships"
  | "finance"
  | "procurement"
  | "risk"
  | "me"
  | "benchmarking"
  | "notifications"
  | "backups"
  | "users";

const ALL: UserRole[] = [
  "administrator",
  "management",
  "project_officer",
  "finance_officer",
  "procurement_officer",
  "utility_user",
  "auditor",
  "content_editor",
];

const matrix: Record<AppModule, UserRole[]> = {
  dashboard: ALL,
  utilities: ["administrator", "management", "project_officer", "utility_user", "auditor", "content_editor"],
  projects: ["administrator", "management", "project_officer", "auditor", "content_editor"],
  documents: ALL,
  cms: ["administrator", "management", "content_editor"],
  audit: ["administrator", "management", "auditor"],
  access: ["administrator", "management"],
  messages: ["administrator", "management", "content_editor"],
  service_requests: ["administrator", "management", "project_officer"],
  requests: ["administrator", "management", "project_officer"],
  consultancy: ["administrator", "management", "project_officer"],
  membership: ["administrator", "management", "finance_officer"],
  training: ["administrator", "management", "project_officer", "content_editor"],
  events_admin: ["administrator", "management", "content_editor"],
  partnerships: ["administrator", "management"],
  finance: ["administrator", "management", "finance_officer", "utility_user"],
  procurement: ["administrator", "management", "procurement_officer"],
  risk: ["administrator", "management", "auditor"],
  me: ["administrator", "management", "project_officer", "auditor"],
  benchmarking: ["administrator", "management", "project_officer", "utility_user", "auditor"],
  notifications: ALL,
  backups: ["administrator"],
  users: ["administrator"],
};

export function canAccess(role: UserRole, module: AppModule) {
  if (role === "administrator") return true;
  return matrix[module]?.includes(role) ?? false;
}
