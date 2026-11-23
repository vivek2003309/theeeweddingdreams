import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/shell/Header";
import { Footer } from "@/components/shell/Footer";
import { ListingDetailView } from "@/components/discovery/ListingDetailView";
import {
  buildPublicVenueJsonLd,
  getVenueDetailBySlug,
} from "@/lib/data/details";
import { MOCK_VENUES } from "@/lib/data/mockAdapter";

interface VenuePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return MOCK_VENUES.map((v) => ({ slug: v.slug }));
}

export async function generateMetadata({
  params,
}: VenuePageProps): Promise<Metadata> {
  const { slug } = await params;
  const venue = getVenueDetailBySlug(slug);
  if (!venue) {
    return { title: "Venue Not Found — The Wedding Dreams" };
  }
  return {
    title: `${venue.name} (${venue.city}) — The Wedding Dreams`,
    description: venue.tagline,
  };
}

export default async function VenueDetailPage({ params }: VenuePageProps) {
  const { slug } = await params;
  const venue = getVenueDetailBySlug(slug);
  if (!venue) notFound();

  const jsonLd = buildPublicVenueJsonLd(venue);

  return (
    <div className="min-h-screen flex flex-col bg-ivory text-ink">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <main id="main-content" className="flex-1">
        <ListingDetailView kind="venue" detail={venue} />
      </main>
      <Footer />
    </div>
  );
}
