import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader, Prose } from "@/components/PageContent";

export const metadata: Metadata = { title: "FAQ" };

const FAQS = [
  {
    q: "What is RuralHQ?",
    a: "RuralHQ is a free directory and information hub for rural New Zealand — helping you find good local businesses and contractors, and read news and insights relevant to rural life.",
  },
  {
    q: "Does it cost anything to list my business?",
    a: "No. Listings on RuralHQ are completely free. You can add your business or service in a few minutes.",
  },
  {
    q: "How do I add a listing?",
    a: "Head to the Add Listing page, fill in your details, and submit. We check every submission before it goes live to keep the directory spam-free.",
  },
  {
    q: "How long until my listing appears?",
    a: "Most submissions are reviewed quickly. Clear, legitimate listings are approved and published; anything we're unsure about gets a quick human review first.",
  },
  {
    q: "How do I report incorrect information?",
    a: "Use the Report an Error page and tell us what's wrong — we'll get it corrected.",
  },
  {
    q: "Can I suggest a business that isn't listed?",
    a: "Absolutely. Use Make a Suggestion and point us at a great rural business you think should be on RuralHQ.",
  },
];

export default function FaqPage() {
  return (
    <div>
      <PageHeader
        title="Frequently Asked Questions"
        subtitle="Everything you need to know about using RuralHQ."
      />
      <Prose>
        {FAQS.map((f) => (
          <div key={f.q}>
            <h2>{f.q}</h2>
            <p>{f.a}</p>
          </div>
        ))}
        <p className="mt-8">
          Still have a question? <Link href="/contact">Contact us</Link> and
          we&apos;ll help.
        </p>
      </Prose>
    </div>
  );
}
