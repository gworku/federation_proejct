/**
 * Canonical public IA — only routes listed here are promoted in nav/sitemap.
 * Removed/legacy paths redirect in next.config.ts.
 */
export const corePublicRoutes = [
  { path: "/", changeFrequency: "daily", priority: 1 },
  { path: "/about", changeFrequency: "monthly", priority: 0.9 },
  { path: "/about/mission-vision", changeFrequency: "monthly", priority: 0.85 },
  { path: "/about/leadership", changeFrequency: "monthly", priority: 0.8 },
  { path: "/mandate", changeFrequency: "monthly", priority: 0.9 },
  { path: "/services", changeFrequency: "weekly", priority: 0.9 },
  { path: "/capacity-building", changeFrequency: "weekly", priority: 0.8 },
  { path: "/technical-support", changeFrequency: "weekly", priority: 0.8 },
  { path: "/consultancy", changeFrequency: "weekly", priority: 0.75 },
  { path: "/membership", changeFrequency: "monthly", priority: 0.8 },
  { path: "/procurement", changeFrequency: "weekly", priority: 0.7 },
  { path: "/projects", changeFrequency: "weekly", priority: 0.85 },
  { path: "/utilities", changeFrequency: "weekly", priority: 0.9 },
  { path: "/knowledge", changeFrequency: "weekly", priority: 0.85 },
  { path: "/partnerships", changeFrequency: "monthly", priority: 0.75 },
  { path: "/news", changeFrequency: "daily", priority: 0.9 },
  { path: "/events", changeFrequency: "weekly", priority: 0.8 },
  { path: "/gallery", changeFrequency: "weekly", priority: 0.7 },
  { path: "/faq", changeFrequency: "monthly", priority: 0.65 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.85 },
  { path: "/request-access", changeFrequency: "monthly", priority: 0.55 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.25 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.25 },
  { path: "/accessibility", changeFrequency: "yearly", priority: 0.25 },
  { path: "/search", changeFrequency: "monthly", priority: 0.35 },
] as const;

/** Legacy paths permanently redirected (SEO-safe consolidation). */
export const legacyRedirects: Array<{ from: string; to: string }> = [
  { from: "/statements", to: "/news" },
  { from: "/publications", to: "/knowledge" },
  { from: "/climate", to: "/services" },
  { from: "/innovation", to: "/knowledge" },
  { from: "/advocacy", to: "/services/communication-advocacy" },
  { from: "/resource-mobilization", to: "/services/resource-mobilization" },
  { from: "/about/structure", to: "/about" },
];
