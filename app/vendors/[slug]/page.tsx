import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/shell/Header";
import { Footer } from "@/components/shell/Footer";
import { ListingDetailView } from "@/components/discovery/ListingDetailView";
import {
  buildPublicVendorJsonLd,
  getVendorDetailBySlug,
} from "@/lib/data/details";
import { MOCK_VENDORS } from "@/lib/data/mockAdapter";

interface VendorPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return MOCK_VENDORS.map((v) => ({ slug: v.slug }));
}

export async function generateMetadata({
  params,
}: VendorPageProps): Promise<Metadata> {
  const { slug } = await params;
  const vendor = getVendorDetailBySlug(slug);
  if (!vendor) {
    return { title: "Atelier Not Found — The Wedding Dreams" };
  }
  return {
    title: `${vendor.name} (${vendor.category}) — The Wedding Dreams`,
    description: vendor.specialty,
  };
}

export default async function VendorDetailPage({ params }: VendorPageProps) {
  const { slug } = await params;
  const vendor = getVendorDetailBySlug(slug);
  if (!vendor) notFound();

  const jsonLd = buildPublicVendorJsonLd(vendor);

  return (
    <div className="min-h-screen flex flex-col bg-ivory text-ink">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <main id="main-content" className="flex-1">
        <ListingDetailView kind="vendor" detail={vendor} />
      </main>
      <Footer />
    </div>
  );
}
