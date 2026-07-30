import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/public/page-hero";
import { Section } from "@/components/public/section";
import { Badge, statusTone } from "@/components/ui/badge";
import type { ApiUtility } from "@/lib/api";
import { buildMetadata } from "@/lib/seo";
import { serverFetch } from "@/lib/server-api";

type Props = { params: Promise<{ slug: string }> };

async function getUtility(slug: string) {
  return serverFetch<ApiUtility>(`/api/utilities/${slug}/`);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const utility = await getUtility(slug);
  if (!utility) {
    return buildMetadata({
      title: "Utility not found",
      description: "The requested member utility could not be found.",
      path: `/utilities/${slug}`,
      noIndex: true,
    });
  }
  return buildMetadata({
    title: utility.name,
    description: `${utility.name} — member utility in ${utility.zone}, ${utility.city}. Grade ${utility.grade}. Official OWUF directory profile.`,
    path: `/utilities/${slug}`,
  });
}

export default async function UtilityDetailPage({ params }: Props) {
  const { slug } = await params;
  const utility = await getUtility(slug);
  if (!utility) notFound();

  const related = await getRelatedUtilities(slug, utility.zone);

  return (
    <>
      <PageHero
        title={utility.name}
        description={`${utility.city}, ${utility.zone}`}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Member Utilities", href: "/utilities" },
          { label: utility.name },
        ]}
      />
      <Section>
        <div className="mx-auto max-w-3xl border border-border bg-white p-8">
          <Badge tone={statusTone(utility.status)}>{utility.status}</Badge>
          <dl className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                Grade
              </dt>
              <dd className="mt-1 text-navy-950">{utility.grade}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                Zone
              </dt>
              <dd className="mt-1 text-navy-950">{utility.zone}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                City / woreda
              </dt>
              <dd className="mt-1 text-navy-950">{utility.city}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                Customers
              </dt>
              <dd className="mt-1 text-navy-950">
                {utility.customers?.toLocaleString() ?? "—"}
              </dd>
            </div>
          </dl>
          <Link
            href="/utilities"
            className="mt-6 inline-flex text-sm font-semibold text-ocean-700 focus-ring rounded"
          >
            Back to directory
          </Link>
        </div>

        {related.length > 0 ? (
          <aside className="mx-auto mt-10 max-w-3xl">
            <h2 className="font-display text-2xl text-navy-950">
              Nearby utilities in {utility.zone}
            </h2>
            <ul className="mt-4 space-y-3">
              {related.map((item) => (
                <li key={item.slug}>
                  <Link
                    href={`/utilities/${item.slug}`}
                    className="block border border-border bg-white px-4 py-3 hover:bg-sky-50 focus-ring"
                  >
                    <span className="text-sm font-semibold text-ocean-700">
                      {item.name}
                    </span>
                    <span className="mt-1 block text-xs text-slate-500">
                      {item.city} · {item.grade}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        ) : null}
      </Section>
    </>
  );
}

async function getRelatedUtilities(slug: string, zone: string) {
  type ListResponse = { results?: ApiUtility[] } | ApiUtility[];
  const payload = await serverFetch<ListResponse>(
    `/api/utilities/?zone=${encodeURIComponent(zone)}&page_size=8`,
  );
  const items = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.results)
      ? payload.results
      : [];
  return items.filter((item) => item.slug !== slug).slice(0, 4);
}
