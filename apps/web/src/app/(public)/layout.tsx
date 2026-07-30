import { DocumentLang } from "@/components/public/document-lang";
import { PrivacyNotice } from "@/components/public/privacy-notice";
import { SiteFooter } from "@/components/public/site-footer";
import { SiteHeader } from "@/components/public/site-header";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="site-gradient flex min-h-full flex-col">
      <DocumentLang />
      <SiteHeader />
      <main id="main-content" className="flex-1" tabIndex={-1}>
        {children}
      </main>
      <SiteFooter />
      <PrivacyNotice />
    </div>
  );
}
