export type ServiceItem = {
  slug: string;
  title: string;
  description: string;
  icon:
    | "droplets"
    | "monitor"
    | "graduation"
    | "wrench"
    | "chart"
    | "users"
    | "shield"
    | "file"
    | "flask"
    | "scale";
};

export const services: ServiceItem[] = [
  {
    slug: "capacity-building",
    title: "Capacity Building for WSPs",
    description:
      "Strong support to member utilities through training, technical assistance, and institutional performance improvement.",
    icon: "graduation",
  },
  {
    slug: "member-engagement",
    title: "Members Engagement & Development",
    description:
      "Recruitment, benchmarking, peer learning, and programmes that strengthen Water Service Providers across all grades.",
    icon: "users",
  },
  {
    slug: "communication-advocacy",
    title: "Communication & Advocacy",
    description:
      "Raise OWUF’s profile, advance members’ interests, and advocate for water resources, safe supplies, and enabling sector policy.",
    icon: "scale",
  },
  {
    slug: "technical-assistance",
    title: "Technical Assistance",
    description:
      "Hands-on support for water and sewerage operations, engineering management, and service quality improvement.",
    icon: "wrench",
  },
  {
    slug: "nrw-management",
    title: "Non-Revenue Water Reduction",
    description:
      "Programmes focused on leak detection, metering accuracy, loss prevention, and revenue protection for member utilities.",
    icon: "shield",
  },
  {
    slug: "digital-systems",
    title: "Technology & Digital Systems",
    description:
      "Support for SCADA, GIS, digital billing, ICT capacity, and change management across member WSPs.",
    icon: "monitor",
  },
  {
    slug: "joint-procurement",
    title: "Joint Procurement & Supply",
    description:
      "Coordinate standardized procurement of water materials and equipment, and explore local manufacturing of sector inputs.",
    icon: "file",
  },
  {
    slug: "resource-mobilization",
    title: "Resource Mobilization",
    description:
      "Link WSPs with development partners and institutions for funding, and strengthen federation financial sustainability.",
    icon: "chart",
  },
  {
    slug: "knowledge-sharing",
    title: "Knowledge Sharing & Data Bank",
    description:
      "Collect and share water and sanitation knowledge through workshops, study tours, networking, and a member data bank.",
    icon: "flask",
  },
  {
    slug: "policy-coordination",
    title: "Policy Coordination & Representation",
    description:
      "Coordinate members under regional water and sewage policy, represent WSPs before OWEB, MoWE, and other sector actors.",
    icon: "droplets",
  },
];


/** Vision, mission, and values — Strategic Plan + institutional brief */
export const strategicDirection = {
  vision:
    "To see water utilities become fully capacitated, self-sustaining, financially viable, and capable of providing reliable, sufficient, affordable, and sustainable water and sanitation services.",
  mission:
    "To empower water utilities through capacity building, partnerships, innovation, advocacy, knowledge exchange, and appropriate technologies so that they can deliver safe, reliable, affordable, inclusive, and sustainable water and sanitation services.",
  missionExtended:
    "Create an enabling environment for water service providers by strengthening capacity, fostering partnerships, promoting best practices, and advocating for effective sector policies—supporting regional water utilities to become strong, viable, and sustainable institutions capable of delivering safe, reliable, and affordable water and sanitation services.",
  values: [
    { title: "Collaboration", description: "Work with members and partners for shared sector results." },
    { title: "Integrity", description: "Act honestly, impartially, and in the public interest." },
    { title: "Good corporate governance", description: "Use sound policies, systems, and prudent resource stewardship." },
    { title: "Accountability", description: "Own decisions, performance, and use of entrusted resources." },
    { title: "Transparency", description: "Communicate openly and make information accessible where appropriate." },
    { title: "Continuous learning", description: "Improve through peer exchange, evidence, and reflection." },
    { title: "Innovation", description: "Adopt appropriate technologies and better ways of working." },
    { title: "Professionalism", description: "Deliver competent, respectful, and reliable support to members." },
    { title: "Environmental responsibility", description: "Protect water sources and promote sustainable practices." },
    { title: "Public-service commitment", description: "Put community water and sanitation needs first." },
    { title: "Respect for the right to safe water and sanitation", description: "Support progressive realization of safe, reliable services for all." },
  ],
  keyResultAreas: [
    {
      id: "kra-1",
      title: "Federation Capacity Development",
      objective:
        "To enhance the capacity of the Federation for effective service delivery to members.",
      points: [
        "Institutional strengthening and governance",
        "Staffing and professional development",
        "ICT infrastructure and operational systems",
        "Monitoring, evaluation, and reporting",
        "Risk management and financial sustainability",
        "Resource mobilization",
      ],
      href: "/mandate",
    },
    {
      id: "kra-2",
      title: "Members Engagement and Development",
      objective:
        "To support member organizations and build their capacity for provision of services.",
      points: [
        "Member recruitment and retention",
        "Technical assistance and capacity building",
        "Utility performance and benchmarking",
        "Peer learning and knowledge exchange",
        "Technical guidelines and standards",
        "Technology adoption",
      ],
      href: "/capacity-building",
    },
    {
      id: "kra-3",
      title: "Communication and Advocacy",
      objective: "To strengthen corporate communication and raise OWUF’s profile.",
      points: [
        "Corporate communication and branding",
        "Water-sector advocacy and representation",
        "Policy and legal engagement",
        "Public awareness and media relations",
        "Events, conferences, and consultations",
        "Promotion of members’ interests",
      ],
      href: "/services/communication-advocacy",
    },
  ],
  background:
    "OWUF promotes cooperation among Water Utilities, protects and advances members’ common interests, and raises sector awareness. Formed by Water Service Providers to enable peer learning, the Federation coordinates WSPs, advocates with OWEB and MoWE, and links members with development partners.",
  history:
    "Formerly the Oromia Water Enterprise Association, the Federation grew from the National Urban Water and Sanitation Forum (ideas first discussed at Welkite; first official forum hosted by Harari Water and Sanitation Authority on 17 April 2009 E.C.). It was legally registered by the Oromia Bureau of Works and Social Affairs on Meskerem 25, 2009 E.C., and licensed by the Oromia Justice Bureau under notice No. 321/159 (WB/03-0530/11), with TIN 0055401768.",
} as const;