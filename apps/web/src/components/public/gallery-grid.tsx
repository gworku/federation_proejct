"use client";

import Image from "next/image";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import type { ApiGalleryItem } from "@/lib/api";

export function GalleryGrid({ items }: { items: ApiGalleryItem[] }) {
  const [active, setActive] = useState<ApiGalleryItem | null>(null);

  useEffect(() => {
    if (!active) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActive(null);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [active]);

  return (
    <>
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => setActive(item)}
              className="surface-card group w-full overflow-hidden text-left transition hover:border-ocean-500/35 focus-ring"
            >
              <div className="relative aspect-[4/3] bg-sky-100">
                <Image
                  src={item.image_url}
                  alt={item.title}
                  fill
                  unoptimized={
                    item.image_url.startsWith("http://") ||
                    item.image_url.startsWith("https://")
                  }
                  className="object-cover transition duration-500 group-hover:scale-[1.02]"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="p-4">
                {item.category ? (
                  <p className="text-xs font-semibold uppercase tracking-wide text-ocean-700">
                    {item.category}
                  </p>
                ) : null}
                <h2 className="mt-1 font-display text-lg text-navy-950">
                  {item.title}
                </h2>
                {item.caption ? (
                  <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                    {item.caption}
                  </p>
                ) : null}
              </div>
            </button>
          </li>
        ))}
      </ul>

      {active ? (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-navy-950/85 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={active.title}
          onClick={() => setActive(null)}
        >
          <button
            type="button"
            className="absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center border border-white/30 text-white focus-ring"
            onClick={() => setActive(null)}
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
          <figure
            className="relative max-h-[85vh] w-full max-w-4xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="relative aspect-[16/10] overflow-hidden bg-navy-900">
              <Image
                src={active.image_url}
                alt={active.title}
                fill
                unoptimized={
                  active.image_url.startsWith("http://") ||
                  active.image_url.startsWith("https://")
                }
                className="object-contain"
                sizes="100vw"
                priority
                loading="eager"
              />
            </div>
            <figcaption className="mt-3 text-center text-sm text-white">
              <p className="font-semibold">{active.title}</p>
              {active.caption ? (
                <p className="mt-1 text-white/75">{active.caption}</p>
              ) : null}
            </figcaption>
          </figure>
        </div>
      ) : null}
    </>
  );
}
