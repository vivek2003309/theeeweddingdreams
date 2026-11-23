"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Globe, Instagram, Mail, Youtube } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { GoldDivider } from "@/components/ui/GoldDivider";
import { useConcierge } from "@/components/concierge/ConciergeContext";
import { newsletterSchema, type NewsletterValues } from "@/lib/validation/enquiry";
import {
  LAUNCH_CITIES,
  VENDOR_CATEGORIES,
  VENUE_SETTINGS,
} from "@/lib/data/mockAdapter";

export function Footer() {
  const { openEnquiry, openPartnerDrawer } = useConcierge();
  const [subscribedEmail, setSubscribedEmail] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NewsletterValues>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (values: NewsletterValues) => {
    setSubmitError(null);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setSubmitError(data.error ?? "Unable to subscribe right now.");
        return;
      }
      setSubscribedEmail(values.email);
      reset();
    } catch {
      setSubmitError("Unable to reach our dispatch desk right now.");
    }
  };

  return (
    <footer className="bg-rose-deep text-ink border-t border-hairline">
      <div className="mx-auto max-w-[1440px] px-6 pt-16 pb-10 md:px-16 md:pt-20">
        {/* Top Editorial Row: White-glass Medallion Logo + Newsletter */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-5 flex flex-col items-start">
            <div className="inline-flex items-center justify-center rounded-[24px] bg-[rgba(255,255,255,0.85)] px-6 py-4 border border-hairline-soft shadow-soft">
              <Image
                src="/assets/aistudio/logo-full-bg-rem_14e94079.png"
                alt="The Wedding Dreams — A complete event solution"
                width={4344}
                height={1211}
                referrerPolicy="no-referrer"
                className="h-14 w-auto min-w-[168px] object-contain"
              />
            </div>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-ink-soft">
              One concierge team coordinating couple, family, venue, and every
              atelier — so your celebration unfolds in serene grace.
            </p>
            <p className="mt-2 font-devanagari text-xs text-gold-text">
              शुभ विवाह · Delhi NCR · Jaipur · Udaipur · Goa
            </p>
          </div>

          <div className="lg:col-span-7 rounded-[20px] border border-hairline-soft bg-ivory/75 p-6 md:p-8 shadow-soft">
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-gold-text">
              Seasonal Dispatches
            </p>
            <h2 className="mt-1 font-display text-2xl md:text-3xl font-normal text-ink">
              Receive private palace{" "}
              <span className="italic text-crimson-deep">introductions</span>.
            </h2>
            <p className="mt-1.5 text-sm text-ink-soft">
              Quarterly notes on newly verified estates, seasonal auspicious
              dates, and editorial wedding films.
            </p>

            {subscribedEmail ? (
              <div className="mt-5 flex items-center gap-2.5 rounded-xl border border-success/40 bg-ivory px-4 py-3 text-sm text-success">
                <Check className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                <span>
                  Welcome to the circle — notes will arrive at {subscribedEmail}.
                </span>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-start"
                noValidate
              >
                <div className="flex-1">
                  <label htmlFor="footer-newsletter-email" className="sr-only">
                    Email address for seasonal dispatches
                  </label>
                  <input
                    id="footer-newsletter-email"
                    type="email"
                    placeholder="your.name@domain.com"
                    aria-invalid={Boolean(errors.email)}
                    className="h-[48px] w-full rounded-full border border-hairline bg-ivory px-5 text-sm text-ink placeholder:text-ink-mute"
                    {...register("email")}
                  />
                  {errors.email && (
                    <p role="alert" className="mt-1.5 pl-4 text-xs text-error">
                      {errors.email.message}
                    </p>
                  )}
                  {submitError && (
                    <p role="alert" className="mt-1.5 pl-4 text-xs text-error">
                      {submitError}
                    </p>
                  )}
                </div>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isSubmitting}
                  className="h-[48px]"
                >
                  {isSubmitting ? "Joining..." : "Join Circle"}
                </Button>
              </form>
            )}
          </div>
        </div>

        <GoldDivider className="py-10" />

        {/* 5 Link Columns */}
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5">
          <div>
            <h3 className="text-[11px] font-medium uppercase tracking-[0.22em] text-gold-text">
              Destinations
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-ink-soft">
              {LAUNCH_CITIES.map((city) => (
                <li key={city.slug}>
                  <button
                    type="button"
                    onClick={() =>
                      openEnquiry({ interestType: "venue", city: city.slug })
                    }
                    className="hover:text-crimson transition-colors cursor-pointer text-left"
                  >
                    {city.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-[11px] font-medium uppercase tracking-[0.22em] text-gold-text">
              Venues
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-ink-soft">
              {VENUE_SETTINGS.slice(0, 4).map((s) => (
                <li key={s.slug}>
                  <button
                    type="button"
                    onClick={() =>
                      openEnquiry({
                        interestType: "venue",
                        listingTitle: s.label,
                      })
                    }
                    className="hover:text-crimson transition-colors cursor-pointer text-left"
                  >
                    {s.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-[11px] font-medium uppercase tracking-[0.22em] text-gold-text">
              Ateliers
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-ink-soft">
              {VENDOR_CATEGORIES.slice(0, 4).map((c) => (
                <li key={c.slug}>
                  <button
                    type="button"
                    onClick={() =>
                      openEnquiry({
                        interestType: "vendor",
                        listingTitle: c.label,
                      })
                    }
                    className="hover:text-crimson transition-colors cursor-pointer text-left"
                  >
                    {c.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-[11px] font-medium uppercase tracking-[0.22em] text-gold-text">
              Concierge
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-ink-soft">
              <li>
                <button
                  type="button"
                  onClick={() =>
                    openEnquiry({ interestType: "complete-wedding" })
                  }
                  className="hover:text-crimson transition-colors cursor-pointer text-left"
                >
                  Concierge Enquiry
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => openPartnerDrawer()}
                  className="hover:text-crimson transition-colors cursor-pointer text-left"
                >
                  Become a Partner
                </button>
              </li>
              <li>
                <a
                  href="#discovery-hub"
                  className="hover:text-crimson transition-colors"
                >
                  Curated Shortlists
                </a>
              </li>
              <li>
                <a
                  href="#procession-timeline"
                  className="hover:text-crimson transition-colors"
                >
                  The Procession
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-[11px] font-medium uppercase tracking-[0.22em] text-gold-text">
              House Standards
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-ink-soft">
              <li>
                <Link
                  href="/venues"
                  className="hover:text-crimson transition-colors"
                >
                  Venue Directory
                </Link>
              </li>
              <li>
                <Link
                  href="/vendors"
                  className="hover:text-crimson transition-colors"
                >
                  Atelier Directory
                </Link>
              </li>
              <li>
                <Link
                  href="/#partner-showcase"
                  className="hover:text-crimson transition-colors"
                >
                  Application Status
                </Link>
              </li>
              <li>
                <Link
                  href="/admin"
                  className="hover:text-crimson transition-colors font-medium text-ink"
                >
                  Admin CMS
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Social Strip & Cropped Brand Signature + Legal Row */}
        <div className="mt-12 flex flex-col gap-6 border-t border-hairline-soft pt-8 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            {[
              { label: "Instagram", Icon: Instagram },
              { label: "Cinema Films", Icon: Youtube },
              { label: "Destinations", Icon: Globe },
              { label: "Concierge Desk", Icon: Mail },
            ].map(({ label, Icon }) => (
              <button
                key={label}
                type="button"
                aria-label={label}
                onClick={() => openEnquiry()}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-hairline bg-ivory/80 text-ink-soft transition-colors hover:border-crimson hover:text-crimson cursor-pointer"
              >
                <Icon className="h-4 w-4" strokeWidth={1.5} />
              </button>
            ))}
          </div>

          <div className="text-left md:text-right">
            <p className="font-display text-xl italic text-crimson-deep">
              A complete event solution
            </p>
            <p className="mt-1 text-xs text-ink-soft">
              © {new Date().getFullYear()} The Wedding Dreams · Curated,
              verified, personally introduced.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
