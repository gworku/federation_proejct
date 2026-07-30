import type { MetadataRoute } from "next";
import { services } from "@/data/content";
import { API_URL } from "@/lib/api";
import { SITE_URL, siteConfig } from "@/lib/seo";
import { corePublicRoutes } from "@/lib/site-routes";

async function fetchSlugs(path: string): Promise<string[]> {
  try {
    const response = await fetch(`${API_URL}${path}`, {
      next: { revalidate: 3600 },
    });
    if (!response.ok) return [];
    const data = await response.json();
    const rows = Array.isArray(data) ? data : data.results || [];
    return rows.map((row: { slug?: string }) => row.slug).filter(Boolean);
  } catch {
    return [];
  }
}

function localizedEntries(
  path: string,
  options: {
    lastModified: Date;
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
    priority: number;
  },
): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(
    siteConfig.locales.map((locale) => [
      locale,
      `${SITE_URL}/${locale}${path === "/" ? "" : path}`,
    ]),
  );

  return siteConfig.locales.map((locale) => ({
    url: `${SITE_URL}/${locale}${path === "/" ? "" : path}`,
    lastModified: options.lastModified,
    changeFrequency: options.changeFrequency,
    priority: options.priority,
    alternates: { languages },
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [utilitySlugs, projectSlugs, newsSlugs] = await Promise.all([
    fetchSlugs("/api/utilities/?page_size=200"),
    fetchSlugs("/api/projects/?page_size=100"),
    fetchSlugs("/api/cms/news/?page_size=100"),
  ]);

  const now = new Date();

  const staticEntries = corePublicRoutes.flatMap((route) =>
    localizedEntries(route.path, {
      lastModified: now,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    }),
  );

  const serviceEntries = services.flatMap((service) =>
    localizedEntries(`/services/${service.slug}`, {
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.65,
    }),
  );

  const dynamicEntries = [
    ...utilitySlugs.flatMap((slug) =>
      localizedEntries(`/utilities/${slug}`, {
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.55,
      }),
    ),
    ...projectSlugs.flatMap((slug) =>
      localizedEntries(`/projects/${slug}`, {
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.6,
      }),
    ),
    ...newsSlugs.flatMap((slug) =>
      localizedEntries(`/news/${slug}`, {
        lastModified: now,
        changeFrequency: "daily",
        priority: 0.7,
      }),
    ),
  ];

  return [...staticEntries, ...serviceEntries, ...dynamicEntries];
}
