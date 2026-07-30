import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const LOCALES = ["en", "om", "am"] as const;
const DEFAULT_LOCALE = "en";

function isLocale(value: string): value is (typeof LOCALES)[number] {
  return (LOCALES as readonly string[]).includes(value);
}

function shouldSkip(pathname: string) {
  return (
    pathname.startsWith("/api") ||
    pathname.startsWith("/app") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/feed.xml") ||
    pathname.startsWith("/robots.txt") ||
    pathname.startsWith("/sitemap") ||
    pathname.includes(".")
  );
}

/** Prefer Afaan Oromo / Amharic when the browser advertises them. */
function localeFromAcceptLanguage(header: string | null): (typeof LOCALES)[number] | null {
  if (!header) return null;
  const parts = header.split(",").map((part) => {
    const [tag, qPart] = part.trim().split(";");
    const q = qPart?.startsWith("q=") ? Number(qPart.slice(2)) : 1;
    return { tag: (tag || "").toLowerCase(), q: Number.isFinite(q) ? q : 1 };
  });
  parts.sort((a, b) => b.q - a.q);
  for (const { tag } of parts) {
    if (tag.startsWith("om")) return "om";
    if (tag.startsWith("am")) return "am";
    if (tag.startsWith("en")) return "en";
  }
  return null;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (shouldSkip(pathname)) return NextResponse.next();

  const segment = pathname.split("/")[1] ?? "";
  const hasLocale = isLocale(segment);

  if (hasLocale) {
    const rest = pathname.slice(`/${segment}`.length) || "/";
    const url = request.nextUrl.clone();
    url.pathname = rest;
    const response = NextResponse.rewrite(url);
    response.cookies.set("NEXT_LOCALE", segment, {
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
    });
    response.headers.set("x-owuf-locale", segment);
    return response;
  }

  const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value;
  const negotiated = localeFromAcceptLanguage(
    request.headers.get("accept-language"),
  );
  const locale =
    cookieLocale && isLocale(cookieLocale)
      ? cookieLocale
      : negotiated || DEFAULT_LOCALE;
  const url = request.nextUrl.clone();
  url.pathname = pathname === "/" ? `/${locale}` : `/${locale}${pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
