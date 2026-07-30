"use client";

import Image from "next/image";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { fetchPartners, submitPartnershipInquiry } from "@/lib/api";
import { pickChrome } from "@/data/public-chrome";
import { useLocale } from "@/hooks/use-locale";
import { PageHero } from "@/components/public/page-hero";
import { Section } from "@/components/public/section";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { org } from "@/lib/org";

const schema = z.object({
  organization: z.string().min(2, "Enter your organization"),
  contact_name: z.string().min(2, "Enter the contact name"),
  email: z.string().email("Enter a valid email"),
  partnership_interest: z.string().min(3, "Describe your partnership interest"),
  message: z.string().min(10, "Enter a short message"),
});

type FormValues = z.infer<typeof schema>;

export default function PartnershipsPage() {
  const { locale, t, href } = useLocale();
  const chrome = pickChrome("partnerships", locale);
  const { push } = useToast();
  const [sent, setSent] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["partners"],
    queryFn: fetchPartners,
  });

  const partners = data ?? [];

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    try {
      await submitPartnershipInquiry(values);
      setSent(true);
      push("Partnership inquiry submitted.", "success");
    } catch (error) {
      push(
        error instanceof Error ? error.message : "Unable to submit inquiry.",
        "error",
      );
    }
  };

  return (
    <>
      <PageHero
        title={chrome.title}
        description={
          chrome.description ||
          `${org.shortName} works with government institutions, member utilities, development partners, and research bodies to strengthen water and sanitation services across Oromia.`
        }
        breadcrumbs={[
          { label: t.home, href: href("/") },
          { label: t.partnerships },
        ]}
      />
      <Section>
        <div className="grid gap-10 lg:grid-cols-3">
          <article className="lg:col-span-2">
            <h2 className="font-display text-2xl text-navy-950">
              {locale === "om"
                ? "Michummaa bu'aa kennaa"
                : locale === "am"
                  ? "\u12e8\u12cd\u1324\u1275 \u12a0\u130b\u122d\u1295\u1290\u1275"
                  : "Collaboration for sector results"}
            </h2>
            <p className="mt-4 max-w-2xl leading-relaxed text-slate-700">
              {locale === "en"
                ? "Partnerships enable OWUF to deliver capacity building, technical assistance, advocacy, and knowledge exchange with OWEB, MoWE, member Water Service Providers, development partners, and academic institutions."
                : chrome.description}
            </p>
            {isLoading ? (
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <Skeleton className="h-28 rounded-md" />
                <Skeleton className="h-28 rounded-md" />
              </div>
            ) : partners.length === 0 ? (
              <div className="mt-8">
                <EmptyState title="No partners published yet" />
              </div>
            ) : (
              <ul className="mt-8 grid gap-4 sm:grid-cols-2">
                {partners.map((partner) => (
                  <li key={partner.slug} className="surface-card p-4">
                    <div className="flex items-start gap-4">
                      <div className="relative flex h-14 w-20 shrink-0 items-center justify-center overflow-hidden rounded-md bg-sky-50">
                        {partner.logo_url ? (
                          <Image
                            src={partner.logo_url}
                            alt=""
                            width={80}
                            height={40}
                            className="max-h-10 w-auto object-contain"
                            unoptimized={
                              partner.logo_url.startsWith("http://") ||
                              partner.logo_url.startsWith("https://")
                            }
                          />
                        ) : (
                          <span className="px-1 text-center text-[10px] font-semibold text-slate-500">
                            {partner.name.slice(0, 18)}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-navy-950">
                          {partner.name}
                        </p>
                        {partner.category ? (
                          <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-ocean-700">
                            {partner.category.replaceAll("_", " ")}
                          </p>
                        ) : null}
                        {partner.summary ? (
                          <p className="mt-2 text-sm text-slate-600">
                            {partner.summary}
                          </p>
                        ) : null}
                        {partner.website ? (
                          <a
                            href={partner.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 inline-flex text-sm font-semibold text-ocean-700 hover:underline focus-ring"
                          >
                            Visit website
                          </a>
                        ) : null}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </article>

          <aside>
            {sent ? (
              <div
                className="surface-card border-teal-200 bg-teal-50 p-6 text-success"
                role="status"
              >
                <h2 className="font-display text-xl text-navy-950">
                  Inquiry received
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  Thank you. Our partnerships team will review your inquiry and
                  follow up by email.
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="surface-card space-y-4 p-6"
                noValidate
              >
                <div>
                  <h2 className="font-display text-xl text-navy-950">
                    Partnership inquiry
                  </h2>
                  <p className="mt-2 text-sm text-slate-600">
                    Government, development, research, and private-sector
                    partners may explore collaboration with OWUF.
                  </p>
                </div>
                {(
                  [
                    ["organization", "Organization", "text"],
                    ["contact_name", "Contact name", "text"],
                    ["email", "Email", "email"],
                    ["partnership_interest", "Partnership interest", "text"],
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
                    htmlFor="message"
                    className="mb-1.5 block text-sm font-semibold"
                  >
                    Message <span className="text-danger">*</span>
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    className="w-full rounded-md border border-border px-3.5 py-3 text-sm focus-ring"
                    {...register("message")}
                  />
                  {errors.message ? (
                    <p className="mt-1 text-xs text-danger">
                      {errors.message.message}
                    </p>
                  ) : null}
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting…" : "Submit inquiry"}
                </Button>
              </form>
            )}
          </aside>
        </div>
      </Section>
    </>
  );
}
