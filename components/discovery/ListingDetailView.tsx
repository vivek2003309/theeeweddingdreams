"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Check,
  MapPin,
  Pause,
  Play,
  ShieldCheck,
  Users,
  Volume2,
  VolumeX,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { GoldDivider } from "@/components/ui/GoldDivider";
import { LotusBullet } from "@/components/ui/Ornaments";
import { TierMarker } from "@/components/ui/TierMarker";
import { MediaGallery } from "./MediaGallery";
import { useConcierge } from "@/components/concierge/ConciergeContext";
import { useMotionContext } from "@/components/motion/MotionProvider";
import type {
  PublicVendorDetail,
  PublicVenueDetail,
} from "@/lib/data/details";

type ListingDetailProps =
  | { kind: "venue"; detail: PublicVenueDetail }
  | { kind: "vendor"; detail: PublicVendorDetail };

export function ListingDetailView(props: ListingDetailProps) {
  const { openEnquiry } = useConcierge();
  const { reducedMotion } = useMotionContext();
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  const isVenue = props.kind === "venue";
  const detail = props.detail;
  const effectivePlay = isPlaying && !reducedMotion;

  const openListingQuote = () => {
    openEnquiry({
      interestType: isVenue ? "venue" : "vendor",
      listingTitle: detail.name,
      city: detail.citySlug,
      tier: detail.tier,
    });
  };

  return (
    <div className="bg-ivory pt-24 pb-20">
      <div className="mx-auto max-w-[1440px] px-6 md:px-10 lg:px-16">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="mb-6 flex items-center gap-2 text-xs text-ink-soft"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 hover:text-crimson transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
            <span>Home</span>
          </Link>
          <span aria-hidden="true" className="text-gold">
            /
          </span>
          <Link
            href={isVenue ? "/venues" : "/vendors"}
            className="hover:text-crimson transition-colors"
          >
            {isVenue ? "Venues" : "Vendors"}
          </Link>
          <span aria-hidden="true" className="text-gold">
            /
          </span>
          <span className="text-ink font-medium">{detail.name}</span>
        </nav>

        {/* 4K Hero Video Banner (Placeholder HLS Adaptive — Light Ivory Scrim) */}
        <section
          aria-label={`${detail.name} 4K hero showcase`}
          data-hls-url={detail.hlsUrl}
          data-preview-mp4={detail.previewMp4Url}
          className="relative overflow-hidden rounded-tl-[24px] rounded-bl-[24px] rounded-br-[24px] rounded-tr-[110px] border border-hairline bg-blush shadow-soft min-h-[400px] md:min-h-[500px] flex flex-col justify-between"
          style={{ background: detail.visualGradient }}
        >
          {/* Ambient slow arch canvas */}
          <div
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute inset-0 flex items-center justify-center",
              effectivePlay ? "animate-ken-burns" : ""
            )}
          >
            <div className="h-[85%] w-[64%] max-w-[680px] rounded-arch border border-hairline/55 bg-ivory/40" />
          </div>

          {/* Light Ivory Scrim — NEVER dark */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[62%]"
            style={{
              background:
                "linear-gradient(to top, rgba(255,249,250,0.95) 0%, rgba(255,249,250,0.74) 50%, rgba(255,249,250,0) 100%)",
            }}
          />

          {/* Top Controls */}
          <div className="relative z-10 flex items-center justify-between px-6 pt-6 md:px-10 md:pr-24 md:pt-8">
            <div className="flex flex-wrap items-center gap-2.5 text-[11px] font-medium uppercase tracking-[0.2em] text-gold-text">
              <span>4K Placeholder · HLS Adaptive</span>
              <span aria-hidden="true" className="text-gold">
                ·
              </span>
              <span className="inline-flex items-center gap-1 text-success">
                <ShieldCheck className="h-3.5 w-3.5" strokeWidth={1.5} />
                Verified Partner
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsPlaying((p) => !p)}
                aria-pressed={!effectivePlay}
                aria-label={
                  effectivePlay ? "Pause 4K showcase" : "Play 4K showcase"
                }
                className="flex h-11 w-11 items-center justify-center rounded-full border border-hairline bg-glass-strong text-ink hover:border-crimson hover:text-crimson cursor-pointer"
              >
                {effectivePlay ? (
                  <Pause className="h-4 w-4" strokeWidth={1.5} />
                ) : (
                  <Play className="h-4 w-4" strokeWidth={1.5} />
                )}
              </button>
              <button
                type="button"
                onClick={() => setIsMuted((m) => !m)}
                aria-pressed={!isMuted}
                aria-label={
                  isMuted ? "Unmute ambient audio" : "Mute ambient audio"
                }
                className="flex h-11 w-11 items-center justify-center rounded-full border border-hairline bg-glass-strong text-ink hover:border-crimson hover:text-crimson cursor-pointer"
              >
                {isMuted ? (
                  <VolumeX className="h-4 w-4" strokeWidth={1.5} />
                ) : (
                  <Volume2 className="h-4 w-4 text-crimson" strokeWidth={1.5} />
                )}
              </button>
            </div>
          </div>

          {/* Bottom Title Overlay on Ivory Scrim */}
          <div className="relative z-10 px-6 pb-8 pt-16 md:px-10 md:pb-10">
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-gold-text">
              {detail.city} ·{" "}
              {isVenue ? props.detail.setting : props.detail.category}
            </p>
            <h1
              className="mt-2 font-display font-light text-ink leading-[1.02] text-balance"
              style={{ fontSize: "var(--fs-h1)" }}
            >
              {detail.name}
            </h1>
            <p className="mt-2.5 max-w-2xl text-base font-light text-ink-soft">
              {isVenue ? props.detail.tagline : props.detail.specialty}
            </p>
          </div>
        </section>

        {/* Sticky Sub-Navigation */}
        <div className="sticky top-[74px] z-20 mt-8 rounded-full border border-hairline-soft bg-glass-strong px-4 py-2 shadow-soft overflow-x-auto">
          <nav
            aria-label="Listing sections"
            className="flex items-center justify-between gap-4 text-xs uppercase tracking-[0.16em]"
          >
            <div className="flex items-center gap-5 whitespace-nowrap">
              <a
                href="#overview"
                className="py-2 text-ink hover:text-crimson transition-colors"
              >
                Overview
              </a>
              <a
                href="#gallery"
                className="py-2 text-ink hover:text-crimson transition-colors"
              >
                Gallery ({detail.gallery.length})
              </a>
              <a
                href="#spaces"
                className="py-2 text-ink hover:text-crimson transition-colors"
              >
                {isVenue ? "Spaces & Amenities" : "Signature Craft"}
              </a>
              <a
                href="#concierge-pledge"
                className="py-2 text-ink hover:text-crimson transition-colors"
              >
                Concierge
              </a>
            </div>

            <div className="hidden sm:flex items-center gap-3 shrink-0">
              <TierMarker tier={detail.tier} />
              <Button variant="primary" onClick={openListingQuote}>
                Request Concierge Quote
              </Button>
            </div>
          </nav>
        </div>

        {/* Main 12-Column Editorial Content + Sticky Concierge Sidebar */}
        <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-start">
          {/* Left 8 Columns */}
          <div className="lg:col-span-8 space-y-14">
            {/* Overview */}
            <section id="overview" className="scroll-mt-36 space-y-4">
              <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-gold-text">
                Editorial Overview
              </p>
              <h2
                className="font-display font-normal text-ink leading-[1.08]"
                style={{ fontSize: "var(--fs-h2)" }}
              >
                Curated for{" "}
                <em className="italic text-crimson-deep">unhurried</em>{" "}
                celebrations.
              </h2>
              <p className="max-w-[62ch] text-base leading-[1.75] text-ink-soft">
                {detail.editorialOverview}
              </p>
              <p className="max-w-[62ch] text-sm leading-[1.7] text-ink-soft">
                {isVenue
                  ? props.detail.architecturalNote
                  : props.detail.craftPhilosophy}
              </p>
            </section>

            <GoldDivider compact />

            {/* Masonry Gallery with Lightbox */}
            <section id="gallery" className="scroll-mt-36 space-y-5">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-gold-text">
                    4K Visual Portfolio
                  </p>
                  <h2
                    className="mt-1 font-display font-normal text-ink"
                    style={{ fontSize: "var(--fs-h3)" }}
                  >
                    Daylight &amp;{" "}
                    <em className="italic text-crimson-deep">evening</em>{" "}
                    studies.
                  </h2>
                </div>
                <span className="text-xs text-ink-soft">
                  Select any plate to inspect in full lightbox
                </span>
              </div>
              <MediaGallery items={detail.gallery} />
            </section>

            <GoldDivider compact />

            {/* Spaces & Amenities (Venue) OR Signature Offerings (Vendor) */}
            <section id="spaces" className="scroll-mt-36 space-y-6">
              <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-gold-text">
                {isVenue
                  ? "Event Spaces & Hospitality"
                  : "Signature Offerings"}
              </p>
              <h2
                className="font-display font-normal text-ink"
                style={{ fontSize: "var(--fs-h3)" }}
              >
                {isVenue ? (
                  <>
                    Courtyards, verandahs &amp;{" "}
                    <em className="italic text-crimson-deep">halls</em>.
                  </>
                ) : (
                  <>
                    Bespoke commissions,{" "}
                    <em className="italic text-crimson-deep">personally</em>{" "}
                    directed.
                  </>
                )}
              </h2>

              {isVenue ? (
                <>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {props.detail.spaces.map((space) => (
                      <div
                        key={space.name}
                        className="rounded-[20px] border border-hairline-soft bg-blush/45 p-5"
                      >
                        <p className="text-[10px] uppercase tracking-[0.2em] text-gold-text">
                          {space.type}
                        </p>
                        <h3 className="mt-1 font-display text-xl text-ink">
                          {space.name}
                        </h3>
                        <p className="mt-2 text-xs text-ink-soft tabular-nums">
                          {space.capacityLabel}
                        </p>
                        <p className="mt-1 text-xs text-ink">
                          Ideal for: {space.idealFor}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-[20px] border border-hairline-soft bg-silk p-6">
                    <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-gold-text">
                      Verified Estate Amenities
                    </p>
                    <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 text-sm text-ink">
                      {props.detail.amenities.map((amenity) => (
                        <li key={amenity} className="flex items-center gap-2.5">
                          <Check
                            className="h-4 w-4 text-success shrink-0"
                            strokeWidth={1.5}
                          />
                          <span>{amenity}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              ) : (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                  {props.detail.signatureOfferings.map((offering) => (
                    <div
                      key={offering.title}
                      className="rounded-[20px] border border-hairline-soft bg-silk p-5"
                    >
                      <h3 className="font-display text-xl text-ink">
                        {offering.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                        {offering.description}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Concierge Pledge */}
            <section
              id="concierge-pledge"
              className="scroll-mt-36 rounded-[24px] border border-hairline bg-blush/55 p-6 md:p-8"
            >
              <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-gold-text">
                Privacy &amp; Concierge Coordination
              </p>
              <h2 className="mt-1.5 font-display text-3xl text-ink">
                Introduced exclusively through our{" "}
                <em className="italic text-crimson-deep">concierge</em>.
              </h2>
              <ul className="mt-4 space-y-2.5 text-sm text-ink">
                {detail.conciergeHighlights.map((line) => (
                  <li key={line} className="flex items-start gap-2.5">
                    <LotusBullet active className="mt-1" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* Right 4 Columns: At-a-Glance Sidebar + Sticky Quote Card */}
          <aside className="lg:col-span-4 lg:sticky lg:top-[146px] space-y-6">
            {/* At-a-Glance Card (Zero phone, email, WhatsApp, or exact prices) */}
            <div className="rounded-[24px] border border-hairline-soft bg-silk p-6 shadow-soft space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-gold-text">
                  At a Glance
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-success">
                  <ShieldCheck className="h-3.5 w-3.5" strokeWidth={1.5} />
                  Verified
                </span>
              </div>

              <dl className="divide-y divide-hairline-soft text-sm">
                <div className="flex items-center justify-between py-3">
                  <dt className="inline-flex items-center gap-2 text-ink-soft">
                    <MapPin className="h-4 w-4 text-gold-text" strokeWidth={1.5} />
                    <span>Destination</span>
                  </dt>
                  <dd className="font-medium text-ink">{detail.city}</dd>
                </div>

                <div className="flex items-center justify-between py-3">
                  <dt className="text-ink-soft">
                    {isVenue ? "Architectural Setting" : "Discipline"}
                  </dt>
                  <dd className="font-medium text-ink">
                    {isVenue ? props.detail.setting : props.detail.category}
                  </dd>
                </div>

                {isVenue ? (
                  <>
                    <div className="flex items-center justify-between py-3">
                      <dt className="inline-flex items-center gap-2 text-ink-soft">
                        <Users
                          className="h-4 w-4 text-gold-text"
                          strokeWidth={1.5}
                        />
                        <span>Gathering Capacity</span>
                      </dt>
                      <dd className="font-medium text-ink tabular-nums">
                        {props.detail.capacityMin}–{props.detail.capacityMax} guests
                      </dd>
                    </div>
                    <div className="flex items-center justify-between py-3">
                      <dt className="text-ink-soft">Accommodation</dt>
                      <dd className="font-medium text-ink text-right">
                        {props.detail.suitesCountLabel}
                      </dd>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between py-3">
                      <dt className="text-ink-soft">Coverage</dt>
                      <dd className="font-medium text-ink text-right">
                        {props.detail.travelScope}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between py-3">
                      <dt className="text-ink-soft">Booking Window</dt>
                      <dd className="font-medium text-ink text-right">
                        {props.detail.leadTimeNote}
                      </dd>
                    </div>
                  </>
                )}

                <div className="flex items-center justify-between py-3">
                  <dt className="text-ink-soft">Celebration Tier</dt>
                  <dd>
                    <TierMarker tier={detail.tier} />
                  </dd>
                </div>
              </dl>
            </div>

            {/* Sticky Concierge Quote Card */}
            <div className="rounded-[24px] border border-hairline bg-glass-strong p-6 shadow-lift space-y-4">
              <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-gold-text">
                Private Concierge Desk
              </p>
              <h3 className="font-display text-2xl text-ink leading-snug">
                Request bespoke availability &amp;{" "}
                <em className="italic text-crimson-deep">proposal</em>.
              </h3>
              <p className="text-xs leading-relaxed text-ink-soft">
                Share your preferred dates and guest gathering. Our concierge
                coordinates walkthroughs, private rates, and introductions
                directly — never exposing your contact details publicly.
              </p>

              <Button
                variant="primary"
                className="w-full"
                onClick={openListingQuote}
              >
                Request Concierge Quote
                <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
              </Button>

              <button
                type="button"
                onClick={() => setIsSaved((s) => !s)}
                aria-pressed={isSaved}
                className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full border border-hairline bg-ivory text-xs font-medium uppercase tracking-[0.14em] text-ink-soft transition-colors hover:border-crimson hover:text-crimson cursor-pointer"
              >
                <Bookmark
                  className="h-4 w-4"
                  strokeWidth={1.5}
                  fill={isSaved ? "currentColor" : "none"}
                />
                <span>
                  {isSaved ? "Saved to Your Shortlist" : "Save to Shortlist"}
                </span>
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
