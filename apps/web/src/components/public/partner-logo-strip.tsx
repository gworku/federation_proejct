"use client";

import Image from "next/image";
import Link from "next/link";
import type { PartnerItem } from "@/lib/api";

export function PartnerLogoStrip({
  partners,
  viewAllHref,
  viewAllLabel,
}: {
  partners: PartnerItem[];
  viewAllHref: string;
  viewAllLabel: string;
}) {
  if (!partners.length) return null;

  return (
    <div>
      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {partners.slice(0, 12).map((partner) => (
          <li key={partner.id ?? partner.slug}>
            <div
              className="surface-card flex h-24 items-center justify-center px-3"
              title={partner.name}
            >
              {partner.logo_url ? (
                <Image
                  src={partner.logo_url}
                  alt={partner.name}
                  width={120}
                  height={48}
                  className="max-h-12 w-auto object-contain"
                  loading="lazy"
                  decoding="async"
                  sizes="(max-width: 640px) 45vw, (max-width: 1024px) 25vw, 12vw"
                />
              ) : (
                <span className="text-center text-xs font-semibold text-slate-600">
                  {partner.name}
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-6">
        <Link
          href={viewAllHref}
          className="text-sm font-semibold text-ocean-700 hover:text-ocean-500 focus-ring"
        >
          {viewAllLabel}
        </Link>
      </div>
    </div>
  );
}
