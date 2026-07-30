import type { Locale } from "@/lib/i18n";

type LocalizedBlock = Record<Locale, { title: string; body: string }>;

export const pageCopy = {
  vision: {
    en: {
      title: "Vision",
      body: "To see water utilities become fully capacitated, self-sustaining, financially viable, and capable of providing reliable, sufficient, affordable, and sustainable water and sanitation services.",
    },
    om: {
      title: "Mul'ata",
      body: "Dhaabbileen tajaajila bishaanii dandeettii guutuu, of danda'uu, fi maallaqaan jabaatanii tajaajila bishaanii fi qulqullinaa amanamaa, gahaa, gatii mijaawaa, fi itti fufiinsa qabu kennuu akka danda'an.",
    },
    am: {
      title: "\u122b\u12d5\u12ed",
      body: "\u12e8\u12cd\u1203 \u1270\u124b\u121b\u1275 \u1219\u1209 \u12a0\u1245\u121d \u12eb\u120b\u1278\u12cd\u1363 \u1260\u122b\u1233\u1278\u12cd \u12e8\u121a\u1246\u1219\u1363 \u1260\u1308\u1295\u12d8\u1265 \u12e8\u121a\u12a9\u1249\u1219 \u12a5\u1293 \u12a0\u1235\u1270\u121b\u121b\u129a\u1363 \u1260\u1242\u1363 \u1270\u1218\u1323\u1323\u129a\u1293 \u12d8\u120b\u1242 \u12e8\u12cd\u1203 \u12a5\u1293 \u12e8\u1295\u1335\u1205\u1293 \u12a0\u1308\u120d\u130d\u120e\u1275 \u12e8\u121a\u1230\u1321 \u12a5\u1295\u12f2\u1206\u1291 \u121b\u12e8\u1275\u1362",
    },
  },
  mission: {
    en: {
      title: "Mission",
      body: "To empower water utilities through capacity building, partnerships, innovation, advocacy, knowledge exchange, and appropriate technologies so that they can deliver safe, reliable, affordable, inclusive, and sustainable water and sanitation services.",
    },
    om: {
      title: "Kaayyoo",
      body: "Dhaabbilee tajaajila bishaanii leenjii, michummaa, haaromsa, afgaaffii, beekumsa qooduu, fi teeknooloojii mijaawaa fayyadamuun cimsuu—bishaanii fi qulqullinaa nageenya qabu, amanamaa, gatii mijaawaa, hunda hammatee, fi itti fufiinsa qabu akka kennan.",
    },
    am: {
      title: "\u1270\u120d\u12d5\u12ae",
      body: "\u12e8\u12cd\u1203 \u1270\u124b\u121b\u1275\u1295 \u1260\u12a0\u1245\u121d \u130d\u1295\u1263\u1273\u1363 \u12a0\u130b\u122d\u1295\u1275\u1363 \u12a0\u12f5\u1235\u1363 \u12f4\u130d\u134d\u1363 \u12a5\u12cd\u1245\u1275 \u1218\u1208\u12cb\u12c8\u1325 \u12a5\u1293 \u1270\u1308\u1262 \u1274\u12ad\u1296\u120e\u1302 \u1260\u121b\u130e\u120d\u1260\u1275 \u12f0\u1205\u1295\u1290\u1271 \u12e8\u1270\u1320\u1260\u1240\u1363 \u12a0\u1235\u1270\u121b\u121b\u129a\u1363 \u1270\u1218\u1323\u1323\u129a\u1363 \u1201\u1209\u1295 \u12a0\u1245\u134b\u12ca \u12a5\u1293 \u12d8\u120b\u1242 \u12e8\u12cd\u1203\u1293 \u1295\u1335\u1205\u1293 \u12a0\u1308\u120d\u130d\u120e\u1275 \u12a5\u1295\u12f2\u1230\u1321 \u121b\u1235\u127b\u120d\u1362",
    },
  },
  aboutIntro: {
    en: {
      title: "About OWUF",
      body: "The Oromia Water Utilities Federation (OWUF) was established to strengthen member Water Service Providers, improve service delivery, promote cooperation, protect common interests, share knowledge, provide technical assistance, advocate for better sector policy, and mobilize resources under Proclamation No. 228/2020.",
    },
    om: {
      title: "Waa'ee OWUF",
      body: "Waldaa Dhaabbilee Tajaajila Bishaanii Oromiyaa (OWUF) dhaabbilee miseensotaa cimsuu, tajaajila fooyyessuu, walta'iinsa guddisuu, fedhii waliigalaa eeguu, beekumsa qooduu, deeggarsa teeknikaa kennuu, imaammata fooyya'aa afgaaffuu, fi qabeenya sassaabuuuf Labsii Lak. 228/2020 jalatti hundeeffameera.",
    },
    am: {
      title: "\u1235\u1208 OWUF",
      body: "\u12e8\u12a6\u122e\u121a\u12eb \u12e8\u12cd\u1203 \u1270\u124b\u121b\u1275 \u134c\u12f4\u122c\u123d\u1295 (OWUF) \u12a0\u1263\u120d \u12e8\u12cd\u1203 \u12a0\u1308\u120d\u130d\u120e\u1275 \u1230\u1326\u12ce\u127d\u1295 \u1208\u121b\u1320\u1293\u12a8\u122d\u1363 \u12a0\u1308\u120d\u130d\u120e\u1275 \u1208\u121b\u123b\u123b\u120d\u1363 \u1275\u1265\u1265\u122d \u1208\u121b\u1233\u12f0\u130d\u1363 \u12e8\u130b\u122b \u1325\u1245\u121d \u1208\u1218\u1320\u1260\u1245\u1363 \u12a5\u12cd\u1245\u1275 \u1208\u1218\u130b\u122b\u1275\u1363 \u1274\u12ad\u1292\u12ab\u120d \u12f0\u130b\u134d \u1208\u1218\u1235\u1320\u1275\u1363 \u1208\u1270\u123b\u1208 \u1356\u120a\u1232 \u1208\u1218\u12f0\u1308\u134d \u12a5\u1293 \u1201\u1265\u1275 \u1208\u121b\u1230\u1263\u1230\u1265 \u1260\u12a0\u12cb\u1305 \u1241\u1325\u122d 228/2020 \u1270\u124b\u1249\u121f\u120d\u1362",
    },
  },
} as const satisfies Record<string, LocalizedBlock>;

export type FaqItem = { q: string; a: string };

export const faqsByLocale: Record<Locale, FaqItem[]> = {
  en: [
    {
      q: "What is OWUF?",
      a: "The Oromia Water Utilities Federation (OWUF) is the federation of Water Service Providers in Oromia. It promotes cooperation among utilities, protects members’ common interests, builds capacity, and advocates with OWEB, MoWE, and other sector actors under Proclamation No. 228/2020.",
    },
    {
      q: "What is OWUF’s legal mandate?",
      a: "Under Proclamation No. 228/2020, OWUF coordinates member organizations, supports joint procurement, provides advice and representation, mobilizes technical and financial assistance, promotes experience sharing and training, and performs other tasks essential to improve potable water and sewage services.",
    },
    {
      q: "What are the Strategic Plan priorities for 2026–2030?",
      a: "Three Key Result Areas: (1) Federation Capacity Development, (2) Member Engagement and Development, and (3) Communication and Advocacy.",
    },
    {
      q: "Who are OWUF’s members?",
      a: "Member Water Service Providers across utility levels—Special 1st through 5th grade enterprises—across zones of Oromia.",
    },
    {
      q: "How do I request technical support?",
      a: "Use the Technical Support page to submit a request. Authorized staff triage cases in the Member Portal.",
    },
    {
      q: "How do I apply for membership?",
      a: "Submit a membership application on the Membership page. Applications are reviewed by federation administrators.",
    },
    {
      q: "Who can access the Member Portal?",
      a: "Authorized federation staff and approved member-utility users. Use Request Access if you need an account.",
    },
    {
      q: "Where can I find official statements?",
      a: "Official statements and press notices are published under News & Media → Statements.",
    },
  ],
  om: [
    {
      q: "OWUF maal?",
      a: "Waldaa Dhaabbilee Tajaajila Bishaanii Oromiyaa (OWUF) waldaa dhaabbilee tajaajila bishaanii Oromiyaa keessatti. Walta'iinsa cimsa, fedhii miseensotaa eega, dandeettii ijaara, fi OWEB, MoWE, fi qooda fudhattoota biroo waliin Labsii 228/2020 jalatti afgaaffaa.",
    },
    {
      q: "Aangoon seeraa OWUF maal?",
      a: "Labsii Lak. 228/2020 jalatti, OWUF dhaabbilee miseensotaa qindeessa, bittaa waliigalaa deeggara, gorsaa fi bakka bu'ummaa kenn, deeggarsa teeknikaa fi maallaqaa sassaaba, leenjii fi muuxannoo qooduu guddisa.",
    },
    {
      q: "Karoorri Tooraawaa 2026–2030 maal irratti xiyyeeffata?",
      a: "Bu'aa Ijoo sadii: (1) Ijaarsa Dandeettii Waldaa, (2) Hirmaannaa fi Misooma Miseensotaa, (3) Qunnamtii fi Afgaaffii.",
    },
    {
      q: "Miseensonni OWUF eenyu?",
      a: "Dhaabbileen tajaajila bishaanii sadarkaa adda addaa—Special 1st hanga 5th—godinoota Oromiyaa keessatti.",
    },
    {
      q: "Deeggarsa teeknikaa akkamitti gaafadha?",
      a: "Fuula Deeggarsa Teeknikaa irratti gaaffii galchi. Hojjettoonni hayyamaman Portalii Miseensaa keessatti qoratu.",
    },
    {
      q: "Miseensummaa akkamitti galmeessaa?",
      a: "Fuula Miseensummaa irratti formulii galchaa. Hogganni waldaa ni ilaala.",
    },
    {
      q: "Portalii Miseensaa eenyutu fayyadamuu danda'a?",
      a: "Hojjettoota waldaa fi miseensota hayyamaman. Herrega barbaachisuuf Access Request fayyadami.",
    },
    {
      q: "Ibsaawwan seera qabeessa eessatti argama?",
      a: "Ibsaawwan fi beeksisaawwan Oduu fi Miidiyaa → Ibsaawwan jalatti maxxanfamu.",
    },
  ],
  am: [
    {
      q: "OWUF \u121d\u1295\u12f5\u1295 \u1290\u12cd?",
      a: "\u12e8\u12a6\u122e\u121a\u12eb \u12e8\u12cd\u1203 \u1270\u124b\u121b\u1275 \u134c\u12f4\u122c\u123d\u1295 (OWUF) \u1260\u12a6\u122e\u121a\u12eb \u12e8\u12cd\u1203 \u12a0\u1308\u120d\u130d\u120e\u1275 \u1230\u1326\u12ce\u127d \u134c\u12f4\u122c\u123d\u1295 \u1290\u12cd\u1362 \u1260\u12a0\u12cb\u1305 228/2020 \u1218\u1230\u1228\u1275 \u1275\u1265\u1265\u122d\u1295 \u12eb\u1233\u12f5\u130b\u120d\u1363 \u12e8\u12a0\u1263\u120b\u1275 \u1325\u1245\u121d \u12ed\u1320\u1265\u1243\u120d\u1363 \u12a0\u1245\u121d \u12ed\u1308\u1290\u1263\u120d\u1363 \u12a8 OWEB\u1363 MoWE \u12a5\u1293 \u120c\u120e\u127d \u130b\u122d \u12ed\u12f0\u130d\u134b\u120d\u1362",
    },
    {
      q: "\u12e8 OWUF \u1215\u130b\u12ca \u12a0\u12f0\u122b \u121d\u1295\u12f5\u1295 \u1290\u12cd?",
      a: "\u1260\u12a0\u12cb\u1305 \u1241\u1325\u122d 228/2020 OWUF \u12a0\u1263\u120d \u12f5\u122d\u1305\u1276\u127d\u1295 \u12eb\u1240\u1293\u1303\u120d\u1363 \u12e8\u130b\u122b \u130d\u12dd\u1295 \u12ed\u12f0\u130d\u134b\u120d\u1363 \u121d\u12ad\u122d\u1293 \u12cd\u12ad\u120d\u1293 \u12ed\u1230\u1323\u120d\u1363 \u1274\u12ad\u1292\u12ab\u120d\u1293 \u12e8\u1308\u1295\u12d8\u1265 \u12f0\u130b\u134d \u12eb\u1230\u1263\u1235\u1263\u120d\u1363 \u1235\u120d\u1320\u1293\u1293 \u120d\u121d\u12f5 \u1218\u130b\u122b\u1275\u1295 \u12eb\u1233\u12f5\u130b\u120d\u1362",
    },
    {
      q: "\u12e8 2026–2030 \u1235\u1275\u122b\u1274\u1302\u12ad \u12a5\u1245\u12f5 \u1245\u12f5\u121a\u12eb\u12ce\u127d \u121d\u1295\u12f5\u1295 \u1293\u1278\u12cd?",
      a: "\u1236\u1235\u1275 \u1241\u120d\u134d \u12e8\u12cd\u1324\u1275 \u12a0\u12ab\u1263\u1262\u12ce\u127d\u1366 (1) \u12e8\u134c\u12f4\u122c\u123d\u1295 \u12a0\u1245\u121d \u130d\u1295\u1263\u1273\u1363 (2) \u12e8\u12a0\u1263\u120b\u1275 \u1270\u1233\u1275\u134e\u1293 \u120d\u121b\u1275\u1363 (3) \u130d\u1295\u1299\u1290\u1275\u1293 \u12f4\u130d\u134d\u1362",
    },
    {
      q: "\u12e8 OWUF \u12a0\u1263\u120b\u1275 \u12a5\u1290\u121b\u1295 \u1293\u1278\u12cd?",
      a: "\u1260\u12a6\u122e\u121a\u12eb \u12d8\u1296\u127d \u12e8\u121a\u1308\u1299 \u1260\u1270\u1208\u12eb\u12e9 \u12f0\u1228\u1303\u12ce\u127d (Special 1\u129b \u12a5\u1235\u12a8 5\u129b) \u12e8\u12cd\u1203 \u12a0\u1308\u120d\u130d\u120e\u1275 \u1230\u1326\u12ce\u127d \u1270\u124b\u121b\u1275\u1362",
    },
    {
      q: "\u1274\u12ad\u1292\u12ab\u120d \u12f0\u130b\u134d \u12a5\u1295\u12f4\u1275 \u12a5\u1320\u12ed\u1243\u1208\u1201?",
      a: "\u1260\u1274\u12ad\u1292\u12ab\u120d \u12f0\u130b\u134d \u1308\u133d \u120b\u12ed \u1320\u12eb\u1244 \u12eb\u1235\u1308\u1261\u1362 \u1260\u12a0\u1263\u120d \u1356\u122d\u1273\u120d \u12cd\u1235\u1325 \u1263\u1208\u1219\u12eb\u12ce\u127d \u12ed\u1218\u1228\u121d\u122b\u1209\u1362",
    },
    {
      q: "\u12a0\u1263\u120d\u1290\u1275 \u12a5\u1295\u12f4\u1275 \u12a5\u1218\u1208\u12a8\u1273\u1208\u1201?",
      a: "\u1260\u12a0\u1263\u120d\u1290\u1275 \u1308\u133d \u120b\u12ed \u121b\u1218\u120d\u12a8\u127b \u12eb\u1235\u1308\u1261\u1362 \u1260\u134c\u12f4\u122c\u123d\u1295 \u12a0\u1235\u1270\u12f3\u12f3\u122a\u12ce\u127d \u12ed\u1308\u1218\u1308\u121b\u120d\u1362",
    },
    {
      q: "\u12e8\u12a0\u1263\u120d \u1356\u122d\u1273\u120d\u1295 \u121b\u1295 \u120a\u1320\u1240\u121d \u12ed\u127d\u120b\u120d?",
      a: "\u12e8\u1348\u1240\u12f1 \u12e8\u134c\u12f4\u122c\u123d\u1295 \u1230\u122b\u1270\u129e\u127d \u12a5\u1293 \u12e8\u12a0\u1263\u120d \u1270\u124b\u121d \u1270\u1320\u1243\u121a\u12ce\u127d\u1362 \u1218\u1208\u12eb \u12a8\u1348\u1208\u1309 Request Access \u12ed\u1320\u1240\u1219\u1362",
    },
    {
      q: "\u12ed\u134b\u12ca \u1218\u130d\u1208\u133b\u12ce\u127d \u12e8\u1275 \u12ed\u1308\u129b\u1209?",
      a: "\u12ed\u134b\u12ca \u1218\u130d\u1208\u133b\u12ce\u127d \u1260\u12dc\u1293\u1293 \u121a\u12f2\u12eb \u2192 \u1218\u130d\u1208\u133b\u12ce\u127d \u1235\u122d \u12ed\u1273\u1270\u121b\u1209\u1362",
    },
  ],
};

export function pickLocalized<T extends LocalizedBlock>(
  block: T,
  locale: Locale,
): T[Locale] {
  return block[locale] ?? block.en;
}
