"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Search, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { InputField } from "@/components/ui/Field";
import { GoldDivider } from "@/components/ui/GoldDivider";
import { LotusBullet } from "@/components/ui/Ornaments";
import { StatusChip } from "@/components/ui/StatusChip";
import { useConcierge } from "@/components/concierge/ConciergeContext";
import { findPartnerStatusRecord } from "@/lib/data/filters";
import {
  partnerStatusLookupSchema,
  type PartnerStatusLookupValues,
} from "@/lib/validation/enquiry";
import type { PartnerStatusRecord } from "@/lib/data/types";

export function PartnerShowcase() {
  const { openPartnerDrawer, partnerRecords } = useConcierge();
  const [lookupResult, setLookupResult] = useState<PartnerStatusRecord | null>(
    null
  );
  const [lookupNotFound, setLookupNotFound] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PartnerStatusLookupValues>({
    resolver: zodResolver(partnerStatusLookupSchema),
    defaultValues: {
      referenceId: "",
      email: "",
    },
  });

  const onLookup = (values: PartnerStatusLookupValues) => {
    const match = findPartnerStatusRecord(
      partnerRecords,
      values.referenceId,
      values.email
    );
    if (match) {
      setLookupResult(match);
      setLookupNotFound(false);
    } else {
      setLookupResult(null);
      setLookupNotFound(true);
    }
  };

  return (
    <section
      id="partner-showcase"
      aria-label="Become a Partner Showcase"
      className="bg-blush/55 py-20 md:py-28 border-t border-hairline-soft"
    >
      <div className="mx-auto max-w-[1440px] px-6 md:px-10 lg:px-16">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-start">
          {/* Left Column: Editorial Partner Invitation */}
          <div className="lg:col-span-7 space-y-6">
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-gold-text">
              For Heritage Properties &amp; Master Ateliers
            </p>
            <h2
              className="font-display font-normal text-ink leading-[1.05] text-balance"
              style={{ fontSize: "var(--fs-h2)" }}
            >
              Curated, verified,{" "}
              <em className="italic text-crimson-deep">personally</em>{" "}
              introduced.
            </h2>
            <p className="max-w-[62ch] font-sans font-light text-base leading-[1.7] text-ink-soft">
              Every venue and wedding craft house on The Wedding Dreams enters
              by verification. We protect your rate cards, showcase your 4K
              editorial work, and introduce only qualified, concierge-vetted
              families.
            </p>

            {/* Verification Stage Preview */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <StatusChip status="pending_verification" />
              <span aria-hidden="true" className="text-gold">
                →
              </span>
              <StatusChip status="under_review" />
              <span aria-hidden="true" className="text-gold">
                →
              </span>
              <StatusChip status="approved" />
            </div>

            <ul className="space-y-3 pt-2 text-sm text-ink">
              <li className="flex items-start gap-3">
                <LotusBullet active className="mt-1" />
                <span>
                  Dedicated 4K HLS showcase with high-key editorial photography
                  and tier markers — never public discount bidding.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <LotusBullet className="mt-1" />
                <span>
                  Direct contact information, GST documents, and rate sheets
                  remain strictly confidential inside our private desk.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <LotusBullet className="mt-1" />
                <span>
                  Every submission remains Pending Verification until an Admin
                  approves and an Editor curates your public page.
                </span>
              </li>
            </ul>

            <div className="pt-3 flex flex-wrap items-center gap-4">
              <Button variant="primary" size="lg" onClick={openPartnerDrawer}>
                Become a Partner
                <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
              </Button>
              <span className="inline-flex items-center gap-1.5 text-xs text-ink-soft">
                <ShieldCheck
                  className="h-4 w-4 text-gold-text"
                  strokeWidth={1.5}
                />
                5-step verification intake · Zero public listing before approval
              </span>
            </div>
          </div>

          {/* Right Column: Check Partner Application Status (FR-20) */}
          <div className="lg:col-span-5">
            <div className="rounded-[24px] border border-hairline bg-ivory/90 p-6 md:p-8 shadow-soft">
              <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-gold-text">
                Applicant Desk · Track Status
              </p>
              <h3 className="mt-1.5 font-display text-3xl font-normal text-ink">
                Check your{" "}
                <em className="italic text-crimson-deep">verification</em>{" "}
                status.
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                Enter your reference ID and business email to view your current
                editorial review stage.
              </p>

              <form
                onSubmit={handleSubmit(onLookup)}
                className="mt-5 space-y-4"
                noValidate
              >
                <InputField
                  id="status-ref-id"
                  label="Application Reference ID"
                  placeholder="e.g. TWD-P1042"
                  error={errors.referenceId?.message}
                  {...register("referenceId")}
                />
                <InputField
                  id="status-email"
                  label="Official Business Email"
                  type="email"
                  placeholder="concierge-demo@example.com"
                  error={errors.email?.message}
                  {...register("email")}
                />
                <Button type="submit" variant="secondary" className="w-full">
                  <Search className="h-4 w-4" strokeWidth={1.5} />
                  Check Status
                </Button>
              </form>

              {lookupResult && (
                <div
                  aria-live="polite"
                  className="mt-5 rounded-2xl border border-hairline-soft bg-silk p-4 space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-display text-xl text-ink">
                      {lookupResult.brandName}
                    </span>
                    <StatusChip status={lookupResult.status} />
                  </div>
                  <p className="text-xs text-ink-soft tabular-nums">
                    Reference {lookupResult.referenceId} · Submitted{" "}
                    {lookupResult.submittedAt}
                  </p>
                  <p className="text-xs leading-relaxed text-ink">
                    {lookupResult.note}
                  </p>
                </div>
              )}

              {lookupNotFound && (
                <p
                  role="alert"
                  className="mt-4 rounded-xl border border-error/30 bg-blush/50 px-4 py-3 text-xs text-error"
                >
                  No application matched that reference ID and email. Please
                  check your confirmation note or submit a new partner
                  application.
                </p>
              )}

              <GoldDivider compact />
              <p className="text-[11px] text-ink-soft">
                Preview demo lookup:{" "}
                <span className="font-medium text-ink tabular-nums">
                  TWD-P1042
                </span>{" "}
                with{" "}
                <span className="font-medium text-ink">
                  concierge-demo@example.com
                </span>
                , or submit a new application above to test live.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
