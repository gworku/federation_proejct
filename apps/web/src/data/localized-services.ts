import type { Locale } from "@/lib/i18n";
import { services as baseServices, type ServiceItem } from "@/data/content";

type LocalizedService = {
  slug: string;
  icon: ServiceItem["icon"];
  title: Record<Locale, string>;
  description: Record<Locale, string>;
};

export const localizedServices: LocalizedService[] = [
  {
    slug: "capacity-building",
    icon: "graduation",
    title: {
      en: "Capacity Building for WSPs",
      om: "Ijaarsa Dandeettii WSP",
      am: "\u1208WSP \u12ce\u127d \u12a0\u1245\u121d \u130d\u1295\u1263\u1273",
    },
    description: {
      en: "Strong support to member utilities through training, technical assistance, and institutional performance improvement.",
      om: "Leenjii, deeggarsa teeknikaa, fi fooyya'iinsa raawwii tiin dhaabbilee miseensotaa cimsuu.",
      am: "\u1260\u1235\u120d\u1320\u1293\u1363 \u1274\u12ad\u1292\u12ab\u120d \u12f0\u130b\u134d \u12a5\u1293 \u1270\u124b\u121b\u12ca \u12a0\u134d\u133b\u133d\u121d \u12a0\u1263\u120d \u1270\u124b\u121b\u1275\u1295 \u121b\u1325\u1293\u12a8\u122d\u1362",
    },
  },
  {
    slug: "member-engagement",
    icon: "users",
    title: {
      en: "Members Engagement & Development",
      om: "Hirmaannaa fi Misooma Miseensotaa",
      am: "\u12e8\u12a0\u1263\u120b\u1275 \u1270\u1233\u1275\u134e \u12a5\u1293 \u12a5\u12f5\u1308\u1275",
    },
    description: {
      en: "Recruitment, benchmarking, peer learning, and programmes that strengthen Water Service Providers across all grades.",
      om: "Hirmaachisuu, wal-madaaluu, barumsa waloo, fi sagantaawwan WSP sadarkaa hunda cimsuu.",
      am: "\u121b\u1235\u1308\u1263\u1275\u1363 \u121b\u1290\u133b\u1338\u122d\u1363 \u12e8\u12a5\u12a9\u12eb \u1275\u121d\u1205\u122d\u1275 \u12a5\u1293 \u1201\u1209\u1295 \u12f0\u1228\u1303\u12ce\u127d \u12e8\u121a\u12eb\u1325\u1295\u12ad\u1229 \u1355\u122e\u130d\u122b\u121e\u127d\u1362",
    },
  },
  {
    slug: "communication-advocacy",
    icon: "scale",
    title: {
      en: "Communication & Advocacy",
      om: "Qunnamtii fi Afgaaffii",
      am: "\u130d\u1295\u1299\u1295 \u12a5\u1293 \u12f4\u130d\u134d",
    },
    description: {
      en: "Raise OWUF’s profile, advance members’ interests, and advocate for water resources, safe supplies, and enabling sector policy.",
      om: "Fakkii OWUF ol kaasuu, fedhii miseensotaa deeggaruu, fi imaammata bishaanii mijataa afgaaffuu.",
      am: "\u12e8OWUF \u121d\u1235\u120d \u121b\u1233\u12f0\u130d\u1363 \u12e8\u12a0\u1263\u120b\u1275 \u1325\u1245\u121d \u121b\u1233\u12f0\u130d \u12a5\u1293 \u1208\u12cd\u1203 \u12a5\u1293 \u12e8\u133d\u122d\u12d5 \u1356\u120a\u1232 \u1218\u12f0\u1308\u134d\u1362",
    },
  },
  {
    slug: "technical-assistance",
    icon: "wrench",
    title: {
      en: "Technical Assistance",
      om: "Deeggarsa Teeknikaa",
      am: "\u12e8\u1274\u12ad\u1292\u12ad \u12f0\u130b\u134d",
    },
    description: {
      en: "Hands-on support for water and sewerage operations, engineering management, and service quality improvement.",
      om: "Deeggarsa hojii bishaanii fi bishaan xuraa'aa, bulchiinsa injinerii, fi qulqullina tajaajilaa.",
      am: "\u1208\u12cd\u1203 \u12a5\u1293 \u12e8\u134d\u1235\u1235 \u12a0\u1235\u1270\u12f3\u12f0\u122d\u1363 \u12a5\u1295\u1302\u1290\u122a\u1295\u130d \u12a5\u1293 \u12e8\u12a0\u1308\u120d\u130d\u120e\u1275 \u1325\u122b\u1275 \u12f5\u130b\u134d\u1362",
    },
  },
  {
    slug: "nrw-management",
    icon: "shield",
    title: {
      en: "Non-Revenue Water Reduction",
      om: "Hir'isuu Bishaan Galii Hin Kennine",
      am: "\u12e8\u1308\u1262 \u12a0\u120d\u12a8\u121b\u1295 \u12cd\u1203 \u121b\u1245\u1290\u1235",
    },
    description: {
      en: "Programmes focused on leak detection, metering accuracy, loss prevention, and revenue protection for member utilities.",
      om: "Sagantaa qorannoo dhangala'ina, madaallii sirrii, fi eegumsa galii miseensotaa.",
      am: "\u12e8\u121d\u12dd\u1275 \u1218\u1208\u12e8\u1275\u1363 \u121a\u1275\u122d \u1275\u12ad\u12ad\u1208\u129b \u12a5\u1293 \u12e8\u12a0\u1263\u120b\u1275 \u1308\u1262 \u121b\u1235\u1320\u1260\u1245 \u1355\u122e\u130d\u122b\u121e\u127d\u1362",
    },
  },
  {
    slug: "digital-systems",
    icon: "monitor",
    title: {
      en: "Technology & Digital Systems",
      om: "Teeknooloojii fi Sirna Dijitaalaa",
      am: "\u1274\u12ad\u1296\u120e\u1302 \u12a5\u1293 \u12f2\u1302\u1273\u120d \u1235\u122d\u12d6\u127d",
    },
    description: {
      en: "Support for SCADA, GIS, digital billing, ICT capacity, and change management across member WSPs.",
      om: "Deeggarsa SCADA, GIS, bilii dijitaalaa, ICT, fi bulchiinsa jijjiiramaa.",
      am: "\u1208SCADA\u1363 GIS\u1363 \u12f2\u1302\u1273\u120d \u12ab\u134d\u12eb\u1363 ICT \u12a5\u1293 \u12e8\u1208\u12cd\u1325 \u12a0\u1235\u1270\u12f3\u12f0\u122d \u12f5\u130b\u134d\u1362",
    },
  },
  {
    slug: "joint-procurement",
    icon: "file",
    title: {
      en: "Joint Procurement & Supply",
      om: "Bittaa Waliigalaa fi Dhiyeessii",
      am: "\u12e8\u130b\u122b \u130d\u12dd \u12a5\u1293 \u12a0\u1245\u122d\u1260\u1275",
    },
    description: {
      en: "Coordinate standardized procurement of water materials and equipment, and explore local manufacturing of sector inputs.",
      om: "Bittaa qabeenya bishaanii waloo qindeessuu fi oomisha naannoo qorachuu.",
      am: "\u12e8\u12cd\u1203 \u12a5\u1243\u12ce\u127d\u1295 \u12e8\u1210\u1240\u1290 \u130d\u12dd \u121b\u1240\u1293\u1300\u1275 \u12a5\u1293 \u12e8\u12a0\u12ab\u1263\u1262 \u121b\u121d\u1228\u1275\u1295 \u121b\u1233\u12f0\u130d\u1362",
    },
  },
  {
    slug: "resource-mobilization",
    icon: "chart",
    title: {
      en: "Resource Mobilization",
      om: "Qabeenya Sassaabuu",
      am: "\u12e8\u1201\u1265\u1275 \u121b\u1290\u1243\u1240\u122d",
    },
    description: {
      en: "Link WSPs with development partners and institutions for funding, and strengthen federation financial sustainability.",
      om: "WSP michuuwwan misoomaa wajjin hidhuu fi dhaabbata maallaqaan cimsuu.",
      am: "WSP\u12ce\u127d\u1295 \u12a8\u121b\u1205\u1260\u1225 \u12a0\u130b\u122e\u127d \u130b\u122d \u121b\u1308\u1293\u1298\u1275 \u12a5\u1293 \u12e8\u134c\u12f4\u122c\u123d\u1295 \u1308\u1295\u12d8\u1263\u12ca \u12d8\u120b\u1242\u1290\u1275 \u121b\u1325\u1293\u12a8\u122d\u1362",
    },
  },
  {
    slug: "knowledge-sharing",
    icon: "flask",
    title: {
      en: "Knowledge Sharing & Data Bank",
      om: "Beekumsa Qooduu fi Kuusaa Daataa",
      am: "\u12e8\u12a5\u12cd\u1245\u1275 \u1218\u130b\u122b\u1275 \u12a5\u1293 \u12e8\u1218\u1228\u1303 \u1263\u1295\u12ad",
    },
    description: {
      en: "Collect and share water and sanitation knowledge through workshops, study tours, networking, and a member data bank.",
      om: "Beekumsa bishaanii fi qulqullinaa workishooppii, imala barumsaa, fi kuusaa daataa tiin qooduu.",
      am: "\u12e8\u12cd\u1203 \u12a5\u1293 \u1295\u1335\u1205\u1293 \u12a5\u12cd\u1245\u1275 \u1260\u12c8\u122d\u12ad\u1236\u1356\u127d\u1363 \u130d\u1265\u1295 \u12a5\u1293 \u12e8\u12a0\u1263\u120b\u1275 \u1218\u1228\u1303 \u1263\u1295\u12ad \u121b\u130b\u122b\u1275\u1362",
    },
  },
  {
    slug: "policy-coordination",
    icon: "droplets",
    title: {
      en: "Policy Coordination & Representation",
      om: "Qindeessuu Imaammataa fi Bakka Bu'ummaa",
      am: "\u12e8\u1356\u120a\u1232 \u121b\u1240\u1293\u1300\u1275 \u12a5\u1293 \u12cd\u12ad\u120d\u1293",
    },
    description: {
      en: "Coordinate members under regional water and sewage policy, represent WSPs before OWEB, MoWE, and other sector actors.",
      om: "Miseensota imaammata naannoo jalatti qindeessuu fi OWEB/MoWE biratti bakka bu'uu.",
      am: "\u12a0\u1263\u120b\u1275\u1295 \u1260\u12a8\u120d\u120d \u1356\u120a\u1232 \u1235\u122d \u121b\u1240\u1293\u1300\u1275 \u12a5\u1293 \u1260OWEB/\u12a8MoWE \u134b\u1295 \u1218\u12cd\u12a8\u120d\u1362",
    },
  },
];

export function getLocalizedServices(locale: Locale) {
  return localizedServices.map((service) => ({
    slug: service.slug,
    icon: service.icon,
    title: service.title[locale] ?? service.title.en,
    description: service.description[locale] ?? service.description.en,
  }));
}

export function getLocalizedService(slug: string, locale: Locale) {
  const row = localizedServices.find((item) => item.slug === slug);
  if (!row) {
    const fallback = baseServices.find((item) => item.slug === slug);
    if (!fallback) return null;
    return {
      slug: fallback.slug,
      icon: fallback.icon,
      title: fallback.title,
      description: fallback.description,
    };
  }
  return {
    slug: row.slug,
    icon: row.icon,
    title: row.title[locale] ?? row.title.en,
    description: row.description[locale] ?? row.description.en,
  };
}
