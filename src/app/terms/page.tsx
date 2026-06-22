import type { Metadata } from "next";
import { PageHeader, Prose } from "@/components/PageContent";

export const metadata: Metadata = { title: "Terms & Conditions" };

export default function TermsPage() {
  return (
    <div>
      <PageHeader title="Terms & Conditions" />
      <Prose>
        <p className="rounded bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Template — review and tailor with your legal advisor before launch.
        </p>

        <h2>Using RuralHQ</h2>
        <p>
          By accessing or using RuralHQ you agree to these terms. If you
          don&apos;t agree, please don&apos;t use the site.
        </p>

        <h2>Listings and content</h2>
        <ul>
          <li>You&apos;re responsible for the accuracy of any listing or content you submit.</li>
          <li>You must have the right to use any content and images you upload.</li>
          <li>We review submissions and may edit or remove content that breaches our guidelines.</li>
        </ul>

        <h2>Acceptable use</h2>
        <p>
          Don&apos;t use RuralHQ for spam, fraud, or unlawful activity, and
          don&apos;t attempt to disrupt or misuse the service.
        </p>

        <h2>No warranty</h2>
        <p>
          RuralHQ is provided &ldquo;as is&rdquo;. While we work to keep
          information accurate, we don&apos;t guarantee it, and we&apos;re not
          liable for decisions made based on directory listings.
        </p>

        <h2>Changes</h2>
        <p>
          We may update these terms from time to time. Continued use of RuralHQ
          means you accept the current terms.
        </p>
      </Prose>
    </div>
  );
}
