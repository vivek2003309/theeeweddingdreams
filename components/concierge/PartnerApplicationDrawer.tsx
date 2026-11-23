"use client";

import React, { useEffect, useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ChevronLeft,
  ChevronRight,
  Film,
  Plus,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { InputField, SelectField } from "@/components/ui/Field";
import { StatusChip } from "@/components/ui/StatusChip";
import { TierMarker } from "@/components/ui/TierMarker";
import { GoldDivider } from "@/components/ui/GoldDivider";
import {
  partnerApplicationSchema,
  type PartnerApplicationValues,
} from "@/lib/validation/enquiry";
import type { PartnerStatusRecord } from "@/lib/data/types";

const PARTNER_DRAFT_KEY = "twd_partner_draft_v1";

const STEP_LABELS = [
  "01. Role",
  "02. Brand",
  "03. Portfolio",
  "04. Tier & Scale",
  "05. Verify",
] as const;

interface PartnerApplicationDrawerProps {
  open: boolean;
  onClose: () => void;
  onApplicationSubmitted?: (record: PartnerStatusRecord) => void;
}

export function PartnerApplicationDrawer({
  open,
  onClose,
  onApplicationSubmitted,
}: PartnerApplicationDrawerProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [submittedRecord, setSubmittedRecord] =
    useState<PartnerStatusRecord | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    trigger,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PartnerApplicationValues>({
    resolver: zodResolver(partnerApplicationSchema),
    defaultValues: {
      role: "venue-owner",
      brandName: "",
      city: "jaipur",
      categoryOrSetting: "Heritage Palace",
      yearsActive: "10+ years",
      brandSummary: "",
      portfolioLinks: [{ url: "" }],
      galleryNotes: "",
      tier: "grand",
      capacityBand: "250-500",
      contactName: "",
      email: "",
      phone: "",
      gstNumber: "",
      consent: false,
      humanVerified: false,
      websiteHoneypot: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "portfolioLinks",
  });

  const watchedRole = useWatch({ control, name: "role" });
  const watchedTier = useWatch({ control, name: "tier" });
  const watchedBrandName = useWatch({ control, name: "brandName" });
  const watchedEmail = useWatch({ control, name: "email" });
  const watchedHumanVerified = useWatch({ control, name: "humanVerified" });

  // Restore draft safely
  useEffect(() => {
    try {
      const saved = window.sessionStorage.getItem(PARTNER_DRAFT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<PartnerApplicationValues>;
        if (parsed.brandName) setValue("brandName", parsed.brandName);
        if (parsed.email) setValue("email", parsed.email);
      }
    } catch {
      // Ignore storage access errors
    }
  }, [setValue]);

  // Persist draft safely
  useEffect(() => {
    try {
      window.sessionStorage.setItem(
        PARTNER_DRAFT_KEY,
        JSON.stringify({
          brandName: watchedBrandName,
          email: watchedEmail,
        })
      );
    } catch {
      // Ignore storage access errors
    }
  }, [watchedBrandName, watchedEmail]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const advanceStep = async () => {
    if (step === 1) {
      const ok = await trigger(["role"]);
      if (ok) setStep(2);
    } else if (step === 2) {
      const ok = await trigger([
        "brandName",
        "city",
        "categoryOrSetting",
        "yearsActive",
        "brandSummary",
      ]);
      if (ok) setStep(3);
    } else if (step === 3) {
      const ok = await trigger(["portfolioLinks"]);
      if (ok) setStep(4);
    } else if (step === 4) {
      const ok = await trigger(["tier", "capacityBand"]);
      if (ok) setStep(5);
    }
  };

  const onSubmit = async (values: PartnerApplicationValues) => {
    setSubmitError(null);
    try {
      const res = await fetch("/api/partner/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const payload = (await res.json()) as {
        referenceId?: string;
        status?: "pending_verification";
        error?: string;
      };
      if (!res.ok || !payload.referenceId) {
        setSubmitError(
          payload.error ?? "Unable to receive your application right now."
        );
        return;
      }

      const record: PartnerStatusRecord = {
        referenceId: payload.referenceId,
        brandName: values.brandName,
        email: values.email,
        status: "pending_verification",
        submittedAt: new Date().toISOString().slice(0, 10),
        note: "Your portfolio and verification documents have entered the private editorial review queue.",
      };
      setSubmittedRecord(record);
      onApplicationSubmitted?.(record);
      try {
        window.sessionStorage.removeItem(PARTNER_DRAFT_KEY);
      } catch {
        // Ignore storage errors
      }
    } catch {
      setSubmitError("Unable to reach the verification desk right now.");
    }
  };

  const handleClose = () => {
    setSubmittedRecord(null);
    setSubmitError(null);
    setStep(1);
    reset();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-labelledby="partner-drawer-title"
    >
      <div
        className="fixed inset-0 bg-blush/65 backdrop-blur-sm transition-opacity duration-700 ease-silk"
        onClick={handleClose}
        aria-hidden="true"
      />
      <aside className="relative z-10 flex h-full w-full max-w-xl flex-col bg-glass-strong border-l border-hairline shadow-lift overflow-y-auto">
        <div className="flex items-start justify-between border-b border-hairline-soft px-6 py-6 md:px-8">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-gold-text">
              Partner Onboarding · Step {step} of 5
            </p>
            <h2
              id="partner-drawer-title"
              className="mt-1 font-display text-3xl font-normal text-ink"
            >
              Join our{" "}
              <span className="italic text-crimson-deep">curated</span> circle
            </h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close partner application drawer"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-hairline bg-ivory text-ink transition-colors hover:border-crimson hover:text-crimson cursor-pointer"
          >
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>

        {/* 5-Step Progress Strip */}
        <div
          aria-live="polite"
          className="border-b border-hairline-soft bg-ivory/75 px-6 py-3 md:px-8"
        >
          <div className="flex items-center justify-between gap-2 overflow-x-auto text-[11px] uppercase tracking-[0.12em] text-ink-soft">
            {STEP_LABELS.map((label, idx) => {
              const stepNum = idx + 1;
              return (
                <span
                  key={label}
                  className={
                    step === stepNum
                      ? "text-crimson font-medium whitespace-nowrap"
                      : step > stepNum
                        ? "text-gold-text whitespace-nowrap"
                        : "whitespace-nowrap"
                  }
                >
                  {label}
                </span>
              );
            })}
          </div>
        </div>

        <div className="flex-1 px-6 py-6 md:px-8">
          {submittedRecord ? (
            <div className="rounded-[20px] border border-hairline bg-ivory p-8 text-center shadow-soft">
              <div className="mx-auto mb-4 flex justify-center">
                <StatusChip status={submittedRecord.status} />
              </div>
              <h3 className="font-display text-3xl text-ink">
                Welcome to the{" "}
                <span className="italic text-crimson-deep">review</span> queue.
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                Reference ID{" "}
                <strong className="font-medium text-ink tabular-nums">
                  {submittedRecord.referenceId}
                </strong>{" "}
                for{" "}
                <span className="font-medium text-ink">
                  {submittedRecord.brandName}
                </span>
                . Nothing from your submission is published until approved by an
                Admin and curated by an Editor.
              </p>
              <p className="mt-2 text-xs text-ink-soft">
                You may check your live review status anytime using this
                reference ID and{" "}
                <span className="font-medium text-ink">
                  {submittedRecord.email}
                </span>
                .
              </p>
              <GoldDivider compact />
              <Button variant="primary" onClick={handleClose}>
                Return to Showcase
              </Button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-5"
              noValidate
            >
              <input
                type="text"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="sr-only"
                {...register("websiteHoneypot")}
              />

              {step === 1 && (
                <div className="space-y-4">
                  <p className="text-sm text-ink-soft">
                    Select how you represent your establishment or atelier.
                  </p>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {[
                      {
                        value: "venue-owner" as const,
                        title: "Venue Owner",
                        desc: "Heritage palaces, estates, havelis & coastal properties",
                      },
                      {
                        value: "vendor" as const,
                        title: "Curated Vendor",
                        desc: "Decor, cinema, couture, culinary & bespoke entertainment",
                      },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setValue("role", opt.value)}
                        className={`rounded-[20px] border p-5 text-left transition-colors cursor-pointer ${
                          watchedRole === opt.value
                            ? "border-crimson bg-lotus-soft/40"
                            : "border-hairline bg-ivory hover:border-gold"
                        }`}
                      >
                        <p className="font-display text-xl text-ink">
                          {opt.title}
                        </p>
                        <p className="mt-1 text-xs leading-relaxed text-ink-soft">
                          {opt.desc}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <InputField
                    id="partner-brand"
                    label="Venue or Studio Name"
                    placeholder="e.g. Suryagarh Heritage Pavilion"
                    error={errors.brandName?.message}
                    {...register("brandName")}
                  />
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <SelectField
                      id="partner-city"
                      label="Primary City"
                      error={errors.city?.message}
                      {...register("city")}
                    >
                      <option value="udaipur">Udaipur</option>
                      <option value="jaipur">Jaipur</option>
                      <option value="delhi-ncr">Delhi NCR</option>
                      <option value="goa">Goa</option>
                      <option value="other">Other City</option>
                    </SelectField>
                    <InputField
                      id="partner-years"
                      label="Years in Craft"
                      placeholder="e.g. 12 years"
                      error={errors.yearsActive?.message}
                      {...register("yearsActive")}
                    />
                  </div>
                  <InputField
                    id="partner-category"
                    label="Setting or Discipline"
                    placeholder="e.g. Heritage Palace or Decor & Florals"
                    error={errors.categoryOrSetting?.message}
                    {...register("categoryOrSetting")}
                  />
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="partner-summary"
                      className="text-[11px] font-medium uppercase tracking-[0.2em] text-gold-text"
                    >
                      Editorial Introduction
                    </label>
                    <textarea
                      id="partner-summary"
                      rows={3}
                      placeholder="Describe your architecture, craftsmanship, or hospitality signature..."
                      className="w-full rounded-xl border border-hairline bg-ivory p-4 text-sm text-ink placeholder:text-ink-mute"
                      {...register("brandSummary")}
                    />
                    {errors.brandSummary && (
                      <p role="alert" className="text-xs text-error">
                        {errors.brandSummary.message}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-gold-text">
                        4K Showreel &amp; Portfolio Links ({fields.length}/5)
                      </p>
                      <p className="mt-0.5 text-xs text-ink-soft">
                        Attach up to 5 high-resolution reel or editorial gallery
                        links for editorial verification.
                      </p>
                    </div>
                    {fields.length < 5 && (
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => append({ url: "" })}
                      >
                        <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
                        Add Reel
                      </Button>
                    )}
                  </div>

                  <div className="space-y-3">
                    {fields.map((field, index) => (
                      <div key={field.id} className="flex items-start gap-2">
                        <div className="flex-1">
                          <InputField
                            id={`partner-reel-${index}`}
                            label={`4K Reel / Gallery Link ${index + 1}`}
                            placeholder="https://vimeo.com/..."
                            error={errors.portfolioLinks?.[index]?.url?.message}
                            {...register(`portfolioLinks.${index}.url`)}
                          />
                        </div>
                        {fields.length > 1 && (
                          <button
                            type="button"
                            onClick={() => remove(index)}
                            aria-label={`Remove reel link ${index + 1}`}
                            className="mt-6 flex h-[52px] w-11 items-center justify-center rounded-xl border border-hairline bg-ivory text-ink-soft hover:border-crimson hover:text-crimson cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="rounded-xl border border-hairline-soft bg-silk p-4 text-xs text-ink-soft flex items-start gap-2.5">
                    <Film
                      className="h-4 w-4 text-gold-text shrink-0 mt-0.5"
                      strokeWidth={1.5}
                    />
                    <span>
                      Approved partners receive direct HLS 4K ingestion upload
                      access via our editorial studio.
                    </span>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-5">
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-gold-text mb-2">
                      Public Tier Positioning (Exact pricing remains private)
                    </p>
                    <div className="grid grid-cols-3 gap-2.5">
                      {(["classic", "grand", "royal"] as const).map(
                        (tierOpt) => (
                          <button
                            key={tierOpt}
                            type="button"
                            onClick={() => setValue("tier", tierOpt)}
                            className={`rounded-xl border p-4 text-center transition-colors cursor-pointer ${
                              watchedTier === tierOpt
                                ? "border-crimson bg-lotus-soft/45"
                                : "border-hairline bg-ivory hover:border-gold"
                            }`}
                          >
                            <TierMarker tier={tierOpt} />
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  <SelectField
                    id="partner-capacity"
                    label="Typical Celebration Scale"
                    error={errors.capacityBand?.message}
                    {...register("capacityBand")}
                  >
                    <option value="under-100">Intimate — Under 100 guests</option>
                    <option value="100-250">Gathered — 100 to 250 guests</option>
                    <option value="250-500">Grand — 250 to 500 guests</option>
                    <option value="500-plus">Royal — 500+ guests</option>
                  </SelectField>
                </div>
              )}

              {step === 5 && (
                <div className="space-y-4">
                  <InputField
                    id="partner-contact"
                    label="Authorized Representative"
                    placeholder="Full Name"
                    error={errors.contactName?.message}
                    {...register("contactName")}
                  />
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <InputField
                      id="partner-email"
                      label="Official Business Email"
                      type="email"
                      placeholder="director@property.com"
                      error={errors.email?.message}
                      {...register("email")}
                    />
                    <InputField
                      id="partner-phone"
                      label="Private Concierge Phone"
                      type="tel"
                      placeholder="+91 98..."
                      error={errors.phone?.message}
                      {...register("phone")}
                    />
                  </div>
                  <InputField
                    id="partner-gst"
                    label="GST / Business Registration ID"
                    placeholder="08AAACS1234A1Z5"
                    hint="Stored privately for Admin verification only — never shown publicly."
                    error={errors.gstNumber?.message}
                    {...register("gstNumber")}
                  />

                  <div className="rounded-xl border border-hairline bg-silk p-4">
                    <label className="flex items-center justify-between gap-3 cursor-pointer">
                      <span className="flex items-center gap-3 text-xs text-ink">
                        <input
                          type="checkbox"
                          className="h-4 w-4 accent-crimson"
                          {...register("humanVerified")}
                        />
                        <span>
                          {watchedHumanVerified
                            ? "Human verification confirmed"
                            : "Verify you are human (Partner verification check)"}
                        </span>
                      </span>
                      <ShieldCheck
                        className={`h-4 w-4 shrink-0 ${
                          watchedHumanVerified
                            ? "text-success"
                            : "text-gold-text"
                        }`}
                        strokeWidth={1.5}
                      />
                    </label>
                    {errors.humanVerified && (
                      <p role="alert" className="mt-2 text-xs text-error">
                        {errors.humanVerified.message}
                      </p>
                    )}
                  </div>

                  <label className="flex items-start gap-3 rounded-xl border border-hairline-soft bg-ivory p-4 text-xs text-ink-soft cursor-pointer">
                    <input
                      type="checkbox"
                      className="mt-0.5 h-4 w-4 accent-crimson"
                      {...register("consent")}
                    />
                    <span>
                      I acknowledge that all contact details, GST documents, and
                      rate cards remain strictly confidential within The Wedding
                      Dreams concierge network and enter{" "}
                      <strong>Pending Verification</strong> until approved.
                    </span>
                  </label>
                  {errors.consent && (
                    <p role="alert" className="text-xs text-error">
                      {errors.consent.message}
                    </p>
                  )}

                  {submitError && (
                    <p role="alert" className="text-xs text-error">
                      {submitError}
                    </p>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between border-t border-hairline-soft pt-4">
                {step > 1 ? (
                  <Button
                    type="button"
                    variant="quiet"
                    onClick={() =>
                      setStep((s) =>
                        s > 1 ? ((s - 1) as 1 | 2 | 3 | 4 | 5) : 1
                      )
                    }
                  >
                    <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
                    Back
                  </Button>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs text-ink-soft">
                    <ShieldCheck
                      className="h-4 w-4 text-gold-text"
                      strokeWidth={1.5}
                    />
                    Verified onboarding
                  </span>
                )}

                {step < 5 ? (
                  <Button type="button" variant="primary" onClick={advanceStep}>
                    Continue
                    <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Submitting..." : "Submit Application"}
                  </Button>
                )}
              </div>
            </form>
          )}
        </div>
      </aside>
    </div>
  );
}
