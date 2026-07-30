import { headers } from "next/headers";
import type { Locale } from "@/lib/i18n";

const LOCALES: Locale[] = ["en", "om", "am"];

export function isLocale(value: string | null | undefined): value is Locale {
  return Boolean(value && (LOCALES as string[]).includes(value));
}

/** Read active public locale from middleware header (set on /en|/om|/am rewrites). */
export async function getRequestLocale(): Promise<Locale> {
  const h = await headers();
  const value = h.get("x-owuf-locale");
  return isLocale(value) ? value : "en";
}

export function ogLocaleFor(locale: Locale) {
  if (locale === "am") return "am_ET";
  if (locale === "om") return "om_ET";
  return "en_ET";
}

export function htmlLangFor(locale: Locale) {
  return locale;
}
