import Image from "next/image";
import Link from "next/link";
import { org } from "@/lib/org";
import { publicPageMetadata } from "@/lib/page-meta";

export async function generateMetadata() {
  return publicPageMetadata("account");
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-full bg-sky-50">
      <div className="mx-auto flex min-h-full max-w-lg flex-col justify-center px-4 py-12 sm:px-6">
        <Link href="/" className="mb-8 flex items-center gap-3 focus-ring">
          <Image
            src={org.logo}
            alt={`${org.shortName} — Oromia Potable Water and Sewage Service Federation emblem`}
            width={64}
            height={64}
            className="h-16 w-16 object-contain"
            priority
          />
          <div>
            <p className="font-bold text-navy-950">{org.shortName}</p>
            <p className="text-xs text-slate-600">Secure member access</p>
          </div>
        </Link>
        <main id="main-content">{children}</main>
      </div>
    </div>
  );
}
