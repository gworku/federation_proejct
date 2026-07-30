"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { apiLogin } from "@/lib/api";
import {
  dashboardForRole,
  setSession,
  type AuthUser,
  type UserRole,
} from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const schema = z.object({
  identifier: z.string().min(3, "Enter your email or username"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { identifier: "", password: "" },
  });

  const onSubmit = async (values: FormValues) => {
    setFormError(null);
    try {
      const data = await apiLogin(values.identifier, values.password);
      const user: AuthUser = {
        id: String(data.user.id),
        name:
          [data.user.first_name, data.user.last_name].filter(Boolean).join(" ") ||
          data.user.email,
        email: data.user.email,
        role: data.user.role as UserRole,
        mustChangePassword: Boolean(data.user.must_change_password),
      };
      setSession(user);
      sessionStorage.setItem("opwssf_access", data.access);
      sessionStorage.setItem("opwssf_refresh", data.refresh);
      if (user.mustChangePassword) {
        router.push("/app/change-password");
        return;
      }
      router.push(data.dashboard || dashboardForRole(user.role));
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Invalid credentials.",
      );
    }
  };

  return (
    <div className="surface-card p-6 sm:p-8">
      <h1 className="font-display text-3xl font-semibold text-navy-950">
        Member login
      </h1>
      <p className="mt-2 text-sm text-slate-600">
        Sign in to the OWUF management platform.
      </p>

      <form className="mt-8 space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        {formError ? (
          <div role="alert" className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-danger">
            {formError}
          </div>
        ) : null}

        <div>
          <label htmlFor="identifier" className="mb-1.5 block text-sm font-semibold text-navy-800">
            Email or username
          </label>
          <Input id="identifier" autoComplete="username" {...register("identifier")} />
          {errors.identifier ? (
            <p className="mt-1 text-xs text-danger">{errors.identifier.message}</p>
          ) : null}
        </div>

        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-semibold text-navy-800">
            Password
          </label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              className="pr-11"
              {...register("password")}
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-slate-600 hover:bg-sky-100 focus-ring"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password ? (
            <p className="mt-1 text-xs text-danger">{errors.password.message}</p>
          ) : null}
        </div>

        <div className="flex justify-end">
          <Link href="/forgot-password" className="text-sm font-semibold text-ocean-700 focus-ring rounded">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
          {isSubmitting ? "Signing in…" : "Login"}
        </Button>
      </form>

      <p className="mt-6 text-sm text-slate-600">
        Need an account?{" "}
        <Link href="/request-access" className="font-semibold text-ocean-700 focus-ring rounded">
          Request access
        </Link>
      </p>
    </div>
  );
}
