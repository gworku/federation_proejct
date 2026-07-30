import type { Locale } from "@/lib/i18n";

export const LOCALES: Locale[] = ["en", "om", "am"];

export function stripLocale(pathname: string): string {
  const match = pathname.match(/^\/(en|om|am)(?=\/|$)/);
  if (!match) return pathname || "/";
  const rest = pathname.slice(match[0].length);
  return rest === "" ? "/" : rest;
}

export function getLocaleFromPath(pathname: string): Locale | null {
  const match = pathname.match(/^\/(en|om|am)(?=\/|$)/);
  if (!match) return null;
  return match[1] as Locale;
}

/** Prefix a site-internal public href with the active locale. */
export function withLocale(locale: Locale, href: string): string {
  if (
    !href ||
    href.startsWith("http") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:") ||
    href.startsWith("/app") ||
    href.startsWith("/login") ||
    href.startsWith("/feed.xml")
  ) {
    return href;
  }
  const [rawPath, query = ""] = href.split("?");
  const path = rawPath.startsWith("/") ? rawPath : `/${rawPath}`;
  const clean = stripLocale(path);
  const localized = clean === "/" ? `/${locale}` : `/${locale}${clean}`;
  return query ? `${localized}?${query}` : localized;
}

export function switchLocalePath(pathname: string, next: Locale): string {
  const clean = stripLocale(pathname);
  return withLocale(next, clean);
}
