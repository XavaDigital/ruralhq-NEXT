// Shared logic for the single /businesses/[slug] detail route, which resolves
// either a business or a contractor (both share the /businesses/ URL base on the
// live site). The route file is a thin wrapper around these helpers.

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LISTING_TYPE_LABEL } from "./types";
import { getAllListingSlugs, getListingBySlug } from "./data";
import { ListingDetail } from "@/components/ListingDetail";
import { JsonLd } from "@/components/JsonLd";
import {
  absoluteUrl,
  breadcrumbJsonLd,
  listingJsonLd,
  listingPath,
} from "./seo";

type RouteProps = { params: Promise<{ slug: string }> };

export async function allListingParams() {
  const slugs = await getAllListingSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function listingMetadata({
  params,
}: RouteProps): Promise<Metadata> {
  const { slug } = await params;
  const listing = await getListingBySlug(slug);
  if (!listing) return {};
  const url = absoluteUrl(listingPath(listing));
  return {
    title: listing.title,
    description: listing.tagline || listing.excerpt,
    alternates: { canonical: url },
    openGraph: {
      title: listing.title,
      description: listing.tagline || listing.excerpt,
      url,
      type: "website",
      ...(listing.imageUrl ? { images: [listing.imageUrl] } : {}),
    },
  };
}

export async function renderListingPage({ params }: RouteProps) {
  const { slug } = await params;
  const listing = await getListingBySlug(slug);
  if (!listing) notFound();

  const breadcrumb = breadcrumbJsonLd([
    { name: "Explore", path: "/explore" },
    { name: LISTING_TYPE_LABEL[listing.type], path: `/explore?type=${listing.type}` },
    { name: listing.title, path: listingPath(listing) },
  ]);

  return (
    <>
      <JsonLd data={listingJsonLd(listing)} />
      <JsonLd data={breadcrumb} />
      <ListingDetail listing={listing} />
    </>
  );
}
