import { publicPageMetadata } from "@/lib/page-meta";

export async function generateMetadata() {
  return publicPageMetadata("about");
}

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
