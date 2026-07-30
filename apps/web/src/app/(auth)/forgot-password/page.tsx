"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiForgotPassword } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
});

type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [done, setDone] = useState(false);
  const [debugUrl, setDebugUrl] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (values: FormValues) => {
    setFormError(null);
    try {
      const res = await apiForgotPassword(values.email);
      setDebugUrl(res.reset_url ?? null);
      setDone(true);
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Unable to send reset email.",
      );
    }
  };

  return (
    <div className="surface-card p-6 sm:p-8">
      <h1 className="font-display text-3xl font-semibold text-navy-950">
        Reset password
      </h1>
      <p className="mt-2 text-sm text-slate-600">
        Enter your account email. If it matches an active user, we will issue
        reset instructions.
      </p>

      {done ? (
        <div className="mt-8 space-y-4" role="status">
          <p className="rounded-md border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-success">
            If an account exists for that email, password reset instructions
            have been issued.
          </p>
          {debugUrl ? (
            <p className="rounded-md border border-border bg-sky-50 px-4 py-3 text-sm text-slate-700">
              Development reset link:{" "}
              <Link href={debugUrl} className="font-semibold text-ocean-700 break-all">
                {debugUrl}
              </Link>
            </p>
          ) : null}
          <Link href="/login" className="inline-flex text-sm font-semibold text-ocean-700 focus-ring">
            Back to login
          </Link>
        </div>
      ) : (
        <form className="mt-8 space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          {formError ? (
            <div role="alert" className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-danger">
              {formError}
            </div>
          ) : null}
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-navy-800">
              Email
            </label>
            <Input id="email" type="email" autoComplete="email" {...register("email")} />
            {errors.email ? (
              <p className="mt-1 text-xs text-danger">{errors.email.message}</p>
            ) : null}
          </div>
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Sending…" : "Send reset link"}
          </Button>
          <p className="text-sm">
            <Link href="/login" className="font-semibold text-ocean-700 focus-ring rounded">
              Back to login
            </Link>
          </p>
        </form>
      )}
    </div>
  );
}
