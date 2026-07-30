"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { cmsHref, cmsTabGroups, parseCmsTab, type CmsTab } from "@/lib/app-routes";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createEvent,
  createGalleryItem,
  createKnowledgeDoc,
  createLeader,
  createNewsArticle,
  createPartner,
  createProcurementNotice,
  createProject,
  createPublication,
  createStatistic,
  createTrainingCourse,
  createUtility,
  deleteEvent,
  deleteGalleryItem,
  deleteKnowledgeDoc,
  deleteLeader,
  deleteNewsArticle,
  deleteNewsletterSubscriber,
  deletePartner,
  deleteProcurementNotice,
  deleteProject,
  deletePublication,
  deleteStatistic,
  deleteTrainingCourse,
  deleteUtility,
  fetchEventsAuth,
  fetchGalleryAuth,
  fetchKnowledgeDocsAuth,
  fetchLeadershipAuth,
  fetchNews,
  fetchNewsletterSubscribers,
  fetchPartnersAuth,
  fetchProcurementNoticesAuth,
  fetchProjects,
  fetchPublicationsAuth,
  fetchStatistics,
  fetchTrainingAuth,
  fetchUtilities,
  updateEvent,
  updateGalleryItem,
  updateKnowledgeDoc,
  updateLeader,
  updateNewsArticle,
  updatePartner,
  updateProcurementNotice,
  updateProject,
  updatePublication,
  updateStatistic,
  updateTrainingCourse,
  updateUtility,
} from "@/lib/api";
import { CmsCrudPanel, toSlug } from "@/components/app/cms-crud-panel";
import { LocaleTranslationsPanel } from "@/components/app/locale-translations-panel";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";


const statusOptions = [
  { value: "draft", label: "Draft" },
  { value: "pending_review", label: "Pending review" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
];

export default function CmsPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = parseCmsTab(searchParams.get("tab"));
  const setTab = (next: CmsTab) => router.replace(cmsHref(next));
  const queryClient = useQueryClient();
  const { push } = useToast();

  const newsQuery = useQuery({
    queryKey: ["cms-news"],
    queryFn: () => fetchNews(true),
  });
  const statsQuery = useQuery({
    queryKey: ["cms-stats"],
    queryFn: fetchStatistics,
  });
  const newsletterQuery = useQuery({
    queryKey: ["cms-newsletter"],
    queryFn: fetchNewsletterSubscribers,
    enabled: tab === "Newsletter",
  });

  const deleteSubMutation = useMutation({
    mutationFn: deleteNewsletterSubscriber,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["cms-newsletter"] });
      push("Subscriber removed.", "success");
    },
    onError: (error: Error) => push(error.message, "error"),
  });

  const articles = newsQuery.data ?? [];
  const drafts = useMemo(
    () => articles.filter((item) => item.status === "draft").length,
    [articles],
  );
  const pendingReview = useMemo(
    () => articles.filter((item) => item.status === "pending_review").length,
    [articles],
  );

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-white p-5 shadow-sm">
        <h1 className="font-display text-2xl text-navy-950">Content manager</h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">
          Administrators and content editors can create, update, and delete website
          content from this page — news, publications, events, gallery, leadership,
          partners, programmes, utilities, homepage stats, translations, and newsletter
          subscribers.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <article className="rounded-md border border-border bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
            Articles
          </p>
          <p className="mt-2 font-display text-3xl text-ocean-700">
            {newsQuery.isLoading ? "…" : articles.length}
          </p>
        </article>
        <article className="rounded-md border border-border bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
            Drafts
          </p>
          <p className="mt-2 font-display text-3xl text-warning">
            {newsQuery.isLoading ? "…" : drafts}
          </p>
        </article>
        <article className="rounded-md border border-border bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
            Pending review
          </p>
          <p className="mt-2 font-display text-3xl text-amber-600">
            {newsQuery.isLoading ? "…" : pendingReview}
          </p>
        </article>
        <article className="rounded-md border border-border bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
            Homepage stats
          </p>
          <p className="mt-2 font-display text-3xl text-ocean-700">
            {statsQuery.isLoading ? "…" : statsQuery.data?.length ?? 0}
          </p>
        </article>
      </section>
      <p className="text-sm text-slate-600">
        Content editors can set Draft or Pending review. Only administrators and
        management can publish news, events, and publications live.
      </p>

      <div className="space-y-3 border-b border-border pb-3">
        {cmsTabGroups.map((group) => (
          <div key={group.label} className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {group.label}
            </p>
            <div className="flex flex-wrap gap-2">
              {group.tabs.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setTab(item)}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-sm font-semibold focus-ring",
                    tab === item
                      ? "bg-ocean-600 text-white"
                      : "bg-sky-50 text-navy-800 hover:bg-sky-100",
                  )}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {tab === "News" ? (
        <CmsCrudPanel
          queryKey="cms-news"
          title="News articles"
          description="Create, edit, publish, and delete federation news."
          fields={[
            { name: "title", label: "Title", required: true },
            { name: "category", label: "Category", required: true },
            {
              name: "excerpt",
              label: "Excerpt",
              type: "textarea",
              required: true,
            },
            { name: "body", label: "Body", type: "textarea" },
            {
              name: "status",
              label: "Status",
              type: "select",
              options: statusOptions,
            },
            { name: "featured", label: "Featured", type: "checkbox" },
          ]}
          defaults={{
            title: "",
            category: "Governance",
            excerpt: "",
            body: "",
            status: "draft",
            featured: false,
          }}
          columns={[
            { key: "title", label: "Title" },
            { key: "category", label: "Category" },
            { key: "status", label: "Status" },
          ]}
          listFn={() => fetchNews(true)}
          createFn={(payload) =>
            createNewsArticle({
              title: String(payload.title),
              slug: toSlug(String(payload.title)) || `article-${Date.now()}`,
              category: String(payload.category),
              excerpt: String(payload.excerpt),
              body: String(payload.body || payload.excerpt),
              status: payload.status as
                | "draft"
                | "pending_review"
                | "published"
                | "archived",
              featured: Boolean(payload.featured),
              published_at:
                payload.status === "published"
                  ? new Date().toISOString()
                  : null,
            })
          }
          updateFn={(id, payload) =>
            updateNewsArticle(String(id), {
              title: String(payload.title),
              category: String(payload.category),
              excerpt: String(payload.excerpt),
              body: String(payload.body || payload.excerpt),
              status: payload.status as
                | "draft"
                | "pending_review"
                | "published"
                | "archived",
              featured: Boolean(payload.featured),
              published_at:
                payload.status === "published"
                  ? new Date().toISOString()
                  : null,
            })
          }
          deleteFn={(id) => deleteNewsArticle(String(id))}
          getId={(row) => row.slug}
        />
      ) : null}

      {tab === "Publications" ? (
        <CmsCrudPanel
          queryKey="cms-publications"
          title="Publications"
          description="Manage public reports and downloadable files."
          fields={[
            { name: "title", label: "Title", required: true },
            { name: "category", label: "Category", required: true },
            { name: "description", label: "Description", type: "textarea" },
            {
              name: "file_url",
              label: "File / document",
              type: "file",
              folder: "publications",
              accept: ".pdf,.doc,.docx,.xls,.xlsx,image/*",
            },
            { name: "file_type", label: "File type", placeholder: "PDF" },
            { name: "file_size", label: "File size", placeholder: "1.2 MB" },
            {
              name: "status",
              label: "Status",
              type: "select",
              options: statusOptions,
            },
            { name: "is_public", label: "Public", type: "checkbox" },
          ]}
          defaults={{
            title: "",
            category: "Report",
            description: "",
            file_url: "",
            file_type: "PDF",
            file_size: "",
            status: "draft",
            is_public: true,
          }}
          columns={[
            { key: "title", label: "Title" },
            { key: "category", label: "Category" },
            { key: "status", label: "Status" },
          ]}
          listFn={fetchPublicationsAuth}
          createFn={(payload) =>
            createPublication({
              ...payload,
              title: String(payload.title),
              slug: toSlug(String(payload.title)) || `pub-${Date.now()}`,
              category: String(payload.category),
              status: String(payload.status),
              description: String(payload.description ?? ""),
              file_url: String(payload.file_url ?? ""),
              file_type: String(payload.file_type ?? "PDF"),
              file_size: String(payload.file_size ?? ""),
              is_public: Boolean(payload.is_public),
            })
          }
          updateFn={(id, payload) =>
            updatePublication(String(id), {
              ...payload,
              title: String(payload.title),
              category: String(payload.category),
              status: String(payload.status),
              is_public: Boolean(payload.is_public),
            })
          }
          deleteFn={(id) => deletePublication(String(id))}
          getId={(row) => row.slug}
        />
      ) : null}

      {tab === "Events" ? (
        <CmsCrudPanel
          queryKey="cms-events"
          title="Events"
          description="Publish federation events and workshops."
          fields={[
            { name: "title", label: "Title", required: true },
            { name: "summary", label: "Summary", type: "textarea", required: true },
            { name: "location", label: "Location", required: true },
            { name: "starts_at", label: "Starts", type: "datetime-local", required: true },
            { name: "ends_at", label: "Ends", type: "datetime-local" },
            {
              name: "status",
              label: "Status",
              type: "select",
              options: [
                { value: "draft", label: "Draft" },
                { value: "pending_review", label: "Pending review" },
                { value: "published", label: "Published" },
                { value: "cancelled", label: "Cancelled" },
              ],
            },
            { name: "is_public", label: "Public", type: "checkbox" },
          ]}
          defaults={{
            title: "",
            summary: "",
            location: "Addis Ababa",
            starts_at: "",
            ends_at: "",
            status: "draft",
            is_public: true,
          }}
          columns={[
            { key: "title", label: "Title" },
            { key: "location", label: "Location" },
            { key: "status", label: "Status" },
          ]}
          listFn={fetchEventsAuth}
          createFn={(payload) =>
            createEvent({
              title: String(payload.title),
              slug: toSlug(String(payload.title)) || `event-${Date.now()}`,
              summary: String(payload.summary),
              location: String(payload.location),
              starts_at: String(payload.starts_at),
              ends_at: payload.ends_at ? String(payload.ends_at) : null,
              status: String(payload.status),
              is_public: Boolean(payload.is_public),
            } as never)
          }
          updateFn={(id, payload) =>
            updateEvent(String(id), {
              title: String(payload.title),
              summary: String(payload.summary),
              location: String(payload.location),
              starts_at: String(payload.starts_at),
              ends_at: payload.ends_at ? String(payload.ends_at) : null,
              status: String(payload.status),
              is_public: Boolean(payload.is_public),
            } as never)
          }
          deleteFn={(id) => deleteEvent(String(id))}
          getId={(row) => row.slug}
        />
      ) : null}

      {tab === "Gallery" ? (
        <CmsCrudPanel
          queryKey="cms-gallery"
          title="Gallery"
          description="Manage photo gallery items shown on the public site."
          fields={[
            { name: "title", label: "Title", required: true },
            { name: "caption", label: "Caption", type: "textarea" },
            {
              name: "image_url",
              label: "Image",
              type: "file",
              required: true,
              folder: "gallery",
              accept: "image/*",
            },
            { name: "category", label: "Category" },
            { name: "sort_order", label: "Sort order", type: "number" },
            { name: "is_public", label: "Public", type: "checkbox" },
          ]}
          defaults={{
            title: "",
            caption: "",
            image_url: "",
            category: "General",
            sort_order: 0,
            is_public: true,
          }}
          columns={[
            { key: "title", label: "Title" },
            { key: "category", label: "Category" },
            { key: "sort_order", label: "Order" },
          ]}
          listFn={fetchGalleryAuth}
          createFn={(payload) =>
            createGalleryItem({
              title: String(payload.title),
              caption: String(payload.caption ?? ""),
              image_url: String(payload.image_url),
              category: String(payload.category ?? "General"),
              sort_order: Number(payload.sort_order ?? 0),
              is_public: Boolean(payload.is_public),
            } as never)
          }
          updateFn={(id, payload) =>
            updateGalleryItem(Number(id), {
              title: String(payload.title),
              caption: String(payload.caption ?? ""),
              image_url: String(payload.image_url),
              category: String(payload.category ?? "General"),
              sort_order: Number(payload.sort_order ?? 0),
              is_public: Boolean(payload.is_public),
            } as never)
          }
          deleteFn={(id) => deleteGalleryItem(Number(id))}
          getId={(row) => row.id!}
        />
      ) : null}

      {tab === "Leadership" ? (
        <CmsCrudPanel
          queryKey="cms-leadership"
          title="Leadership"
          description="Board and management profiles."
          fields={[
            { name: "name", label: "Name", required: true },
            { name: "role", label: "Role", required: true },
            { name: "bio", label: "Bio", type: "textarea" },
            {
              name: "photo_url",
              label: "Photo",
              type: "file",
              folder: "leadership",
              accept: "image/*",
            },
            { name: "sort_order", label: "Sort order", type: "number" },
            { name: "is_public", label: "Public", type: "checkbox" },
          ]}
          defaults={{
            name: "",
            role: "",
            bio: "",
            photo_url: "",
            sort_order: 0,
            is_public: true,
          }}
          columns={[
            { key: "name", label: "Name" },
            { key: "role", label: "Role" },
            { key: "sort_order", label: "Order" },
          ]}
          listFn={fetchLeadershipAuth}
          createFn={(payload) =>
            createLeader({
              name: String(payload.name),
              role: String(payload.role),
              bio: String(payload.bio ?? ""),
              photo_url: String(payload.photo_url ?? ""),
              sort_order: Number(payload.sort_order ?? 0),
              is_public: Boolean(payload.is_public),
            } as never)
          }
          updateFn={(id, payload) =>
            updateLeader(Number(id), {
              name: String(payload.name),
              role: String(payload.role),
              bio: String(payload.bio ?? ""),
              photo_url: String(payload.photo_url ?? ""),
              sort_order: Number(payload.sort_order ?? 0),
              is_public: Boolean(payload.is_public),
            } as never)
          }
          deleteFn={(id) => deleteLeader(Number(id))}
          getId={(row) => row.id!}
        />
      ) : null}

      {tab === "Partners" ? (
        <CmsCrudPanel
          queryKey="cms-partners"
          title="Partners"
          description="Strategic and development partners."
          fields={[
            { name: "name", label: "Name", required: true },
            {
              name: "category",
              label: "Category",
              type: "select",
              options: [
                { value: "government", label: "Government" },
                { value: "development", label: "Development Partner" },
                { value: "research", label: "Research / University" },
                { value: "association", label: "Professional Association" },
                { value: "private", label: "Private Sector" },
                { value: "media", label: "Media" },
                { value: "other", label: "Other" },
              ],
            },
            { name: "summary", label: "Summary", type: "textarea" },
            { name: "website", label: "Website" },
            {
              name: "logo_url",
              label: "Logo",
              type: "file",
              folder: "partners",
              accept: "image/*",
            },
            { name: "sort_order", label: "Sort order", type: "number" },
            { name: "is_public", label: "Public", type: "checkbox" },
          ]}
          defaults={{
            name: "",
            category: "development",
            summary: "",
            website: "",
            logo_url: "",
            sort_order: 0,
            is_public: true,
          }}
          columns={[
            { key: "name", label: "Name" },
            { key: "category", label: "Category" },
            { key: "is_public", label: "Public" },
          ]}
          listFn={fetchPartnersAuth}
          createFn={(payload) =>
            createPartner({
              name: String(payload.name),
              slug: toSlug(String(payload.name)) || `partner-${Date.now()}`,
              category: String(payload.category ?? ""),
              summary: String(payload.summary ?? ""),
              website: String(payload.website ?? ""),
              logo_url: String(payload.logo_url ?? ""),
              sort_order: Number(payload.sort_order ?? 0),
              is_public: Boolean(payload.is_public),
            })
          }
          updateFn={(id, payload) =>
            updatePartner(String(id), {
              name: String(payload.name),
              category: String(payload.category ?? ""),
              summary: String(payload.summary ?? ""),
              website: String(payload.website ?? ""),
              logo_url: String(payload.logo_url ?? ""),
              sort_order: Number(payload.sort_order ?? 0),
              is_public: Boolean(payload.is_public),
            })
          }
          deleteFn={(id) => deletePartner(String(id))}
          getId={(row) => row.slug}
        />
      ) : null}

      {tab === "Training" ? (
        <CmsCrudPanel
          queryKey="cms-training"
          title="Training courses"
          description="Open and manage capacity-building courses."
          fields={[
            { name: "title", label: "Title", required: true },
            { name: "summary", label: "Summary", type: "textarea", required: true },
            { name: "topic", label: "Topic" },
            { name: "venue", label: "Venue" },
            { name: "facilitator", label: "Facilitator" },
            { name: "starts_at", label: "Starts", type: "datetime-local", required: true },
            { name: "ends_at", label: "Ends", type: "datetime-local" },
            { name: "capacity", label: "Capacity", type: "number" },
            {
              name: "status",
              label: "Status",
              type: "select",
              options: [
                { value: "draft", label: "Draft" },
                { value: "open", label: "Open" },
                { value: "full", label: "Full" },
                { value: "closed", label: "Closed" },
                { value: "completed", label: "Completed" },
              ],
            },
            { name: "is_online", label: "Online", type: "checkbox" },
            { name: "is_public", label: "Public", type: "checkbox" },
          ]}
          defaults={{
            title: "",
            summary: "",
            topic: "",
            venue: "",
            facilitator: "",
            starts_at: "",
            ends_at: "",
            capacity: 30,
            status: "draft",
            is_online: false,
            is_public: true,
          }}
          columns={[
            { key: "title", label: "Title" },
            { key: "topic", label: "Topic" },
            { key: "status", label: "Status" },
          ]}
          listFn={fetchTrainingAuth}
          createFn={(payload) =>
            createTrainingCourse({
              title: String(payload.title),
              slug: toSlug(String(payload.title)) || `training-${Date.now()}`,
              summary: String(payload.summary),
              topic: String(payload.topic ?? ""),
              venue: String(payload.venue ?? ""),
              facilitator: String(payload.facilitator ?? ""),
              starts_at: String(payload.starts_at),
              ends_at: payload.ends_at ? String(payload.ends_at) : null,
              capacity: Number(payload.capacity || 0) || null,
              status: String(payload.status),
              is_online: Boolean(payload.is_online),
              is_public: Boolean(payload.is_public),
            })
          }
          updateFn={(id, payload) =>
            updateTrainingCourse(String(id), {
              title: String(payload.title),
              summary: String(payload.summary),
              topic: String(payload.topic ?? ""),
              venue: String(payload.venue ?? ""),
              facilitator: String(payload.facilitator ?? ""),
              starts_at: String(payload.starts_at),
              ends_at: payload.ends_at ? String(payload.ends_at) : null,
              capacity: Number(payload.capacity || 0) || null,
              status: String(payload.status),
              is_online: Boolean(payload.is_online),
              is_public: Boolean(payload.is_public),
            })
          }
          deleteFn={(id) => deleteTrainingCourse(String(id))}
          getId={(row) => row.slug}
        />
      ) : null}

      {tab === "Procurement" ? (
        <CmsCrudPanel
          queryKey="cms-procurement"
          title="Procurement notices"
          description="Publish tenders and procurement opportunities."
          fields={[
            { name: "title", label: "Title", required: true },
            { name: "category", label: "Category" },
            { name: "summary", label: "Summary", type: "textarea", required: true },
            { name: "reference_code", label: "Reference code" },
            { name: "closing_at", label: "Closing", type: "datetime-local" },
            {
              name: "document_url",
              label: "Document",
              type: "file",
              folder: "procurement",
              accept: ".pdf,.doc,.docx,.xls,.xlsx,image/*",
            },
            {
              name: "status",
              label: "Status",
              type: "select",
              options: [
                { value: "draft", label: "Draft" },
                { value: "open", label: "Open" },
                { value: "closed", label: "Closed" },
                { value: "awarded", label: "Awarded" },
              ],
            },
            { name: "is_public", label: "Public", type: "checkbox" },
          ]}
          defaults={{
            title: "",
            category: "Goods",
            summary: "",
            reference_code: "",
            closing_at: "",
            document_url: "",
            status: "draft",
            is_public: true,
          }}
          columns={[
            { key: "title", label: "Title" },
            { key: "reference_code", label: "Reference" },
            { key: "status", label: "Status" },
          ]}
          listFn={fetchProcurementNoticesAuth}
          createFn={(payload) =>
            createProcurementNotice({
              title: String(payload.title),
              slug: toSlug(String(payload.title)) || `proc-${Date.now()}`,
              category: String(payload.category ?? ""),
              summary: String(payload.summary),
              reference_code: String(payload.reference_code ?? ""),
              closing_at: payload.closing_at
                ? String(payload.closing_at)
                : null,
              document_url: String(payload.document_url ?? ""),
              status: String(payload.status),
              is_public: Boolean(payload.is_public),
            })
          }
          updateFn={(id, payload) =>
            updateProcurementNotice(String(id), {
              title: String(payload.title),
              category: String(payload.category ?? ""),
              summary: String(payload.summary),
              reference_code: String(payload.reference_code ?? ""),
              closing_at: payload.closing_at
                ? String(payload.closing_at)
                : null,
              document_url: String(payload.document_url ?? ""),
              status: String(payload.status),
              is_public: Boolean(payload.is_public),
            })
          }
          deleteFn={(id) => deleteProcurementNotice(String(id))}
          getId={(row) => row.slug}
        />
      ) : null}

      {tab === "Knowledge" ? (
        <CmsCrudPanel
          queryKey="cms-knowledge"
          title="Knowledge documents"
          description="Manage knowledge hub documents and DMS entries."
          fields={[
            { name: "title", label: "Title", required: true },
            { name: "document_type", label: "Type", placeholder: "Guideline" },
            { name: "topic", label: "Topic" },
            { name: "year", label: "Year", type: "number" },
            { name: "language", label: "Language", placeholder: "en" },
            { name: "author", label: "Author" },
            { name: "summary", label: "Summary", type: "textarea", required: true },
            {
              name: "file_url",
              label: "Document file",
              type: "file",
              folder: "knowledge",
              accept: ".pdf,.doc,.docx,.xls,.xlsx,image/*",
            },
            { name: "file_type", label: "File type" },
            { name: "version", label: "Version" },
            {
              name: "access_level",
              label: "Access",
              type: "select",
              options: [
                { value: "public", label: "Public" },
                { value: "members", label: "Members" },
                { value: "staff", label: "Staff" },
              ],
            },
            {
              name: "status",
              label: "Status",
              type: "select",
              options: statusOptions,
            },
            { name: "is_public", label: "Public", type: "checkbox" },
          ]}
          defaults={{
            title: "",
            document_type: "Guideline",
            topic: "",
            year: new Date().getFullYear(),
            language: "en",
            author: "OWUF",
            summary: "",
            file_url: "",
            file_type: "PDF",
            version: "1.0",
            access_level: "public",
            status: "draft",
            is_public: true,
          }}
          columns={[
            { key: "title", label: "Title" },
            { key: "document_type", label: "Type" },
            { key: "status", label: "Status" },
          ]}
          listFn={fetchKnowledgeDocsAuth}
          createFn={(payload) =>
            createKnowledgeDoc({
              title: String(payload.title),
              slug: toSlug(String(payload.title)) || `doc-${Date.now()}`,
              document_type: String(payload.document_type ?? ""),
              topic: String(payload.topic ?? ""),
              year: Number(payload.year || 0) || null,
              language: String(payload.language ?? "en"),
              author: String(payload.author ?? ""),
              summary: String(payload.summary),
              file_url: String(payload.file_url ?? ""),
              file_type: String(payload.file_type ?? "PDF"),
              version: String(payload.version ?? "1.0"),
              access_level: String(payload.access_level ?? "public"),
              status: String(payload.status),
              is_public: Boolean(payload.is_public),
            })
          }
          updateFn={(id, payload) =>
            updateKnowledgeDoc(String(id), {
              title: String(payload.title),
              document_type: String(payload.document_type ?? ""),
              topic: String(payload.topic ?? ""),
              year: Number(payload.year || 0) || null,
              language: String(payload.language ?? "en"),
              author: String(payload.author ?? ""),
              summary: String(payload.summary),
              file_url: String(payload.file_url ?? ""),
              file_type: String(payload.file_type ?? "PDF"),
              version: String(payload.version ?? "1.0"),
              access_level: String(payload.access_level ?? "public"),
              status: String(payload.status),
              is_public: Boolean(payload.is_public),
            })
          }
          deleteFn={(id) => deleteKnowledgeDoc(String(id))}
          getId={(row) => row.slug}
        />
      ) : null}

      {tab === "Projects" ? (
        <CmsCrudPanel
          queryKey="cms-projects"
          title="Projects & programmes"
          description="Create, update, and remove public programme pages."
          fields={[
            { name: "title", label: "Title", required: true },
            { name: "location", label: "Location", required: true },
            { name: "category", label: "Category", required: true },
            { name: "status", label: "Status", required: true, placeholder: "Active" },
            { name: "progress", label: "Progress %", type: "number" },
            { name: "description", label: "Description", type: "textarea", required: true },
            { name: "objectives", label: "Objectives", type: "textarea" },
            { name: "funding_partner", label: "Funding partner" },
            { name: "contact_person", label: "Contact person" },
            { name: "is_public", label: "Public", type: "checkbox" },
          ]}
          defaults={{
            title: "",
            location: "Oromia",
            category: "Member Services",
            status: "Active",
            progress: 0,
            description: "",
            objectives: "",
            funding_partner: "",
            contact_person: "",
            is_public: true,
          }}
          columns={[
            { key: "title", label: "Title" },
            { key: "status", label: "Status" },
            { key: "progress", label: "Progress" },
          ]}
          listFn={() => fetchProjects()}
          createFn={(payload) =>
            createProject({
              title: String(payload.title),
              slug: toSlug(String(payload.title)) || `project-${Date.now()}`,
              location: String(payload.location),
              category: String(payload.category),
              status: String(payload.status),
              progress: Number(payload.progress ?? 0),
              description: String(payload.description),
              objectives: String(payload.objectives ?? ""),
              funding_partner: String(payload.funding_partner ?? ""),
              contact_person: String(payload.contact_person ?? ""),
              is_public: Boolean(payload.is_public),
            })
          }
          updateFn={(id, payload) =>
            updateProject(String(id), {
              title: String(payload.title),
              location: String(payload.location),
              category: String(payload.category),
              status: String(payload.status),
              progress: Number(payload.progress ?? 0),
              description: String(payload.description),
              objectives: String(payload.objectives ?? ""),
              funding_partner: String(payload.funding_partner ?? ""),
              contact_person: String(payload.contact_person ?? ""),
              is_public: Boolean(payload.is_public),
            })
          }
          deleteFn={(id) => deleteProject(String(id))}
          getId={(row) => row.slug!}
        />
      ) : null}

      {tab === "Utilities" ? (
        <CmsCrudPanel
          queryKey="cms-utilities"
          title="Member utilities"
          description="Maintain the public utilities directory."
          fields={[
            { name: "name", label: "Utility name", required: true },
            { name: "zone", label: "Zone", required: true },
            { name: "city", label: "City / town", required: true },
            { name: "grade", label: "Grade", required: true, placeholder: "1st" },
            {
              name: "status",
              label: "Status",
              type: "select",
              options: [
                { value: "Active", label: "Active" },
                { value: "Digitizing", label: "Digitizing" },
                { value: "Support Needed", label: "Support Needed" },
              ],
            },
            { name: "customers", label: "Customers", type: "number" },
            { name: "contact_email", label: "Contact email" },
            { name: "contact_phone", label: "Contact phone" },
            { name: "is_public", label: "Public", type: "checkbox" },
          ]}
          defaults={{
            name: "",
            zone: "",
            city: "",
            grade: "1st",
            status: "Active",
            customers: 0,
            contact_email: "",
            contact_phone: "",
            is_public: true,
          }}
          columns={[
            { key: "name", label: "Name" },
            { key: "zone", label: "Zone" },
            { key: "status", label: "Status" },
          ]}
          listFn={() => fetchUtilities()}
          createFn={(payload) =>
            createUtility({
              name: String(payload.name),
              slug: toSlug(String(payload.name)) || `utility-${Date.now()}`,
              zone: String(payload.zone),
              city: String(payload.city),
              grade: String(payload.grade),
              status: String(payload.status),
              customers: Number(payload.customers || 0) || null,
              contact_email: String(payload.contact_email ?? ""),
              contact_phone: String(payload.contact_phone ?? ""),
              is_public: Boolean(payload.is_public),
            })
          }
          updateFn={(id, payload) =>
            updateUtility(String(id), {
              name: String(payload.name),
              zone: String(payload.zone),
              city: String(payload.city),
              grade: String(payload.grade),
              status: String(payload.status),
              customers: Number(payload.customers || 0) || null,
              contact_email: String(payload.contact_email ?? ""),
              contact_phone: String(payload.contact_phone ?? ""),
              is_public: Boolean(payload.is_public),
            })
          }
          deleteFn={(id) => deleteUtility(String(id))}
          getId={(row) => row.slug!}
        />
      ) : null}

      {tab === "Stats" ? (
        <CmsCrudPanel
          queryKey="cms-stats"
          title="Homepage statistics"
          description="Create, update, and delete counters shown on the public homepage."
          fields={[
            { name: "key", label: "Key", required: true, placeholder: "utilities" },
            { name: "label", label: "Label", required: true },
            { name: "value", label: "Value", type: "number", required: true },
            { name: "suffix", label: "Suffix", placeholder: "+" },
            { name: "sort_order", label: "Sort order", type: "number" },
            { name: "is_public", label: "Public", type: "checkbox" },
          ]}
          defaults={{
            key: "",
            label: "",
            value: 0,
            suffix: "",
            sort_order: 0,
            is_public: true,
          }}
          columns={[
            { key: "label", label: "Label" },
            { key: "key", label: "Key" },
            { key: "value", label: "Value" },
          ]}
          listFn={fetchStatistics}
          createFn={(payload) =>
            createStatistic({
              key: toSlug(String(payload.key || payload.label)) || `stat-${Date.now()}`,
              label: String(payload.label),
              value: Number(payload.value ?? 0),
              suffix: String(payload.suffix ?? ""),
              sort_order: Number(payload.sort_order ?? 0),
              is_public: Boolean(payload.is_public),
            })
          }
          updateFn={(id, payload) =>
            updateStatistic(String(id), {
              label: String(payload.label),
              value: Number(payload.value ?? 0),
              suffix: String(payload.suffix ?? ""),
              sort_order: Number(payload.sort_order ?? 0),
              is_public: Boolean(payload.is_public),
            })
          }
          deleteFn={(id) => deleteStatistic(String(id))}
          getId={(row) => row.key!}
        />
      ) : null}

      {tab === "Translations" ? <LocaleTranslationsPanel /> : null}

      {tab === "Newsletter" ? (
        <section className="space-y-4">
          <div>
            <h2 className="font-display text-2xl text-navy-950">
              Newsletter subscribers
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Manage public newsletter subscriptions.
            </p>
          </div>
          {newsletterQuery.isLoading ? (
            <Skeleton className="h-24" />
          ) : !newsletterQuery.data?.length ? (
            <EmptyState title="No subscribers yet" />
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-border bg-white shadow-sm">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-sky-50">
                  <tr>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Subscribed</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {newsletterQuery.data.map((row) => (
                    <tr key={row.id} className="border-t border-border">
                      <td className="px-4 py-3">{row.email}</td>
                      <td className="px-4 py-3 text-slate-600">
                        {new Date(row.created_at).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          type="button"
                          size="sm"
                          variant="danger"
                          onClick={() => {
                            if (window.confirm("Remove this subscriber?")) {
                              deleteSubMutation.mutate(row.id);
                            }
                          }}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      ) : null}
    </div>
  );
}
