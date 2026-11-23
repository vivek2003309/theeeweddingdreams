import React from "react";
import type { Metadata } from "next";
import { getDataAdapter } from "@/lib/data";
import { Header } from "@/components/shell/Header";
import { Footer } from "@/components/shell/Footer";
import { DiscoveryHub } from "@/components/home/DiscoveryHub";

export const metadata: Metadata = {
  title: "Curated Ateliers & Vendors — The Wedding Dreams",
  description:
    "Discover verified floral designers, 4K cinema guilds, couture houses, and royal culinary kitchens personally introduced by our concierge.",
};

export default async function VendorsIndexPage() {
  const adapter = getDataAdapter();
  const [venues, vendors] = await Promise.all([
    adapter.getFeaturedVenues(),
    adapter.getFeaturedVendors(),
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-ivory text-ink">
      <Header />
      <main id="main-content" className="flex-1 pt-16">
        <DiscoveryHub venues={venues} vendors={vendors} initialMode="vendors" />
      </main>
      <Footer />
    </div>
  );
}
