import { publicPageMetadata } from "@/lib/page-meta";

export async function generateMetadata() {
  return publicPageMetadata("search");
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
