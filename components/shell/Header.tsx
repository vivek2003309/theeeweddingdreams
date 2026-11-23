"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { ArchImage } from "@/components/ui/ArchImage";
import { LotusBullet } from "@/components/ui/Ornaments";
import { useMotionContext } from "@/components/motion/MotionProvider";
import { useConcierge } from "@/components/concierge/ConciergeContext";
import {
  LAUNCH_CITIES,
  VENDOR_CATEGORIES,
  VENUE_SETTINGS,
} from "@/lib/data/mockAdapter";

type MegaMenuKind = "venues" | "vendors" | null;

const GUEST_BANDS = [
  { label: "Intimate · Under 100", value: "under-100" as const },
  { label: "Gathered · 100–250", value: "100-250" as const },
  { label: "Grand · 250–500", value: "250-500" as const },
  { label: "Royal · 500+", value: "500-plus" as const },
];

export function Header() {
  const { scrollY, scrollDirection, scrollTo } = useMotionContext();
  const { openEnquiry, openPartnerDrawer } = useConcierge();

  const [activeMega, setActiveMega] = useState<MegaMenuKind>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const headerRef = useRef<HTMLElement | null>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isScrolled = scrollY > 40;
  const isHidden =
    scrollDirection === "down" &&
    scrollY > 160 &&
    activeMega === null &&
    !mobileOpen;

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveMega(null);
        setMobileOpen(false);
      }
    };
    const onClickOutside = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setActiveMega(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onClickOutside);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onClickOutside);
    };
  }, []);

  const scheduleCloseMega = () => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    closeTimeoutRef.current = setTimeout(() => {
      setActiveMega(null);
    }, 180);
  };

  const cancelCloseMega = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  const handleAnchorClick = (selector: string) => {
    setActiveMega(null);
    setMobileOpen(false);
    scrollTo(selector);
  };

  return (
    <>
      <header
        ref={headerRef}
        onMouseLeave={scheduleCloseMega}
        onMouseEnter={cancelCloseMega}
        className={cn(
          "fixed top-0 left-0 right-0 z-40 transition-[transform,background-color,border-color,box-shadow] duration-700 ease-silk",
          isHidden ? "-translate-y-full" : "translate-y-0",
          isScrolled
            ? "bg-[rgba(255,255,255,0.82)] border-b border-hairline-soft shadow-soft"
            : "bg-[rgba(255,255,255,0.62)] border-b border-hairline-soft/60",
          "backdrop-blur-[18px]"
        )}
      >
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-5 py-2.5 md:px-10 lg:px-16">
          {/* Logo on Plinth — exact uploaded logo never recoloured or stretched */}
          <Link
            href="/"
            aria-label="The Wedding Dreams — Home"
            className="relative flex shrink-0 items-center justify-center px-3 py-1.5"
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -inset-x-4 -inset-y-1.5 bg-logo-plinth rounded-full"
            />
            <Image
              src="/assets/aistudio/logo-full-bg-rem_14e94079.png"
              alt="The Wedding Dreams — A complete event solution"
              width={4344}
              height={1211}
              priority
              referrerPolicy="no-referrer"
              className="relative z-10 h-10 w-auto min-w-[132px] md:h-12 lg:h-[54px] lg:min-w-[168px] object-contain"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav
            aria-label="Primary navigation"
            className="hidden lg:flex items-center gap-7 text-[0.875rem] font-normal tracking-[0.04em] text-ink"
          >
            <button
              type="button"
              aria-expanded={activeMega === "venues"}
              aria-controls="mega-menu-venues"
              onMouseEnter={() => {
                cancelCloseMega();
                setActiveMega("venues");
              }}
              onClick={() =>
                setActiveMega((prev) => (prev === "venues" ? null : "venues"))
              }
              className={cn(
                "inline-flex items-center gap-1.5 py-2 whitespace-nowrap shrink-0 transition-colors duration-300 cursor-pointer",
                activeMega === "venues"
                  ? "text-crimson"
                  : "text-ink hover:text-crimson"
              )}
            >
              <span>Venues</span>
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 transition-transform duration-500 ease-silk",
                  activeMega === "venues" && "rotate-180"
                )}
                strokeWidth={1.5}
              />
            </button>

            <button
              type="button"
              aria-expanded={activeMega === "vendors"}
              aria-controls="mega-menu-vendors"
              onMouseEnter={() => {
                cancelCloseMega();
                setActiveMega("vendors");
              }}
              onClick={() =>
                setActiveMega((prev) => (prev === "vendors" ? null : "vendors"))
              }
              className={cn(
                "inline-flex items-center gap-1.5 py-2 whitespace-nowrap shrink-0 transition-colors duration-300 cursor-pointer",
                activeMega === "vendors"
                  ? "text-crimson"
                  : "text-ink hover:text-crimson"
              )}
            >
              <span>Vendors</span>
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 transition-transform duration-500 ease-silk",
                  activeMega === "vendors" && "rotate-180"
                )}
                strokeWidth={1.5}
              />
            </button>

            <button
              type="button"
              onClick={() => handleAnchorClick("#editorial-teasers")}
              className="py-2 whitespace-nowrap shrink-0 text-ink hover:text-crimson transition-colors duration-300 cursor-pointer"
            >
              Real Weddings
            </button>
            <button
              type="button"
              onClick={() => handleAnchorClick("#signature-decor")}
              className="py-2 whitespace-nowrap shrink-0 text-ink hover:text-crimson transition-colors duration-300 cursor-pointer"
            >
              Journal
            </button>
            <button
              type="button"
              onClick={() => handleAnchorClick("#procession-timeline")}
              className="py-2 whitespace-nowrap shrink-0 text-ink hover:text-crimson transition-colors duration-300 cursor-pointer"
            >
              Our Concierge
            </button>
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden lg:flex items-center gap-3 shrink-0">
            <Button
              variant="secondary"
              onClick={() => {
                setActiveMega(null);
                openEnquiry();
              }}
            >
              Concierge Enquiry
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setActiveMega(null);
                openPartnerDrawer();
              }}
            >
              Become a Partner
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={mobileOpen}
            className="flex lg:hidden h-11 w-11 items-center justify-center rounded-full border border-hairline bg-ivory text-ink transition-colors hover:border-crimson hover:text-crimson cursor-pointer"
          >
            <Menu className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>

        {/* Venues Mega-Menu */}
        {activeMega === "venues" && (
          <div
            id="mega-menu-venues"
            role="region"
            aria-label="Venues directory"
            onMouseEnter={cancelCloseMega}
            className="hidden lg:block border-t border-hairline-soft bg-[rgba(255,249,250,0.96)] backdrop-blur-[18px] shadow-lift"
          >
            <div className="mx-auto grid max-w-[1440px] grid-cols-12 gap-8 px-16 py-10">
              <div className="col-span-3 space-y-3">
                <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-gold-text">
                  By Setting
                </p>
                <ul className="space-y-2.5">
                  {VENUE_SETTINGS.map((setting) => (
                    <li key={setting.slug}>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveMega(null);
                          openEnquiry({
                            interestType: "venue",
                            listingTitle: setting.label,
                          });
                        }}
                        className="group flex items-start gap-2.5 text-left cursor-pointer"
                      >
                        <LotusBullet className="mt-1 opacity-70 group-hover:opacity-100" />
                        <span>
                          <span className="block text-sm font-medium text-ink group-hover:text-crimson transition-colors">
                            {setting.label}
                          </span>
                          <span className="block text-xs text-ink-soft">
                            {setting.description}
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="col-span-3 space-y-3 border-l border-hairline-soft pl-8">
                <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-gold-text">
                  By City
                </p>
                <ul className="space-y-3">
                  {LAUNCH_CITIES.map((city) => (
                    <li key={city.slug}>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveMega(null);
                          openEnquiry({
                            interestType: "venue",
                            city: city.slug,
                          });
                        }}
                        className="group text-left cursor-pointer"
                      >
                        <span className="block font-display text-lg text-ink group-hover:text-crimson transition-colors">
                          {city.name}
                        </span>
                        <span className="block text-xs text-ink-soft">
                          {city.regionLabel}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="col-span-3 space-y-3 border-l border-hairline-soft pl-8">
                <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-gold-text">
                  By Guest Count
                </p>
                <ul className="space-y-3">
                  {GUEST_BANDS.map((band) => (
                    <li key={band.value}>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveMega(null);
                          openEnquiry({
                            interestType: "venue",
                            guestCount: band.value,
                          });
                        }}
                        className="text-sm text-ink hover:text-crimson transition-colors cursor-pointer"
                      >
                        {band.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="col-span-3 space-y-3">
                <Link
                  href="/venues/aravalli-marble-courtyard"
                  onClick={() => setActiveMega(null)}
                  className="group block rounded-[20px] border border-hairline-soft bg-blush/50 p-4 transition-colors hover:border-gold"
                >
                  <ArchImage
                    src="/placeholder/venues/udaipur-palace.jpg"
                    alt="Aravalli Marble Courtyard in Udaipur"
                    ratio="4/3"
                    caption="Udaipur · Heritage Palace"
                  />
                  <p className="mt-3 font-display text-lg text-ink group-hover:text-crimson transition-colors">
                    Aravalli Marble Courtyard
                  </p>
                  <p className="mt-0.5 text-xs text-ink-soft">
                    Private island ceremonial ghats · ◇◇◇ Royal
                  </p>
                </Link>
                <Link
                  href="/venues"
                  onClick={() => setActiveMega(null)}
                  className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.16em] text-crimson hover:text-crimson-deep transition-colors"
                >
                  <span>Browse all 12 Venues →</span>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Vendors Mega-Menu */}
        {activeMega === "vendors" && (
          <div
            id="mega-menu-vendors"
            role="region"
            aria-label="Vendors directory"
            onMouseEnter={cancelCloseMega}
            className="hidden lg:block border-t border-hairline-soft bg-[rgba(255,249,250,0.96)] backdrop-blur-[18px] shadow-lift"
          >
            <div className="mx-auto grid max-w-[1440px] grid-cols-12 gap-8 px-16 py-10">
              <div className="col-span-8">
                <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.22em] text-gold-text">
                  Curated Craft Disciplines
                </p>
                <div className="grid grid-cols-2 gap-5">
                  {VENDOR_CATEGORIES.map((category) => (
                    <button
                      key={category.slug}
                      type="button"
                      onClick={() => {
                        setActiveMega(null);
                        openEnquiry({
                          interestType: "vendor",
                          listingTitle: category.label,
                        });
                      }}
                      className="group flex items-start gap-3 rounded-xl border border-hairline-soft bg-ivory/80 p-4 text-left transition-colors hover:border-hairline hover:bg-blush/40 cursor-pointer"
                    >
                      <LotusBullet className="mt-1" />
                      <span>
                        <span className="block font-display text-xl text-ink group-hover:text-crimson transition-colors">
                          {category.label}
                        </span>
                        <span className="mt-0.5 block text-xs leading-relaxed text-ink-soft">
                          {category.description}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="col-span-4 space-y-3 border-l border-hairline-soft pl-8">
                <Link
                  href="/vendors/atelier-kamala-florals"
                  onClick={() => setActiveMega(null)}
                  className="group block rounded-[20px] border border-hairline-soft bg-silk/80 p-4 transition-colors hover:border-gold"
                >
                  <ArchImage
                    src="/placeholder/vendors/kamala.jpg"
                    alt="Atelier Kamala Florals lotus mandap"
                    ratio="4/3"
                    caption="Jaipur · Decor & Florals"
                    gradient="linear-gradient(155deg, #FDEEF2 0%, #FFF9FA 60%, #FAF5EE 100%)"
                  />
                  <p className="mt-3 font-display text-lg text-ink group-hover:text-crimson transition-colors">
                    Atelier Kamala Florals
                  </p>
                  <p className="mt-0.5 text-xs text-ink-soft">
                    Curated, verified, personally introduced · ◇◇◇ Royal
                  </p>
                </Link>
                <Link
                  href="/vendors"
                  onClick={() => setActiveMega(null)}
                  className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.16em] text-crimson hover:text-crimson-deep transition-colors"
                >
                  <span>Browse all 18 Ateliers →</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Mobile Full-Screen Ivory Sheet */}
      {mobileOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation menu"
          className="fixed inset-0 z-50 flex flex-col bg-ivory lg:hidden overflow-y-auto"
        >
          <div className="flex items-center justify-between border-b border-hairline-soft px-5 py-3">
            <div className="relative flex items-center px-2 py-1">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -inset-x-3 -inset-y-1 bg-logo-plinth rounded-full"
              />
              <Image
                src="/assets/aistudio/logo-full-bg-rem_14e94079.png"
                alt="The Wedding Dreams"
                width={4344}
                height={1211}
                referrerPolicy="no-referrer"
                className="relative z-10 h-10 w-auto min-w-[132px] object-contain"
              />
            </div>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="Close navigation menu"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-hairline bg-blush/50 text-ink cursor-pointer"
            >
              <X className="h-5 w-5" strokeWidth={1.5} />
            </button>
          </div>

          <div className="flex-1 space-y-8 px-6 py-8">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-gold-text">
                Venues by City
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2.5">
                {LAUNCH_CITIES.map((city) => (
                  <button
                    key={city.slug}
                    type="button"
                    onClick={() => {
                      setMobileOpen(false);
                      openEnquiry({ interestType: "venue", city: city.slug });
                    }}
                    className="min-h-[44px] rounded-xl border border-hairline-soft bg-blush/40 px-4 py-2.5 text-left font-display text-lg text-ink"
                  >
                    {city.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-gold-text">
                Vendor Disciplines
              </p>
              <div className="mt-3 space-y-2">
                {VENDOR_CATEGORIES.map((cat) => (
                  <button
                    key={cat.slug}
                    type="button"
                    onClick={() => {
                      setMobileOpen(false);
                      openEnquiry({
                        interestType: "vendor",
                        listingTitle: cat.label,
                      });
                    }}
                    className="flex min-h-[44px] w-full items-center gap-2.5 border-b border-hairline-soft py-2 text-left text-base text-ink"
                  >
                    <LotusBullet />
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Link
                href="/venues"
                onClick={() => setMobileOpen(false)}
                className="flex min-h-[44px] items-center font-display text-2xl text-ink hover:text-crimson"
              >
                All Venues
              </Link>
              <Link
                href="/vendors"
                onClick={() => setMobileOpen(false)}
                className="flex min-h-[44px] items-center font-display text-2xl text-ink hover:text-crimson"
              >
                All Verified Ateliers
              </Link>
              <button
                type="button"
                onClick={() => handleAnchorClick("#procession-timeline")}
                className="min-h-[44px] text-left font-display text-2xl text-ink"
              >
                The Procession
              </button>
              <button
                type="button"
                onClick={() => handleAnchorClick("#editorial-teasers")}
                className="min-h-[44px] text-left font-display text-2xl text-ink"
              >
                Real Weddings &amp; Journal
              </button>
            </div>
          </div>

          {/* Pinned CTAs in Mobile Sheet */}
          <div className="sticky bottom-0 flex flex-col gap-3 border-t border-hairline-soft bg-glass-strong px-6 py-5">
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => {
                setMobileOpen(false);
                openEnquiry();
              }}
            >
              Concierge Enquiry
            </Button>
            <Button
              variant="primary"
              className="w-full"
              onClick={() => {
                setMobileOpen(false);
                openPartnerDrawer();
              }}
            >
              Become a Partner
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
