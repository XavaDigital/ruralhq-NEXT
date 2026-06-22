import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader, Prose } from "@/components/PageContent";

export const metadata: Metadata = { title: "Contributors" };

export default function ContributorsPage() {
  return (
    <div>
      <PageHeader
        title="Contributors"
        subtitle="RuralHQ is powered by the rural community — the people who share their knowledge, experiences, and recommendations."
      />
      <Prose>
        <h2>Become a contributor</h2>
        <p>
          Got expertise to share, or a story the rural community would value?
          RuralHQ is more than a directory — it&apos;s an information hub, and
          we&apos;re always looking for contributors to help share knowledge from
          experts in their field.
        </p>

        <h2>Ways to contribute</h2>
        <ul>
          <li>Write articles and insights for the newsfeed.</li>
          <li>Add and review local businesses you know and trust.</li>
          <li>Suggest businesses or topics we&apos;re missing.</li>
        </ul>

        <p className="mt-8">
          Keen to contribute? <Link href="/contact">Get in touch</Link> and
          tell us what you&apos;d like to share.
        </p>
      </Prose>
    </div>
  );
}
