import {
  allListingParams,
  listingMetadata,
  renderListingPage,
} from "@/lib/listing-route";

// Single detail route for both businesses and contractors (shared /businesses/
// base, matching the live site).
export const generateStaticParams = allListingParams;
export const generateMetadata = listingMetadata;

export default async function Page(props: {
  params: Promise<{ slug: string }>;
}) {
  return renderListingPage(props);
}
