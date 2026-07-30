import { Suspense } from "react";
import CmsPageClient from "./page-client";

export default function CmsPage() {
  return (
    <Suspense
      fallback={
        <div className="rounded-2xl border border-border bg-white p-6 text-sm text-slate-600">
          Loading content manager…
        </div>
      }
    >
      <CmsPageClient />
    </Suspense>
  );
}
