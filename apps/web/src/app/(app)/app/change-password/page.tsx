"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiChangePassword } from "@/lib/api";
import { getSession, setSession } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

const schema = z
  .object({
    current_password: z.string().min(1, "Current password is required"),
    password: z.string().min(10, "Use at least 10 characters"),
    password_confirmation: z.string().min(10),
  })
  .refine((v) => v.password === v.password_confirmation, {
    message: "Passwords do not match",
    path: ["password_confirmation"],
  });

type FormValues = z.infer<typeof schema>;

export default function ChangePasswordPage() {
  const router = useRouter();
  const { push } = useToast();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values: FormValues) => {
    setFormError(null);
    try {
      await apiChangePassword(values);
      const session = getSession();
      if (session) {
        setSession({ ...session, mustChangePassword: false });
      }
      push("Password updated.", "success");
      router.replace("/app/dashboard");
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Unable to change password.",
      );
    }
  };

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <div>
        <h1 className="font-display text-2xl font-semibold text-navy-950">
          Change password
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          For security, set a new password before continuing to the workspace.
        </p>
      </div>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="surface-card space-y-4 p-6"
        noValidate
      >
        {formError ? (
          <div role="alert" className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-danger">
            {formError}
          </div>
        ) : null}
        <div>
          <label htmlFor="current_password" className="mb-1.5 block text-sm font-semibold">
            Current password
          </label>
          <Input
            id="current_password"
            type="password"
            autoComplete="current-password"
            {...register("current_password")}
          />
          {errors.current_password ? (
            <p className="mt-1 text-xs text-danger">{errors.current_password.message}</p>
          ) : null}
        </div>
        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-semibold">
            New password
          </label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            {...register("password")}
          />
          {errors.password ? (
            <p className="mt-1 text-xs text-danger">{errors.password.message}</p>
          ) : null}
        </div>
        <div>
          <label htmlFor="password_confirmation" className="mb-1.5 block text-sm font-semibold">
            Confirm new password
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
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : "Update password"}
        </Button>
      </form>
    </div>
  );
}
