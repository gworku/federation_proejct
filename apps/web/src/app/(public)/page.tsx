import { HomePage } from "@/components/public/home-page";
import { JsonLd } from "@/components/seo/json-ld";
import { org } from "@/lib/org";
import { getRequestLocale } from "@/lib/request-locale";
import { buildMetadata, siteConfig, webPageJsonLd } from "@/lib/seo";

export async function generateMetadata() {
  const locale = await getRequestLocale();
  return buildMetadata({
    title: `${org.shortName} — Official Water Utilities Federation of Oromia`,
    description: siteConfig.description,
    path: "/",
    contentLocale: locale,
  });
}

export default function Page() {
  return (
    <>
      <JsonLd
        data={webPageJsonLd({
          name: `${org.shortName} — Official Water Utilities Federation of Oromia`,
          description: siteConfig.description,
          path: "/",
        })}
      />
      <HomePage />
    </>
  );
}
