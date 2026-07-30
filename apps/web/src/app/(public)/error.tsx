"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 py-24 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ocean-700">
        Temporary issue
      </p>
      <h1 className="mt-3 font-display text-3xl text-navy-950">
        Something went wrong
      </h1>
      <p className="mt-3 text-sm text-slate-600">
        The page could not be loaded. Please try again, or return to the
        homepage.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-xl bg-ocean-600 px-5 py-3 text-sm font-semibold text-white hover:bg-ocean-500 focus-ring"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-xl border border-ocean-600/30 px-5 py-3 text-sm font-semibold text-ocean-700 hover:bg-sky-50 focus-ring"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
