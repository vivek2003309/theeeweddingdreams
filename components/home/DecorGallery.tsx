"use client";

import React, { useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ArchImage } from "@/components/ui/ArchImage";
import { Button } from "@/components/ui/Button";
import { GoldDivider } from "@/components/ui/GoldDivider";
import { CornerBrackets } from "@/components/ui/Ornaments";
import { TierMarker } from "@/components/ui/TierMarker";
import { useConcierge } from "@/components/concierge/ConciergeContext";
import { useMotionContext } from "@/components/motion/MotionProvider";
import type { PublicDecorPlate, PublicExperience } from "@/lib/data/types";

interface DecorGalleryProps {
  plates: PublicDecorPlate[];
  experiences: PublicExperience[];
}

export function DecorGallery({ plates, experiences }: DecorGalleryProps) {
  const { openEnquiry } = useConcierge();
  const { reducedMotion } = useMotionContext();

  const pinSectionRef = useRef<HTMLElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const mobileRailRef = useRef<HTMLDivElement | null>(null);
  const [activePlateIdx, setActivePlateIdx] = useState(0);

  // Desktop pinned horizontal asymmetrical gallery inside gsap.context()
  useEffect(() => {
    if (reducedMotion) return;
    const section = pinSectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
    if (!isDesktop) return;

    let isDisposed = false;
    let ctx: ReturnType<typeof import("gsap").gsap.context> | null = null;

    async function initPinnedGallery() {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (isDisposed || !section || !track) return;

      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {
        const getScrollDistance = () =>
          Math.max(0, track.scrollWidth - section.clientWidth + 96);

        gsap.to(track, {
          x: () => -getScrollDistance(),
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () => `+=${Math.max(900, getScrollDistance())}`,
            pin: true,
            scrub: 0.9,
            invalidateOnRefresh: true,
            anticipatePin: 1,
            onUpdate: (self) => {
              const nextIdx = Math.min(
                plates.length - 1,
                Math.floor(self.progress * plates.length)
              );
              setActivePlateIdx(nextIdx);
            },
          },
        });
      }, section);
    }

    initPinnedGallery();

    return () => {
      isDisposed = true;
      ctx?.revert();
    };
  }, [reducedMotion, plates.length]);

  const scrollRailBy = (direction: -1 | 1) => {
    const nextIdx = Math.max(
      0,
      Math.min(plates.length - 1, activePlateIdx + direction)
    );
    setActivePlateIdx(nextIdx);
    if (mobileRailRef.current) {
      mobileRailRef.current.scrollBy({
        left: direction * 340,
        behavior: reducedMotion ? "auto" : "smooth",
      });
    }
  };

  return (
    <div id="signature-decor" className="bg-blush/55 border-t border-hairline-soft">
      {/* Part A: Signature Decor Pinned Horizontal Gallery (Desktop) / Snap Carousel (Mobile) */}
      <section
        ref={pinSectionRef}
        aria-label="Signature Decor Gallery"
        className="relative overflow-hidden py-20 lg:py-24"
      >
        <div className="mx-auto max-w-[1440px] px-6 md:px-10 lg:px-16">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-gold-text">
                Signature Scenography · 0{plates.length} Plates
              </p>
              <h2
                className="mt-2 font-display font-normal text-ink leading-[1.05] text-balance"
                style={{ fontSize: "var(--fs-h2)" }}
              >
                Architectural decor crafted in{" "}
                <em className="italic text-crimson-deep">daylight</em> &amp;
                candlelight.
              </h2>
              <p className="mt-3 max-w-[62ch] font-sans font-light text-base leading-[1.7] text-ink-soft">
                Native mogra, pale lotus, and hand-carved sandstone pavilions
                composed so every frame remains luminous and timeless.
              </p>
            </div>

            <div className="flex items-center gap-3 self-start md:self-end">
              <span className="text-xs uppercase tracking-[0.18em] text-gold-text tabular-nums">
                Plate 0{activePlateIdx + 1} / 0{plates.length}
              </span>
              <div className="flex items-center gap-2 lg:hidden">
                <button
                  type="button"
                  onClick={() => scrollRailBy(-1)}
                  aria-label="Previous decor plate"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-hairline bg-ivory text-ink transition-colors hover:border-crimson hover:text-crimson cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
                </button>
                <button
                  type="button"
                  onClick={() => scrollRailBy(1)}
                  aria-label="Next decor plate"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-hairline bg-ivory text-ink transition-colors hover:border-crimson hover:text-crimson cursor-pointer"
                >
                  <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Asymmetrical Horizontal Track */}
        <div className="mt-10 hidden lg:block">
          <div
            ref={trackRef}
            className="flex items-end gap-10 pl-16 pr-24 will-change-transform"
          >
            {plates.map((plate, index) => {
              const isTall = plate.aspectVariant === "tall";
              const isArch = plate.aspectVariant === "arch";
              const widthClass = isTall
                ? "w-[360px]"
                : isArch
                  ? "w-[400px]"
                  : "w-[480px]";
              const offsetClass =
                index % 2 === 1 ? "-translate-y-6" : "translate-y-0";

              return (
                <article
                  key={plate.id}
                  data-hls-url={plate.hlsUrl}
                  data-preview-mp4={plate.previewMp4Url}
                  className={cn(
                    "group relative shrink-0 rounded-[20px] border border-hairline-soft bg-glass p-5 shadow-soft transition-[transform,box-shadow] duration-700 ease-silk hover:-translate-y-2 hover:shadow-lift",
                    widthClass,
                    offsetClass
                  )}
                >
                  <CornerBrackets />
                  <ArchImage
                    src={plate.posterUrl}
                    alt={plate.altText}
                    ratio={isTall ? "3/4" : isArch ? "4/5" : "4/3"}
                    archMask={isArch || isTall}
                    gradient={plate.visualGradient}
                    caption={`4K Placeholder · ${plate.ritualLabel}`}
                  />
                  <div className="mt-4 space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-ink-soft">
                      <span className="uppercase tracking-[0.18em] text-gold-text tabular-nums">
                        {plate.indexLabel}
                      </span>
                      <span>
                        {plate.cityLabel} · {plate.ritualLabel}
                      </span>
                    </div>
                    <h3 className="font-display text-2xl font-medium text-ink">
                      {plate.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-ink-soft">
                      {plate.craftNote}
                    </p>
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() =>
                          openEnquiry({
                            interestType: "vendor",
                            listingTitle: plate.title,
                            city: plate.citySlug,
                          })
                        }
                        className="inline-flex min-h-[40px] items-center gap-1.5 text-xs font-medium uppercase tracking-[0.14em] text-crimson hover:text-crimson-deep transition-colors cursor-pointer"
                      >
                        <span>Enquire About This Scenography</span>
                        <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        {/* Mobile & Tablet Horizontal Snap Carousel */}
        <div
          ref={mobileRailRef}
          className="mt-8 flex snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-4 lg:hidden"
        >
          {plates.map((plate) => (
            <article
              key={plate.id}
              className="group relative w-[84vw] max-w-[360px] shrink-0 snap-center rounded-[20px] border border-hairline-soft bg-glass p-4 shadow-soft"
            >
              <ArchImage
                src={plate.posterUrl}
                alt={plate.altText}
                ratio="4/5"
                gradient={plate.visualGradient}
                caption={`4K Placeholder · ${plate.ritualLabel}`}
              />
              <div className="mt-4 space-y-1.5">
                <p className="text-[11px] uppercase tracking-[0.18em] text-gold-text">
                  {plate.indexLabel} · {plate.cityLabel}
                </p>
                <h3 className="font-display text-2xl font-medium text-ink">
                  {plate.title}
                </h3>
                <p className="text-sm leading-relaxed text-ink-soft">
                  {plate.craftNote}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <div className="mx-auto max-w-[1440px] px-6 md:px-10 lg:px-16">
        <GoldDivider compact />
      </div>

      {/* Part B: 4 Curated Experiences Grid */}
      <section
        aria-label="Curated Wedding Experiences"
        className="py-16 md:py-24"
      >
        <div className="mx-auto max-w-[1440px] px-6 md:px-10 lg:px-16">
          <div className="max-w-2xl">
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-gold-text">
              Curated Experiences
            </p>
            <h2
              className="mt-2 font-display font-normal text-ink leading-[1.05] text-balance"
              style={{ fontSize: "var(--fs-h2)" }}
            >
              Four ways to gather,{" "}
              <em className="italic text-crimson-deep">personally</em> held.
            </h2>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-4">
            {experiences.map((exp) => (
              <article
                key={exp.id}
                className="group relative flex flex-col justify-between rounded-[20px] border border-hairline-soft bg-ivory/85 p-5 shadow-soft transition-[transform,box-shadow] duration-700 ease-silk hover:-translate-y-2 hover:shadow-lift"
              >
                <CornerBrackets />
                <div>
                  <ArchImage
                    src={`/placeholder/experiences/${exp.slug}.jpg`}
                    alt={exp.altText}
                    ratio="4/3"
                    gradient={exp.visualGradient}
                    caption={`${exp.cityLabel} · ${exp.durationLabel}`}
                  />
                  <div className="mt-4 flex items-center justify-between text-xs text-ink-soft">
                    <span className="font-display text-2xl font-light text-gold-antique tabular-nums">
                      {exp.indexLabel}
                    </span>
                    <TierMarker tier={exp.tier} />
                  </div>
                  <h3 className="mt-2 font-display text-2xl font-medium text-ink">
                    {exp.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                    {exp.subtitle}
                  </p>
                </div>

                <div className="mt-5 border-t border-hairline-soft pt-4 flex items-center justify-between gap-2">
                  <span className="text-xs text-ink-soft">
                    {exp.cityLabel} · {exp.durationLabel}
                  </span>
                  <Button
                    variant="quiet"
                    onClick={() =>
                      openEnquiry({
                        interestType: "complete-wedding",
                        listingTitle: exp.title,
                        city: exp.citySlug,
                        tier: exp.tier,
                      })
                    }
                    className="px-2"
                  >
                    Enquire
                    <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
