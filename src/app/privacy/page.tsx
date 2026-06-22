import type { Metadata } from "next";
import { PageHeader, Prose } from "@/components/PageContent";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <div>
      <PageHeader title="Privacy Policy" />
      <Prose>
        <p className="rounded bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Template — review and tailor with your legal advisor before launch.
        </p>

        <h2>Introduction</h2>
        <p>
          This policy explains how RuralHQ collects, uses, and protects your
          personal information when you use our website. By using RuralHQ you
          agree to this policy.
        </p>

        <h2>What we collect</h2>
        <ul>
          <li>Details you provide when adding a listing, contacting us, or subscribing (e.g. name, email, business details).</li>
          <li>Basic usage data (e.g. pages visited) to help us improve the site.</li>
          <li>Cookies and similar technologies, including those used by advertising and analytics partners.</li>
        </ul>

        <h2>How we use it</h2>
        <ul>
          <li>To operate the directory and publish approved listings.</li>
          <li>To respond to your enquiries and send updates you&apos;ve subscribed to.</li>
          <li>To maintain, secure, and improve RuralHQ.</li>
        </ul>

        <h2>Sharing</h2>
        <p>
          We don&apos;t sell your personal information. We may share it with
          service providers who help us run RuralHQ, or where required by law.
        </p>

        <h2>Your choices</h2>
        <p>
          You can request access to or correction of your information, and
          unsubscribe from emails at any time. Contact us to make a request.
        </p>

        <h2>Contact</h2>
        <p>
          Questions about your privacy? Reach us via the Contact page.
        </p>
      </Prose>
    </div>
  );
}
