"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { submitAccessRequest } from "@/lib/api";
import { PageHero } from "@/components/public/page-hero";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const schema = z.object({
  fullName: z.string().min(2, "Enter your full name"),
  email: z.string().email("Enter a valid email"),
  organization: z.string().min(2, "Enter your organization or utility"),
  roleRequested: z.string().min(2, "Describe the access you need"),
  justification: z.string().min(20, "Provide a brief justification (20+ characters)"),
});

type FormValues = z.infer<typeof schema>;

export default function RequestAccessPage() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setError(null);
    try {
      await submitAccessRequest({
        full_name: values.fullName,
        email: values.email,
        organization: values.organization,
        role_requested: values.roleRequested,
        justification: values.justification,
      });
      setSubmitted(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to submit request. Please try again.",
      );
    }
  };

  return (
    <>
      <PageHero
        title="Request system access"
        description="Submit a request for OWUF management platform access. Approvals are role-based and reviewed by administrators."
      />
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        {submitted ? (
          <div
            className="border border-teal-200 bg-teal-50 p-6 text-success"
            role="status"
          >
            Your access request has been submitted. You will be contacted after
            review.
          </div>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4 border border-border bg-white p-6 sm:p-8"
            noValidate
          >
            {error ? (
              <p className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-danger" role="alert">
                {error}
              </p>
            ) : null}
            {(
              [
                ["fullName", "Full name", "text"],
                ["email", "Work email", "email"],
                ["organization", "Organization / utility", "text"],
                ["roleRequested", "Requested role or module access", "text"],
              ] as const
            ).map(([name, label, type]) => (
              <div key={name}>
                <label htmlFor={name} className="mb-1.5 block text-sm font-semibold text-navy-800">
                  {label} <span className="text-danger">*</span>
                </label>
                <Input id={name} type={type} {...register(name)} />
                {errors[name] ? (
                  <p className="mt-1 text-xs text-danger">{errors[name]?.message}</p>
                ) : null}
              </div>
            ))}
            <div>
              <label htmlFor="justification" className="mb-1.5 block text-sm font-semibold text-navy-800">
                Justification <span className="text-danger">*</span>
              </label>
              <textarea
                id="justification"
                rows={5}
                className="w-full rounded-sm border border-border bg-white px-3.5 py-3 text-sm focus-ring"
                {...register("justification")}
              />
              {errors.justification ? (
                <p className="mt-1 text-xs text-danger">{errors.justification.message}</p>
              ) : null}
            </div>
            <Button type="submit" size="lg" disabled={isSubmitting}>
              {isSubmitting ? "Submitting…" : "Submit request"}
            </Button>
          </form>
        )}
      </div>
    </>
  );
}
