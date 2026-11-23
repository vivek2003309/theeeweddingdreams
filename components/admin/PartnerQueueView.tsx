"use client";

import React, { useMemo, useState } from "react";
import {
  Check,
  ExternalLink,
  FileCheck2,
  Lock,
  MessageSquareWarning,
  ShieldCheck,
  X,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { StatusChip } from "@/components/ui/StatusChip";
import { TierMarker } from "@/components/ui/TierMarker";
import {
  canApproveApplications,
  canReadApplicationDocs,
} from "@/lib/security/rbac";
import { useAdminStore } from "./AdminStoreContext";
import type { AdminPartnerApplication } from "@/lib/admin/types";
import type { PartnerStatus } from "@/lib/data/types";

const STATUS_FILTERS: Array<{ value: PartnerStatus | "all"; label: string }> = [
  { value: "all", label: "All Applications" },
  { value: "pending_verification", label: "Pending Verification" },
  { value: "under_review", label: "Under Review" },
  { value: "needs_info", label: "Needs Info" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Declined" },
];

const CHECKLIST_ITEMS: Array<{
  key: keyof AdminPartnerApplication["checklist"];
  label: string;
}> = [
  {
    key: "gstVerified",
    label: "GSTIN & legal entity registration verified",
  },
  {
    key: "video4kReviewed",
    label: "Uncompressed 4K film / venue walkthrough reviewed",
  },
  {
    key: "highKeyImageryApproved",
    label: "Daylight, high-key imagery matches editorial palette",
  },
  {
    key: "hospitalityReferenceChecked",
    label: "Two past luxury family or palace references confirmed",
  },
];

export function PartnerQueueView() {
  const { state, staffRole, toggleChecklistItem, reviewApplication } =
    useAdminStore();
  const canApprove = canApproveApplications(staffRole);
  const canSeeDocs = canReadApplicationDocs(staffRole);
  const [filter, setFilter] = useState<PartnerStatus | "all">("all");
  const [activeAppId, setActiveAppId] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState<string>("");

  const filteredApps = useMemo(() => {
    if (filter === "all") return state.applications;
    return state.applications.filter((a) => a.status === filter);
  }, [state.applications, filter]);

  const activeApp = useMemo(
    () => state.applications.find((a) => a.id === activeAppId) ?? null,
    [state.applications, activeAppId]
  );

  const openDrawer = (app: AdminPartnerApplication) => {
    setActiveAppId(app.id);
    setNotesDraft(app.reviewerNotes);
  };

  const handleDecision = (nextStatus: PartnerStatus) => {
    if (!activeApp) return;
    reviewApplication(activeApp.id, nextStatus, notesDraft);
    setActiveAppId(null);
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-gold-text">
            Partner Verification Queue · Concierge Gatekeeping
          </p>
          <h1
            className="mt-1 font-display font-normal text-ink leading-[1.08]"
            style={{ fontSize: "var(--fs-h2)" }}
          >
            Partner <em className="italic text-crimson-deep">verification</em>{" "}
            dossiers.
          </h1>
          <p className="mt-1.5 text-sm text-ink-soft">
            Every venue and atelier undergoes manual verification before
            entering our public directory. Private GST and direct contacts never
            leave this workspace.
          </p>
        </div>
      </header>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-2">
        {STATUS_FILTERS.map((f) => {
          const count =
            f.value === "all"
              ? state.applications.length
              : state.applications.filter((a) => a.status === f.value).length;
          return (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              aria-pressed={filter === f.value}
              className={cn(
                "min-h-[38px] rounded-full border px-4 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap",
                filter === f.value
                  ? "border-crimson bg-lotus-soft text-crimson"
                  : "border-hairline bg-ivory text-ink-soft hover:border-gold hover:text-ink"
              )}
            >
              {f.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Applications Table */}
      <div className="overflow-x-auto rounded-[20px] border border-hairline-soft bg-glass shadow-soft">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-hairline-soft bg-blush/45 text-[11px] uppercase tracking-[0.16em] text-gold-text">
              <th className="px-5 py-3.5 font-medium">Reference</th>
              <th className="px-5 py-3.5 font-medium">Partner &amp; Role</th>
              <th className="px-5 py-3.5 font-medium">City &amp; Discipline</th>
              <th className="px-5 py-3.5 font-medium">Tier</th>
              <th className="px-5 py-3.5 font-medium">Checklist</th>
              <th className="px-5 py-3.5 font-medium">Status</th>
              <th className="px-5 py-3.5 font-medium text-right">Review</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline-soft">
            {filteredApps.map((app) => {
              const completedChecks = Object.values(app.checklist).filter(
                Boolean
              ).length;
              return (
                <tr
                  key={app.id}
                  className="hover:bg-blush/25 transition-colors"
                >
                  <td className="px-5 py-4 whitespace-nowrap text-xs font-medium tabular-nums text-gold-text">
                    {app.referenceId}
                    <span className="block text-[11px] font-normal text-ink-mute">
                      {app.submittedAt}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-display text-lg font-medium text-ink">
                      {app.brandName}
                    </p>
                    <p className="text-xs text-ink-soft">
                      {app.role === "venue-owner"
                        ? "Venue Estate"
                        : "Creative Atelier"}
                    </p>
                  </td>
                  <td className="px-5 py-4 text-xs text-ink-soft">
                    <span className="font-medium text-ink">{app.city}</span>
                    <span className="block">{app.categoryOrSetting}</span>
                  </td>
                  <td className="px-5 py-4">
                    <TierMarker tier={app.tier} />
                  </td>
                  <td className="px-5 py-4 text-xs tabular-nums text-ink-soft">
                    {completedChecks} / 4 verified
                  </td>
                  <td className="px-5 py-4">
                    <StatusChip status={app.status} />
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Button
                      variant="secondary"
                      onClick={() => openDrawer(app)}
                      className="min-h-[38px] px-4 text-xs"
                    >
                      Review Dossier
                    </Button>
                  </td>
                </tr>
              );
            })}
            {filteredApps.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-12 text-center text-sm text-ink-soft"
                >
                  No partner applications match this status filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Light Blush-Ivory ReviewDrawer */}
      {activeApp && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Review ${activeApp.brandName}`}
          className="fixed inset-0 z-50 flex justify-end bg-[rgba(253,238,242,0.72)] backdrop-blur-md"
        >
          <div className="flex h-full w-full max-w-2xl flex-col border-l border-hairline bg-ivory shadow-lift overflow-hidden">
            {/* Drawer Header */}
            <div className="flex items-start justify-between gap-4 border-b border-hairline-soft bg-blush/50 px-6 py-5">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-gold-text tabular-nums">
                    {activeApp.referenceId}
                  </span>
                  <StatusChip status={activeApp.status} />
                </div>
                <h2 className="mt-1.5 font-display text-3xl text-ink">
                  {activeApp.brandName}
                </h2>
                <p className="text-xs text-ink-soft">
                  {activeApp.city} · {activeApp.categoryOrSetting} · Capacity{" "}
                  {activeApp.capacityBand}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveAppId(null)}
                aria-label="Close review drawer"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-hairline bg-ivory text-ink hover:border-crimson hover:text-crimson cursor-pointer"
              >
                <X className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              {/* Confidential Staff-Only Private Vault (Admin Only per SECURITY.md §2) */}
              {canSeeDocs ? (
                <section className="rounded-[20px] border border-crimson/25 bg-blush/45 p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-crimson">
                      <Lock className="h-3.5 w-3.5" strokeWidth={1.5} />
                      <span>Staff-Only Private Vault (Admin)</span>
                    </div>
                    <span className="rounded-full border border-crimson/30 bg-ivory px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.14em] text-crimson">
                      Never Public
                    </span>
                  </div>

                  <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-xs">
                    <div className="rounded-xl border border-hairline-soft bg-ivory/85 p-3">
                      <dt className="text-gold-text uppercase tracking-[0.14em] text-[10px]">
                        Primary Contact
                      </dt>
                      <dd className="mt-1 font-medium text-ink">
                        {activeApp.privateContactName}
                      </dd>
                    </div>
                    <div className="rounded-xl border border-hairline-soft bg-ivory/85 p-3">
                      <dt className="text-gold-text uppercase tracking-[0.14em] text-[10px]">
                        GSTIN Registration
                      </dt>
                      <dd className="mt-1 font-medium tabular-nums text-ink">
                        {activeApp.privateGstNumber}
                      </dd>
                    </div>
                    <div className="rounded-xl border border-hairline-soft bg-ivory/85 p-3">
                      <dt className="text-gold-text uppercase tracking-[0.14em] text-[10px]">
                        Direct Email
                      </dt>
                      <dd className="mt-1 text-ink">{activeApp.privateEmail}</dd>
                    </div>
                    <div className="rounded-xl border border-hairline-soft bg-ivory/85 p-3">
                      <dt className="text-gold-text uppercase tracking-[0.14em] text-[10px]">
                        Direct Phone / WhatsApp
                      </dt>
                      <dd className="mt-1 tabular-nums text-ink">
                        {activeApp.privatePhone}
                      </dd>
                    </div>
                  </dl>

                  {/* Watermarked Document Stub */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-silk px-3 py-1 text-[11px] text-ink">
                      <FileCheck2
                        className="h-3.5 w-3.5 text-gold-text"
                        strokeWidth={1.5}
                      />
                      <span>GST_Certificate_Watermarked.pdf (Staff Preview)</span>
                    </span>
                    {activeApp.portfolioUrls.map((url, i) => (
                      <span
                        key={url}
                        className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-ivory px-3 py-1 text-[11px] text-ink-soft"
                      >
                        <ExternalLink className="h-3 w-3 text-gold-text" strokeWidth={1.5} />
                        <span>4K Reel #{i + 1}</span>
                      </span>
                    ))}
                  </div>
                </section>
              ) : (
                <section className="rounded-[20px] border border-hairline bg-silk/80 p-5 space-y-2 text-xs text-ink-soft">
                  <p className="inline-flex items-center gap-1.5 font-medium uppercase tracking-[0.16em] text-crimson">
                    <Lock className="h-3.5 w-3.5" strokeWidth={1.5} />
                    <span>GST &amp; Contact Vault Restricted to Admin</span>
                  </p>
                  <p>
                    Your current role can review portfolio links only. Direct
                    phone, email, and verification PDFs are redacted per
                    SECURITY.md §2.
                  </p>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {activeApp.portfolioUrls.map((url, i) => (
                      <span
                        key={url}
                        className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-ivory px-3 py-1 text-[11px] text-ink-soft"
                      >
                        <ExternalLink className="h-3 w-3 text-gold-text" strokeWidth={1.5} />
                        <span>4K Reel #{i + 1}</span>
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {/* 4-Point Verification Checklist */}
              <section className="space-y-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck
                    className="h-4 w-4 text-gold-text"
                    strokeWidth={1.5}
                  />
                  <h3 className="font-display text-2xl text-ink">
                    Concierge Verification Checklist
                  </h3>
                </div>
                <div className="space-y-2.5">
                  {CHECKLIST_ITEMS.map((item) => {
                    const checked = activeApp.checklist[item.key];
                    return (
                      <label
                        key={item.key}
                        className={cn(
                          "flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm cursor-pointer transition-colors",
                          checked
                            ? "border-success/40 bg-silk/70 text-ink"
                            : "border-hairline-soft bg-ivory text-ink-soft hover:border-hairline"
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() =>
                            toggleChecklistItem(activeApp.id, item.key)
                          }
                          className="h-4 w-4 accent-crimson cursor-pointer"
                        />
                        <span>{item.label}</span>
                      </label>
                    );
                  })}
                </div>
              </section>

              {/* Reviewer Notes */}
              <section className="space-y-2">
                <label
                  htmlFor="partner-reviewer-notes"
                  className="block text-xs font-medium uppercase tracking-[0.16em] text-gold-text"
                >
                  Internal Reviewer Notes &amp; Email Dispatch Context
                </label>
                <textarea
                  id="partner-reviewer-notes"
                  rows={3}
                  value={notesDraft}
                  onChange={(e) => setNotesDraft(e.target.value)}
                  placeholder="Record verification observations or missing documentation details..."
                  className="w-full rounded-2xl border border-hairline bg-ivory p-3.5 text-sm text-ink placeholder:text-ink-mute"
                />
              </section>
            </div>

            {/* Sticky Action Bar */}
            <div className="border-t border-hairline-soft bg-blush/40 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
              {canApprove ? (
                <>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => handleDecision("needs_info")}
                    >
                      <MessageSquareWarning
                        className="h-4 w-4"
                        strokeWidth={1.5}
                      />
                      <span>Request Info</span>
                    </Button>
                    <button
                      type="button"
                      onClick={() => handleDecision("rejected")}
                      className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-crimson/40 bg-ivory px-4 text-xs font-medium uppercase tracking-[0.12em] text-crimson hover:bg-lotus-soft transition-colors cursor-pointer"
                    >
                      <XCircle className="h-4 w-4" strokeWidth={1.5} />
                      <span>Decline</span>
                    </button>
                  </div>

                  <Button
                    variant="primary"
                    onClick={() => handleDecision("approved")}
                  >
                    <Check className="h-4 w-4" strokeWidth={1.5} />
                    <span>Approve &amp; Create Draft</span>
                  </Button>
                </>
              ) : (
                <p className="text-xs text-ink-soft">
                  Approval, info requests, and declines require the{" "}
                  <strong className="text-ink">Admin</strong> role.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
