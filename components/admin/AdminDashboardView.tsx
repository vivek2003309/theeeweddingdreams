"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Building2,
  ClipboardCheck,
  Film,
  Kanban,
  Lock,
  ShieldCheck,
} from "lucide-react";
import { GoldDivider } from "@/components/ui/GoldDivider";
import { StatusChip } from "@/components/ui/StatusChip";
import { canViewAuditLog } from "@/lib/security/rbac";
import { useAdminStore } from "./AdminStoreContext";

export function AdminDashboardView() {
  const { state, staffRole } = useAdminStore();
  const showAudit = canViewAuditLog(staffRole);

  const pendingApps = state.applications.filter(
    (a) =>
      a.status === "pending_verification" ||
      a.status === "under_review" ||
      a.status === "needs_info"
  );
  const publishedHeroCount = state.heroSlides.filter((s) => s.isPublished).length;
  const activeLeadsCount = state.leads.filter((l) => l.stage !== "booked").length;
  const confirmedLeadsCount = state.leads.filter(
    (l) => l.stage === "booked"
  ).length;
  const publishedListingsCount =
    state.venues.filter((v) => v.vault.isPublished).length +
    state.vendors.filter((vd) => vd.vault.isPublished).length;

  const kpis = [
    {
      label: "Pending Partner Reviews",
      value: String(pendingApps.length),
      sub: `${state.applications.length} total applications`,
      href: "/admin/applications",
      Icon: ClipboardCheck,
    },
    {
      label: "Active Concierge Leads",
      value: String(activeLeadsCount),
      sub: `${confirmedLeadsCount} confirmed celebrations`,
      href: "/admin/leads",
      Icon: Kanban,
    },
    {
      label: "Published Directory",
      value: String(publishedListingsCount),
      sub: `${state.venues.length} venues · ${state.vendors.length} ateliers`,
      href: "/admin/listings",
      Icon: Building2,
    },
    {
      label: "Live Hero Chapters",
      value: `${publishedHeroCount}/${state.heroSlides.length}`,
      sub: "4K HLS adaptive playlists",
      href: "/admin/hero",
      Icon: Film,
    },
  ];

  const modules = [
    {
      title: "Hero Video Manager",
      description:
        "Reorder chapters, inspect 4K HLS transcode readiness, schedule seasonal windows, and preview the Processional Window.",
      href: "/admin/hero",
      cta: "Open Hero Manager",
    },
    {
      title: "Partner Verification Queue",
      description:
        "Inspect private GST credentials, 4K portfolio reels, complete the 4-point concierge checklist, and approve or request info.",
      href: "/admin/applications",
      cta: "Review Applications",
    },
    {
      title: "Venues & Vendors Editor",
      description:
        "Edit public showcase copy, capacity bands, amenities, SEO fields, and staff-only confidential contact/rate vaults.",
      href: "/admin/listings",
      cta: "Manage Directory",
    },
    {
      title: "Concierge Leads Kanban",
      description:
        "Advance couple enquiries across five stages, assign directors, and record private walkthrough notes.",
      href: "/admin/leads",
      cta: "Open Pipeline",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-gold-text">
            Operations Overview · Private Desk
          </p>
          <h1
            className="mt-1 font-display font-normal text-ink leading-[1.08]"
            style={{ fontSize: "var(--fs-h2)" }}
          >
            Concierge <em className="italic text-crimson-deep">command</em>{" "}
            dashboard.
          </h1>
        </div>
        <div className="inline-flex items-center gap-2 self-start rounded-full border border-hairline bg-silk px-4 py-2 text-xs text-ink-soft">
          <ShieldCheck className="h-4 w-4 text-success" strokeWidth={1.5} />
          <span>Public PII isolation active · Mock in-memory CMS</span>
        </div>
      </header>

      {/* KPI Strip */}
      <section aria-label="Key metrics" className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map(({ label, value, sub, href, Icon }) => (
          <Link
            key={label}
            href={href}
            className="group rounded-[20px] border border-hairline-soft bg-glass p-5 shadow-soft transition-[transform,box-shadow,border-color] duration-500 ease-silk hover:-translate-y-1 hover:border-gold hover:shadow-lift"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-gold-text">
                {label}
              </span>
              <Icon
                className="h-4 w-4 text-crimson transition-transform duration-300 group-hover:scale-110"
                strokeWidth={1.5}
              />
            </div>
            <p className="mt-3 font-display text-4xl font-medium tabular-nums text-ink">
              {value}
            </p>
            <p className="mt-1 text-xs text-ink-soft">{sub}</p>
          </Link>
        ))}
      </section>

      {/* Quick Module Launchers */}
      <section aria-label="CMS modules" className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {modules.map((mod) => (
          <div
            key={mod.href}
            className="flex flex-col justify-between rounded-[20px] border border-hairline-soft bg-blush/40 p-6"
          >
            <div>
              <h2 className="font-display text-2xl font-medium text-ink">
                {mod.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                {mod.description}
              </p>
            </div>
            <div className="mt-5">
              <Link
                href={mod.href}
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full border border-crimson/40 bg-ivory px-5 text-xs font-medium uppercase tracking-[0.14em] text-crimson hover:bg-crimson hover:text-ivory transition-colors"
              >
                <span>{mod.cta}</span>
                <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.5} />
              </Link>
            </div>
          </div>
        ))}
      </section>

      <GoldDivider compact />

      {/* Pending Applications Snapshot + Audit Log */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <section
          aria-label="Recent partner applications"
          className="lg:col-span-5 rounded-[20px] border border-hairline-soft bg-glass p-6 shadow-soft"
        >
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-gold-text">
                Verification Queue
              </p>
              <h2 className="mt-1 font-display text-2xl text-ink">
                Awaiting Review
              </h2>
            </div>
            <Link
              href="/admin/applications"
              className="text-xs font-medium uppercase tracking-[0.14em] text-crimson hover:text-crimson-deep"
            >
              View All →
            </Link>
          </div>

          <ul className="mt-5 space-y-3">
            {state.applications.slice(0, 4).map((app) => (
              <li
                key={app.id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-hairline-soft bg-ivory/85 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate font-display text-lg text-ink">
                    {app.brandName}
                  </p>
                  <p className="text-xs text-ink-soft">
                    {app.referenceId} · {app.city} · {app.categoryOrSetting}
                  </p>
                </div>
                <StatusChip status={app.status} />
              </li>
            ))}
          </ul>
        </section>

        <section
          aria-label="Live audit log"
          className="lg:col-span-7 rounded-[20px] border border-hairline-soft bg-glass p-6 shadow-soft"
        >
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-gold-text">
                Governance &amp; Traceability
              </p>
              <h2 className="mt-1 font-display text-2xl text-ink">
                Live Audit Log
              </h2>
            </div>
            <span className="text-xs tabular-nums text-ink-soft">
              {state.auditLog.length} recorded actions
            </span>
          </div>

          {showAudit ? (
            <div className="mt-5 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-hairline-soft text-[11px] uppercase tracking-[0.16em] text-gold-text">
                    <th className="pb-2.5 pr-4 font-medium">When</th>
                    <th className="pb-2.5 pr-4 font-medium">Staff</th>
                    <th className="pb-2.5 pr-4 font-medium">Action</th>
                    <th className="pb-2.5 font-medium">Target</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline-soft text-xs">
                  {state.auditLog.slice(0, 8).map((entry) => (
                    <tr key={entry.id}>
                      <td className="py-3 pr-4 whitespace-nowrap tabular-nums text-ink-soft">
                        {entry.timestamp}
                      </td>
                      <td className="py-3 pr-4 whitespace-nowrap">
                        <span className="font-medium text-ink">
                          {entry.actor}
                        </span>{" "}
                        <span className="text-ink-mute">({entry.role})</span>
                      </td>
                      <td className="py-3 pr-4 text-ink">{entry.action}</td>
                      <td className="py-3 text-ink-soft">{entry.target}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-hairline-soft bg-blush/40 p-5 text-sm text-ink-soft flex items-start gap-3">
              <Lock className="h-4 w-4 shrink-0 text-crimson mt-0.5" strokeWidth={1.5} />
              <p>
                Audit logs are restricted to <strong className="text-ink">Admin</strong>{" "}
                staff (SECURITY.md §2). Switch back to Admin in the sidebar to
                inspect governance records.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
