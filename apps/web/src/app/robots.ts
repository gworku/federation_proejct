import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/en/", "/om/", "/am/"],
        disallow: [
          "/app/",
          "/login",
          "/en/login",
          "/om/login",
          "/am/login",
          "/forgot-password",
          "/api/",
          "/_next/",
          "/search",
          "/en/search",
          "/om/search",
          "/am/search",
          "/request-access",
          "/en/request-access",
          "/om/request-access",
          "/am/request-access",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
