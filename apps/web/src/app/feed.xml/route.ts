import { API_URL } from "@/lib/api";
import { SITE_URL, siteConfig } from "@/lib/seo";
import { org } from "@/lib/org";

export const revalidate = 600;

type NewsRow = {
  title: string;
  slug: string;
  excerpt: string;
  published_at: string | null;
  category: string;
};

async function getNews(): Promise<NewsRow[]> {
  try {
    const response = await fetch(`${API_URL}/api/cms/news/?page_size=30`, {
      next: { revalidate: 600 },
    });
    if (!response.ok) return [];
    const data = await response.json();
    return Array.isArray(data) ? data : data.results || [];
  } catch {
    return [];
  }
}

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export async function GET() {
  const news = await getNews();
  const items = news
    .map((item) => {
      const link = `${SITE_URL}/en/news/${item.slug}`;
      const pubDate = item.published_at
        ? new Date(item.published_at).toUTCString()
        : new Date().toUTCString();
      return `
    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${pubDate}</pubDate>
      <category>${escapeXml(item.category)}</category>
      <description>${escapeXml(item.excerpt)}</description>
    </item>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(org.name.en)} News</title>
    <link>${SITE_URL}/en/news</link>
    <description>${escapeXml(siteConfig.description)}</description>
    <language>en</language>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=600, stale-while-revalidate=86400",
    },
  });
}
