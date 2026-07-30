"use client";

import Link from "next/link";
import { Mail, Phone } from "lucide-react";
import { useLocale } from "@/hooks/use-locale";
import { org } from "@/lib/org";

export function TopBar() {
  const { href, t } = useLocale();
  const phones = org.phone.filter((p) => p && !p.includes("000 0000"));

  return (
    <div className="border-b border-white/10 bg-navy-900 text-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-2 text-xs sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-white/75">
          <span className="hidden font-semibold uppercase tracking-[0.12em] text-aqua-400 md:inline">
            {t.officialWebsite}
          </span>
          {phones.map((phone) => (
            <a
              key={phone}
              href={`tel:${phone.replace(/\s/g, "")}`}
              className="inline-flex items-center gap-1.5 hover:text-white focus-ring"
            >
              <Phone className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{phone}</span>
            </a>
          ))}
          <a
            href={`mailto:${org.email}`}
            className="inline-flex items-center gap-1.5 hover:text-white focus-ring"
          >
            <Mail className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">{org.email}</span>
            <span className="sm:hidden">Email</span>
          </a>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={href("/partnerships")}
            className="hidden px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-white/80 hover:text-white focus-ring sm:inline-flex"
          >
            {t.partnerships}
          </Link>
          <Link
            href={href("/contact")}
            className="rounded-md bg-ocean-600 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-white hover:bg-ocean-500 focus-ring"
          >
            {t.contactUs}
          </Link>
        </div>
      </div>
    </div>
  );
}
