"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { submitContactMessage } from "@/lib/api";
import { pickChrome } from "@/data/public-chrome";
import { org } from "@/lib/org";
import { useToast } from "@/components/ui/toast";
import { PageHero } from "@/components/public/page-hero";
import { Section } from "@/components/public/section";
import { JsonLd } from "@/components/seo/json-ld";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocale } from "@/hooks/use-locale";
import { contactPageJsonLd } from "@/lib/seo";

type FormValues = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

export default function ContactPage() {
  const { locale, t, href } = useLocale();
  const chrome = pickChrome("contact", locale);
  const { push } = useToast();
  const [sent, setSent] = useState(false);

  const schema = useMemo(
    () =>
      z.object({
        name: z.string().min(2, t.fullName),
        email: z.string().email(t.email),
        subject: z.string().min(3, t.subject),
        message: z.string().min(10, t.message),
      }),
    [t.email, t.fullName, t.message, t.subject],
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    try {
      await submitContactMessage(values);
      setSent(true);
      push(
        locale === "om"
          ? "Ergaan milkaa'inaan ergameera."
          : locale === "am"
            ? "\u1218\u120d\u12d5\u12ad\u1275\u12ce \u1260\u1270\u1233\u12ab \u1201\u1294\u1273 \u1270\u120d\u12ae\u12a0\u120d\u1362"
            : "Message sent successfully.",
        "success",
      );
    } catch (error) {
      push(
        error instanceof Error ? error.message : "Unable to send message.",
        "error",
      );
    }
  };

  return (
    <>
      <JsonLd data={contactPageJsonLd()} />
      <PageHero
        title={chrome.title}
        description={chrome.description}
        breadcrumbs={[
          { label: t.home, href: href("/") },
          { label: t.contactUs },
        ]}
      />
      <Section>
        <div className="mb-10 max-w-2xl">
          <p className="section-eyebrow">
            {locale === "en" ? "Get in touch" : t.contactUs}
          </p>
          <p className="mt-3 text-base leading-relaxed text-slate-700">
            {locale === "en"
              ? "Reach the federation for membership, partnerships, programmes, or media enquiries. We respond in English, Afaan Oromo, and Amharic."
              : chrome.description}
          </p>
        </div>
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="rounded-md bg-navy-950 p-8 text-white sm:p-10">
            <p className="section-eyebrow text-aqua-400 before:bg-aqua-400">
              {t.contactDetails}
            </p>
            <h2 className="mt-3 font-display text-2xl sm:text-3xl">
              {locale === "en"
                ? "Headquarters & channels"
                : t.contactDetails}
            </h2>
            <dl className="mt-6 space-y-5 text-sm text-white/85">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-white/55">
                  {t.address}
                </dt>
                <dd className="mt-1">{org.address[locale] ?? org.address.en}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-white/55">
                  {t.email}
                </dt>
                <dd className="mt-1">
                  <a
                    href={`mailto:${org.email}`}
                    className="underline decoration-white/30 underline-offset-2 hover:decoration-white focus-ring"
                  >
                    {org.email}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-white/55">
                  {t.website}
                </dt>
                <dd className="mt-1">{org.domain}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-white/55">
                  {t.languages}
                </dt>
                <dd className="mt-1">English · Afaan Oromo · {"\u12a0\u121b\u122d\u129b"}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-white/55">
                  {t.legalMandate}
                </dt>
                <dd className="mt-1">{org.proclamation}</dd>
              </div>
            </dl>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={`mailto:${org.email}`}
                className="inline-flex h-11 items-center rounded-md bg-ocean-600 px-5 text-sm font-semibold text-white hover:bg-ocean-500 focus-ring"
              >
                {t.email}
              </a>
              <Link
                href={href("/partnerships")}
                className="inline-flex h-11 items-center rounded-md border border-white/40 px-5 text-sm font-semibold text-white hover:bg-white/10 focus-ring"
              >
                {t.partnerships}
              </Link>
            </div>
          </div>
          {sent ? (
            <div
              className="surface-card border-teal-200 bg-teal-50 p-8 text-success"
              role="status"
            >
              {locale === "om"
                ? "Galatoomi. Ergaan kee fudhatameera."
                : locale === "am"
                  ? "\u12a0\u1218\u1230\u130d\u1295\u12cd\u1362 \u1218\u120d\u12d5\u12ad\u1275\u12ce \u1270\u1208\u1245\u134e\u12a0\u120d\u1362"
                  : "Thank you. Your message has been received. Our team will follow up shortly."}
            </div>
          ) : (
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="surface-card space-y-4 p-8 sm:p-10"
              noValidate
            >
              <div>
                <p className="section-eyebrow">{t.sendMessage}</p>
                <h2 className="mt-3 font-display text-2xl text-navy-950">
                  {locale === "en" ? "Send an enquiry" : t.sendMessage}
                </h2>
              </div>
              {(
                [
                  ["name", t.fullName, "text"],
                  ["email", t.email, "email"],
                  ["subject", t.subject, "text"],
                ] as const
              ).map(([name, label, type]) => (
                <div key={name}>
                  <label htmlFor={name} className="mb-1.5 block text-sm font-semibold">
                    {label} <span className="text-danger">*</span>
                  </label>
                  <Input id={name} type={type} {...register(name)} />
                  {errors[name] ? (
                    <p className="mt-1 text-xs text-danger">{errors[name]?.message}</p>
                  ) : null}
                </div>
              ))}
              <div>
                <label htmlFor="message" className="mb-1.5 block text-sm font-semibold">
                  {t.message} <span className="text-danger">*</span>
                </label>
                <textarea
                  id="message"
                  rows={5}
                  className="w-full rounded-md border border-border px-3.5 py-3 text-sm focus-ring"
                  {...register("message")}
                />
                {errors.message ? (
                  <p className="mt-1 text-xs text-danger">{errors.message.message}</p>
                ) : null}
              </div>
              <Button type="submit" disabled={isSubmitting} className="h-11 px-6">
                {isSubmitting ? t.sending : t.sendMessage}
              </Button>
            </form>
          )}
        </div>
      </Section>
    </>
  );
}
