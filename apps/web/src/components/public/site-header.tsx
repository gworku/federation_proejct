"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, useEffect, useId, useRef, useState } from "react";
import { ChevronDown, Menu, Search, X } from "lucide-react";
import { BrandLogo } from "@/components/public/brand-logo";
import { LanguageSwitcher } from "@/components/public/language-switcher";
import { TopBar } from "@/components/public/top-bar";
import { useLocale } from "@/hooks/use-locale";
import { useLogout } from "@/hooks/use-logout";
import { getSession, type AuthUser } from "@/lib/auth";
import { mainNav, navJourneys } from "@/lib/i18n";
import { stripLocale } from "@/lib/locale-path";
import { org } from "@/lib/org";
import { cn } from "@/lib/utils";

function isActive(pathname: string, href: string) {
  const clean = stripLocale(pathname);
  return href === "/" ? clean === "/" : clean.startsWith(href);
}

function journeyById(id: string) {
  return navJourneys.find((journey) => journey.id === id);
}

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { locale, t, href } = useLocale();
  const [open, setOpen] = useState(false);
  const [openJourney, setOpenJourney] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [session, setSession] = useState<AuthUser | null>(null);
  const { logout, pending } = useLogout("/");
  const journeyMenuId = useId();
  const navRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    setSession(getSession());
  }, [pathname]);

  useEffect(() => {
    setOpen(false);
    setOpenJourney(null);
  }, [pathname]);

  useEffect(() => {
    if (!openJourney) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenJourney(null);
    };
    const onPointer = (event: MouseEvent) => {
      if (!navRef.current?.contains(event.target as Node)) {
        setOpenJourney(null);
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onPointer);
    };
  }, [openJourney]);

  const onSearch = (event: FormEvent) => {
    event.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push(href(`/search?q=${encodeURIComponent(q)}`));
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <TopBar />
      <div className="border-b border-white/10 bg-navy-950 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <Link
            href={href("/")}
            className="flex min-w-0 items-center gap-3 focus-ring"
          >
            <BrandLogo size={52} priority />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold sm:text-base">
                {org.shortName}
              </p>
              <p className="hidden truncate text-[11px] text-white/70 xl:block">
                {org.name[locale] ?? org.name.en}
              </p>
            </div>
          </Link>

          <nav
            ref={navRef}
            className="hidden items-center gap-0.5 xl:flex"
            aria-label={t.primaryNav}
          >
            {mainNav.map((entry) => {
              if (entry.type === "link") {
                return (
                  <Link
                    key={entry.href}
                    href={href(entry.href)}
                    className={cn(
                      "border-b-2 px-2.5 py-2 text-[13px] font-medium transition focus-ring",
                      isActive(pathname, entry.href)
                        ? "border-white text-white"
                        : "border-transparent text-white/80 hover:text-white",
                    )}
                  >
                    {t[entry.labelKey]}
                  </Link>
                );
              }

              const journey = journeyById(entry.journeyId);
              if (!journey) return null;
              const active =
                openJourney === journey.id ||
                journey.items.some((item) => isActive(pathname, item.href));
              const panelId = `${journeyMenuId}-${journey.id}`;
              return (
                <div key={journey.id} className="relative">
                  <button
                    type="button"
                    className={cn(
                      "inline-flex items-center gap-1 border-b-2 px-2.5 py-2 text-[13px] font-medium focus-ring",
                      active
                        ? "border-white text-white"
                        : "border-transparent text-white/80 hover:text-white",
                    )}
                    aria-expanded={openJourney === journey.id}
                    aria-haspopup="true"
                    aria-controls={panelId}
                    onClick={() =>
                      setOpenJourney((current) =>
                        current === journey.id ? null : journey.id,
                      )
                    }
                  >
                    {t[journey.labelKey]}
                    <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                  {openJourney === journey.id ? (
                    <div
                      id={panelId}
                      role="menu"
                      className="absolute left-0 mt-2 w-72 border border-white/15 bg-navy-950 p-2 shadow-lg"
                    >
                      <p className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-white/55">
                        {t[journey.labelKey]}
                      </p>
                      {journey.items.map((link) => (
                        <Link
                          key={link.href}
                          role="menuitem"
                          href={href(link.href)}
                          className={cn(
                            "block border-l-2 px-3 py-2.5 text-sm focus-ring",
                            isActive(pathname, link.href)
                              ? "border-ocean-500 bg-white/10 text-white"
                              : "border-transparent text-white/80 hover:bg-white/5 hover:text-white",
                          )}
                        >
                          {t[link.labelKey]}
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <form onSubmit={onSearch} className="relative hidden lg:block">
              <label className="sr-only" htmlFor="site-search">
                {t.searchSite}
              </label>
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60"
                aria-hidden="true"
              />
              <input
                id="site-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t.search}
                className="h-10 w-36 border border-white/25 bg-navy-900 pl-9 pr-3 text-sm text-white placeholder:text-white/50 focus-ring xl:w-44"
              />
            </form>
            <LanguageSwitcher className="hidden sm:inline-flex" />
            {session ? (
              <>
                <Link
                  href="/app/dashboard"
                  className="hidden border border-white/30 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 focus-ring sm:inline-flex"
                >
                  {t.workspace}
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  disabled={pending}
                  className="hidden border border-white/30 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 focus-ring disabled:opacity-60 sm:inline-flex"
                >
                  {pending ? "…" : t.logout}
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="hidden rounded-md bg-ocean-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-ocean-500 focus-ring sm:inline-flex"
              >
                {t.memberPortal}
              </Link>
            )}
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center border border-white/30 focus-ring xl:hidden"
              aria-expanded={open}
              aria-controls="mobile-nav"
              onClick={() => setOpen((v) => !v)}
            >
              <span className="sr-only">{t.toggleMenu}</span>
              {open ? (
                <X className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Menu className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {open ? (
          <div
            id="mobile-nav"
            className="max-h-[70vh] overflow-y-auto border-t border-white/10 bg-navy-950 px-4 py-4 xl:hidden"
          >
            <nav className="flex flex-col gap-1" aria-label={t.mobileNav}>
              {mainNav.map((entry) => {
                if (entry.type === "link") {
                  return (
                    <Link
                      key={entry.href}
                      href={href(entry.href)}
                      className="min-h-11 border-l-2 border-transparent px-3 py-3 text-sm font-medium text-white/90 hover:bg-white/5 focus-ring"
                    >
                      {t[entry.labelKey]}
                    </Link>
                  );
                }
                const journey = journeyById(entry.journeyId);
                if (!journey) return null;
                return (
                  <div
                    key={journey.id}
                    className="mt-2 border-t border-white/10 pt-2"
                  >
                    <p className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white/55">
                      {t[journey.labelKey]}
                    </p>
                    {journey.items.map((link) => (
                      <Link
                        key={link.href}
                        href={href(link.href)}
                        className="block min-h-11 border-l-2 border-transparent px-3 py-3 text-sm font-medium text-white/90 hover:bg-white/5 focus-ring"
                      >
                        {t[link.labelKey]}
                      </Link>
                    ))}
                  </div>
                );
              })}
              <form onSubmit={onSearch} className="mt-3">
                <label className="sr-only" htmlFor="mobile-site-search">
                  {t.searchSite}
                </label>
                <input
                  id="mobile-site-search"
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t.search}
                  className="h-11 w-full border border-white/25 bg-navy-900 px-3 text-sm text-white placeholder:text-white/50 focus-ring"
                />
              </form>
              <LanguageSwitcher variant="full" className="mt-3 w-full justify-between" />
              {session ? (
                <>
                  <Link
                    href="/app/dashboard"
                    className="mt-2 border border-white/30 px-3 py-3 text-center text-sm font-semibold text-white focus-ring"
                  >
                    {t.workspace}
                  </Link>
                  <button
                    type="button"
                    onClick={logout}
                    disabled={pending}
                    className="mt-2 border border-white/30 px-3 py-3 text-center text-sm font-semibold text-white focus-ring disabled:opacity-60"
                  >
                    {pending ? "…" : t.logout}
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="mt-2 border border-white/30 px-3 py-3 text-center text-sm font-semibold text-white focus-ring"
                >
                  {t.memberPortal}
                </Link>
              )}
            </nav>
          </div>
        ) : null}
      </div>
    </header>
  );
}
