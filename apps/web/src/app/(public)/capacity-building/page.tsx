"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarDays, MapPin, Users } from "lucide-react";
import {
  fetchTrainingCourses,
  registerForTraining,
} from "@/lib/api";
import { PageHero } from "@/components/public/page-hero";
import { Section } from "@/components/public/section";
import { Badge, statusTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";

const topics = [
  "Technical and utility management training",
  "Financial, billing, and revenue management",
  "Water-quality monitoring and NRW reduction",
  "GIS, SCADA, and digital billing systems",
  "Climate resilience and environmental protection",
  "Governance and leadership",
];

const schema = z.object({
  course_slug: z.string().min(1, "Select a course"),
  name: z.string().min(2, "Enter your name"),
  email: z.string().email("Enter a valid email"),
  organization: z.string().optional(),
  phone: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function CapacityBuildingPage() {
  const { push } = useToast();
  const [sent, setSent] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["training-courses"],
    queryFn: fetchTrainingCourses,
  });

  const courses = data ?? [];

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { course_slug: "" },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await registerForTraining({
        course_slug: values.course_slug,
        name: values.name,
        email: values.email,
        organization: values.organization || undefined,
        phone: values.phone || undefined,
      });
      setSent(true);
      push("Training registration submitted.", "success");
    } catch (error) {
      push(
        error instanceof Error ? error.message : "Unable to register.",
        "error",
      );
    }
  };

  return (
    <>
      <PageHero
        title="Capacity Building and Training"
        description="Structured learning programmes that strengthen technical, managerial, and institutional performance of member Water Service Providers."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Capacity Building" },
        ]}
      />
      <Section>
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <p className="leading-relaxed text-slate-600">
              Capacity building is a core OWUF function under Strategic Plan Key
              Result Area 2. Browse the training calendar and register for open
              programmes aligned with member needs.
            </p>
            <ul className="grid gap-3 sm:grid-cols-2">
              {topics.map((topic) => (
                <li
                  key={topic}
                  className="border-l-2 border-ocean-600 bg-sky-50 px-4 py-3 text-sm text-navy-800"
                >
                  {topic}
                </li>
              ))}
            </ul>

            <div>
              <h2 className="font-display text-2xl text-navy-950">
                Training calendar
              </h2>
              {isError ? (
                <p className="mt-3 border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-warning">
                  Unable to load the live training calendar. Please try again
                  later.
                </p>
              ) : null}
              {isLoading ? (
                <div className="mt-4 space-y-3">
                  <Skeleton className="h-28" />
                  <Skeleton className="h-28" />
                </div>
              ) : courses.length === 0 ? (
                <div className="mt-4">
                  <EmptyState
                    title="No training courses published"
                    description="Upcoming programmes will appear here when opened for registration."
                  />
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {courses.map((course) => (
                    <article
                      key={course.slug}
                      className="border-b border-border py-5"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <h3 className="font-display text-xl text-navy-950">
                          {course.title}
                        </h3>
                        <Badge tone={statusTone(course.status)}>
                          {course.status.replaceAll("_", " ")}
                        </Badge>
                      </div>
                      <p className="mt-2 text-sm text-slate-600">
                        {course.summary}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-4 text-sm text-ocean-700">
                        <span className="inline-flex items-center gap-1.5">
                          <CalendarDays className="h-4 w-4" aria-hidden="true" />
                          {new Date(course.starts_at).toLocaleDateString(
                            "en-GB",
                            {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            },
                          )}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin className="h-4 w-4" aria-hidden="true" />
                          {course.is_online
                            ? "Online"
                            : course.venue || "Venue TBA"}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Users className="h-4 w-4" aria-hidden="true" />
                          {course.registered_count}/{course.capacity} registered
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-slate-600">
                        Topic: {course.topic}
                        {course.facilitator
                          ? ` · Facilitator: ${course.facilitator}`
                          : ""}
                      </p>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>

          <aside>
            {sent ? (
              <div
                className="border border-teal-200 bg-teal-50 p-6 text-success"
                role="status"
              >
                <h2 className="font-display text-xl text-navy-950">
                  Registration received
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  Thank you. You will receive confirmation details by email.
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
                    Register for training
                  </h2>
                  <p className="mt-2 text-sm text-slate-600">
                    Select a course and submit your details.
                  </p>
                </div>
                <div>
                  <label
                    htmlFor="course_slug"
                    className="mb-1.5 block text-sm font-semibold"
                  >
                    Course <span className="text-danger">*</span>
                  </label>
                  <select
                    id="course_slug"
                    className="w-full rounded-sm border border-border bg-white px-3.5 py-3 text-sm focus-ring"
                    {...register("course_slug")}
                  >
                    <option value="">Select a course…</option>
                    {courses.map((course) => (
                      <option key={course.slug} value={course.slug}>
                        {course.title}
                      </option>
                    ))}
                  </select>
                  {errors.course_slug ? (
                    <p className="mt-1 text-xs text-danger">
                      {errors.course_slug.message}
                    </p>
                  ) : null}
                </div>
                {(
                  [
                    ["name", "Full name", "text", true],
                    ["email", "Email", "email", true],
                    ["organization", "Organization", "text", false],
                    ["phone", "Phone", "tel", false],
                  ] as const
                ).map(([name, label, type, required]) => (
                  <div key={name}>
                    <label
                      htmlFor={name}
                      className="mb-1.5 block text-sm font-semibold"
                    >
                      {label}
                      {required ? (
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
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting || courses.length === 0}
                >
                  {isSubmitting ? "Submitting…" : "Register"}
                </Button>
              </form>
            )}
          </aside>
        </div>
      </Section>
    </>
  );
}
