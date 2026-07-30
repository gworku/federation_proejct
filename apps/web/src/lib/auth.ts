export type UserRole =
  | "administrator"
  | "management"
  | "project_officer"
  | "finance_officer"
  | "procurement_officer"
  | "utility_user"
  | "auditor"
  | "content_editor";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  mustChangePassword?: boolean;
};

export const ROLE_DASHBOARD: Record<UserRole, string> = {
  administrator: "/app/dashboard",
  management: "/app/dashboard",
  project_officer: "/app/projects",
  finance_officer: "/app/finance",
  procurement_officer: "/app/procurement",
  utility_user: "/app/finance",
  auditor: "/app/audit",
  content_editor: "/app/cms",
};

const STORAGE_KEY = "opwssf_auth_session";

export function getSession(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function setSession(user: AuthUser) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

export function logoutLocal() {
  sessionStorage.removeItem(STORAGE_KEY);
  sessionStorage.removeItem("opwssf_access");
  sessionStorage.removeItem("opwssf_refresh");
}

export function dashboardForRole(role: UserRole) {
  return ROLE_DASHBOARD[role] ?? "/app/dashboard";
}
