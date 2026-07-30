import type { UserRole } from "@/lib/auth";

function resolveApiUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "NEXT_PUBLIC_API_URL must be set for production builds (e.g. https://api.owuf.gov.et).",
    );
  }
  return "http://127.0.0.1:8000";
}

export const API_URL = resolveApiUrl();

/** Turn API-relative `/storage/...` paths into absolute URLs for the browser. */
export function absoluteMediaUrl(url?: string | null): string {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith("/")) return `${API_URL}${url}`;
  return url;
}

export type ApiUtility = {
  id: number;
  name: string;
  slug: string;
  zone: string;
  city: string;
  grade: string;
  status: string;
  membership_status?: string;
  customers: number | null;
  population_served?: number | null;
  service_type?: string;
  water_sources?: string;
  website?: string;
  contact_email?: string;
  contact_phone?: string;
  is_public?: boolean;
  updated_at?: string;
};

export type ApiProjectMilestone = {
  id: number;
  title: string;
  due_date: string | null;
  status: string;
  sort_order: number;
};

export type ApiProject = {
  id: number;
  title: string;
  slug: string;
  location: string;
  category: string;
  status: string;
  progress: number;
  description: string;
  objectives?: string;
  funding_partner?: string;
  implementing_partners?: string;
  start_date?: string | null;
  end_date?: string | null;
  budget_visible?: boolean;
  contact_person?: string;
  is_public?: boolean;
  milestones?: ApiProjectMilestone[];
  updated_at?: string;
};

export type ApiNews = {
  id: number;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  body?: string;
  status?: "draft" | "pending_review" | "published" | "archived" | string;
  featured: boolean;
  published_at: string | null;
  updated_at?: string;
};

export type ApiStatistic = {
  id: number;
  key: string;
  label: string;
  value: number;
  suffix: string;
  sort_order: number;
  is_public?: boolean;
};

export type ApiUser = {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole | string;
  username?: string;
  is_active?: boolean;
  must_change_password?: boolean;
};

type Paginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

function getAccessToken() {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem("opwssf_access");
}

function getRefreshToken() {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem("opwssf_refresh");
}

async function refreshAccessToken(): Promise<string | null> {
  const refresh = getRefreshToken();
  if (!refresh) return null;
  const response = await fetch(`${API_URL}/api/auth/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });
  if (!response.ok) return null;
  const data = (await response.json()) as { access: string; refresh?: string };
  sessionStorage.setItem("opwssf_access", data.access);
  if (data.refresh) sessionStorage.setItem("opwssf_refresh", data.refresh);
  return data.access;
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
  auth = false,
): Promise<T> {
  const headers = new Headers(init.headers);
  const isFormData =
    typeof FormData !== "undefined" && init.body instanceof FormData;
  if (!headers.has("Content-Type") && init.body && !isFormData) {
    headers.set("Content-Type", "application/json");
  }

  if (auth) {
    let token = getAccessToken();
    if (!token) token = await refreshAccessToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  let response = await fetch(`${API_URL}${path}`, { ...init, headers });

  if (auth && response.status === 401) {
    const nextToken = await refreshAccessToken();
    if (nextToken) {
      headers.set("Authorization", `Bearer ${nextToken}`);
      response = await fetch(`${API_URL}${path}`, { ...init, headers });
    }
  }

  if (!response.ok) {
    let detail = `Request failed (${response.status})`;
    try {
      const data = await response.clone().json();
      detail =
        data?.non_field_errors?.[0] ||
        data?.detail ||
        data?.error ||
        detail;
    } catch {
      // Ignore invalid error payloads and fall back to the status message.
    }
    throw new Error(typeof detail === "string" ? detail : "Request failed");
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

async function listOrArray<T>(path: string, auth = false): Promise<T[]> {
  const data = await apiFetch<Paginated<T> | T[]>(path, {}, auth);
  return Array.isArray(data) ? data : data.results;
}

export async function apiLogin(identifier: string, password: string) {
  return apiFetch<{
    access: string;
    refresh: string;
    user: ApiUser;
    dashboard: string;
  }>("/api/auth/login/", {
    method: "POST",
    body: JSON.stringify({ identifier, password }),
  });
}

export async function apiForgotPassword(email: string) {
  return apiFetch<{
    detail: string;
    reset_token?: string;
    reset_url?: string;
  }>("/api/auth/forgot-password/", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function apiResetPassword(payload: {
  email: string;
  token: string;
  password: string;
  password_confirmation: string;
}) {
  return apiFetch<{ detail: string }>("/api/auth/reset-password/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function apiChangePassword(payload: {
  current_password: string;
  password: string;
  password_confirmation: string;
}) {
  return apiFetch<{ detail: string }>(
    "/api/auth/change-password/",
    { method: "POST", body: JSON.stringify(payload) },
    true,
  );
}

export type AdminUserItem = ApiUser & {
  created_at?: string;
  updated_at?: string;
  locked_until?: string | null;
  organization?: string | null;
};

export async function fetchAdminUsers(params?: {
  search?: string;
  role?: string;
  is_active?: string;
}) {
  const query = new URLSearchParams({ page_size: "100" });
  if (params?.search) query.set("search", params.search);
  if (params?.role && params.role !== "all") query.set("role", params.role);
  if (params?.is_active !== undefined && params.is_active !== "") {
    query.set("is_active", params.is_active);
  }
  return listOrArray<AdminUserItem>(`/api/admin/users/?${query}`, true);
}

export async function updateAdminUser(
  id: number,
  payload: Partial<{
    role: string;
    is_active: boolean;
    must_change_password: boolean;
    organization: string | null;
  }>,
) {
  return apiFetch<AdminUserItem>(
    `/api/admin/users/${id}/`,
    { method: "PATCH", body: JSON.stringify(payload) },
    true,
  );
}

export async function exportAdminUsersCsv() {
  const token =
    typeof window !== "undefined"
      ? sessionStorage.getItem("opwssf_access")
      : null;
  const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "";
  const res = await fetch(`${base}/api/admin/users/export/`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error("Unable to export users.");
  return res.blob();
}

export async function apiLogout() {
  const refresh = getRefreshToken();
  if (!refresh) return;
  try {
    await apiFetch("/api/auth/logout/", {
      method: "POST",
      body: JSON.stringify({ refresh }),
    }, true);
  } catch {
    // Ignore offline logout failures; local session is still cleared.
  }
}

export async function fetchUtilities(params?: {
  search?: string;
  zone?: string;
  status?: string;
  grade?: string;
}) {
  const query = new URLSearchParams();
  if (params?.search) query.set("search", params.search);
  if (params?.zone && params.zone !== "all") query.set("zone", params.zone);
  if (params?.status && params.status !== "all") query.set("status", params.status);
  if (params?.grade && params.grade !== "all") query.set("grade", params.grade);
  query.set("page_size", "500");
  const suffix = query.toString() ? `?${query}` : "";
  return listOrArray<ApiUtility>(`/api/utilities/${suffix}`);
}

export async function fetchUtility(slug: string) {
  return apiFetch<ApiUtility>(`/api/utilities/${slug}/`);
}

export async function fetchProjects(params?: { search?: string }) {
  const query = new URLSearchParams({ page_size: "100" });
  if (params?.search) query.set("search", params.search);
  return listOrArray<ApiProject>(`/api/projects/?${query}`);
}

export async function fetchProject(slug: string) {
  return apiFetch<ApiProject>(`/api/projects/${slug}/`);
}

export async function createProject(
  payload: Partial<ApiProject> & { title: string; slug: string },
) {
  return apiFetch<ApiProject>(
    "/api/projects/",
    { method: "POST", body: JSON.stringify(payload) },
    true,
  );
}

export async function updateProject(slug: string, payload: Partial<ApiProject>) {
  return apiFetch<ApiProject>(
    `/api/projects/${slug}/`,
    { method: "PATCH", body: JSON.stringify(payload) },
    true,
  );
}

export async function deleteProject(slug: string) {
  return apiFetch<void>(`/api/projects/${slug}/`, { method: "DELETE" }, true);
}

export async function createUtility(
  payload: Partial<ApiUtility> & { name: string; slug: string; zone: string; city: string; grade: string },
) {
  return apiFetch<ApiUtility>(
    "/api/utilities/",
    { method: "POST", body: JSON.stringify(payload) },
    true,
  );
}

export async function updateUtility(slug: string, payload: Partial<ApiUtility>) {
  return apiFetch<ApiUtility>(
    `/api/utilities/${slug}/`,
    { method: "PATCH", body: JSON.stringify(payload) },
    true,
  );
}

export async function deleteUtility(slug: string) {
  return apiFetch<void>(`/api/utilities/${slug}/`, { method: "DELETE" }, true);
}

export async function fetchNews(auth = false, params?: { search?: string }) {
  const query = new URLSearchParams({ page_size: "25" });
  if (params?.search) query.set("search", params.search);
  return listOrArray<ApiNews>(`/api/cms/news/?${query}`, auth);
}

export async function fetchNewsArticle(slug: string) {
  return apiFetch<ApiNews>(`/api/cms/news/${slug}/`);
}

export async function createNewsArticle(payload: {
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  body?: string;
  status: "draft" | "pending_review" | "published" | "archived";
  featured?: boolean;
  published_at?: string | null;
}) {
  return apiFetch<ApiNews>(
    "/api/cms/news/",
    { method: "POST", body: JSON.stringify(payload) },
    true,
  );
}

export async function updateNewsArticle(
  slug: string,
  payload: Partial<{
    title: string;
    category: string;
    excerpt: string;
    body: string;
    status: "draft" | "pending_review" | "published" | "archived";
    featured: boolean;
    published_at: string | null;
  }>,
) {
  return apiFetch<ApiNews>(
    `/api/cms/news/${slug}/`,
    { method: "PATCH", body: JSON.stringify(payload) },
    true,
  );
}

export async function fetchStatistics() {
  return listOrArray<ApiStatistic>("/api/cms/statistics/?page_size=20");
}

export async function fetchDashboardSummary() {
  return apiFetch<{
    utilities: number;
    projects: number;
    published_news: number;
    draft_news: number;
    pending_access_requests: number;
    open_service_requests?: number;
    pending_membership?: number;
    open_risks?: number;
    kpi_submitted?: number;
    contributions_overdue?: number;
    unread_notifications?: number;
  }>("/api/dashboard/summary/", {}, true);
}

export type CoverageZone = {
  zone: string;
  total: number;
  active: number;
  digitizing: number;
  support_needed: number;
  lat: number;
  lng: number;
};

export async function fetchCoverage() {
  return apiFetch<{
    count: number;
    active_count: number;
    member_count: number;
    zone_count: number;
    grades: { grade: string; total: number }[];
    zones: CoverageZone[];
  }>(
    "/api/utilities/coverage/",
  );
}

export type AccessRequestItem = {
  id: number;
  full_name: string;
  email: string;
  organization: string;
  role_requested: string;
  justification: string;
  status: "pending" | "approved" | "rejected";
  staff_notes?: string;
  created_username?: string;
  setup_token?: string;
  setup_url?: string;
  created_at: string;
};

export async function fetchAccessRequests() {
  return listOrArray<AccessRequestItem>(
    "/api/auth/access-requests/manage/?page_size=100",
    true,
  );
}

export async function updateAccessRequest(
  id: number,
  status: "pending" | "approved" | "rejected",
  extra?: { staff_notes?: string },
) {
  return apiFetch<AccessRequestItem>(
    `/api/auth/access-requests/${id}/`,
    {
      method: "PATCH",
      body: JSON.stringify({
        status,
        ...(extra?.staff_notes !== undefined
          ? { staff_notes: extra.staff_notes }
          : {}),
      }),
    },
    true,
  );
}

export type AuditEventItem = {
  id: number;
  action: string;
  entity_type?: string | null;
  entity_id?: number | null;
  actor_email: string | null;
  ip_address: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
};

export async function fetchAuditEvents(params?: {
  action?: string;
  entity_type?: string;
  from?: string;
  to?: string;
}) {
  const query = new URLSearchParams({ page_size: "50" });
  if (params?.action) query.set("action", params.action);
  if (params?.entity_type) query.set("entity_type", params.entity_type);
  if (params?.from) query.set("from", params.from);
  if (params?.to) query.set("to", params.to);
  return listOrArray<AuditEventItem>(`/api/audit/events/?${query}`, true);
}

export async function submitAccessRequest(payload: {
  full_name: string;
  email: string;
  organization: string;
  role_requested: string;
  justification: string;
}) {
  return apiFetch<AccessRequestItem>("/api/auth/access-requests/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export type ApiPublication = {
  id: number;
  title: string;
  slug: string;
  category: string;
  description: string;
  file_type: string;
  file_size: string;
  file_url: string;
  published_at: string | null;
  status: string;
  is_public?: boolean;
};

export async function fetchPublications(params?: { search?: string }) {
  const query = new URLSearchParams({ page_size: "100" });
  if (params?.search) query.set("search", params.search);
  return listOrArray<ApiPublication>(`/api/cms/publications/?${query}`);
}

export type ApiLeader = {
  id: number;
  name: string;
  role: string;
  bio: string;
  photo_url: string;
  sort_order: number;
  is_public?: boolean;
};

export async function fetchLeadership() {
  return listOrArray<ApiLeader>("/api/cms/leadership/?page_size=50");
}

export async function submitContactMessage(payload: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  return apiFetch("/api/cms/contact/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateStatistic(
  key: string,
  payload: Partial<{
    label: string;
    value: number;
    suffix: string;
    sort_order: number;
    is_public: boolean;
  }>,
) {
  return apiFetch<ApiStatistic>(
    `/api/cms/statistics/${key}/`,
    { method: "PATCH", body: JSON.stringify(payload) },
    true,
  );
}

export async function createStatistic(payload: {
  key: string;
  label: string;
  value: number;
  suffix?: string;
  sort_order?: number;
  is_public?: boolean;
}) {
  return apiFetch<ApiStatistic>(
    "/api/cms/statistics/",
    { method: "POST", body: JSON.stringify(payload) },
    true,
  );
}

export async function deleteStatistic(key: string) {
  return apiFetch<void>(`/api/cms/statistics/${key}/`, { method: "DELETE" }, true);
}

export type MediaUploadResult = {
  url: string;
  path: string;
  name: string;
  mime: string | null;
  size: number;
};

export async function uploadCmsMedia(file: File, folder = "uploads") {
  const body = new FormData();
  body.append("file", file);
  body.append("folder", folder);
  return apiFetch<MediaUploadResult>("/api/cms/media/", { method: "POST", body }, true);
}

export type ApiEvent = {
  id: number;
  title: string;
  slug: string;
  summary: string;
  location: string;
  starts_at: string;
  ends_at: string | null;
  status: string;
  is_public?: boolean;
};

export async function fetchEvents(params?: { search?: string }) {
  const query = new URLSearchParams({ page_size: "100" });
  if (params?.search) query.set("search", params.search);
  return listOrArray<ApiEvent>(`/api/cms/events/?${query}`);
}

export type ApiGalleryItem = {
  id: number;
  title: string;
  caption: string;
  image_url: string;
  category: string;
  sort_order: number;
  is_public?: boolean;
};

export async function fetchGallery(params?: { search?: string }) {
  const query = new URLSearchParams({ page_size: "100" });
  if (params?.search) query.set("search", params.search);
  return listOrArray<ApiGalleryItem>(`/api/cms/gallery/?${query}`);
}

export async function subscribeNewsletter(email: string) {
  return apiFetch<{ detail: string; email: string }>("/api/cms/newsletter/", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export type ContactMessageItem = {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: "new" | "in_progress" | "closed";
  staff_notes?: string;
  created_at: string;
};

export async function fetchContactMessages() {
  return listOrArray<ContactMessageItem>(
    "/api/cms/contact/manage/?page_size=100",
    true,
  );
}

export async function updateContactMessage(
  id: number,
  status: "new" | "in_progress" | "closed",
  extra?: { staff_notes?: string },
) {
  return apiFetch<ContactMessageItem>(
    `/api/cms/contact/${id}/`,
    {
      method: "PATCH",
      body: JSON.stringify({
        status,
        ...(extra?.staff_notes !== undefined
          ? { staff_notes: extra.staff_notes }
          : {}),
      }),
    },
    true,
  );
}

export type ServiceRequestCategory =
  | "operations"
  | "engineering"
  | "billing"
  | "nrw"
  | "water_quality"
  | "ict"
  | "institutional"
  | "other";

export type ServiceRequestItem = {
  id: number;
  name: string;
  email: string;
  organization: string;
  category: ServiceRequestCategory;
  subject: string;
  description: string;
  status: "new" | "in_progress" | "closed";
  staff_notes?: string;
  processed_at?: string | null;
  created_at: string;
};

export async function submitServiceRequest(payload: {
  name: string;
  email: string;
  organization: string;
  category: ServiceRequestCategory;
  subject: string;
  description: string;
}) {
  return apiFetch<ServiceRequestItem>("/api/cms/service-requests/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchServiceRequests() {
  return listOrArray<ServiceRequestItem>(
    "/api/cms/service-requests/manage/?page_size=100",
    true,
  );
}

export async function updateServiceRequest(
  id: number,
  status: "new" | "in_progress" | "closed",
  extra?: { staff_notes?: string },
) {
  return apiFetch<ServiceRequestItem>(
    `/api/cms/service-requests/${id}/`,
    {
      method: "PATCH",
      body: JSON.stringify({ status, staff_notes: extra?.staff_notes ?? "" }),
    },
    true,
  );
}

export async function deleteServiceRequest(id: number) {
  return apiFetch<void>(
    `/api/cms/service-requests/${id}/`,
    { method: "DELETE" },
    true,
  );
}

export type RequestFeedItem = {
  id: number;
  resource: string;
  label: string;
  status: string;
  title: string;
  requester: string;
  created_at: string | null;
  href: string;
};

export async function fetchRequestsFeed() {
  return apiFetch<{ count: number; results: RequestFeedItem[] }>(
    "/api/requests/feed/",
    {},
    true,
  );
}

export async function fetchRequestsSummary() {
  return apiFetch<{
    open_total: number;
    by_type: Array<{
      resource: string;
      label: string;
      open: number;
      total: number;
      href: string;
    }>;
  }>("/api/requests/summary/", {}, true);
}

export async function exportRequestsCsv(resource = "all", status?: string) {
  const query = new URLSearchParams();
  if (status) query.set("status", status);
  const suffix = query.toString() ? `?${query}` : "";
  const token =
    typeof window !== "undefined"
      ? sessionStorage.getItem("opwssf_access")
      : null;
  const response = await fetch(
    `${API_URL}/api/requests/export/${resource}/${suffix}`,
    {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    },
  );
  if (!response.ok) {
    throw new Error(`Export failed (${response.status})`);
  }
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `owuf-requests-${resource}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export type MembershipApplicationItem = {
  id: number;
  organization_name: string;
  contact_name: string;
  email: string;
  phone: string;
  zone: string;
  city: string;
  category: "full" | "associate" | "observer";
  justification: string;
  status: "pending" | "under_review" | "approved" | "rejected";
  staff_notes?: string;
  created_at: string;
};

export async function submitMembershipApplication(
  payload: Omit<MembershipApplicationItem, "id" | "status" | "created_at">,
) {
  return apiFetch<MembershipApplicationItem>(
    "/api/cms/membership-applications/",
    { method: "POST", body: JSON.stringify(payload) },
  );
}

export async function fetchMembershipApplications() {
  return listOrArray<MembershipApplicationItem>(
    "/api/cms/membership-applications/manage/?page_size=100",
    true,
  );
}

export async function updateMembershipApplication(
  id: number,
  status: MembershipApplicationItem["status"],
  extra?: { staff_notes?: string },
) {
  return apiFetch<MembershipApplicationItem>(
    `/api/cms/membership-applications/${id}/`,
    {
      method: "PATCH",
      body: JSON.stringify({
        status,
        ...(extra?.staff_notes !== undefined
          ? { staff_notes: extra.staff_notes }
          : {}),
      }),
    },
    true,
  );
}

export async function registerForEvent(payload: {
  event_slug: string;
  name: string;
  email: string;
  organization?: string;
  phone?: string;
}) {
  return apiFetch("/api/cms/event-registrations/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export type EventRegistrationItem = {
  id: number;
  event_id: number;
  event_title: string;
  name: string;
  email: string;
  organization: string;
  phone: string;
  status: string;
  staff_notes?: string;
  created_at: string;
};

export async function fetchEventRegistrations() {
  return listOrArray<EventRegistrationItem>(
    "/api/cms/event-registrations/manage/?page_size=100",
    true,
  );
}

export async function updateEventRegistration(
  id: number,
  status: string,
  extra?: { staff_notes?: string },
) {
  return apiFetch<EventRegistrationItem>(
    `/api/cms/event-registrations/${id}/`,
    {
      method: "PATCH",
      body: JSON.stringify({
        status,
        ...(extra?.staff_notes !== undefined
          ? { staff_notes: extra.staff_notes }
          : {}),
      }),
    },
    true,
  );
}

export type TrainingCourse = {
  id: number;
  title: string;
  slug: string;
  summary: string;
  topic: string;
  venue: string;
  is_online: boolean;
  meeting_url: string;
  starts_at: string;
  ends_at: string | null;
  registration_deadline: string | null;
  capacity: number;
  facilitator: string;
  status: string;
  registered_count: number;
};

export async function fetchTrainingCourses() {
  return listOrArray<TrainingCourse>("/api/cms/training/?page_size=100");
}

export async function registerForTraining(payload: {
  course_slug: string;
  name: string;
  email: string;
  organization?: string;
  phone?: string;
}) {
  return apiFetch("/api/cms/training-registrations/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export type TrainingRegistrationItem = {
  id: number;
  course_id: number;
  course_title: string;
  name: string;
  email: string;
  organization: string;
  phone: string;
  status: string;
  staff_notes?: string;
  created_at: string;
};

export async function fetchTrainingRegistrations() {
  return listOrArray<TrainingRegistrationItem>(
    "/api/cms/training-registrations/manage/?page_size=100",
    true,
  );
}

export async function updateTrainingRegistration(
  id: number,
  status: string,
  extra?: { staff_notes?: string },
) {
  return apiFetch<TrainingRegistrationItem>(
    `/api/cms/training-registrations/${id}/`,
    {
      method: "PATCH",
      body: JSON.stringify({
        status,
        ...(extra?.staff_notes !== undefined
          ? { staff_notes: extra.staff_notes }
          : {}),
      }),
    },
    true,
  );
}

export type PartnerItem = {
  id: number;
  name: string;
  slug: string;
  category: string;
  summary: string;
  website: string;
  logo_url: string;
  sort_order: number;
};

export async function fetchPartners() {
  return listOrArray<PartnerItem>("/api/cms/partners/?page_size=100");
}

export async function submitPartnershipInquiry(payload: {
  organization: string;
  contact_name: string;
  email: string;
  partnership_interest: string;
  message: string;
}) {
  return apiFetch("/api/cms/partnership-inquiries/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export type PartnershipInquiryItem = {
  id: number;
  organization: string;
  contact_name: string;
  email: string;
  partnership_interest: string;
  message: string;
  status: "new" | "in_progress" | "closed";
  staff_notes?: string;
  created_at: string;
};

export async function fetchPartnershipInquiries() {
  return listOrArray<PartnershipInquiryItem>(
    "/api/cms/partnership-inquiries/manage/?page_size=100",
    true,
  );
}

export async function updatePartnershipInquiry(
  id: number,
  status: PartnershipInquiryItem["status"],
  extra?: { staff_notes?: string },
) {
  return apiFetch<PartnershipInquiryItem>(
    `/api/cms/partnership-inquiries/${id}/`,
    {
      method: "PATCH",
      body: JSON.stringify({
        status,
        ...(extra?.staff_notes !== undefined
          ? { staff_notes: extra.staff_notes }
          : {}),
      }),
    },
    true,
  );
}

export type ProcurementNotice = {
  id: number;
  title: string;
  slug: string;
  category: string;
  summary: string;
  reference_code: string;
  closing_at: string | null;
  document_url: string;
  status: string;
};

export async function fetchProcurementNotices() {
  return listOrArray<ProcurementNotice>("/api/cms/procurement/?page_size=100");
}

export async function expressProcurementInterest(payload: {
  notice_slug: string;
  organization: string;
  contact_name: string;
  email: string;
  phone?: string;
  message?: string;
}) {
  return apiFetch("/api/cms/procurement-interests/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export type ProcurementInterestItem = {
  id: number;
  notice_id: number;
  notice_title: string;
  organization: string;
  contact_name: string;
  email: string;
  phone: string;
  message: string;
  status: string;
  staff_notes?: string;
  created_at: string;
};

export async function fetchProcurementInterests() {
  return listOrArray<ProcurementInterestItem>(
    "/api/cms/procurement-interests/manage/?page_size=100",
    true,
  );
}

export async function updateProcurementInterest(
  id: number,
  status: string,
  extra?: { staff_notes?: string },
) {
  return apiFetch<ProcurementInterestItem>(
    `/api/cms/procurement-interests/${id}/`,
    {
      method: "PATCH",
      body: JSON.stringify({
        status,
        ...(extra?.staff_notes !== undefined
          ? { staff_notes: extra.staff_notes }
          : {}),
      }),
    },
    true,
  );
}

export type KnowledgeDoc = {
  id: number;
  title: string;
  slug: string;
  document_type: string;
  topic: string;
  year: number | null;
  language: string;
  author: string;
  summary: string;
  file_url: string;
  file_type: string;
  version: string;
  download_count: number;
  access_level: string;
  status: string;
};

export async function fetchKnowledgeDocs(params?: {
  q?: string;
  document_type?: string;
  topic?: string;
  language?: string;
  year?: string;
}) {
  const query = new URLSearchParams({ page_size: "100" });
  if (params?.q) query.set("q", params.q);
  if (params?.document_type) query.set("document_type", params.document_type);
  if (params?.topic) query.set("topic", params.topic);
  if (params?.language) query.set("language", params.language);
  if (params?.year) query.set("year", params.year);
  return listOrArray<KnowledgeDoc>(`/api/cms/knowledge-docs/?${query}`);
}

export async function trackKnowledgeDownload(slug: string) {
  return apiFetch<{ slug: string; file_url: string; download_count: number }>(
    `/api/cms/knowledge-docs/${slug}/download/`,
    { method: "POST", body: JSON.stringify({}) },
  );
}

export type ConsultancyRequestItem = {
  id: number;
  name: string;
  email: string;
  organization: string;
  category: string;
  subject: string;
  description: string;
  status: "new" | "in_progress" | "closed";
  staff_notes?: string;
  created_at: string;
};

export async function submitConsultancyRequest(payload: {
  name: string;
  email: string;
  organization: string;
  category: string;
  subject: string;
  description: string;
}) {
  return apiFetch<ConsultancyRequestItem>("/api/cms/consultancy-requests/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchConsultancyRequests() {
  return listOrArray<ConsultancyRequestItem>(
    "/api/cms/consultancy-requests/manage/?page_size=100",
    true,
  );
}

export async function updateConsultancyRequest(
  id: number,
  status: ConsultancyRequestItem["status"],
  extra?: { staff_notes?: string },
) {
  return apiFetch<ConsultancyRequestItem>(
    `/api/cms/consultancy-requests/${id}/`,
    {
      method: "PATCH",
      body: JSON.stringify({
        status,
        ...(extra?.staff_notes !== undefined
          ? { staff_notes: extra.staff_notes }
          : {}),
      }),
    },
    true,
  );
}

export type RiskItem = {
  id: number;
  title: string;
  category: string;
  description: string;
  probability: number;
  impact: number;
  rating: number;
  mitigation: string;
  residual_risk: string;
  owner: string;
  due_date: string | null;
  review_status: string;
  updated_at: string;
};

export async function fetchRisks() {
  return listOrArray<RiskItem>("/api/ops/risks/?page_size=100", true);
}

export async function createRisk(
  payload: Partial<RiskItem> & {
    title: string;
    description: string;
  },
) {
  return apiFetch<RiskItem>(
    "/api/ops/risks/",
    { method: "POST", body: JSON.stringify(payload) },
    true,
  );
}

export async function updateRisk(id: number, payload: Partial<RiskItem>) {
  return apiFetch<RiskItem>(
    `/api/ops/risks/${id}/`,
    { method: "PATCH", body: JSON.stringify(payload) },
    true,
  );
}

export type StrategicKRAItem = {
  id: number;
  code: string;
  title: string;
  objective: string;
  sort_order: number;
  indicators: Array<{
    id: number;
    code: string;
    title: string;
    unit: string;
    baseline: string;
    annual_target: string;
    frequency: string;
    responsible_officer: string;
  }>;
};

export async function fetchStrategicKRAs() {
  return listOrArray<StrategicKRAItem>("/api/ops/kras/?page_size=50", true);
}

export type IndicatorResultItem = {
  id: number;
  indicator: number;
  indicator_code: string;
  indicator_title: string;
  annual_target: string;
  period_label: string;
  period_start: string;
  period_end: string;
  actual_value: string;
  variance_notes: string;
  evidence_url: string;
  status: string;
};

export async function fetchIndicatorResults() {
  return listOrArray<IndicatorResultItem>(
    "/api/ops/indicator-results/?page_size=100",
    true,
  );
}

export async function createIndicatorResult(payload: {
  indicator: number;
  period_label: string;
  period_start: string;
  period_end: string;
  actual_value: number | string;
  variance_notes?: string;
  evidence_url?: string;
  status?: string;
}) {
  return apiFetch<IndicatorResultItem>(
    "/api/ops/indicator-results/",
    { method: "POST", body: JSON.stringify(payload) },
    true,
  );
}

export async function updateIndicatorResult(
  id: number,
  payload: Partial<IndicatorResultItem>,
) {
  return apiFetch<IndicatorResultItem>(
    `/api/ops/indicator-results/${id}/`,
    { method: "PATCH", body: JSON.stringify(payload) },
    true,
  );
}

export type UtilityKPIItem = {
  id: number;
  utility: number;
  utility_name: string;
  utility_slug: string;
  zone: string;
  period_label: string;
  period_start: string;
  period_end: string;
  water_production_m3: string | null;
  nrw_percent: string | null;
  meter_coverage_percent: string | null;
  billing_efficiency_percent: string | null;
  collection_efficiency_percent: string | null;
  service_coverage_percent: string | null;
  water_quality_compliance_percent: string | null;
  customer_complaints: number | null;
  notes: string;
  status: string;
};

export async function fetchUtilityKPIs() {
  return listOrArray<UtilityKPIItem>(
    "/api/ops/utility-kpis/?page_size=100",
    true,
  );
}

export async function createUtilityKPI(payload: Record<string, unknown>) {
  return apiFetch<UtilityKPIItem>(
    "/api/ops/utility-kpis/",
    { method: "POST", body: JSON.stringify(payload) },
    true,
  );
}

export async function updateUtilityKPI(
  id: number,
  payload: Partial<UtilityKPIItem>,
) {
  return apiFetch<UtilityKPIItem>(
    `/api/ops/utility-kpis/${id}/`,
    { method: "PATCH", body: JSON.stringify(payload) },
    true,
  );
}

export type BenchmarkRow = {
  utility: string;
  zone: string;
  period_label: string;
  nrw_percent: string | null;
  billing_efficiency_percent: string | null;
  collection_efficiency_percent: string | null;
  service_coverage_percent: string | null;
  meter_coverage_percent: string | null;
};

export async function fetchBenchmarkingSummary() {
  return apiFetch<{ results: BenchmarkRow[]; count: number }>(
    "/api/ops/benchmarking/summary/",
    {},
    true,
  );
}

export type NotificationItem = {
  id: number;
  title: string;
  body: string;
  level: string;
  link: string;
  is_read: boolean;
  created_at: string;
};

export async function fetchNotifications() {
  return listOrArray<NotificationItem>(
    "/api/ops/notifications/?page_size=50",
    true,
  );
}

export async function markNotificationRead(id: number) {
  return apiFetch(`/api/ops/notifications/${id}/read/`, { method: "POST" }, true);
}

export async function markAllNotificationsRead() {
  return apiFetch(
    "/api/ops/notifications/mark-all-read/",
    { method: "POST" },
    true,
  );
}

export type ContributionPaymentItem = {
  id: number;
  contribution_id: number;
  amount: string;
  paid_at: string | null;
  reference: string;
  method: string;
  notes: string;
  receipt_url: string;
  receipt_name: string;
  status: "pending" | "approved" | "rejected";
  submitted_by: number | null;
  reviewed_by: number | null;
  reviewed_at: string | null;
  review_notes: string;
  created_at: string | null;
};

export type ContributionItem = {
  id: number;
  utility: number | null;
  utility_name: string;
  organization_name: string;
  invoice_number: string;
  period_label: string;
  amount: string;
  amount_paid: string;
  balance: string;
  currency: string;
  issued_at: string | null;
  due_at: string | null;
  status: string;
  notes: string;
  attachment_url?: string;
  attachment_name?: string;
  payments?: ContributionPaymentItem[];
};

export async function fetchContributions() {
  return listOrArray<ContributionItem>(
    "/api/membership/contributions/?page_size=100",
    true,
  );
}

export async function createContribution(payload: Partial<ContributionItem>) {
  return apiFetch<ContributionItem>(
    "/api/membership/contributions/",
    { method: "POST", body: JSON.stringify(payload) },
    true,
  );
}

export async function updateContribution(
  id: number,
  payload: Partial<ContributionItem>,
) {
  return apiFetch<ContributionItem>(
    `/api/membership/contributions/${id}/`,
    { method: "PATCH", body: JSON.stringify(payload) },
    true,
  );
}

export async function recordContributionPayment(payload: {
  contribution: number;
  amount: number | string;
  paid_at: string;
  reference?: string;
  method?: string;
  notes?: string;
  receipt_url?: string;
  receipt_name?: string;
}) {
  return apiFetch<ContributionItem>(
    "/api/membership/payments/",
    { method: "POST", body: JSON.stringify(payload) },
    true,
  );
}

export async function submitContributionPayment(payload: {
  contribution: number;
  amount: number | string;
  paid_at: string;
  reference: string;
  method: "bank_transfer" | "mobile_money" | "cash" | "other";
  notes?: string;
  receipt_url: string;
  receipt_name: string;
}) {
  return apiFetch<ContributionItem>(
    "/api/membership/payment-submissions/",
    { method: "POST", body: JSON.stringify(payload) },
    true,
  );
}

export async function reviewContributionPayment(
  paymentId: number,
  payload: { status: "approved" | "rejected"; review_notes?: string },
) {
  return apiFetch<ContributionItem>(
    `/api/membership/payments/${paymentId}/review/`,
    { method: "PATCH", body: JSON.stringify(payload) },
    true,
  );
}

export async function fetchContributionSummary() {
  return apiFetch<{
    total: number;
    issued: number;
    paid: number;
    overdue: number;
    outstanding_amount: string;
  }>("/api/membership/contributions/summary/", {}, true);
}

export type LocaleContentItem = {
  id: number;
  key: string;
  locale: "en" | "om" | "am";
  title: string;
  body: string;
  is_approved: boolean;
  updated_at: string;
};

export async function fetchLocaleContent(locale?: string, auth = false) {
  const query = new URLSearchParams({ page_size: "200" });
  if (locale) query.set("locale", locale);
  return listOrArray<LocaleContentItem>(
    `/api/cms/locale-content/?${query}`,
    auth,
  );
}

export async function createLocaleContent(payload: {
  key: string;
  locale: "en" | "om" | "am";
  title: string;
  body: string;
  is_approved?: boolean;
}) {
  return apiFetch<LocaleContentItem>(
    "/api/cms/locale-content/",
    { method: "POST", body: JSON.stringify(payload) },
    true,
  );
}

export async function updateLocaleContent(
  id: number,
  payload: Partial<{
    title: string;
    body: string;
    is_approved: boolean;
  }>,
) {
  return apiFetch<LocaleContentItem>(
    `/api/cms/locale-content/${id}/`,
    { method: "PATCH", body: JSON.stringify(payload) },
    true,
  );
}

export async function upsertLocaleContent(payload: {
  key: string;
  locale: "en" | "om" | "am";
  title: string;
  body: string;
  is_approved?: boolean;
}) {
  const existing = await fetchLocaleContent(payload.locale, true);
  const match = existing.find(
    (row) => row.key === payload.key && row.locale === payload.locale,
  );
  if (match) {
    return updateLocaleContent(match.id, {
      title: payload.title,
      body: payload.body,
      is_approved: payload.is_approved ?? true,
    });
  }
  return createLocaleContent({
    ...payload,
    is_approved: payload.is_approved ?? true,
  });
}

export async function deleteLocaleContent(id: number) {
  return apiFetch<void>(
    `/api/cms/locale-content/${id}/`,
    { method: "DELETE" },
    true,
  );
}

export async function deleteNewsArticle(slug: string) {
  return apiFetch<void>(`/api/cms/news/${slug}/`, { method: "DELETE" }, true);
}

export async function fetchPublicationsAuth() {
  return listOrArray<ApiPublication>(
    "/api/cms/publications/?page_size=100",
    true,
  );
}

export async function createPublication(
  payload: Partial<ApiPublication> & {
    title: string;
    slug: string;
    category: string;
    status: string;
  },
) {
  return apiFetch<ApiPublication>(
    "/api/cms/publications/",
    { method: "POST", body: JSON.stringify(payload) },
    true,
  );
}

export async function updatePublication(
  slug: string,
  payload: Partial<ApiPublication>,
) {
  return apiFetch<ApiPublication>(
    `/api/cms/publications/${slug}/`,
    { method: "PATCH", body: JSON.stringify(payload) },
    true,
  );
}

export async function deletePublication(slug: string) {
  return apiFetch<void>(
    `/api/cms/publications/${slug}/`,
    { method: "DELETE" },
    true,
  );
}

export async function fetchEventsAuth() {
  return listOrArray<ApiEvent>("/api/cms/events/?page_size=100", true);
}

export async function createEvent(
  payload: Partial<ApiEvent> & {
    title: string;
    slug: string;
    summary: string;
    location: string;
    starts_at: string;
    status: string;
  },
) {
  return apiFetch<ApiEvent>(
    "/api/cms/events/",
    { method: "POST", body: JSON.stringify(payload) },
    true,
  );
}

export async function updateEvent(slug: string, payload: Partial<ApiEvent>) {
  return apiFetch<ApiEvent>(
    `/api/cms/events/${slug}/`,
    { method: "PATCH", body: JSON.stringify(payload) },
    true,
  );
}

export async function deleteEvent(slug: string) {
  return apiFetch<void>(`/api/cms/events/${slug}/`, { method: "DELETE" }, true);
}

export async function fetchGalleryAuth() {
  return listOrArray<ApiGalleryItem>("/api/cms/gallery/?page_size=100", true);
}

export async function createGalleryItem(
  payload: Partial<ApiGalleryItem> & { title: string; image_url: string },
) {
  return apiFetch<ApiGalleryItem>(
    "/api/cms/gallery/",
    { method: "POST", body: JSON.stringify(payload) },
    true,
  );
}

export async function updateGalleryItem(
  id: number,
  payload: Partial<ApiGalleryItem>,
) {
  return apiFetch<ApiGalleryItem>(
    `/api/cms/gallery/${id}/`,
    { method: "PATCH", body: JSON.stringify(payload) },
    true,
  );
}

export async function deleteGalleryItem(id: number) {
  return apiFetch<void>(`/api/cms/gallery/${id}/`, { method: "DELETE" }, true);
}

export async function fetchLeadershipAuth() {
  return listOrArray<ApiLeader>("/api/cms/leadership/?page_size=50", true);
}

export async function createLeader(
  payload: Partial<ApiLeader> & { name: string; role: string },
) {
  return apiFetch<ApiLeader>(
    "/api/cms/leadership/",
    { method: "POST", body: JSON.stringify(payload) },
    true,
  );
}

export async function updateLeader(id: number, payload: Partial<ApiLeader>) {
  return apiFetch<ApiLeader>(
    `/api/cms/leadership/${id}/`,
    { method: "PATCH", body: JSON.stringify(payload) },
    true,
  );
}

export async function deleteLeader(id: number) {
  return apiFetch<void>(
    `/api/cms/leadership/${id}/`,
    { method: "DELETE" },
    true,
  );
}

export type ApiPartner = {
  id: number;
  name: string;
  slug: string;
  category: string;
  summary: string;
  website: string;
  logo_url: string;
  sort_order: number;
  is_public: boolean;
};

export async function fetchPartnersAuth() {
  return listOrArray<ApiPartner>("/api/cms/partners/?page_size=100", true);
}

export async function createPartner(
  payload: Partial<ApiPartner> & { name: string; slug: string },
) {
  return apiFetch<ApiPartner>(
    "/api/cms/partners/",
    { method: "POST", body: JSON.stringify(payload) },
    true,
  );
}

export async function updatePartner(slug: string, payload: Partial<ApiPartner>) {
  return apiFetch<ApiPartner>(
    `/api/cms/partners/${slug}/`,
    { method: "PATCH", body: JSON.stringify(payload) },
    true,
  );
}

export async function deletePartner(slug: string) {
  return apiFetch<void>(
    `/api/cms/partners/${slug}/`,
    { method: "DELETE" },
    true,
  );
}

export type ApiTrainingCourse = {
  id: number;
  title: string;
  slug: string;
  summary: string;
  topic: string;
  venue: string;
  is_online: boolean;
  starts_at: string;
  ends_at: string | null;
  capacity: number | null;
  facilitator: string;
  status: string;
  is_public: boolean;
};

export async function fetchTrainingAuth() {
  return listOrArray<ApiTrainingCourse>(
    "/api/cms/training/?page_size=100",
    true,
  );
}

export async function createTrainingCourse(
  payload: Partial<ApiTrainingCourse> & {
    title: string;
    slug: string;
    summary: string;
    starts_at: string;
    status: string;
  },
) {
  return apiFetch<ApiTrainingCourse>(
    "/api/cms/training/",
    { method: "POST", body: JSON.stringify(payload) },
    true,
  );
}

export async function updateTrainingCourse(
  slug: string,
  payload: Partial<ApiTrainingCourse>,
) {
  return apiFetch<ApiTrainingCourse>(
    `/api/cms/training/${slug}/`,
    { method: "PATCH", body: JSON.stringify(payload) },
    true,
  );
}

export async function deleteTrainingCourse(slug: string) {
  return apiFetch<void>(
    `/api/cms/training/${slug}/`,
    { method: "DELETE" },
    true,
  );
}

export type ApiProcurementNotice = {
  id: number;
  title: string;
  slug: string;
  category: string;
  summary: string;
  reference_code: string;
  closing_at: string | null;
  document_url: string;
  status: string;
  is_public: boolean;
};

export async function fetchProcurementNoticesAuth() {
  return listOrArray<ApiProcurementNotice>(
    "/api/cms/procurement/?page_size=100",
    true,
  );
}

export async function createProcurementNotice(
  payload: Partial<ApiProcurementNotice> & {
    title: string;
    slug: string;
    summary: string;
    status: string;
  },
) {
  return apiFetch<ApiProcurementNotice>(
    "/api/cms/procurement/",
    { method: "POST", body: JSON.stringify(payload) },
    true,
  );
}

export async function updateProcurementNotice(
  slug: string,
  payload: Partial<ApiProcurementNotice>,
) {
  return apiFetch<ApiProcurementNotice>(
    `/api/cms/procurement/${slug}/`,
    { method: "PATCH", body: JSON.stringify(payload) },
    true,
  );
}

export async function deleteProcurementNotice(slug: string) {
  return apiFetch<void>(
    `/api/cms/procurement/${slug}/`,
    { method: "DELETE" },
    true,
  );
}

export type ApiKnowledgeDoc = {
  id: number;
  title: string;
  slug: string;
  document_type: string;
  topic: string;
  year: number | null;
  language: string;
  author: string;
  summary: string;
  file_url: string;
  file_type: string;
  version: string;
  access_level: string;
  status: string;
  is_public: boolean;
};

export async function fetchKnowledgeDocsAuth() {
  return listOrArray<ApiKnowledgeDoc>(
    "/api/cms/knowledge-docs/?page_size=100",
    true,
  );
}

export async function createKnowledgeDoc(
  payload: Partial<ApiKnowledgeDoc> & {
    title: string;
    slug: string;
    summary: string;
    status: string;
  },
) {
  return apiFetch<ApiKnowledgeDoc>(
    "/api/cms/knowledge-docs/",
    { method: "POST", body: JSON.stringify(payload) },
    true,
  );
}

export async function updateKnowledgeDoc(
  slug: string,
  payload: Partial<ApiKnowledgeDoc>,
) {
  return apiFetch<ApiKnowledgeDoc>(
    `/api/cms/knowledge-docs/${slug}/`,
    { method: "PATCH", body: JSON.stringify(payload) },
    true,
  );
}

export async function deleteKnowledgeDoc(slug: string) {
  return apiFetch<void>(
    `/api/cms/knowledge-docs/${slug}/`,
    { method: "DELETE" },
    true,
  );
}

export async function deleteContactMessage(id: number) {
  return apiFetch<void>(`/api/cms/contact/${id}/`, { method: "DELETE" }, true);
}

export type NewsletterSubscriberItem = {
  id: number;
  email: string;
  created_at: string;
};

export async function fetchNewsletterSubscribers() {
  return listOrArray<NewsletterSubscriberItem>(
    "/api/cms/newsletter-subscribers/?page_size=200",
    true,
  );
}

export async function deleteNewsletterSubscriber(id: number) {
  return apiFetch<void>(
    `/api/cms/newsletter-subscribers/${id}/`,
    { method: "DELETE" },
    true,
  );
}

export type BackupItem = {
  filename: string;
  size_bytes: number;
  created_at: string;
  label?: string;
};

export async function fetchBackups() {
  return apiFetch<BackupItem[]>("/api/backups/", {}, true);
}

export async function createBackup(label = "manual") {
  return apiFetch<BackupItem & { path?: string }>(
    "/api/backups/",
    { method: "POST", body: JSON.stringify({ label }) },
    true,
  );
}

export async function deleteBackup(filename: string) {
  return apiFetch<void>(
    `/api/backups/${encodeURIComponent(filename)}/`,
    { method: "DELETE" },
    true,
  );
}

export async function restoreBackup(filename: string) {
  return apiFetch<{
    filename: string;
    tables: Record<string, number>;
    restored_at: string;
    rows_total: number;
  }>(
    `/api/backups/${encodeURIComponent(filename)}/restore/`,
    { method: "POST", body: JSON.stringify({}) },
    true,
  );
}

export async function downloadBackup(filename: string) {
  const token = getAccessToken();
  const res = await fetch(
    `${API_URL}/api/backups/${encodeURIComponent(filename)}/`,
    {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    },
  );
  if (!res.ok) {
    throw new Error("Backup download failed.");
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
