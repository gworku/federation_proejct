"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  submitServiceRequest,
  type ServiceRequestCategory,
} from "@/lib/api";
import { PageHero } from "@/components/public/page-hero";
import { Section } from "@/components/public/section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

const services = [
  "Operational assessments and performance reviews",
  "Engineering support and system diagnostics",
  "Billing, revenue, and NRW assessments",
  "Metering and water-quality management advice",
  "Maintenance planning and institutional assessments",
  "ICT and digital-transformation assistance",
];

const categories: Array<{ value: ServiceRequestCategory; label: string }> = [
  { value: "operations", label: "Operations" },
  { value: "engineering", label: "Engineering" },
  { value: "billing", label: "Billing & Revenue" },
  { value: "nrw", label: "NRW Reduction" },
  { value: "water_quality", label: "Water Quality" },
  { value: "ict", label: "ICT & Digital" },
  { value: "institutional", label: "Institutional" },
  { value: "other", label: "Other" },
];

const schema = z.object({
  name: z.string().min(2, "Enter your name"),
  email: z.string().email("Enter a valid email"),
  organization: z.string().min(2, "Enter your utility or organization"),
  category: z.enum([
    "operations",
    "engineering",
    "billing",
    "nrw",
    "water_quality",
    "ict",
    "institutional",
    "other",
  ]),
  subject: z.string().min(3, "Enter a subject"),
  description: z.string().min(20, "Describe the assistance needed (20+ characters)"),
});

type FormValues = z.infer<typeof schema>;

export default function TechnicalSupportPage() {
  const { push } = useToast();
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { category: "operations" },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await submitServiceRequest(values);
      setSent(true);
      push("Technical support request submitted.", "success");
    } catch (error) {
      push(
        error instanceof Error ? error.message : "Unable to submit request.",
        "error",
      );
    }
  };

  return (
    <>
      <PageHero
        title="Technical Support"
        description="Hands-on technical assistance helping member utilities diagnose challenges, improve operations, and adopt appropriate technologies."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Technical Support" },
        ]}
      />
      <Section>
        <div className="grid gap-8 lg:grid-cols-3">
          <article className="lg:col-span-2">
            <p className="leading-relaxed text-slate-600">
              Member utilities can request technical assistance for operational,
              engineering, financial, and digital challenges. OWUF staff triage
              submissions through the member workspace and follow up by email.
            </p>
            <ul className="mt-6 space-y-3">
              {services.map((item) => (
                <li
                  key={item}
                  className="border border-border bg-white px-4 py-3 text-sm text-slate-600"
                >
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm text-slate-600">
              Already have portal access?{" "}
              <Link
                href="/login"
                className="font-semibold text-ocean-700 hover:underline"
              >
                Sign in to the member workspace
              </Link>
              .
            </p>
          </article>

          <aside>
            {sent ? (
              <div
                className="border border-teal-200 bg-teal-50 p-6 text-success"
                role="status"
              >
                <h2 className="font-display text-xl text-navy-950">
                  Request received
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  Thank you. Our technical team will review your request and
                  contact you at the email you provided.
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
                    Request assistance
                  </h2>
                  <p className="mt-2 text-sm text-slate-600">
                    Submit a technical assistance request. Fields marked * are
                    required.
                  </p>
                </div>
                {(
                  [
                    ["name", "Full name", "text"],
                    ["email", "Email", "email"],
                    ["organization", "Utility / organization", "text"],
                    ["subject", "Subject", "text"],
                  ] as const
                ).map(([name, label, type]) => (
                  <div key={name}>
                    <label
                      htmlFor={name}
                      className="mb-1.5 block text-sm font-semibold"
                    >
                      {label} <span className="text-danger">*</span>
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
                    htmlFor="category"
                    className="mb-1.5 block text-sm font-semibold"
                  >
                    Category <span className="text-danger">*</span>
                  </label>
                  <select
                    id="category"
                    className="w-full rounded-sm border border-border bg-white px-3.5 py-3 text-sm focus-ring"
                    {...register("category")}
                  >
                    {categories.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                  {errors.category ? (
                    <p className="mt-1 text-xs text-danger">
                      {errors.category.message}
                    </p>
                  ) : null}
                </div>
                <div>
                  <label
                    htmlFor="description"
                    className="mb-1.5 block text-sm font-semibold"
                  >
                    Description <span className="text-danger">*</span>
                  </label>
                  <textarea
                    id="description"
                    rows={5}
                    className="w-full rounded-sm border border-border px-3.5 py-3 text-sm focus-ring"
                    {...register("description")}
                  />
                  {errors.description ? (
                    <p className="mt-1 text-xs text-danger">
                      {errors.description.message}
                    </p>
                  ) : null}
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting…" : "Submit request"}
                </Button>
              </form>
            )}
          </aside>
        </div>
      </Section>
    </>
  );
}
