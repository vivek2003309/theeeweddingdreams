"use client";

import React from "react";
import { ArrowRight } from "lucide-react";
import { ArchImage } from "@/components/ui/ArchImage";
import { Button } from "@/components/ui/Button";
import { GoldDivider } from "@/components/ui/GoldDivider";
import { CornerBrackets } from "@/components/ui/Ornaments";
import { TierMarker } from "@/components/ui/TierMarker";
import { useConcierge } from "@/components/concierge/ConciergeContext";
import type {
  PublicJournalDispatch,
  PublicRealWedding,
} from "@/lib/data/types";

interface EditorialTeasersProps {
  realWeddings: PublicRealWedding[];
  journalDispatches: PublicJournalDispatch[];
}

export function EditorialTeasers({
  realWeddings,
  journalDispatches,
}: EditorialTeasersProps) {
  const { openEnquiry } = useConcierge();

  return (
    <section
      id="editorial-teasers"
      aria-label="Real Weddings and Editorial Journal"
      className="bg-ivory py-20 md:py-28 border-t border-hairline-soft"
    >
      <div className="mx-auto max-w-[1440px] px-6 md:px-10 lg:px-16">
        {/* Real Weddings Teaser */}
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-gold-text">
              Real Weddings · Concierge Archive
            </p>
            <h2
              className="mt-2 font-display font-normal text-ink leading-[1.05] text-balance"
              style={{ fontSize: "var(--fs-h2)" }}
            >
              Celebrations held in{" "}
              <em className="italic text-crimson-deep">memory</em>.
            </h2>
          </div>
          <Button
            variant="secondary"
            onClick={() => openEnquiry({ interestType: "complete-wedding" })}
            className="self-start md:self-end"
          >
            Request Private Lookbook
          </Button>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-7 md:grid-cols-3">
          {realWeddings.map((wedding) => (
            <article
              key={wedding.id}
              className="group relative flex flex-col rounded-[20px] border border-hairline-soft bg-glass p-5 shadow-soft transition-[transform,box-shadow] duration-700 ease-silk hover:-translate-y-2 hover:shadow-lift"
            >
              <CornerBrackets />
              <ArchImage
                src={`/placeholder/real-weddings/${wedding.slug}.jpg`}
                alt={wedding.altText}
                ratio="4/5"
                gradient={wedding.visualGradient}
                caption={`${wedding.cityLabel} · ${wedding.seasonLabel}`}
              />
              <div className="mt-4 flex flex-1 flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs text-ink-soft">
                    <span>
                      {wedding.cityLabel} · {wedding.seasonLabel}
                    </span>
                    <TierMarker tier={wedding.tier} />
                  </div>
                  <h3 className="mt-1.5 font-display text-3xl font-normal text-ink">
                    {wedding.coupleTitle}
                  </h3>
                  <p className="mt-0.5 text-xs uppercase tracking-[0.16em] text-gold-text">
                    {wedding.venueName}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                    {wedding.storyExcerpt}
                  </p>
                </div>

                <div className="mt-5 border-t border-hairline-soft pt-3.5">
                  <button
                    type="button"
                    onClick={() =>
                      openEnquiry({
                        interestType: "venue",
                        listingTitle: wedding.venueName,
                        city: wedding.citySlug,
                        tier: wedding.tier,
                      })
                    }
                    className="inline-flex min-h-[40px] items-center gap-1.5 text-xs font-medium uppercase tracking-[0.14em] text-crimson hover:text-crimson-deep cursor-pointer"
                  >
                    <span>Enquire About This Setting</span>
                    <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        <GoldDivider />

        {/* Journal Teaser */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-4 space-y-3">
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-gold-text">
              The Wedding Dreams Journal
            </p>
            <h2
              className="font-display font-normal text-ink leading-[1.08]"
              style={{ fontSize: "var(--fs-h3)" }}
            >
              Notes from our{" "}
              <em className="italic text-crimson-deep">directors</em>.
            </h2>
            <p className="text-sm leading-relaxed text-ink-soft">
              Practical perspectives on palace acoustics, auspicious golden-hour
              timings, and thoughtful hospitality for multi-generational
              families.
            </p>
          </div>

          <div className="lg:col-span-8 divide-y divide-hairline-soft rounded-[20px] border border-hairline-soft bg-silk/65 px-6 py-2">
            {journalDispatches.map((entry) => (
              <article
                key={entry.id}
                className="flex flex-col gap-2 py-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="max-w-xl">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-gold-text">
                    {entry.categoryLabel} · {entry.readTimeLabel}
                  </p>
                  <h3 className="mt-1 font-display text-2xl font-normal text-ink">
                    {entry.title}
                  </h3>
                  <p className="mt-1 text-sm text-ink-soft">{entry.excerpt}</p>
                </div>
                <Button
                  variant="quiet"
                  onClick={() =>
                    openEnquiry({
                      interestType: "complete-wedding",
                      listingTitle: `Journal inquiry: ${entry.title}`,
                    })
                  }
                  className="self-start sm:self-center shrink-0"
                >
                  Discuss
                  <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
                </Button>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
