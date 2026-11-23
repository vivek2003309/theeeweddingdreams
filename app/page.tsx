import React from "react";
import { getDataAdapter } from "@/lib/data";
import { Header } from "@/components/shell/Header";
import { Footer } from "@/components/shell/Footer";
import { HeroProcessionalWindow } from "@/components/hero/HeroProcessionalWindow";
import { DecorGallery } from "@/components/home/DecorGallery";
import { DiscoveryHub } from "@/components/home/DiscoveryHub";
import { ProcessionTimeline } from "@/components/home/ProcessionTimeline";
import { PartnerShowcase } from "@/components/home/PartnerShowcase";
import { EditorialTeasers } from "@/components/home/EditorialTeasers";

export default async function HomePage() {
  const adapter = getDataAdapter();
  const [
    heroSlides,
    decorPlates,
    experiences,
    venues,
    vendors,
    processionSteps,
    realWeddings,
    journalDispatches,
  ] = await Promise.all([
    adapter.getHeroSlides(),
    adapter.getDecorPlates(),
    adapter.getCuratedExperiences(),
    adapter.getFeaturedVenues(),
    adapter.getFeaturedVendors(),
    adapter.getProcessionSteps(),
    adapter.getRealWeddings(),
    adapter.getJournalDispatches(),
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-ivory text-ink">
      <Header />
      <main id="main-content" className="flex-1">
        <HeroProcessionalWindow slides={heroSlides} />
        <DecorGallery plates={decorPlates} experiences={experiences} />
        <DiscoveryHub venues={venues} vendors={vendors} />
        <ProcessionTimeline steps={processionSteps} />
        <PartnerShowcase />
        <EditorialTeasers
          realWeddings={realWeddings}
          journalDispatches={journalDispatches}
        />
      </main>
      <Footer />
    </div>
  );
}
