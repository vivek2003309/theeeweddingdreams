import React from "react";
import type { Metadata } from "next";
import { getDataAdapter } from "@/lib/data";
import { Header } from "@/components/shell/Header";
import { Footer } from "@/components/shell/Footer";
import { DiscoveryHub } from "@/components/home/DiscoveryHub";

export const metadata: Metadata = {
  title: "Curated Venues — The Wedding Dreams",
  description:
    "Explore verified heritage palaces, coastal estates, and garden pavilions across India through our private wedding concierge.",
};

export default async function VenuesIndexPage() {
  const adapter = getDataAdapter();
  const [venues, vendors] = await Promise.all([
    adapter.getFeaturedVenues(),
    adapter.getFeaturedVendors(),
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-ivory text-ink">
      <Header />
      <main id="main-content" className="flex-1 pt-16">
        <DiscoveryHub venues={venues} vendors={vendors} initialMode="venues" />
      </main>
      <Footer />
    </div>
  );
}
