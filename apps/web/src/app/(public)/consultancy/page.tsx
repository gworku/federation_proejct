"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { submitConsultancyRequest } from "@/lib/api";
import { PageHero } from "@/components/public/page-hero";
import { Section } from "@/components/public/section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

const services = [
  "Water engineering assessments and system design support",
  "Utility management and institutional strengthening",
  "Financial management and revenue improvement studies",
  "ICT systems, billing platforms, and digital transformation",
  "GIS, SCADA, and network monitoring advisory",
  "Policy, strategy, and research / feasibility support",
];

const categories = [
  { value: "engineering", label: "Water Engineering" },
  { value: "management", label: "Utility Management" },
  { value: "financial", label: "Financial Management" },
  { value: "ict", label: "ICT Systems" },
  { value: "gis_scada", label: "GIS / SCADA" },
  { value: "policy", label: "Policy & Strategy" },
  { value: "research", label: "Research / Feasibility" },
  { value: "other", label: "Other" },
] as const;

const schema = z.object({
  name: z.string().min(2, "Enter your name"),
  email: z.string().email("Enter a valid email"),
  organization: z.string().min(2, "Enter your utility or organization"),
  category: z.enum([
    "engineering",
    "management",
    "financial",
    "ict",
    "gis_scada",
    "policy",
    "research",
    "other",
  ]),
  subject: z.string().min(3, "Enter a subject"),
  description: z
    .string()
    .min(20, "Describe the consultancy need (20+ characters)"),
});

type FormValues = z.infer<typeof schema>;

export default function ConsultancyPage() {
  const { push } = useToast();
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { category: "engineering" },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await submitConsultancyRequest(values);
      setSent(true);
      push("Consultancy request submitted.", "success");
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
        title="Consultancy Services"
        description="Specialized advisory and consultancy support helping member utilities plan, diagnose, and implement improvements across operations and systems."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Consultancy" },
        ]}
      />
      <Section>
        <div className="grid gap-8 lg:grid-cols-3">
          <article className="lg:col-span-2">
            <p className="leading-relaxed text-slate-600">
              OWUF provides structured consultancy for utilities that need deeper
              technical or institutional support beyond routine technical
              assistance. Requests are triaged by OWUF staff after submission.
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
              Looking for lighter technical help?{" "}
              <Link
                href="/technical-support"
                className="font-semibold text-ocean-700 hover:underline"
              >
                Request technical support
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
                  Thank you. Our consultancy team will review your request and
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
                    Request consultancy
                  </h2>
                  <p className="mt-2 text-sm text-slate-600">
                    Fields marked * are required.
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
                    Service area <span className="text-danger">*</span>
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
