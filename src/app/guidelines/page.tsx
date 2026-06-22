import type { Metadata } from "next";
import { PageHeader, Prose } from "@/components/PageContent";

export const metadata: Metadata = { title: "Community Guidelines" };

export default function GuidelinesPage() {
  return (
    <div>
      <PageHeader
        title="Community Guidelines"
        subtitle="A few simple rules to keep RuralHQ useful, honest, and friendly for everyone."
      />
      <Prose>
        <h2>Be honest and accurate</h2>
        <p>
          List real businesses and services with accurate details. Reviews
          should reflect genuine experiences — don&apos;t post fake, misleading,
          or paid-for reviews.
        </p>

        <h2>Be respectful</h2>
        <p>
          Keep it civil. Personal attacks, harassment, hate speech, and
          discriminatory content have no place on RuralHQ.
        </p>

        <h2>Keep it relevant</h2>
        <p>
          RuralHQ is for rural New Zealand. Listings, reviews, and content should
          be relevant to the rural community. Spam, irrelevant promotions, and
          off-topic content will be removed.
        </p>

        <h2>Respect privacy and rights</h2>
        <p>
          Don&apos;t post other people&apos;s private information, and only upload
          images and content you have the right to use.
        </p>

        <h2>Moderation</h2>
        <p>
          Every submission is checked before it goes live, and we may remove
          content that breaches these guidelines. If you spot something that
          shouldn&apos;t be here, please report it.
        </p>
      </Prose>
    </div>
  );
}
