"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Bookmark, Film, RotateCcw, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { ArchImage } from "@/components/ui/ArchImage";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { GoldDivider } from "@/components/ui/GoldDivider";
import { CornerBrackets } from "@/components/ui/Ornaments";
import { TierMarker } from "@/components/ui/TierMarker";
import { useConcierge } from "@/components/concierge/ConciergeContext";
import {
  LAUNCH_CITIES,
  VENDOR_CATEGORIES,
  VENUE_SETTINGS,
} from "@/lib/data/mockAdapter";
import { filterPublicVendors, filterPublicVenues } from "@/lib/data/filters";
import type {
  BudgetTier,
  CitySlug,
  GuestBand,
  PublicVendor,
  PublicVenue,
  VendorCategorySlug,
  VenueSettingSlug,
} from "@/lib/data/types";

interface DiscoveryHubProps {
  venues: PublicVenue[];
  vendors: PublicVendor[];
  initialMode?: "venues" | "vendors";
}

const GUEST_FILTERS: Array<{ value: GuestBand; label: string }> = [
  { value: "all", label: "Any Size" },
  { value: "under-100", label: "Under 100" },
  { value: "100-250", label: "100–250" },
  { value: "250-500", label: "250–500" },
  { value: "500-plus", label: "500+" },
];

const TIER_FILTERS: Array<{ value: BudgetTier | "all"; label: string }> = [
  { value: "all", label: "All Tiers" },
  { value: "classic", label: "◇ Classic" },
  { value: "grand", label: "◇◇ Grand" },
  { value: "royal", label: "◇◇◇ Royal" },
];

export function DiscoveryHub({
  venues,
  vendors,
  initialMode = "venues",
}: DiscoveryHubProps) {
  const { openEnquiry } = useConcierge();

  const [mode, setMode] = useState<"venues" | "vendors">(initialMode);
  const [selectedCity, setSelectedCity] = useState<CitySlug | "all">("all");
  const [selectedSetting, setSelectedSetting] = useState<
    VenueSettingSlug | "all"
  >("all");
  const [selectedCategory, setSelectedCategory] = useState<
    VendorCategorySlug | "all"
  >("all");
  const [selectedTier, setSelectedTier] = useState<BudgetTier | "all">("all");
  const [selectedGuestBand, setSelectedGuestBand] = useState<GuestBand>("all");
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [showSavedOnly, setShowSavedOnly] = useState(false);

  const toggleSaved = (id: string) => {
    setSavedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const resetFilters = () => {
    setSelectedCity("all");
    setSelectedSetting("all");
    setSelectedCategory("all");
    setSelectedTier("all");
    setSelectedGuestBand("all");
    setShowSavedOnly(false);
  };

  const hasActiveFilters =
    selectedCity !== "all" ||
    selectedSetting !== "all" ||
    selectedCategory !== "all" ||
    selectedTier !== "all" ||
    selectedGuestBand !== "all" ||
    showSavedOnly;

  const filteredVenues = useMemo(() => {
    const list = filterPublicVenues(venues, {
      city: selectedCity,
      setting: selectedSetting,
      tier: selectedTier,
      guestBand: selectedGuestBand,
    });
    return showSavedOnly ? list.filter((v) => savedIds.includes(v.id)) : list;
  }, [
    venues,
    selectedCity,
    selectedSetting,
    selectedTier,
    selectedGuestBand,
    showSavedOnly,
    savedIds,
  ]);

  const filteredVendors = useMemo(() => {
    const list = filterPublicVendors(vendors, {
      city: selectedCity,
      category: selectedCategory,
      tier: selectedTier,
    });
    return showSavedOnly ? list.filter((v) => savedIds.includes(v.id)) : list;
  }, [
    vendors,
    selectedCity,
    selectedCategory,
    selectedTier,
    showSavedOnly,
    savedIds,
  ]);

  const visibleCount =
    mode === "venues" ? filteredVenues.length : filteredVendors.length;
  const totalCount = mode === "venues" ? venues.length : vendors.length;

  return (
    <section
      id="discovery-hub"
      aria-label="Venues and Vendors Dual Discovery Hub"
      className="bg-ivory py-20 md:py-28 border-t border-hairline-soft"
    >
      <div className="mx-auto max-w-[1440px] px-6 md:px-10 lg:px-16">
        {/* Editorial Heading + Venues | Vendors Toggle */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-gold-text">
              Dual-Discovery Hub · Verified Directory
            </p>
            <h2
              className="mt-2 font-display font-normal text-ink leading-[1.05] text-balance"
              style={{ fontSize: "var(--fs-h2)" }}
            >
              Curated palaces &amp;{" "}
              <em className="italic text-crimson-deep">verified</em> ateliers.
            </h2>
            <p className="mt-3 max-w-[62ch] font-sans font-light text-base leading-[1.7] text-ink-soft">
              Explore our private shortlist by city, setting, discipline, and
              tier. Exact pricing and direct contact details are held privately
              by our concierge.
            </p>
          </div>

          {/* Venues | Vendors Segmented Switcher */}
          <div
            role="tablist"
            aria-label="Browse venues or vendors"
            className="inline-flex items-center gap-1 self-start rounded-full border border-hairline bg-blush/60 p-1.5"
          >
            <button
              type="button"
              role="tab"
              aria-selected={mode === "venues"}
              onClick={() => setMode("venues")}
              className={cn(
                "min-h-[44px] rounded-full px-6 text-xs font-medium uppercase tracking-[0.14em] transition-colors duration-500 ease-silk whitespace-nowrap cursor-pointer",
                mode === "venues"
                  ? "bg-crimson text-ivory shadow-soft"
                  : "text-ink-soft hover:text-ink"
              )}
            >
              Venues ({venues.length})
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === "vendors"}
              onClick={() => setMode("vendors")}
              className={cn(
                "min-h-[44px] rounded-full px-6 text-xs font-medium uppercase tracking-[0.14em] transition-colors duration-500 ease-silk whitespace-nowrap cursor-pointer",
                mode === "vendors"
                  ? "bg-crimson text-ivory shadow-soft"
                  : "text-ink-soft hover:text-ink"
              )}
            >
              Vendors ({vendors.length})
            </button>
          </div>
        </div>

        {/* Sticky Filter Bar */}
        <div
          aria-label="Directory filters"
          className="sticky top-[74px] z-20 mt-8 rounded-[20px] border border-hairline-soft bg-glass-strong p-4 shadow-soft md:p-5"
        >
          <div className="flex flex-col gap-4">
            {/* Row 1: Cities + Tier Diamonds */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="mr-1 text-[11px] font-medium uppercase tracking-[0.2em] text-gold-text">
                  City
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedCity("all")}
                  aria-pressed={selectedCity === "all"}
                  className={cn(
                    "min-h-[38px] rounded-full border px-3.5 text-xs font-medium transition-colors whitespace-nowrap cursor-pointer",
                    selectedCity === "all"
                      ? "border-crimson bg-lotus-soft text-crimson"
                      : "border-hairline bg-ivory text-ink-soft hover:border-gold hover:text-ink"
                  )}
                >
                  All Cities
                </button>
                {LAUNCH_CITIES.map((city) => (
                  <button
                    key={city.slug}
                    type="button"
                    onClick={() => setSelectedCity(city.slug)}
                    aria-pressed={selectedCity === city.slug}
                    className={cn(
                      "min-h-[38px] rounded-full border px-3.5 text-xs font-medium transition-colors whitespace-nowrap cursor-pointer",
                      selectedCity === city.slug
                        ? "border-crimson bg-lotus-soft text-crimson"
                        : "border-hairline bg-ivory text-ink-soft hover:border-gold hover:text-ink"
                    )}
                  >
                    {city.name}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="mr-1 text-[11px] font-medium uppercase tracking-[0.2em] text-gold-text">
                  Tier
                </span>
                {TIER_FILTERS.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setSelectedTier(t.value)}
                    aria-pressed={selectedTier === t.value}
                    className={cn(
                      "min-h-[38px] rounded-full border px-3.5 text-xs font-medium transition-colors whitespace-nowrap cursor-pointer",
                      selectedTier === t.value
                        ? "border-crimson bg-lotus-soft text-crimson"
                        : "border-hairline bg-ivory text-ink-soft hover:border-gold hover:text-ink"
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Row 2: Setting (Venues) or Category (Vendors) + Guest Band + Saved Toggle */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-hairline-soft pt-3.5">
              <div className="flex flex-wrap items-center gap-2">
                {mode === "venues" ? (
                  <>
                    <span className="mr-1 text-[11px] font-medium uppercase tracking-[0.2em] text-gold-text">
                      Setting
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedSetting("all")}
                      aria-pressed={selectedSetting === "all"}
                      className={cn(
                        "min-h-[36px] rounded-full border px-3 text-xs transition-colors whitespace-nowrap cursor-pointer",
                        selectedSetting === "all"
                          ? "border-crimson bg-lotus-soft text-crimson font-medium"
                          : "border-hairline bg-ivory text-ink-soft hover:border-gold"
                      )}
                    >
                      All Settings
                    </button>
                    {VENUE_SETTINGS.map((setting) => (
                      <button
                        key={setting.slug}
                        type="button"
                        onClick={() => setSelectedSetting(setting.slug)}
                        aria-pressed={selectedSetting === setting.slug}
                        className={cn(
                          "min-h-[36px] rounded-full border px-3 text-xs transition-colors whitespace-nowrap cursor-pointer",
                          selectedSetting === setting.slug
                            ? "border-crimson bg-lotus-soft text-crimson font-medium"
                            : "border-hairline bg-ivory text-ink-soft hover:border-gold"
                        )}
                      >
                        {setting.label}
                      </button>
                    ))}
                  </>
                ) : (
                  <>
                    <span className="mr-1 text-[11px] font-medium uppercase tracking-[0.2em] text-gold-text">
                      Discipline
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedCategory("all")}
                      aria-pressed={selectedCategory === "all"}
                      className={cn(
                        "min-h-[36px] rounded-full border px-3 text-xs transition-colors whitespace-nowrap cursor-pointer",
                        selectedCategory === "all"
                          ? "border-crimson bg-lotus-soft text-crimson font-medium"
                          : "border-hairline bg-ivory text-ink-soft hover:border-gold"
                      )}
                    >
                      All Ateliers
                    </button>
                    {VENDOR_CATEGORIES.map((cat) => (
                      <button
                        key={cat.slug}
                        type="button"
                        onClick={() => setSelectedCategory(cat.slug)}
                        aria-pressed={selectedCategory === cat.slug}
                        className={cn(
                          "min-h-[36px] rounded-full border px-3 text-xs transition-colors whitespace-nowrap cursor-pointer",
                          selectedCategory === cat.slug
                            ? "border-crimson bg-lotus-soft text-crimson font-medium"
                            : "border-hairline bg-ivory text-ink-soft hover:border-gold"
                        )}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {mode === "venues" && (
                  <label className="inline-flex items-center gap-2 text-xs text-ink-soft">
                    <span className="uppercase tracking-[0.16em] text-[10px] text-gold-text font-medium">
                      Guests
                    </span>
                    <select
                      aria-label="Filter venues by guest count"
                      value={selectedGuestBand}
                      onChange={(e) =>
                        setSelectedGuestBand(e.target.value as GuestBand)
                      }
                      className="h-[36px] rounded-full border border-hairline bg-ivory px-3 text-xs text-ink cursor-pointer"
                    >
                      {GUEST_FILTERS.map((g) => (
                        <option key={g.value} value={g.value}>
                          {g.label}
                        </option>
                      ))}
                    </select>
                  </label>
                )}

                <button
                  type="button"
                  onClick={() => setShowSavedOnly((prev) => !prev)}
                  aria-pressed={showSavedOnly}
                  className={cn(
                    "inline-flex min-h-[36px] items-center gap-1.5 rounded-full border px-3.5 text-xs transition-colors whitespace-nowrap cursor-pointer",
                    showSavedOnly
                      ? "border-crimson bg-lotus-soft text-crimson font-medium"
                      : "border-hairline bg-ivory text-ink-soft hover:border-gold"
                  )}
                >
                  <Bookmark className="h-3.5 w-3.5" strokeWidth={1.5} />
                  <span className="tabular-nums">
                    Shortlist ({savedIds.length})
                  </span>
                </button>

                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="inline-flex min-h-[36px] items-center gap-1.5 rounded-full px-3 text-xs text-crimson hover:text-crimson-deep cursor-pointer whitespace-nowrap"
                  >
                    <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.5} />
                    <span>Reset</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Live Result Summary */}
        <div
          aria-live="polite"
          className="mt-6 flex items-center justify-between text-xs text-ink-soft"
        >
          <p className="tabular-nums">
            Showing <strong className="font-medium text-ink">{visibleCount}</strong>{" "}
            of {totalCount} verified{" "}
            {mode === "venues" ? "properties" : "ateliers"}
          </p>
          <p className="hidden sm:block text-gold-text uppercase tracking-[0.18em] text-[11px]">
            No public rates · Private concierge quotes only
          </p>
        </div>

        <GoldDivider compact />

        {/* Listing Grid or Empty State */}
        {visibleCount === 0 ? (
          <EmptyState
            title="No listing matches this exact filter."
            description="Many of our private royal estates and bespoke ateliers remain off-catalogue. Let our concierge curate a bespoke shortlist for your dates."
            actionLabel="Ask Our Concierge"
            onAction={() =>
              openEnquiry({
                interestType: mode === "venues" ? "venue" : "vendor",
                city: selectedCity === "all" ? "udaipur" : selectedCity,
                tier: selectedTier === "all" ? "royal" : selectedTier,
              })
            }
          />
        ) : mode === "venues" ? (
          <div
            data-testid="venues-grid"
            className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {filteredVenues.map((venue) => {
              const isSaved = savedIds.includes(venue.id);
              return (
                <article
                  key={venue.id}
                  data-hls-url={venue.hlsUrl}
                  data-preview-mp4={venue.previewMp4Url}
                  className="group relative flex flex-col rounded-[20px] border border-hairline-soft bg-glass p-4 shadow-soft transition-[transform,box-shadow] duration-700 ease-silk hover:-translate-y-2 hover:shadow-lift"
                >
                  <CornerBrackets />
                  <div className="relative">
                    <Link
                      href={`/venues/${venue.slug}`}
                      className="block focus-visible:outline-none"
                    >
                      <ArchImage
                        src={venue.posterUrl}
                        alt={venue.altText}
                        ratio="4/5"
                        gradient={venue.visualGradient}
                        caption={`${venue.city} · ${venue.setting}`}
                      />
                    </Link>
                    <button
                      type="button"
                      onClick={() => toggleSaved(venue.id)}
                      aria-pressed={isSaved}
                      aria-label={
                        isSaved
                          ? `Remove ${venue.name} from shortlist`
                          : `Save ${venue.name} to shortlist`
                      }
                      className={cn(
                        "absolute top-3 right-3 z-10 flex h-10 w-10 items-center justify-center rounded-full border bg-glass-strong transition-colors cursor-pointer",
                        isSaved
                          ? "border-crimson text-crimson"
                          : "border-hairline text-ink-soft hover:border-crimson hover:text-crimson"
                      )}
                    >
                      <Bookmark
                        className="h-4 w-4"
                        strokeWidth={1.5}
                        fill={isSaved ? "currentColor" : "none"}
                      />
                    </button>
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute bottom-3 left-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-glass-strong px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-ink-soft opacity-0 transition-opacity duration-500 ease-silk group-hover:opacity-100"
                    >
                      <Film className="h-3 w-3 text-gold-text" strokeWidth={1.5} />
                      <span>720p Preview</span>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-1 flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2 text-xs text-ink-soft">
                        <span>
                          {venue.city} · {venue.setting}
                        </span>
                        {venue.verified && (
                          <span className="inline-flex items-center gap-1 font-medium text-success">
                            <ShieldCheck
                              className="h-3.5 w-3.5"
                              strokeWidth={1.5}
                            />
                            Verified
                          </span>
                        )}
                      </div>
                      <h3 className="mt-1.5 font-display text-2xl font-medium leading-snug text-ink">
                        <Link
                          href={`/venues/${venue.slug}`}
                          className="hover:text-crimson transition-colors"
                        >
                          {venue.name}
                        </Link>
                      </h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
                        {venue.tagline}
                      </p>
                    </div>

                    <div className="mt-5 space-y-3 border-t border-hairline-soft pt-3.5">
                      <div className="flex items-center justify-between text-xs text-ink-soft">
                        <span className="tabular-nums">
                          {venue.capacityMin}–{venue.capacityMax} guests
                        </span>
                        <TierMarker tier={venue.tier} />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button
                          variant="secondary"
                          className="w-full"
                          onClick={() =>
                            openEnquiry({
                              interestType: "venue",
                              listingTitle: venue.name,
                              city: venue.citySlug,
                              tier: venue.tier,
                            })
                          }
                        >
                          Request Concierge Quote
                        </Button>
                        <Link
                          href={`/venues/${venue.slug}`}
                          className="inline-flex min-h-[36px] items-center justify-center gap-1 text-xs font-medium uppercase tracking-[0.16em] text-gold-text hover:text-crimson transition-colors"
                        >
                          <span>View Estate Showcase</span>
                          <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.5} />
                        </Link>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div
            data-testid="vendors-grid"
            className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3"
          >
            {filteredVendors.map((vendor) => {
              const isSaved = savedIds.includes(vendor.id);
              return (
                <article
                  key={vendor.id}
                  data-hls-url={vendor.hlsUrl}
                  data-preview-mp4={vendor.previewMp4Url}
                  className="group relative flex flex-col rounded-[20px] border border-hairline-soft bg-glass p-5 shadow-soft transition-[transform,box-shadow] duration-700 ease-silk hover:-translate-y-2 hover:shadow-lift"
                >
                  <CornerBrackets />
                  <div className="relative">
                    <Link
                      href={`/vendors/${vendor.slug}`}
                      className="block focus-visible:outline-none"
                    >
                      <ArchImage
                        src={vendor.posterUrl}
                        alt={vendor.altText}
                        ratio="4/3"
                        gradient={vendor.visualGradient}
                        caption={`${vendor.city} · ${vendor.category}`}
                      />
                    </Link>
                    <button
                      type="button"
                      onClick={() => toggleSaved(vendor.id)}
                      aria-pressed={isSaved}
                      aria-label={
                        isSaved
                          ? `Remove ${vendor.name} from shortlist`
                          : `Save ${vendor.name} to shortlist`
                      }
                      className={cn(
                        "absolute top-3 right-3 z-10 flex h-10 w-10 items-center justify-center rounded-full border bg-glass-strong transition-colors cursor-pointer",
                        isSaved
                          ? "border-crimson text-crimson"
                          : "border-hairline text-ink-soft hover:border-crimson hover:text-crimson"
                      )}
                    >
                      <Bookmark
                        className="h-4 w-4"
                        strokeWidth={1.5}
                        fill={isSaved ? "currentColor" : "none"}
                      />
                    </button>
                  </div>

                  <div className="mt-4 flex flex-1 flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2 text-xs text-ink-soft">
                        <span>
                          {vendor.category} · {vendor.city}
                        </span>
                        {vendor.verified && (
                          <span className="inline-flex items-center gap-1 font-medium text-success">
                            <ShieldCheck
                              className="h-3.5 w-3.5"
                              strokeWidth={1.5}
                            />
                            Verified
                          </span>
                        )}
                      </div>
                      <h3 className="mt-1.5 font-display text-2xl font-medium text-ink">
                        <Link
                          href={`/vendors/${vendor.slug}`}
                          className="hover:text-crimson transition-colors"
                        >
                          {vendor.name}
                        </Link>
                      </h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
                        {vendor.specialty}
                      </p>
                    </div>

                    <div className="mt-5 space-y-3 border-t border-hairline-soft pt-3.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-ink-soft">
                          Personally introduced
                        </span>
                        <TierMarker tier={vendor.tier} />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button
                          variant="secondary"
                          className="w-full"
                          onClick={() =>
                            openEnquiry({
                              interestType: "vendor",
                              listingTitle: vendor.name,
                              city: vendor.citySlug,
                              tier: vendor.tier,
                            })
                          }
                        >
                          Request Concierge Quote
                        </Button>
                        <Link
                          href={`/vendors/${vendor.slug}`}
                          className="inline-flex min-h-[36px] items-center justify-center gap-1 text-xs font-medium uppercase tracking-[0.16em] text-gold-text hover:text-crimson transition-colors"
                        >
                          <span>View Atelier Profile</span>
                          <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.5} />
                        </Link>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
