import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd } from "@/lib/seo";
import { cn } from "@/lib/utils";

export type Crumb = {
  label: string;
  href?: string;
};

export function Breadcrumbs({
  items,
  tone = "dark",
}: {
  items: Crumb[];
  tone?: "light" | "dark";
}) {
  const schemaItems = items.map((item, index) => ({
    name: item.label,
    path: item.href || items[index - 1]?.href || "/",
  }));

  const light = tone === "light";

  return (
    <>
      <JsonLd data={breadcrumbJsonLd(schemaItems)} />
      <nav aria-label="Breadcrumb">
        <ol
          className={cn(
            "flex flex-wrap items-center gap-1 text-sm",
            light ? "text-white/70" : "text-slate-600",
          )}
        >
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            return (
              <li key={`${item.label}-${index}`} className="flex items-center gap-1">
                {index > 0 ? (
                  <ChevronRight
                    className={cn(
                      "h-3.5 w-3.5",
                      light ? "text-white/45" : "text-slate-400",
                    )}
                    aria-hidden="true"
                  />
                ) : null}
                {isLast || !item.href ? (
                  <span
                    aria-current={isLast ? "page" : undefined}
                    className={cn(
                      isLast &&
                        (light
                          ? "font-semibold text-white"
                          : "font-semibold text-navy-800"),
                    )}
                  >
                    {item.label}
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    className={cn(
                      "focus-ring",
                      light ? "hover:text-white" : "hover:text-ocean-700",
                    )}
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
