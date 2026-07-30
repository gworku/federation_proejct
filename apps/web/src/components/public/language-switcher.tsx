"use client";

import { localeLabels, type Locale } from "@/lib/i18n";
import { useLocale } from "@/hooks/use-locale";
import { cn } from "@/lib/utils";

const locales: Locale[] = ["en", "om", "am"];

type LanguageSwitcherProps = {
  variant?: "compact" | "full";
  className?: string;
};

export function LanguageSwitcher({
  variant = "compact",
  className,
}: LanguageSwitcherProps) {
  const { locale, setLocale, t } = useLocale();

  return (
    <div
      role="group"
      aria-label={t.language}
      className={cn(
        "inline-flex items-center border border-white/25 p-0.5",
        className,
      )}
    >
      {locales.map((code) => {
        const active = locale === code;
        const label =
          variant === "full" ? localeLabels[code] : code.toUpperCase();
        return (
          <button
            key={code}
            type="button"
            lang={code}
            aria-pressed={active}
            aria-current={active ? "true" : undefined}
            title={localeLabels[code]}
            onClick={() => setLocale(code)}
            className={cn(
              "px-2.5 py-1.5 text-xs font-semibold transition focus-ring",
              variant === "full" && "px-3 text-[11px] sm:text-xs",
              active
                ? "bg-white text-navy-950"
                : "text-white/80 hover:bg-white/10 hover:text-white",
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
