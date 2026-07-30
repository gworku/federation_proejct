"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Breadcrumbs, type Crumb } from "@/components/public/breadcrumbs";

export function PageHero({
  title,
  description,
  breadcrumbs,
  lastUpdated,
  lastUpdatedLabel = "Last updated",
}: {
  title: string;
  description?: string;
  breadcrumbs?: Crumb[];
  lastUpdated?: string | null;
  lastUpdatedLabel?: string;
}) {
  const reduce = useReducedMotion();
  const transition = { duration: reduce ? 0 : 0.45, ease: "easeOut" as const };

  return (
    <div className="relative overflow-hidden border-b border-border bg-navy-950 px-4 pb-10 pt-32 text-white sm:px-6 sm:pb-12 sm:pt-36 lg:px-8">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(115deg, rgba(12,103,143,0.55) 0%, transparent 55%), radial-gradient(ellipse at 85% 20%, rgba(255,255,255,0.08), transparent 45%)",
        }}
        aria-hidden
      />
      <motion.div
        className="relative mx-auto max-w-7xl"
        initial={reduce ? false : "hidden"}
        animate="show"
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: reduce ? 0 : 0.08 } },
        }}
      >
        {breadcrumbs?.length ? (
          <motion.div
            className="mb-4"
            variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition } }}
          >
            <Breadcrumbs items={breadcrumbs} tone="light" />
          </motion.div>
        ) : null}
        <motion.h1
          className="max-w-3xl font-display text-3xl font-semibold sm:text-[2.5rem] sm:leading-tight"
          variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition } }}
        >
          {title}
        </motion.h1>
        {description ? (
          <motion.p
            className="mt-3 max-w-2xl text-base leading-relaxed text-white/80"
            variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition } }}
          >
            {description}
          </motion.p>
        ) : null}
        {lastUpdated ? (
          <motion.p
            className="mt-4 text-sm text-white/60"
            variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition } }}
          >
            {lastUpdatedLabel}:{" "}
            <time dateTime={lastUpdated}>
              {new Date(lastUpdated).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </time>
          </motion.p>
        ) : null}
      </motion.div>
    </div>
  );
}
