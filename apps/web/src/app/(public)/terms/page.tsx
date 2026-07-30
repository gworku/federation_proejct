import { publicPageMetadata } from "@/lib/page-meta";
import { PageHero } from "@/components/public/page-hero";
import { Section } from "@/components/public/section";

export async function generateMetadata() {
  return publicPageMetadata("terms");
}

export default function TermsPage() {
  return (
    <>
      <PageHero title="Terms and Conditions" description="Terms governing use of the OWUF website and platform." />
      <Section>
        <div className="prose mx-auto max-w-3xl border border-border bg-white p-8 text-slate-600">
          <p>
            By using this website and the management system, users agree to
            access information lawfully, protect credentials, and use federation
            systems only for authorized institutional purposes.
          </p>
          <p className="mt-4">
            Unauthorized access, misuse of data, or attempts to disrupt services
            are prohibited and may result in account suspension and legal action.
          </p>
        </div>
      </Section>
    </>
  );
}
