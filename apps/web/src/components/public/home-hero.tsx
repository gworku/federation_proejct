"use client";

import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import ceoPhoto from "@/assets/ceo.png";
import { org } from "@/lib/org";
import type { Locale } from "@/lib/i18n";
import { ui } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const AUTO_ADVANCE_MS = 6000;
const SWIPE_THRESHOLD = 48;

type HomeHeroProps = {
  locale: Locale;
  href: (path: string) => string;
};

type Slide = {
  id: string;
  src: string | StaticImageData;
  alt: string;
  objectPosition: string;
  kind: "intro" | "ceo" | "board";
};

/**
 * Full-bleed home hero with all federation photos.
 * Move between slides with arrows, dots, keyboard, or swipe.
 */
export function HomeHero({ locale, href }: HomeHeroProps) {
  const t = ui[locale];
  const fullName = org.name[locale] ?? org.name.en;

  const slides: Slide[] = useMemo(
    () => [
      {
        id: "forum",
        src: "/brand/photos/hero.png",
        alt: "OWUF leadership addressing a water utilities forum",
        objectPosition: "object-[center_22%]",
        kind: "intro",
      },
      {
        id: "ceo",
        src: ceoPhoto,
        alt: "Eng. Andualem Ayyano, Chief Executive Officer of OWUF",
        objectPosition: "object-[center_top]",
        kind: "ceo",
      },
      {
        id: "board",
        src: "/brand/photos/board.png",
        alt: t.boardTitle,
        objectPosition: "object-center",
        kind: "board",
      },
    ],
    [t.boardTitle],
  );

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const pointerX = useRef<number | null>(null);
  const reduceMotion = useRef(false);

  useEffect(() => {
    reduceMotion.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
  }, []);

  const go = useCallback(
    (next: number) => {
      const count = slides.length;
      setIndex(((next % count) + count) % count);
    },
    [slides.length],
  );

  const next = useCallback(() => go(index + 1), [go, index]);
  const prev = useCallback(() => go(index - 1), [go, index]);

  useEffect(() => {
    if (paused || reduceMotion.current || slides.length < 2) return;
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, AUTO_ADVANCE_MS);
    return () => window.clearInterval(id);
  }, [paused, slides.length]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") next();
      if (event.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  const onPointerDown = (event: ReactPointerEvent) => {
    pointerX.current = event.clientX;
  };

  const onPointerUp = (event: ReactPointerEvent) => {
    if (pointerX.current == null) return;
    const delta = event.clientX - pointerX.current;
    pointerX.current = null;
    if (Math.abs(delta) < SWIPE_THRESHOLD) return;
    if (delta < 0) next();
    else prev();
  };

  const slide = slides[index] ?? slides[0];
  const isCeo = slide.kind === "ceo";

  return (
    <section
      className="relative min-h-[78vh] overflow-hidden text-white sm:min-h-[82vh]"
      aria-roledescription="carousel"
      aria-label={t.heroCarouselLabel}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) {
          setPaused(false);
        }
      }}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
    >
      <div className="absolute inset-0 bg-navy-950">
        <div key={slide.id} className="absolute inset-0">
          {slide.kind === "ceo" ? (
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              priority
              quality={92}
              sizes="100vw"
              placeholder="blur"
              fetchPriority="high"
              className={cn("object-cover [image-rendering:auto]", slide.objectPosition)}
            />
          ) : (
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              priority
              quality={85}
              sizes="100vw"
              fetchPriority="high"
              className={cn("object-cover", slide.objectPosition)}
            />
          )}
        </div>
        <div
          className={cn(
            "absolute inset-0",
            isCeo ? "hero-ceo-overlay" : "hero-overlay",
          )}
        />
      </div>

      <div
        className={cn(
          "relative mx-auto flex min-h-[78vh] max-w-7xl flex-col px-4 pt-36 sm:min-h-[82vh] sm:px-6 lg:px-8",
          isCeo
            ? "justify-end pb-28 sm:pb-32"
            : "justify-end pb-24 sm:justify-center sm:pb-28",
        )}
      >
        <div
          className={cn(isCeo ? "mx-auto max-w-2xl text-center" : "max-w-2xl")}
          aria-live="polite"
        >
          {!isCeo ? (
            <p className="font-display text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
              {org.shortName}
            </p>
          ) : null}

          {slide.kind === "intro" ? (
            <>
              <h1 className="sr-only">{fullName}</h1>
              <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.16em] text-aqua-400">
                {locale === "en"
                  ? "Water utilities · Oromia · Ethiopia"
                  : t.officialWebsite}
              </p>
              <p className="mt-4 max-w-xl font-display text-xl leading-snug text-white sm:text-2xl lg:text-[1.75rem]">
                {t.heroTitle}
              </p>
              <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/80 sm:text-base">
                {t.heroSupport}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href={href("/services")}
                  className="inline-flex h-11 items-center rounded-md bg-ocean-600 px-5 text-sm font-semibold text-white hover:bg-ocean-500 focus-ring"
                >
                  {t.services}
                </Link>
                <Link
                  href={href("/contact")}
                  className="inline-flex h-11 items-center rounded-md border border-white/50 px-5 text-sm font-semibold text-white hover:bg-white/10 focus-ring"
                >
                  {t.contactUs}
                </Link>
              </div>
            </>
          ) : null}

          {slide.kind === "ceo" ? (
            <>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-aqua-400">
                {org.shortName} · Chief Executive Officer
              </p>
              <h1 className="mt-3 font-display text-3xl leading-tight text-white drop-shadow-sm sm:text-4xl lg:text-[2.85rem]">
                {t.ceoTitle}
              </h1>
              <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-white/90 sm:text-base">
                {t.ceoCaption}
              </p>
              <div className="mt-7 flex justify-center">
                <Link
                  href={href("/about/leadership")}
                  className="inline-flex h-11 items-center rounded-md bg-ocean-600 px-5 text-sm font-semibold text-white shadow-lg shadow-navy-950/30 hover:bg-ocean-500 focus-ring"
                >
                  {t.meetCeo}
                </Link>
              </div>
            </>
          ) : null}

          {slide.kind === "board" ? (
            <>
              <h1 className="mt-4 font-display text-2xl leading-snug text-white sm:text-3xl">
                {t.boardTitle}
              </h1>
              <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/80 sm:text-base">
                {t.boardCaption}
              </p>
              <div className="mt-8">
                <Link
                  href={href("/about/leadership")}
                  className="inline-flex h-11 items-center rounded-md border border-white/50 px-5 text-sm font-semibold text-white hover:bg-white/10 focus-ring"
                >
                  {t.meetLeadership}
                </Link>
              </div>
            </>
          ) : null}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-6 z-10 flex items-center justify-center gap-6 px-4 sm:bottom-8">
        <button
          type="button"
          onClick={prev}
          className="pointer-events-auto inline-flex h-10 w-10 items-center justify-center text-white/90 transition hover:text-white focus-ring"
          aria-label={t.heroPrev}
        >
          <ArrowLeft className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
        </button>

        <div
          className="pointer-events-auto flex items-center gap-2.5"
          role="tablist"
          aria-label={t.heroCarouselLabel}
        >
          {slides.map((item, i) => {
            const active = i === index;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={active}
                aria-label={`${t.heroSlideLabel} ${i + 1}`}
                onClick={() => go(i)}
                className={cn(
                  "h-2 w-2 rounded-full transition focus-ring",
                  active ? "bg-white" : "bg-white/40 hover:bg-white/65",
                )}
              />
            );
          })}
        </div>

        <button
          type="button"
          onClick={next}
          className="pointer-events-auto inline-flex h-10 w-10 items-center justify-center text-white/90 transition hover:text-white focus-ring"
          aria-label={t.heroNext}
        >
          <ArrowRight className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
