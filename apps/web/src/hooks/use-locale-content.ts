"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchLocaleContent, type LocaleContentItem } from "@/lib/api";
import type { Locale } from "@/lib/i18n";
import { useLocale } from "@/hooks/use-locale";

/** Load approved CMS LocaleContent for the active locale, keyed by content key. */
export function useLocaleContent(keys?: string[]) {
  const { locale } = useLocale();
  const query = useQuery({
    queryKey: ["locale-content", locale],
    queryFn: () => fetchLocaleContent(locale),
    staleTime: 15 * 60_000,
    gcTime: 30 * 60_000,
  });

  const map = new Map<string, LocaleContentItem>();
  for (const row of query.data ?? []) {
    if (!keys || keys.includes(row.key)) map.set(row.key, row);
  }

  const get = (key: string, fallbackTitle: string, fallbackBody: string) => {
    const row = map.get(key);
    return {
      title: row?.title || fallbackTitle,
      body: row?.body || fallbackBody,
      fromCms: Boolean(row),
    };
  };

  return { ...query, locale: locale as Locale, get, map };
}
