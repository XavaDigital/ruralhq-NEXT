// Shared logic for the four listing-type detail routes
// (/businesses, /events, /promotions, /jobs). Each route file is a thin wrapper
// that binds its ListingType, so the URL contract stays explicit (no greedy
// catch-all) while the rendering/metadata/static-params logic lives in one
// place.

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ListingType } from "./types";
import { LISTING_TYPE_LABEL } from "./types";
import { getListing, getListingSlugs } from "./data";
import { ListingDetail } from "@/components/ListingDetail";
import { JsonLd } from "@/components/JsonLd";
import {
  absoluteUrl,
  breadcrumbJsonLd,
  listingJsonLd,
  listingPath,
} from "./seo";

type RouteProps = { params: Promise<{ slug: string }> };

export async function listingParams(type: ListingType) {
  const slugs = await getListingSlugs(type);
  return slugs.map((slug) => ({ slug }));
}

export async function listingMetadata(
  type: ListingType,
  { params }: RouteProps,
): Promise<Metadata> {
  const { slug } = await params;
  const listing = await getListing(type, slug);
  if (!listing) return {};
  const url = absoluteUrl(listingPath(listing));
  return {
    title: listing.title,
    description: listing.excerpt,
    alternates: { canonical: url },
    openGraph: {
      title: listing.title,
      description: listing.excerpt,
      url,
      type: "website",
      ...(listing.imageUrl ? { images: [listing.imageUrl] } : {}),
    },
  };
}

export async function renderListingPage(
  type: ListingType,
  { params }: RouteProps,
) {
  const { slug } = await params;
  const listing = await getListing(type, slug);
  if (!listing) notFound();

  const breadcrumb = breadcrumbJsonLd([
    { name: "Explore", path: "/explore" },
    { name: LISTING_TYPE_LABEL[type], path: `/explore?type=${type}` },
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
