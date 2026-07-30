"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarDays, MapPin } from "lucide-react";
import { fetchEvents, registerForEvent } from "@/lib/api";
import { PageHero } from "@/components/public/page-hero";
import { Section } from "@/components/public/section";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { JsonLd } from "@/components/seo/json-ld";
import { eventJsonLd } from "@/lib/seo";
import { pickChrome } from "@/data/public-chrome";
import { useLocale } from "@/hooks/use-locale";

const schema = z.object({
  event_slug: z.string().min(1, "Select an event"),
  name: z.string().min(2, "Enter your name"),
  email: z.string().email("Enter a valid email"),
  organization: z.string().optional(),
  phone: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function EventsPage() {
  const { locale, t, href } = useLocale();
  const chrome = pickChrome("events", locale);
  const { push } = useToast();
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null);
  const [sentSlug, setSentSlug] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["events"],
    queryFn: () => fetchEvents(),
    staleTime: 60_000,
  });

  const events = data ?? [];

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { event_slug: "" },
  });

  const openForm = (slug: string) => {
    setExpandedSlug(slug);
    setValue("event_slug", slug);
  };

  const onSubmit = async (values: FormValues) => {
    try {
      await registerForEvent({
        event_slug: values.event_slug,
        name: values.name,
        email: values.email,
        organization: values.organization || undefined,
        phone: values.phone || undefined,
      });
      setSentSlug(values.event_slug);
      setExpandedSlug(null);
      reset({ event_slug: "", name: "", email: "", organization: "", phone: "" });
      push("Event registration submitted.", "success");
    } catch (error) {
      push(
        error instanceof Error ? error.message : "Unable to register.",
        "error",
      );
    }
  };

  return (
    <>
      {events.slice(0, 5).map((event) => (
        <JsonLd
          key={`schema-${event.slug}`}
          data={eventJsonLd({
            name: event.title,
            description: event.summary,
            path: `/events`,
            startDate: event.starts_at,
            endDate: event.ends_at,
            location: event.location,
          })}
        />
      ))}
      <PageHero
        title={chrome.title}
        description={chrome.description}
        breadcrumbs={[
          { label: t.home, href: href("/") },
          { label: t.events },
        ]}
      />
      <Section>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
          </div>
        ) : events.length === 0 ? (
          <EmptyState title="No upcoming events published" />
        ) : (
          <div className="grid gap-4">
            {events.map((event) => (
              <article
                key={event.slug}
                className="surface-card p-6"
              >
                <div className="flex flex-wrap items-center gap-4 text-sm font-semibold text-ocean-700">
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="h-4 w-4" aria-hidden="true" />
                    {new Date(event.starts_at).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" aria-hidden="true" />
                    {event.location}
                  </span>
                </div>
                <h2 className="mt-3 font-display text-2xl text-navy-950">
                  {event.title}
                </h2>
                <p className="mt-2 text-sm text-slate-600">{event.summary}</p>

                {sentSlug === event.slug ? (
                  <p
                    className="mt-4 border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-success"
                    role="status"
                  >
                    Registration received for this event. Check your email for
                    confirmation.
                  </p>
                ) : expandedSlug === event.slug ? (
                  <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="mt-5 space-y-3 border-t border-border pt-5"
                    noValidate
                  >
                    <input type="hidden" {...register("event_slug")} />
                    <p className="text-sm font-semibold text-navy-950">
                      Register for {event.title}
                    </p>
                    <div className="grid gap-3 sm:grid-cols-2">
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
                            htmlFor={`${event.slug}-${name}`}
                            className="mb-1.5 block text-sm font-semibold"
                          >
                            {label}
                            {required ? (
                              <span className="text-danger"> *</span>
                            ) : null}
                          </label>
                          <Input
                            id={`${event.slug}-${name}`}
                            type={type}
                            {...register(name)}
                          />
                          {errors[name] ? (
                            <p className="mt-1 text-xs text-danger">
                              {errors[name]?.message}
                            </p>
                          ) : null}
                        </div>
                      ))}
                    </div>
                    {errors.event_slug ? (
                      <p className="text-xs text-danger">
                        {errors.event_slug.message}
                      </p>
                    ) : null}
                    <div className="flex flex-wrap gap-2">
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Submitting…" : "Submit registration"}
                      </Button>
                      <button
                        type="button"
                        className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-sky-50 focus-ring"
                        onClick={() => setExpandedSlug(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    type="button"
                    className="mt-4 border border-border px-4 py-2 text-sm font-semibold text-ocean-700 hover:bg-sky-50 focus-ring"
                    onClick={() => openForm(event.slug)}
                  >
                    Register for this event
                  </button>
                )}
              </article>
            ))}
          </div>
        )}
      </Section>
    </>
  );
}
