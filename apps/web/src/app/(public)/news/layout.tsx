import { publicPageMetadata } from "@/lib/page-meta";
import { SITE_URL } from "@/lib/seo";

export async function generateMetadata() {
  const meta = await publicPageMetadata("news");
  return {
    ...meta,
    alternates: {
      ...meta.alternates,
      types: {
        "application/rss+xml": `${SITE_URL}/feed.xml`,
      },
    },
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
