import { publicPageMetadata } from "@/lib/page-meta";

export async function generateMetadata() {
  return publicPageMetadata("leadership");
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
