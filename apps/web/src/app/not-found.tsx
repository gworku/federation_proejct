import Link from "next/link";
import { org } from "@/lib/org";

const quickLinks = [
  { href: "/services", label: "Services" },
  { href: "/utilities", label: "Member Utilities" },
  { href: "/news", label: "News" },
  { href: "/contact", label: "Contact" },
];

export default function NotFound() {
  return (
    <div className="site-gradient flex min-h-full flex-col items-center justify-center px-4 py-24 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-ocean-600">
        {org.shortName}
      </p>
      <p className="mt-6 font-display text-7xl font-semibold text-navy-950/15 sm:text-8xl">
        404
      </p>
      <h1 className="mt-2 font-display text-4xl font-semibold text-navy-950 sm:text-5xl">
        Page not found
      </h1>
      <p className="mt-4 max-w-md text-slate-600">
        The page you requested is unavailable or has moved. Use the links below
        to continue, or contact the federation office for assistance.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="rounded-xl bg-ocean-600 px-5 py-3 text-sm font-semibold text-white hover:bg-ocean-500 focus-ring"
        >
          Go home
        </Link>
        <Link
          href="/contact"
          className="rounded-xl border border-ocean-600/30 px-5 py-3 text-sm font-semibold text-ocean-700 hover:bg-sky-100 focus-ring"
        >
          Contact support
        </Link>
      </div>
      <ul className="mt-10 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-slate-600">
        {quickLinks.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="font-medium text-ocean-700 underline-offset-2 hover:underline focus-ring rounded"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
