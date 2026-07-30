export const org = {
  name: {
    en: "Oromia Water Utilities Federation",
    om: "Federeeshinii Tajaajiloota Bishaanii Oromiyaa",
    am: "\u12e8\u12a6\u122e\u121a\u12eb \u12e8\u12cd\u1203 \u12a0\u1308\u120d\u130d\u120e\u1275 \u1270\u124b\u121b\u1275 \u134c\u12f4\u122c\u123d\u1295",
  },
  /** Also known historically as Oromia Urban Water Supply and Sewerage Service Enterprises Federation */
  legalName: {
    en: "Oromia Urban Water Supply and Sewerage Service Enterprises Federation",
  },
  shortName: "OWUF",
  domain: "owuf.gov.et",
  email: "info@owuf.gov.et",
  /** Primary public contact — email is the verified institutional channel */
  phone: [] as string[],
  /** Official social — populate when federation pages are verified live */
  social: {
    facebook: "",
    linkedin: "",
    telegram: "",
  } as Record<"facebook" | "linkedin" | "telegram", string>,
  address: {
    en: "Finfinnee / Addis Ababa, Oromia, Ethiopia",
    om: "Finfinnee, Oromiyaa, Itoophiyaa",
    am: "\u134a\u1295\u134a\u1294 / \u12a0\u12f2\u1235 \u12a0\u1260\u1263\u1363 \u12a6\u122e\u121a\u12eb\u1363 \u12a2\u1275\u12ee\u1335\u12eb",
  },
  supervisingBodies: ["Oromia Water & Energy Bureau (OWEB)", "Ministry of Water and Energy (MoWE)"],
  proclamation: "Proclamation No. 228/2020",
  tin: "0055401768",
  strategicPlanPeriod: "2026\u20132030",
  logo: "/brand/logo-owuf.png",
  logoSvg: "/brand/logo-owuf.png",
} as const;

export type Locale = "en" | "om" | "am";
