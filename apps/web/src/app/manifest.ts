import type { MetadataRoute } from "next";
import { org } from "@/lib/org";
import { siteConfig } from "@/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: org.name.en,
    short_name: org.shortName,
    description: siteConfig.description,
    start_url: "/en",
    id: "/en",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#f0f7fb",
    theme_color: "#0b1f3a",
    lang: "en",
    dir: "ltr",
    categories: ["government", "utilities", "business"],
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/brand/logo-owuf.png",
        sizes: "any",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
