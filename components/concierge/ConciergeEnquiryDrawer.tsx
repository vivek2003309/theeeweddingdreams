"use client";

import React, { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { InputField, SelectField } from "@/components/ui/Field";
import { GoldDivider } from "@/components/ui/GoldDivider";
import { TierMarker } from "@/components/ui/TierMarker";
import {
  conciergeEnquirySchema,
  type ConciergeEnquiryValues,
} from "@/lib/validation/enquiry";
import type { EnquiryPrefill } from "./ConciergeContext";

const DRAFT_KEY = "twd_enquiry_draft_v1";

interface ConciergeEnquiryDrawerProps {
  open: boolean;
  prefill?: EnquiryPrefill;
  onClose: () => void;
}

export function ConciergeEnquiryDrawer({
  open,
  prefill,
  onClose,
}: ConciergeEnquiryDrawerProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [referenceCode, setReferenceCode] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [briefResult, setBriefResult] = useState<string | null>(null);
  const [briefError, setBriefError] = useState<string | null>(null);
  const [isComposingBrief, setIsComposingBrief] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    trigger,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ConciergeEnquiryValues>({
    resolver: zodResolver(conciergeEnquirySchema),
    defaultValues: {
      interestType: "complete-wedding",
      listingTitle: "",
      city: "udaipur",
      celebrationDate: "November 2026",
      guestCount: "250-500",
      tier: "royal",
      briefNotes: "",
      fullName: "",
      email: "",
      phone: "",
      consent: false,
      humanVerified: false,
      websiteHoneypot: "",
    },
  });

  const watchedCity = useWatch({ control, name: "city" });
  const watchedDate = useWatch({ control, name: "celebrationDate" });
  const watchedGuestCount = useWatch({ control, name: "guestCount" });
  const watchedTier = useWatch({ control, name: "tier" });
  const watchedListingTitle = useWatch({ control, name: "listingTitle" });
  const watchedBriefNotes = useWatch({ control, name: "briefNotes" });
  const watchedFullName = useWatch({ control, name: "fullName" });
  const watchedEmail = useWatch({ control, name: "email" });
  const watchedHumanVerified = useWatch({ control, name: "humanVerified" });

  // Restore draft safely from sessionStorage
  useEffect(() => {
    try {
      const saved = window.sessionStorage.getItem(DRAFT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<ConciergeEnquiryValues>;
        if (parsed.fullName) setValue("fullName", parsed.fullName);
        if (parsed.email) setValue("email", parsed.email);
        if (parsed.briefNotes) setValue("briefNotes", parsed.briefNotes);
      }
    } catch {
      // Ignore storage access errors in sandboxed frames
    }
  }, [setValue]);

  // Apply prefill when opened
  useEffect(() => {
    if (!open) return;
    if (prefill?.interestType) setValue("interestType", prefill.interestType);
    if (prefill?.listingTitle !== undefined) {
      setValue("listingTitle", prefill.listingTitle);
    } else {
      setValue("listingTitle", "");
    }
    if (prefill?.city) setValue("city", prefill.city);
    if (prefill?.celebrationDate)
      setValue("celebrationDate", prefill.celebrationDate);
    if (prefill?.guestCount) setValue("guestCount", prefill.guestCount);
    if (prefill?.tier) setValue("tier", prefill.tier);
    if (prefill?.chapterName) {
      setValue(
        "briefNotes",
        `Enquiring around ${prefill.chapterName} orchestration.`
      );
    }
  }, [open, prefill, setValue]);

  // Save draft on key field changes
  useEffect(() => {
    try {
      window.sessionStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({
          fullName: watchedFullName,
          email: watchedEmail,
          briefNotes: watchedBriefNotes,
        })
      );
    } catch {
      // Ignore storage errors
    }
  }, [watchedFullName, watchedEmail, watchedBriefNotes]);

  // Escape key closes drawer
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const handleNextStep = async () => {
    if (step === 1) {
      const ok = await trigger(["city", "celebrationDate", "interestType"]);
      if (ok) setStep(2);
    } else if (step === 2) {
      const ok = await trigger(["guestCount", "tier"]);
      if (ok) setStep(3);
    }
  };

  const handleGenerateBrief = async () => {
    setBriefError(null);
    setBriefResult(null);
    const notes = watchedBriefNotes?.trim() || "";
    const promptText =
      notes.length >= 10
        ? notes
        : `Multi-day ${watchedTier} wedding in ${watchedCity} for ${watchedGuestCount} guests around ${watchedDate}.`;

    setIsComposingBrief(true);
    try {
      const res = await fetch("/api/concierge/brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          city: watchedCity,
          guestCount: watchedGuestCount,
          tier: watchedTier,
          chapters: ["Mehendi", "Sangeet", "Pheras", "Reception"],
          visionPrompt: promptText,
        }),
      });
      const data = (await res.json()) as { brief?: string; error?: string };
      if (!res.ok || !data.brief) {
        setBriefError(
          data.error ?? "Unable to compose celebration brief at this moment."
        );
      } else {
        setBriefResult(data.brief);
      }
    } catch {
      setBriefError("Could not reach the concierge brief service.");
    } finally {
      setIsComposingBrief(false);
    }
  };

  const onSubmit = async (data: ConciergeEnquiryValues) => {
    setSubmitError(null);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const payload = (await res.json()) as {
        referenceCode?: string;
        error?: string;
      };
      if (!res.ok || !payload.referenceCode) {
        setSubmitError(
          payload.error ?? "Unable to submit your enquiry right now."
        );
        return;
      }
      setReferenceCode(payload.referenceCode);
      try {
        window.sessionStorage.removeItem(DRAFT_KEY);
      } catch {
        // Ignore storage errors
      }
    } catch {
      setSubmitError("Could not reach the concierge desk right now.");
    }
  };

  const handleResetAndClose = () => {
    setReferenceCode(null);
    setSubmitError(null);
    setBriefResult(null);
    setBriefError(null);
    setStep(1);
    reset();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-labelledby="concierge-drawer-title"
    >
      {/* Light blush veil scrim — never dark */}
      <div
        className="fixed inset-0 bg-blush/65 backdrop-blur-sm transition-opacity duration-700 ease-silk"
        onClick={handleResetAndClose}
        aria-hidden="true"
      />

      <aside className="relative z-10 flex h-full w-full max-w-xl flex-col bg-glass-strong border-l border-hairline shadow-lift overflow-y-auto">
        <div className="flex items-start justify-between border-b border-hairline-soft px-6 py-6 md:px-8">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-gold-text">
              Private Concierge Desk
            </p>
            <h2
              id="concierge-drawer-title"
              className="mt-1 font-display text-3xl font-normal text-ink"
            >
              Begin your{" "}
              <span className="italic text-crimson-deep">conversation</span>
            </h2>
          </div>
          <button
            type="button"
            onClick={handleResetAndClose}
            aria-label="Close concierge enquiry drawer"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-hairline bg-ivory text-ink transition-colors hover:border-crimson hover:text-crimson cursor-pointer"
          >
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>

        {/* Step Indicator */}
        <div
          aria-live="polite"
          className="border-b border-hairline-soft bg-ivory/75 px-6 py-3 md:px-8"
        >
          <div className="flex items-center justify-between text-xs uppercase tracking-[0.16em] text-ink-soft">
            <span className={step === 1 ? "text-crimson font-medium" : ""}>
              01. Date &amp; City
            </span>
            <span aria-hidden="true" className="text-gold">
              ·
            </span>
            <span className={step === 2 ? "text-crimson font-medium" : ""}>
              02. Guests &amp; Tier
            </span>
            <span aria-hidden="true" className="text-gold">
              ·
            </span>
            <span className={step === 3 ? "text-crimson font-medium" : ""}>
              03. Contact
            </span>
          </div>
        </div>

        <div className="flex-1 px-6 py-6 md:px-8">
          {referenceCode ? (
            <div className="rounded-[20px] border border-hairline bg-ivory p-8 text-center shadow-soft">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-success/40 bg-blush text-success">
                <Check className="h-6 w-6" strokeWidth={1.5} />
              </div>
              <p className="text-xs uppercase tracking-[0.22em] text-gold-text">
                Enquiry Received
              </p>
              <h3 className="mt-2 font-display text-3xl text-ink">
                Our concierge holds the{" "}
                <span className="italic text-crimson-deep">details</span>.
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                Your private reference code is{" "}
                <strong className="font-medium text-ink tabular-nums">
                  {referenceCode}
                </strong>
                . A senior celebration director will introduce a curated
                shortlist within 24 hours. Partner contacts remain private and
                coordinated solely through our team.
              </p>
              <GoldDivider compact />
              <Button variant="primary" onClick={handleResetAndClose}>
                Return to Showcase
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
              {/* Honeypot field hidden from real users */}
              <input
                type="text"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="sr-only"
                {...register("websiteHoneypot")}
              />

              {step === 1 && (
                <div className="space-y-5">
                  <SelectField
                    id="enquiry-interest"
                    label="Celebration Scope"
                    error={errors.interestType?.message}
                    {...register("interestType")}
                  >
                    <option value="complete-wedding">
                      Complete Wedding Concierge
                    </option>
                    <option value="venue">Venue Shortlist &amp; Buyout</option>
                    <option value="vendor">Curated Vendor Atelier</option>
                  </SelectField>

                  <SelectField
                    id="enquiry-city"
                    label="Preferred Destination"
                    error={errors.city?.message}
                    {...register("city")}
                  >
                    <option value="udaipur">Udaipur — Lake Palaces</option>
                    <option value="jaipur">Jaipur — Heritage Havelis</option>
                    <option value="delhi-ncr">
                      Delhi NCR — Estate Pavilions
                    </option>
                    <option value="goa">Goa — Coastal Sanctuaries</option>
                    <option value="other">Other Heritage Destination</option>
                  </SelectField>

                  <InputField
                    id="enquiry-date"
                    label="Preferred Month or Dates"
                    placeholder="e.g. November 2026"
                    error={errors.celebrationDate?.message}
                    {...register("celebrationDate")}
                  />

                  {watchedListingTitle && (
                    <div className="rounded-xl border border-hairline-soft bg-blush/60 px-4 py-3 text-xs text-ink-soft">
                      Focused shortlist:{" "}
                      <span className="font-medium text-ink">
                        {watchedListingTitle}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {step === 2 && (
                <div className="space-y-5">
                  <SelectField
                    id="enquiry-guests"
                    label="Estimated Guest Gathering"
                    error={errors.guestCount?.message}
                    {...register("guestCount")}
                  >
                    <option value="under-100">Intimate — Under 100</option>
                    <option value="100-250">Gathered — 100 to 250</option>
                    <option value="250-500">Grand — 250 to 500</option>
                    <option value="500-plus">Royal Procession — 500+</option>
                  </SelectField>

                  <div>
                    <span className="block text-[11px] font-medium uppercase tracking-[0.2em] text-gold-text mb-2">
                      Celebration Tier
                    </span>
                    <div className="grid grid-cols-3 gap-2.5">
                      {(["classic", "grand", "royal"] as const).map(
                        (tierOption) => {
                          const selected = watchedTier === tierOption;
                          return (
                            <button
                              key={tierOption}
                              type="button"
                              onClick={() => setValue("tier", tierOption)}
                              className={`flex flex-col items-center justify-center rounded-xl border px-3 py-3 text-center transition-colors cursor-pointer ${
                                selected
                                  ? "border-crimson bg-lotus-soft/45"
                                  : "border-hairline bg-ivory hover:border-gold"
                              }`}
                            >
                              <TierMarker tier={tierOption} />
                            </button>
                          );
                        }
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="enquiry-notes"
                      className="text-[11px] font-medium uppercase tracking-[0.2em] text-gold-text"
                    >
                      Celebration Vision &amp; Multi-Day Notes
                    </label>
                    <textarea
                      id="enquiry-notes"
                      rows={3}
                      placeholder="Describe the atmosphere, rituals, or architectural feel you envision..."
                      className="w-full rounded-xl border border-hairline bg-ivory p-4 text-sm text-ink placeholder:text-ink-mute focus:outline-none"
                      {...register("briefNotes")}
                    />
                  </div>

                  {/* High-thinking Concierge Celebration Brief tool */}
                  <div className="rounded-[20px] border border-hairline-soft bg-silk p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-gold-text">
                          Concierge Celebration Architect
                        </p>
                        <p className="mt-0.5 text-xs text-ink-soft">
                          Draft an initial ritual &amp; venue cadence brief
                          before submitting.
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={handleGenerateBrief}
                        disabled={isComposingBrief}
                      >
                        <Sparkles className="h-3.5 w-3.5" strokeWidth={1.5} />
                        {isComposingBrief ? "Composing..." : "Draft Brief"}
                      </Button>
                    </div>
                    {briefError && (
                      <p role="alert" className="mt-3 text-xs text-error">
                        {briefError}
                      </p>
                    )}
                    {briefResult && (
                      <div className="mt-3 rounded-xl border border-hairline-soft bg-ivory p-4 text-xs leading-relaxed text-ink whitespace-pre-line">
                        {briefResult}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-5">
                  <InputField
                    id="enquiry-name"
                    label="Your Names"
                    placeholder="e.g. Ananya Sharma & Kabir Mehta"
                    error={errors.fullName?.message}
                    {...register("fullName")}
                  />

                  <InputField
                    id="enquiry-email"
                    label="Email Address"
                    type="email"
                    placeholder="couple@domain.com"
                    error={errors.email?.message}
                    {...register("email")}
                  />

                  <InputField
                    id="enquiry-phone"
                    label="Private Phone / WhatsApp"
                    type="tel"
                    placeholder="+91 98..."
                    error={errors.phone?.message}
                    {...register("phone")}
                  />

                  {/* Turnstile-style human verification check (mock-adapter ready) */}
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
                            : "Verify you are human (Concierge protection)"}
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

                  <label className="flex items-start gap-3 rounded-xl border border-hairline-soft bg-ivory p-4 text-xs leading-relaxed text-ink-soft cursor-pointer">
                    <input
                      type="checkbox"
                      className="mt-0.5 h-4 w-4 accent-crimson"
                      {...register("consent")}
                    />
                    <span>
                      I consent to The Wedding Dreams concierge team contacting
                      me regarding this shortlist. Partner contacts remain
                      private and curated through our concierge.
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

              <div className="flex items-center justify-between gap-3 pt-4 border-t border-hairline-soft">
                {step > 1 ? (
                  <Button
                    type="button"
                    variant="quiet"
                    onClick={() => setStep((s) => (s === 3 ? 2 : 1))}
                  >
                    <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
                    Back
                  </Button>
                ) : (
                  <span className="text-xs text-ink-soft">
                    Draft auto-saved privately
                  </span>
                )}

                {step < 3 ? (
                  <Button
                    type="button"
                    variant="primary"
                    onClick={handleNextStep}
                  >
                    Continue
                    <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Submitting..." : "Send to Concierge"}
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
