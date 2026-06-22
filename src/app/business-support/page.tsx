import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader, Prose } from "@/components/PageContent";

export const metadata: Metadata = { title: "Business Support" };

export default function BusinessSupportPage() {
  return (
    <div>
      <PageHeader
        title="Business Support"
        subtitle="Everything you need to get your business listed and make the most of RuralHQ."
      />
      <Prose>
        <h2>Get listed — for free</h2>
        <p>
          Listing your rural business on RuralHQ is completely free. Add your
          details on the <Link href="/add-listing">Add Listing</Link> page and,
          once approved, you&apos;ll appear in the directory and on the map.
        </p>

        <h2>Make your listing shine</h2>
        <ul>
          <li>Write a clear description of what you do and who you serve.</li>
          <li>Add your contact details, website, and the regions you cover.</li>
          <li>Choose the categories that best match your services.</li>
        </ul>

        <h2>Manage and update</h2>
        <p>
          Need to update your details or claim an existing listing? Use{" "}
          <Link href="/report">Report an Error</Link> to flag changes, or{" "}
          <Link href="/contact">contact us</Link> directly.
        </p>

        <h2>Need a hand?</h2>
        <p>
          We&apos;re here to help. <Link href="/contact">Get in touch</Link> and
          we&apos;ll get your business connected to rural New Zealand.
        </p>
      </Prose>
    </div>
  );
}
