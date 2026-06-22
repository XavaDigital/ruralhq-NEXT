import type { Metadata } from "next";
import { PageHeader } from "@/components/PageContent";
import { ContactForm } from "@/components/ContactForm";

export const metadata: Metadata = { title: "Contact Us" };

export default function ContactPage() {
  return (
    <div>
      <PageHeader
        title="Contact Us"
        subtitle="Questions, feedback, or just want to say hello? Drop us a line and we'll get back to you."
      />
      <div className="container-rhq py-12">
        <div className="mx-auto max-w-2xl">
          <ContactForm topic="contact" cta="Send message" />
        </div>
      </div>
    </div>
  );
}
