import type { Metadata } from "next";
import { PageHeader } from "@/components/PageContent";
import { ContactForm } from "@/components/ContactForm";

export const metadata: Metadata = { title: "Make a Suggestion" };

export default function SuggestionPage() {
  return (
    <div>
      <PageHeader
        title="Make a Suggestion"
        subtitle="Know a great rural business we're missing, or have an idea to improve RuralHQ? We'd love to hear it."
      />
      <div className="container-rhq py-12">
        <div className="mx-auto max-w-2xl">
          <ContactForm topic="suggestion" cta="Send suggestion" />
        </div>
      </div>
    </div>
  );
}
