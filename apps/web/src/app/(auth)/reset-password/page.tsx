"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiResetPassword } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const schema = z
  .object({
    email: z.string().email("Enter a valid email"),
    token: z.string().min(10, "Reset token is required"),
    password: z.string().min(10, "Use at least 10 characters"),
    password_confirmation: z.string().min(10),
  })
  .refine((v) => v.password === v.password_confirmation, {
    message: "Passwords do not match",
    path: ["password_confirmation"],
  });

type FormValues = z.infer<typeof schema>;

function ResetPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [formError, setFormError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: params.get("email") ?? "",
      token: params.get("token") ?? "",
      password: "",
      password_confirmation: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setFormError(null);
    try {
      await apiResetPassword(values);
      setDone(true);
      window.setTimeout(() => router.push("/login"), 1500);
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Unable to reset password.",
      );
    }
  };

  if (done) {
    return (
      <div className="surface-card p-6 sm:p-8" role="status">
        <h1 className="font-display text-3xl font-semibold text-navy-950">
          Password updated
        </h1>
        <p className="mt-3 text-sm text-slate-600">
          You can now sign in with your new password.
        </p>
        <Link href="/login" className="mt-6 inline-flex text-sm font-semibold text-ocean-700">
          Go to login
        </Link>
      </div>
    );
  }

  return (
    <div className="surface-card p-6 sm:p-8">
      <h1 className="font-display text-3xl font-semibold text-navy-950">
        Choose a new password
      </h1>
      <p className="mt-2 text-sm text-slate-600">
        Use a strong password with at least 10 characters.
      </p>
      <form className="mt-8 space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        {formError ? (
          <div role="alert" className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-danger">
            {formError}
          </div>
        ) : null}
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-semibold">Email</label>
          <Input id="email" type="email" {...register("email")} />
          {errors.email ? <p className="mt-1 text-xs text-danger">{errors.email.message}</p> : null}
        </div>
        <div>
          <label htmlFor="token" className="mb-1.5 block text-sm font-semibold">Reset token</label>
          <Input id="token" {...register("token")} />
          {errors.token ? <p className="mt-1 text-xs text-danger">{errors.token.message}</p> : null}
        </div>
        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-semibold">New password</label>
          <Input id="password" type="password" autoComplete="new-password" {...register("password")} />
          {errors.password ? <p className="mt-1 text-xs text-danger">{errors.password.message}</p> : null}
        </div>
        <div>
          <label htmlFor="password_confirmation" className="mb-1.5 block text-sm font-semibold">
            Confirm password
          </label>
          <Input
            id="password_confirmation"
            type="password"
            autoComplete="new-password"
            {...register("password_confirmation")}
          />
          {errors.password_confirmation ? (
            <p className="mt-1 text-xs text-danger">{errors.password_confirmation.message}</p>
          ) : null}
        </div>
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Saving…" : "Update password"}
        </Button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="surface-card p-8 text-sm text-slate-600">Loading…</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
