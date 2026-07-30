"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  getStoredLocale,
  setStoredLocale,
  ui,
  type Locale,
} from "@/lib/i18n";
import {
  getLocaleFromPath,
  switchLocalePath,
  withLocale,
} from "@/lib/locale-path";

export function useLocale() {
  const pathname = usePathname();
  const router = useRouter();
  const pathLocale = getLocaleFromPath(pathname);
  const [locale, setLocaleState] = useState<Locale>(pathLocale ?? "en");

  useEffect(() => {
    const next = pathLocale ?? getStoredLocale();
    setLocaleState(next);
    setStoredLocale(next);
  }, [pathLocale]);

  const setLocale = (next: Locale) => {
    if (locale === next) return;
    setStoredLocale(next);
    setLocaleState(next);
    router.push(switchLocalePath(pathname, next));
  };

  return {
    locale,
    setLocale,
    t: ui[locale],
    href: (path: string) => withLocale(locale, path),
  };
}
