import type { Metadata } from "next";
import { PageHeader } from "@/components/PageContent";
import { ContactForm } from "@/components/ContactForm";

export const metadata: Metadata = { title: "Report an Error" };

export default function ReportPage() {
  return (
    <div>
      <PageHeader
        title="Report an Error"
        subtitle="Spotted something wrong — outdated details, a broken link, or incorrect information? Let us know and we'll fix it."
      />
      <div className="container-rhq py-12">
        <div className="mx-auto max-w-2xl">
          <ContactForm topic="error-report" cta="Submit report" />
        </div>
      </div>
    </div>
  );
}
