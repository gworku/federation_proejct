import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { services } from "@/data/content";
import { getLocalizedService } from "@/data/localized-services";
import { ServiceDetail } from "@/components/public/service-detail";
import { buildMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = getLocalizedService(slug, "en");
  if (!service) {
    return buildMetadata({
      title: "Service not found",
      description: "The requested service page could not be found.",
      path: `/services/${slug}`,
      noIndex: true,
    });
  }
  return buildMetadata({
    title: service.title,
    description: `${service.description} Official OWUF service for member utilities in Oromia, Ethiopia.`,
    path: `/services/${slug}`,
  });
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!services.some((item) => item.slug === slug)) notFound();
  return <ServiceDetail slug={slug} />;
}
