"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  expressProcurementInterest,
  fetchProcurementNotices,
} from "@/lib/api";
import { PageHero } from "@/components/public/page-hero";
import { Section } from "@/components/public/section";
import { Badge, statusTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";

const schema = z.object({
  notice_slug: z.string().min(1, "Select a notice"),
  organization: z.string().min(2, "Enter your organization"),
  contact_name: z.string().min(2, "Enter the contact name"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().optional(),
  message: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function ProcurementPage() {
  const { push } = useToast();
  const [sent, setSent] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["procurement-notices"],
    queryFn: fetchProcurementNotices,
  });

  const notices = data ?? [];
  const openNotices = notices.filter((n) => n.status === "open" || n.status === "published");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { notice_slug: "" },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await expressProcurementInterest({
        notice_slug: values.notice_slug,
        organization: values.organization,
        contact_name: values.contact_name,
        email: values.email,
        phone: values.phone || undefined,
        message: values.message || undefined,
      });
      setSent(true);
      push("Interest submitted successfully.", "success");
    } catch (error) {
      push(
        error instanceof Error ? error.message : "Unable to submit interest.",
        "error",
      );
    }
  };

  return (
    <>
      <PageHero
        title="Procurement Notices"
        description="Open federation procurement opportunities. Review notices and express interest for follow-up by the procurement team."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Procurement" },
        ]}
      />
      <Section>
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <h2 className="font-display text-2xl text-navy-950">
              Current notices
            </h2>
            {isError ? (
              <p className="border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-warning">
                Unable to load live procurement notices. Please try again later.
              </p>
            ) : null}
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
              </div>
            ) : notices.length === 0 ? (
              <EmptyState
                title="No procurement notices published"
                description="Open notices will appear here when published by OWUF."
              />
            ) : (
              <div className="space-y-3">
                {notices.map((notice) => (
                  <article
                    key={notice.slug}
                    className="border-b border-border py-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="font-display text-xl text-navy-950">
                          {notice.title}
                        </h3>
                        {notice.reference_code ? (
                          <p className="mt-1 text-xs font-semibold text-ocean-700">
                            Ref: {notice.reference_code}
                          </p>
                        ) : null}
                      </div>
                      <Badge tone={statusTone(notice.status)}>
                        {notice.status.replaceAll("_", " ")}
                      </Badge>
                    </div>
                    <p className="mt-3 text-sm text-slate-600">{notice.summary}</p>
                    <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-600">
                      <span>{notice.category}</span>
                      {notice.closing_at ? (
                        <span>
                          Closes{" "}
                          {new Date(notice.closing_at).toLocaleDateString(
                            "en-GB",
                            {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            },
                          )}
                        </span>
                      ) : null}
                    </div>
                    {notice.document_url ? (
                      <a
                        href={notice.document_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex text-sm font-semibold text-ocean-700 hover:underline focus-ring rounded"
                      >
                        View documents
                      </a>
                    ) : null}
                  </article>
                ))}
              </div>
            )}
          </div>

          <aside>
            {sent ? (
              <div
                className="border border-teal-200 bg-teal-50 p-6 text-success"
                role="status"
              >
                <h2 className="font-display text-xl text-navy-950">
                  Interest received
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  Thank you. The procurement team will review your expression of
                  interest and follow up by email.
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-4 border border-border bg-white p-6"
                noValidate
              >
                <div>
                  <h2 className="font-display text-xl text-navy-950">
                    Express interest
                  </h2>
                  <p className="mt-2 text-sm text-slate-600">
                    Select a notice and submit your organization details.
                  </p>
                </div>
                <div>
                  <label
                    htmlFor="notice_slug"
                    className="mb-1.5 block text-sm font-semibold"
                  >
                    Notice <span className="text-danger">*</span>
                  </label>
                  <select
                    id="notice_slug"
                    className="w-full rounded-sm border border-border bg-white px-3.5 py-3 text-sm focus-ring"
                    {...register("notice_slug")}
                  >
                    <option value="">Select a notice…</option>
                    {(openNotices.length > 0 ? openNotices : notices).map(
                      (notice) => (
                        <option key={notice.slug} value={notice.slug}>
                          {notice.title}
                        </option>
                      ),
                    )}
                  </select>
                  {errors.notice_slug ? (
                    <p className="mt-1 text-xs text-danger">
                      {errors.notice_slug.message}
                    </p>
                  ) : null}
                </div>
                {(
                  [
                    ["organization", "Organization", "text"],
                    ["contact_name", "Contact name", "text"],
                    ["email", "Email", "email"],
                    ["phone", "Phone", "tel"],
                  ] as const
                ).map(([name, label, type]) => (
                  <div key={name}>
                    <label
                      htmlFor={name}
                      className="mb-1.5 block text-sm font-semibold"
                    >
                      {label}
                      {name !== "phone" ? (
                        <span className="text-danger"> *</span>
                      ) : null}
                    </label>
                    <Input id={name} type={type} {...register(name)} />
                    {errors[name] ? (
                      <p className="mt-1 text-xs text-danger">
                        {errors[name]?.message}
                      </p>
                    ) : null}
                  </div>
                ))}
                <div>
                  <label
                    htmlFor="message"
                    className="mb-1.5 block text-sm font-semibold"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    className="w-full rounded-sm border border-border px-3.5 py-3 text-sm focus-ring"
                    {...register("message")}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting || notices.length === 0}
                >
                  {isSubmitting ? "Submitting…" : "Submit interest"}
                </Button>
              </form>
            )}
          </aside>
        </div>
      </Section>
    </>
  );
}
