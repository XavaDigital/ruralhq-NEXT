import type { ReactNode } from "react";

// Shared chrome for the simple content pages (FAQ, legal, info): a dark hero
// with a green underline, and a prose wrapper that styles plain h2/p/ul markup.

export function PageHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <section className="bg-ink text-white">
      <div className="container-rhq py-16 text-center">
        <h1 className="font-heading text-3xl font-bold text-white sm:text-4xl">
          {title}
        </h1>
        <div className="mx-auto mt-4 h-1 w-16 rounded bg-brand" />
        {subtitle ? (
          <p className="mx-auto mt-4 max-w-2xl text-gray-300">{subtitle}</p>
        ) : null}
      </div>
    </section>
  );
}

export function Prose({ children }: { children: ReactNode }) {
  return (
    <div className="container-rhq py-12">
      <div className="mx-auto max-w-3xl leading-relaxed text-body [&_a]:text-brand-dark [&_a]:underline [&_h2]:mb-2 [&_h2]:mt-8 [&_h2]:font-heading [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-ink [&_li]:mt-1 [&_p]:mt-3 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-6">
        {children}
      </div>
    </div>
  );
}

