import { publicPageMetadata } from "@/lib/page-meta";

export async function generateMetadata() {
  return publicPageMetadata("consultancy");
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
