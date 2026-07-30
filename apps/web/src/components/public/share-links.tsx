"use client";

import { Link2 } from "lucide-react";
import { useState } from "react";

export function ShareLinks({
  title,
  path,
}: {
  title: string;
  path: string;
}) {
  const [copied, setCopied] = useState(false);

  const share = async () => {
    const url = `${window.location.origin}${path.startsWith("/") ? path : `/${path}`}`;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        /* user cancelled or unsupported */
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  return (
    <button
      type="button"
      onClick={share}
      className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-semibold text-ocean-700 hover:bg-sky-50 focus-ring"
    >
      <Link2 className="h-4 w-4" aria-hidden />
      {copied ? "Link copied" : "Share"}
    </button>
  );
}
