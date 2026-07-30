export type Locale = "en" | "om" | "am";

const STORAGE_KEY = "opwssf_locale";

export const localeLabels: Record<Locale, string> = {
  en: "English",
  om: "Afaan Oromo",
  am: "\u12a0\u121b\u122d\u129b",
};

export function getStoredLocale(): Locale {
  if (typeof window === "undefined") return "en";
  const value = localStorage.getItem(STORAGE_KEY);
  if (value === "om" || value === "am" || value === "en") return value;
  return "en";
}

export function setStoredLocale(locale: Locale) {
  localStorage.setItem(STORAGE_KEY, locale);
  document.documentElement.lang = locale;
}

/** Lightweight UI strings for chrome that should feel multilingual. */
export const ui = {
  en: {
    login: "Member Portal",
    search: "Search\u2026",
    exploreServices: "Services for members",
    explorePrograms: "Programmes & projects",
    memberPortal: "Member login",
    workspace: "Workspace",
    logout: "Logout",
    learnMore: "Learn more",
    viewDetails: "View details",
    readMore: "Read more",
    viewProjects: "View Projects",
    contactUs: "Contact",
    memberUtilities: "Member Utilities",
    newsEvents: "News & Media",
    newsMedia: "News & Media",
    resources: "Documents",
    about: "About OWUF",
    services: "Services",
    servicesForMembers: "Services",
    programsKnowledge: "Programs",
    projects: "Programs",
    home: "Home",
    mandate: "Mandate & Legal",
    missionVision: "Mission & Values",
    leadership: "Leadership",
    structure: "Structure",
    knowledge: "Knowledge Center",
    partnerships: "Partnerships",
    capacityBuilding: "Capacity Building",
    technicalSupport: "Technical Support",
    events: "Events & Training",
    gallery: "Gallery",
    membership: "Membership",
    consultancy: "Consultancy",
    procurement: "Procurement",
    faq: "FAQ",
    heroTitle: "Reliable water and sanitation services for communities across Oromia",
    heroSupport:
      "We strengthen Water Service Providers through capacity building, partnerships, and advocacy—so households and institutions receive safe, sustainable water and sanitation every day.",
    language: "Language",
    skipToContent: "Skip to main content",
    officialWebsite: "Official website",
    legalMandate: "Legal mandate",
    strategicPlan: "Strategic plan",
    languagesAvailable: "Institutional alignment",
    lastUpdated: "Last updated",
    rssFeed: "RSS feed",
    sendMessage: "Send message",
    sending: "Sending…",
    fullName: "Full name",
    email: "Email",
    subject: "Subject",
    message: "Message",
    contactDetails: "Contact details",
    address: "Address",
    website: "Website",
    languages: "Languages",
    primaryNav: "Primary",
    mobileNav: "Mobile",
    toggleMenu: "Toggle menu",
    searchSite: "Search site",
    whoWeAre: "Who we are",
    latestUpdates: "Latest updates",
    accessPlatform: "Member utilities workspace",
    accessPlatformBlurb:
      "Authorised staff can sign in to manage projects, utilities, reports, and federation records.",
    requestAccess: "Request access",
    contactSupport: "Contact",
    viewAllNews: "View all news",
    viewAllServices: "View all services",
    boardTitle: "Federation Board",
    boardCaption:
      "Executive Committee Board members advancing water and sanitation services across Oromia.",
    meetLeadership: "Meet the leadership",
    ceoTitle: "Eng. Andualem Ayyano",
    ceoCaption:
      "Leading OWUF to strengthen member utilities, raise shared standards, and deliver reliable water and sanitation services across Oromia.",
    meetCeo: "Meet the CEO",
    boardScrollHint: "Scroll left or right to view the full board",
    heroCarouselLabel: "Homepage highlights",
    heroSlideLabel: "Slide",
    heroNext: "Next image",
    heroPrev: "Previous image",
    heroPause: "Pause slideshow",
    heroPlay: "Play slideshow",
    heroAutoplayHint: "Advances every 5 seconds",
    searchResults: "{n} result(s)",
    searchStartTitle: "Start a search",
    searchStartBody:
      "Use the search box in the header to find utilities, projects, news, events, or publications.",
    searchEmptyTitle: "No matches found",
    searchEmptyBody:
      "Try a different keyword, zone name, or project category.",
    filterAll: "All",
    download: "Download",
    collections: "Collections",
  },
  om: {
    login: "Portalii Miseensaa",
    search: "Barbaadi\u2026",
    exploreServices: "Tajaajila miseensotaaf",
    explorePrograms: "Sagantaawwan fi pirojektoota",
    memberPortal: "Seensa miseensaa",
    workspace: "Bakka Hojii",
    logout: "Ba'i",
    learnMore: "Dabalataan baradhu",
    viewDetails: "Bal'ina ilaali",
    readMore: "Dabalataan dubbisi",
    viewProjects: "Pirojektoota Ilaali",
    contactUs: "Nu Qunnami",
    memberUtilities: "Dhaabbilee Miseensotaa",
    newsEvents: "Oduu fi Miidiyaa",
    newsMedia: "Oduu fi Miidiyaa",
    resources: "Sanadoota",
    about: "Waa'ee OWUF",
    services: "Tajaajila",
    servicesForMembers: "Tajaajila",
    programsKnowledge: "Sagantaawwan",
    projects: "Sagantaawwan",
    home: "Fuula Jalqabaa",
    mandate: "Aangoo Seeraa",
    missionVision: "Kaayyoo fi Gatiin",
    leadership: "Hooggana",
    structure: "Caasaa",
    knowledge: "Giddu-galeessa Beekumsaa",
    partnerships: "Michummaa",
    capacityBuilding: "Ijaarsa Dandeettii",
    technicalSupport: "Deeggarsa Teeknikaa",
    events: "Taateewwan fi Leenjii",
    gallery: "Kuusaa Suuraa",
    membership: "Miseensummaa",
    consultancy: "Gorsaa Ogeessaa",
    procurement: "Bittaa Waliigalaa",
    faq: "Gaaffilee Yeroo yinbaasu",
    heroTitle:
      "Dhaabbilee bishaanii cimsuun tajaajila amanamaa Oromiyaa keessatti kennaa",
    heroSupport:
      "OWUF dhaabbilee tajaajila bishaanii leenjii, michummaa, afgaaffii, fi beekumsa qooduun cimsa—hawaasni bishaan amanamaa akka argatuuf.",
    language: "Afaan",
    skipToContent: "Gara qabiyyee guddaatti darbii",
    officialWebsite: "Website seera qabeessa",
    legalMandate: "Aangoo seeraa",
    strategicPlan: "Karoora tooraawaa",
    languagesAvailable: "Waliigala dhaabbataa",
    lastUpdated: "Yeroo dhumaa haaromfame",
    rssFeed: "RSS",
    sendMessage: "Ergaa ergi",
    sending: "Ergaa jira…",
    fullName: "Maqaa guutuu",
    email: "Imeelii",
    subject: "Mata duree",
    message: "Ergaa",
    contactDetails: "Odeeffannoo quunnamtii",
    address: "Teessoo",
    website: "Website",
    languages: "Afaanota",
    primaryNav: "Menu guddaa",
    mobileNav: "Menu moobayilaa",
    toggleMenu: "Menu bani/cufi",
    searchSite: "Website barbaadi",
    whoWeAre: "Eenyu nuti",
    latestUpdates: "Fooyya'iinsa haaraa",
    accessPlatform: "Bakka hojii dhaabbilee miseensaa",
    accessPlatformBlurb:
      "Hojjettoonni hayyamaman pirojektoota, dhaabbilee, gabaasa, fi galmee waldaa bulchuu danda'u.",
    requestAccess: "Hayyama gaafadhu",
    contactSupport: "Qunnamtii",
    viewAllNews: "Oduu hunda ilaali",
    viewAllServices: "Tajaajila hunda ilaali",
    boardTitle: "Boordii Waldaa",
    boardCaption:
      "Miseensota Boordii Koree Hojii raawwachiiftuu tajaajila bishaanii fi qulqullinaa Oromiyaa keessatti guddisan.",
    meetLeadership: "Hooggana waliin walqunnami",
    ceoTitle: "Eng. Andualem Ayyano",
    ceoCaption:
      "Pireezidantii Hojii Raawwachiiftuu (CEO) Waldaa Dhaabbilee Tajaajila Bishaanii Oromiyaa. Miseensota cimsuun, hangata qooduun, fi tajaajila bishaanii fi qulqullinaa amanamaa hawaasa Oromiyaa keessatti kennuu.",
    meetCeo: "CEO waliin walqunnami",
    boardScrollHint: "Gara bitaa ykn mirgaatti scooli gochuun boordii guutuu ilaali",
    heroCarouselLabel: "Mul'ata fuula jalqabaa",
    heroSlideLabel: "Suuraa",
    heroNext: "Suuraa itti aanu",
    heroPrev: "Suuraa duraani",
    heroPause: "Agarsiisa dhaabi",
    heroPlay: "Agarsiisa jalqabi",
    heroAutoplayHint: "Sekondii 5 irratti jijjiirama",
    searchResults: "Firiinsa {n}",
    searchStartTitle: "Barbaacha jalqabi",
    searchStartBody:
      "Sanduuqa barbaachaa mata duree irraa fayyadamuun dhaabbilee, pirojektoota, oduu, taateewwan, ykn maxxansaawwan barbaadi.",
    searchEmptyTitle: "Waliigalteen hin argamne",
    searchEmptyBody:
      "Jecha biraa, maqaa zoonii, ykn gosa pirojektii yaali.",
    filterAll: "Hunda",
    download: "Buusi",
    collections: "Kuusaawwan",
  },
  am: {
    login: "\u12e8\u12a0\u1263\u120d \u1356\u122d\u1273\u120d",
    search: "\u1348\u120d\u130d\u2026",
    exploreServices: "\u12e8\u12a0\u1263\u120d \u12a0\u1308\u120d\u130d\u120e\u1276\u127d",
    explorePrograms: "\u1355\u122e\u130d\u122b\u121e\u127b\u127d \u12a5\u1293 \u1355\u122e\u1300\u12ad\u1276\u127d",
    memberPortal: "\u12e8\u12a0\u1263\u120d \u1218\u1308\u1263\u12eb",
    workspace: "\u12e8\u1235\u122b \u1260\u1273",
    logout: "\u12cd\u1323",
    learnMore: "\u1270\u1328\u121b\u122a \u12ed\u1218\u120d\u12a8\u1271",
    viewDetails: "\u12dd\u122d\u12dd\u122d \u12ed\u1218\u120d\u12a8\u1271",
    readMore: "\u1270\u1328\u121b\u122a \u12eb\u1295\u1261",
    viewProjects:
      "\u1355\u122e\u1300\u12ad\u1276\u127d\u1295 \u12ed\u1218\u120d\u12a8\u1271",
    contactUs: "\u12eb\u130d\u1299\u1295",
    memberUtilities: "\u12a0\u1263\u120d \u1270\u124b\u121b\u1275",
    newsEvents: "\u12dc\u1293 \u12a5\u1293 \u121a\u12f2\u12eb",
    newsMedia: "\u12dc\u1293 \u12a5\u1293 \u121a\u12f2\u12eb",
    resources: "\u1230\u1290\u12f6\u127d",
    about: "\u1235\u1208 OWUF",
    services: "\u12a0\u1308\u120d\u130d\u120e\u1276\u127d",
    servicesForMembers: "\u12a0\u1308\u120d\u130d\u120e\u1276\u127d",
    programsKnowledge: "\u1355\u122e\u130d\u122b\u121e\u127d",
    projects: "\u1355\u122e\u130d\u122b\u121e\u127d",
    home: "\u1218\u1290\u123b",
    mandate: "\u12a0\u12f5\u122b\u130a \u12a5\u1293 \u1205\u130b",
    missionVision: "\u1270\u120d\u121b \u12a5\u1293 \u12a5\u1234\u1276\u127d",
    leadership: "\u12a0\u1218\u122b\u122d\u1235\u1295\u1275",
    structure: "\u1218\u1245\u122d\u122d",
    knowledge: "\u12e8\u12a5\u12cd\u1245\u1275 \u1218\u12d0\u12a8\u120d",
    partnerships: "\u12a0\u130b\u122d\u1295\u1290\u1276\u127d",
    capacityBuilding: "\u12a0\u1245\u121d \u130d\u1295\u1263\u1273",
    technicalSupport: "\u12e8\u1274\u12ad\u1292\u12ad \u12f0\u130b\u134d",
    events: "\u12dd\u130d\u1305\u1276\u127d \u12a5\u1293 \u1235\u120d\u1320\u1293",
    gallery: "\u12e8\u134d\u1276 \u121b\u12d5\u12a8\u120d",
    membership: "\u12a0\u1263\u120d\u1290\u1275",
    consultancy: "\u12a0\u121b\u12ab\u122a",
    procurement: "\u132d\u122d\u133d",
    faq: "\u1270\u12f8\u130b\u130a \u1320\u12eb\u1244\u12ce\u127d",
    heroTitle:
      "\u12e8\u12a6\u122e\u121a\u12eb \u12e8\u12cd\u1203 \u1270\u124b\u121b\u1275\u1295 \u121b\u1325\u1293\u12a8\u122d \u12a0\u121b\u1293\u121b \u12a0\u1308\u120d\u130d\u120e\u1275 \u121b\u1245\u1228\u1265",
    heroSupport:
      "OWUF \u12e8\u12cd\u1203 \u12a0\u1308\u120d\u130d\u120e\u1275 \u1230\u1326\u12ce\u127d\u1295 \u1260\u12a0\u1245\u121d \u130d\u1295\u1263\u1273\u1363 \u12a0\u130b\u122d\u1295\u1290\u1275\u1363 \u12f4\u130d\u134d \u12a5\u1293 \u12a5\u12cd\u1245\u1275 \u121b\u130b\u122b\u1275 \u12eb\u1325\u1295\u12ad\u122b\u120d\u1362",
    language: "\u1240\u1295\u1243",
    skipToContent: "\u12c8\u12f0 \u12d3\u1263\u122a \u12ed\u12d8\u120d\u1209",
    officialWebsite: "\u12ed\u134b\u12ca \u12f0\u1205\u1228\u1308\u1275",
    legalMandate: "\u12a0\u12f5\u122b\u130a",
    strategicPlan: "\u1235\u1275\u122b\u1274\u1302\u12ad \u12a5\u1245\u12f5",
    languagesAvailable: "\u1270\u124b\u121b\u12ca \u12a0\u1245\u1323\u1323\u121d",
    lastUpdated: "\u1208\u1218\u130d\u1208\u123b \u12e8\u1270\u12d8\u1218\u1290",
    rssFeed: "RSS",
    sendMessage: "\u1218\u120d\u12d5\u12ad\u1275 \u120b\u12ad",
    sending: "\u1260\u1218\u120b\u12ad \u120b\u12ed…",
    fullName: "\u1219\u1209 \u1235\u121d",
    email: "\u12a2\u121c\u12ed\u120d",
    subject: "\u122d\u12d5\u1235",
    message: "\u1218\u120d\u12d5\u12ad\u1275",
    contactDetails: "\u12e8\u130d\u1295\u1299\u1295 \u12d3\u12f5\u122b\u1236\u127d",
    address: "\u12a0\u12f5\u122b\u123b",
    website: "\u12f0\u1205\u1228\u1308\u1275",
    languages: "\u1240\u1295\u1246\u127d",
    primaryNav: "\u12d3\u1263\u122a \u1218\u1295\u1308\u12f5",
    mobileNav: "\u12e8\u121e\u1263\u12ed\u120d \u1218\u1295\u1308\u12f5",
    toggleMenu: "\u1218\u1295\u1308\u12f5 \u12ad\u1348\u1275/\u12a0\u12dd\u130b",
    searchSite: "\u12f0\u1205\u1228\u1308\u1275 \u1348\u120d\u130d",
    whoWeAre: "\u12a5\u1295\u121d\u1295 \u1290\u1295",
    latestUpdates: "\u12a0\u12f2\u1235 \u12d8\u121b\u1294\u12ce\u127d",
    accessPlatform: "\u12e8\u12a0\u1263\u120d \u1270\u124b\u121b\u1275 \u12e8\u1235\u122b \u1260\u1273",
    accessPlatformBlurb:
      "\u12e8\u1270\u1348\u1240\u12f0 \u1230\u122b\u1270\u129e\u127d \u1355\u122e\u1300\u12ad\u1276\u127d\u1295\u1363 \u1270\u124b\u121b\u1275\u1295\u1363 \u122a\u1356\u122d\u1276\u127d\u1295 \u12a5\u1293 \u12e8\u134c\u12f4\u122c\u123d\u1295 \u1218\u12d8\u130d\u1260\u1276\u127d \u121b\u1235\u1270\u12f3\u12f0\u122d \u12ed\u127d\u120b\u1209\u1362",
    requestAccess: "\u1218\u12d8\u1218\u127b \u12ed\u1320\u12ed\u1241",
    contactSupport: "\u12eb\u130d\u1299",
    viewAllNews: "\u1201\u1209\u1295 \u12dc\u1293 \u12ed\u1218\u120d\u12a8\u1271",
    viewAllServices: "\u1201\u1209\u1295 \u12a0\u1308\u120d\u130d\u120e\u1276\u127d \u12ed\u1218\u120d\u12a8\u1271",
    boardTitle: "\u12e8\u134c\u12f4\u122c\u123d\u1295 \u1266\u122d\u12f5",
    boardCaption:
      "\u1260\u12a6\u122e\u121a\u12eb \u12e8\u12cd\u1203\u1293 \u1295\u1335\u1205\u1293 \u12a0\u1308\u120d\u130d\u120e\u1275 \u12e8\u121a\u12eb\u1233\u12f1\u1271 \u12e8\u12a0\u1235\u1270\u12f3\u12f0\u122d \u12a0\u1218\u122a\u122d \u1266\u122d\u12f5 \u12a0\u1263\u120b\u1275\u1362",
    meetLeadership: "\u12a0\u1218\u122b\u122d\u1235\u1295\u1275\u1295 \u12ed\u1218\u120d\u12a8\u1271",
    ceoTitle: "Eng. Andualem Ayyano",
    ceoCaption:
      "\u12e8\u12a6\u122e\u121a\u12eb \u12e8\u12cd\u1203 \u12a0\u1308\u120d\u130d\u120e\u1275 \u12a0\u1308\u120d\u130d\u120e\u1276\u127d \u12a0\u130b\u121d\u12eb\u1275 \u12e8\u1235\u122b \u12a0\u1235\u1270\u12f3\u12f3\u122a \u12f4\u1228\u12ad\u1270\u122d\u1362 \u12a0\u1263\u120b\u1275 \u12a0\u1308\u120d\u130d\u120e\u1275\u12ce\u127d\u1295 \u1260\u121b\u1325\u1293\u12a8\u122d\u1363 \u12e8\u1300\u122e \u12f0\u1228\u1303\u12ce\u127d\u1295 \u1260\u121b\u130b\u122b\u1275 \u12a5\u1293 \u1208\u12a6\u122e\u121a\u12eb \u121b\u1205\u1260\u1228\u1230\u1265 \u12a0\u121b\u1293\u121b \u12e8\u12cd\u1203\u1293 \u1295\u1335\u1205\u1293 \u12a0\u1308\u120d\u130d\u120e\u1275 \u1208\u121b\u1245\u1228\u1265 \u12ed\u1218\u122b\u1362",
    meetCeo: "CEO\u1295 \u12ed\u1218\u120d\u12a8\u1271",
    boardScrollHint:
      "\u12e8\u1219\u1209\u1295 \u1266\u122d\u12f5 \u1208\u121b\u12e8\u1275 \u12c8\u12f0 \u1308\u122b \u12a5\u1293 \u12c8\u12f0 \u1240\u129d \u12ed\u1235\u1241\u1209",
    heroCarouselLabel: "\u12e8\u1218\u1290\u123b \u12a0\u1235\u1270\u12eb\u12e8\u1276\u127d",
    heroSlideLabel: "\u1235\u120c\u12ed\u12f5",
    heroNext: "\u1240\u1323\u12ed \u121d\u1235\u120d",
    heroPrev: "\u12e8\u1240\u12f0\u121e \u121d\u1235\u120d",
    heroPause: "\u12a0\u1243\u122b\u122d \u12a0\u12dd\u121b",
    heroPlay: "\u12a0\u1243\u122b\u122d \u12a0\u1235\u1308\u129d",
    heroAutoplayHint: "\u1260\u12a0\u121d\u1235\u1275 \u1235\u12ae\u1295\u12f5 \u12ed\u1240\u12ed\u122b\u120d",
    searchResults: "{n} \u12cd\u1324\u1276\u127d",
    searchStartTitle: "\u1348\u120d\u130d \u12ed\u1300\u121d\u1229",
    searchStartBody:
      "\u12a8\u120b\u12ed \u12e8\u1348\u120d\u130d \u1233\u1325\u1295 \u1260\u1218\u1320\u1240\u121d \u1270\u124b\u121b\u1275\u1295\u1363 \u1355\u122e\u1300\u12ad\u1276\u127d\u1295\u1363 \u12dc\u1293\u1363 \u12dd\u130d\u1305\u1276\u127d\u1295 \u12a5\u1293 \u1205\u1275\u1218\u1276\u127d \u12ed\u1348\u120d\u1309\u1362",
    searchEmptyTitle: "\u12cd\u1324\u1275 \u12a0\u120d\u1270\u1308\u129b\u121d",
    searchEmptyBody:
      "\u120c\u120b \u1240\u120d\u1363 \u12e8\u12dd\u1295 \u1235\u121d \u12a5\u1293 \u12e8\u1355\u122e\u1300\u12ad\u1275 \u121d\u12f5\u1265 \u12ed\u121d\u12a8\u1229\u1362",
    filterAll: "\u1201\u1209",
    download: "\u12a0\u12cd\u122d\u12f5",
    collections: "\u1235\u1265\u1235\u1266\u127d",
  },
} as const;

export type UiKey = keyof typeof ui.en;

export type NavItem = { href: string; labelKey: UiKey };

export type NavJourney = {
  id: string;
  labelKey: UiKey;
  href?: string;
  items: NavItem[];
};

/** Dropdown menus nested under About / Services. */
export const navJourneys: NavJourney[] = [
  {
    id: "about",
    labelKey: "about",
    href: "/about",
    items: [
      { href: "/about", labelKey: "about" },
      { href: "/mandate", labelKey: "mandate" },
      { href: "/about/mission-vision", labelKey: "missionVision" },
      { href: "/about/leadership", labelKey: "leadership" },
      { href: "/partnerships", labelKey: "partnerships" },
    ],
  },
  {
    id: "services",
    labelKey: "services",
    href: "/services",
    items: [
      { href: "/services", labelKey: "services" },
      { href: "/capacity-building", labelKey: "capacityBuilding" },
      { href: "/technical-support", labelKey: "technicalSupport" },
      { href: "/consultancy", labelKey: "consultancy" },
      { href: "/membership", labelKey: "membership" },
      { href: "/procurement", labelKey: "procurement" },
    ],
  },
  {
    id: "resources",
    labelKey: "resources",
    href: "/knowledge",
    items: [
      { href: "/knowledge", labelKey: "knowledge" },
      { href: "/events", labelKey: "events" },
      { href: "/gallery", labelKey: "gallery" },
      { href: "/faq", labelKey: "faq" },
    ],
  },
];

export type MainNavEntry =
  | { type: "link"; href: string; labelKey: UiKey }
  | { type: "journey"; journeyId: string };

/**
 * Desktop / mobile menu order:
 * Home → About → Program → Member Utilities → News → Service → Documents → Contact
 */
export const mainNav: MainNavEntry[] = [
  { type: "link", href: "/", labelKey: "home" },
  { type: "journey", journeyId: "about" },
  { type: "link", href: "/projects", labelKey: "projects" },
  { type: "link", href: "/utilities", labelKey: "memberUtilities" },
  { type: "link", href: "/news", labelKey: "newsMedia" },
  { type: "journey", journeyId: "services" },
  { type: "journey", journeyId: "resources" },
  { type: "link", href: "/contact", labelKey: "contactUs" },
];

