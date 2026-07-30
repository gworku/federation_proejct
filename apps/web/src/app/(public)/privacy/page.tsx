import { publicPageMetadata } from "@/lib/page-meta";
import { PageHero } from "@/components/public/page-hero";
import { Section } from "@/components/public/section";

export async function generateMetadata() {
  return publicPageMetadata("privacy");
}

export default function PrivacyPage() {
  return (
    <>
      <PageHero title="Privacy Policy" description="How OWUF handles personal and organizational information." />
      <Section>
        <div className="prose mx-auto max-w-3xl border border-border bg-white p-8 text-slate-600">
          <p>
            OWUF collects and processes information required to operate this
            website and the authenticated management platform. Personal data is
            used only for legitimate institutional purposes such as access
            control, member coordination, and service communication.
          </p>
          <p className="mt-4">
            Contact details of utility managers and staff are treated as
            sensitive operational information and are published only where
            authorized. Full legal text will be finalized with federation counsel.
          </p>
        </div>
      </Section>
    </>
  );
}
