import type { Metadata } from "next";
import { org } from "@/lib/org";
import { getRequestLocale } from "@/lib/request-locale";
import { buildMetadata } from "@/lib/seo";

const defs = {
  about: {
    title: `About ${org.shortName}`,
    description: `Learn about the ${org.name.en}—mandate under Proclamation No. 228/2020, governance, and role coordinating Water Service Providers across Oromia, Ethiopia.`,
    path: "/about",
  },
  mission: {
    title: "Mission, Vision and Values",
    description: `${org.shortName} mission, vision, core values, and Key Result Areas from the Strategic Plan ${org.strategicPlanPeriod}.`,
    path: "/about/mission-vision",
  },
  leadership: {
    title: "Leadership and Governance",
    description: `Meet the Executive Committee Board and leadership of the ${org.name.en}.`,
    path: "/about/leadership",
  },
  services: {
    title: "Services for Member Utilities",
    description: `Explore ${org.shortName} services including capacity building, technical assistance, NRW reduction, digital systems, joint procurement, and policy advocacy.`,
    path: "/services",
  },
  projects: {
    title: "Projects and Programmes",
    description: `Federation programmes under Strategic Plan ${org.strategicPlanPeriod} Key Result Areas for institutional capacity, member development, and advocacy.`,
    path: "/projects",
  },
  utilities: {
    title: "Member Utilities Directory",
    description: `Searchable directory of ${org.shortName} member Water Service Providers across Oromia utility levels.`,
    path: "/utilities",
  },
  news: {
    title: "News and Official Updates",
    description: `Official news, announcements, and programme updates from the ${org.name.en}.`,
    path: "/news",
  },
  events: {
    title: "Events and Engagements",
    description: `Upcoming ${org.shortName} meetings, training programmes, and member engagement activities.`,
    path: "/events",
  },
  gallery: {
    title: "Photo Gallery",
    description: `Photos and media from ${org.shortName} programmes, member utilities, and federation events.`,
    path: "/gallery",
  },
  faq: {
    title: "Frequently Asked Questions",
    description: `Answers about ${org.shortName} mandate, Strategic Plan, membership, and the management platform.`,
    path: "/faq",
  },
  contact: {
    title: `Contact ${org.shortName}`,
    description: `Contact the ${org.name.en} for support, partnerships, and institutional inquiries.`,
    path: "/contact",
  },
  requestAccess: {
    title: "Request Platform Access",
    description: `Request authorized access to the ${org.shortName} integrated management platform.`,
    path: "/request-access",
    noIndex: true as const,
  },
  privacy: {
    title: "Privacy Policy",
    description: `How ${org.shortName} collects, processes, and protects personal and organizational information.`,
    path: "/privacy",
  },
  terms: {
    title: "Terms and Conditions",
    description: `Terms governing lawful use of the ${org.shortName} website and authenticated management system.`,
    path: "/terms",
  },
  accessibility: {
    title: "Accessibility Statement",
    description: `${org.shortName} commitment to accessible public and authenticated digital services.`,
    path: "/accessibility",
  },
  search: {
    title: `Search ${org.shortName} Resources`,
    description: `Find ${org.shortName} member utilities, projects, news, and public resources across Oromia.`,
    path: "/search",
    noIndex: true as const,
  },
  login: {
    title: "Member Portal Login",
    description: `Authorized personnel login to the ${org.shortName} integrated management platform.`,
    path: "/login",
    noIndex: true as const,
  },
  account: {
    title: "OWUF Account",
    description: `Sign in or manage access to the ${org.shortName} integrated management platform.`,
    path: "/login",
    noIndex: true as const,
  },
  mandate: {
    title: "Mandate and Legal Framework",
    description: `${org.shortName} powers and duties under Proclamation No. 228/2020 and alignment with national water-sector frameworks.`,
    path: "/mandate",
  },
  knowledge: {
    title: "Knowledge Center",
    description: `Strategic plans, policies, guidelines, publications, and learning resources from ${org.shortName}.`,
    path: "/knowledge",
  },
  partnerships: {
    title: "Partnerships",
    description: `${org.shortName} collaboration with OWEB, MoWE, member utilities, development partners, and research institutions.`,
    path: "/partnerships",
  },
  capacityBuilding: {
    title: "Capacity Building and Training",
    description: `Training and capacity programmes strengthening Water Service Providers across Oromia.`,
    path: "/capacity-building",
  },
  technicalSupport: {
    title: "Technical Support",
    description: `Technical assistance for operations, NRW, billing, engineering, and digital transformation of member utilities.`,
    path: "/technical-support",
  },
  membership: {
    title: "Membership Application",
    description: `Apply for ${org.shortName} membership as a Water Service Provider or partner organization across Oromia.`,
    path: "/membership",
  },
  consultancy: {
    title: "Consultancy Services",
    description: `Request ${org.shortName} consultancy support in water engineering, utility management, ICT, GIS/SCADA, and policy.`,
    path: "/consultancy",
  },
  procurement: {
    title: "Procurement Notices",
    description: `View open ${org.shortName} procurement notices and express interest in federation tenders and opportunities.`,
    path: "/procurement",
  },
} as const;

export type PublicPageKey = keyof typeof defs;

/** Locale-aware metadata for public section layouts. */
export async function publicPageMetadata(
  key: PublicPageKey,
): Promise<Metadata> {
  const locale = await getRequestLocale();
  const def = defs[key];
  return buildMetadata({
    title: def.title,
    description: def.description,
    path: def.path,
    noIndex: "noIndex" in def ? Boolean(def.noIndex) : false,
    contentLocale: locale,
  });
}
