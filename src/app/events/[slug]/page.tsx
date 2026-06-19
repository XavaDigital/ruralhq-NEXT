import {
  listingMetadata,
  listingParams,
  renderListingPage,
} from "@/lib/listing-route";

const TYPE = "events" as const;

export const generateStaticParams = () => listingParams(TYPE);
export const generateMetadata = (props: { params: Promise<{ slug: string }> }) =>
  listingMetadata(TYPE, props);

export default async function Page(props: { params: Promise<{ slug: string }> }) {
  return renderListingPage(TYPE, props);
}
