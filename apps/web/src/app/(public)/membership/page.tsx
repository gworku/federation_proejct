"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { submitMembershipApplication } from "@/lib/api";
import { PageHero } from "@/components/public/page-hero";
import { Section } from "@/components/public/section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

const categories = [
  { value: "full", label: "Full Member" },
  { value: "associate", label: "Associate" },
  { value: "observer", label: "Observer" },
] as const;

const schema = z.object({
  organization_name: z.string().min(2, "Enter the organization name"),
  contact_name: z.string().min(2, "Enter the contact name"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().min(5, "Enter a phone number"),
  zone: z.string().min(2, "Enter the zone"),
  city: z.string().min(2, "Enter the city"),
  category: z.enum(["full", "associate", "observer"]),
  justification: z
    .string()
    .min(20, "Explain why you are applying (20+ characters)"),
});

type FormValues = z.infer<typeof schema>;

export default function MembershipPage() {
  const { push } = useToast();
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { category: "full" },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await submitMembershipApplication(values);
      setSent(true);
      push("Membership application submitted.", "success");
    } catch (error) {
      push(
        error instanceof Error ? error.message : "Unable to submit application.",
        "error",
      );
    }
  };

  return (
    <>
      <PageHero
        title="Membership Application"
        description="Join the Oromia Water Utilities Federation as a full, associate, or observer member and access capacity building, technical support, and advocacy."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Membership" },
        ]}
      />
      <Section>
        <div className="grid gap-8 lg:grid-cols-3">
          <article className="lg:col-span-2">
            <p className="leading-relaxed text-slate-600">
              Membership enables Water Service Providers and partner
              organizations to participate in federation programmes, peer
              learning, joint procurement, and policy engagement. Applications
              are reviewed by OWUF staff after submission.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "Full membership for licensed Water Service Providers",
                "Associate membership for sector institutions and partners",
                "Observer status for learning and coordination participation",
              ].map((item) => (
                <li
                  key={item}
                  className="border border-border bg-white px-4 py-3 text-sm text-slate-600"
                >
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm text-slate-600">
              Already a member with portal access?{" "}
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
                  Application received
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  Thank you. Our membership team will review your application and
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
                    Apply for membership
                  </h2>
                  <p className="mt-2 text-sm text-slate-600">
                    Fields marked * are required.
                  </p>
                </div>
                {(
                  [
                    ["organization_name", "Organization name", "text"],
                    ["contact_name", "Contact name", "text"],
                    ["email", "Email", "email"],
                    ["phone", "Phone", "tel"],
                    ["zone", "Zone", "text"],
                    ["city", "City", "text"],
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
                    Membership category <span className="text-danger">*</span>
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
                    htmlFor="justification"
                    className="mb-1.5 block text-sm font-semibold"
                  >
                    Justification <span className="text-danger">*</span>
                  </label>
                  <textarea
                    id="justification"
                    rows={5}
                    className="w-full rounded-sm border border-border px-3.5 py-3 text-sm focus-ring"
                    {...register("justification")}
                  />
                  {errors.justification ? (
                    <p className="mt-1 text-xs text-danger">
                      {errors.justification.message}
                    </p>
                  ) : null}
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting…" : "Submit application"}
                </Button>
              </form>
            )}
          </aside>
        </div>
      </Section>
    </>
  );
}
