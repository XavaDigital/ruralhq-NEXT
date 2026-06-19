// Injects schema.org structured data. Server component — renders a plain
// <script type="application/ld+json"> so crawlers see it in the initial HTML.

export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      // JSON-LD is data, not user markup; stringify is safe here.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
