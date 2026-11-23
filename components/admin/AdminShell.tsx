"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  ClipboardCheck,
  Film,
  Kanban,
  LayoutDashboard,
  Lock,
  Menu,
  ShieldCheck,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  canAccessModule,
  type AdminModule,
  type StaffRole,
} from "@/lib/security/rbac";
import { useAdminStore } from "./AdminStoreContext";

const NAV_ITEMS: Array<{
  href: string;
  mod: AdminModule;
  label: string;
  description: string;
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  exact: boolean;
}> = [
  {
    href: "/admin",
    mod: "dashboard",
    label: "Dashboard",
    description: "KPIs & Governance",
    Icon: LayoutDashboard,
    exact: true,
  },
  {
    href: "/admin/hero",
    mod: "hero",
    label: "Hero Video Manager",
    description: "6-Chapter 4K Carousel",
    Icon: Film,
    exact: false,
  },
  {
    href: "/admin/applications",
    mod: "applications",
    label: "Partner Verification",
    description: "Approval Queue",
    Icon: ClipboardCheck,
    exact: false,
  },
  {
    href: "/admin/listings",
    mod: "listings",
    label: "Venues & Vendors",
    description: "7-Tab Listing Editor",
    Icon: Building2,
    exact: false,
  },
  {
    href: "/admin/leads",
    mod: "leads",
    label: "Leads Kanban",
    description: "Concierge Pipeline",
    Icon: Kanban,
    exact: false,
  },
];

const ROLE_OPTIONS: Array<{ value: StaffRole; label: string }> = [
  { value: "admin", label: "Admin" },
  { value: "editor", label: "Editor" },
  { value: "concierge", label: "Concierge" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { state, staffRole, staffProfile, setStaffRole, notice, clearNotice } =
    useAdminStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const pendingCount = state.applications.filter(
    (a) =>
      a.status === "pending_verification" ||
      a.status === "under_review" ||
      a.status === "needs_info"
  ).length;

  const newLeadsCount = state.leads.filter((l) => l.stage === "new").length;

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  const renderNavLinks = (onNavigate?: () => void) => (
    <nav aria-label="Admin CMS navigation" className="space-y-1.5">
      {NAV_ITEMS.map(({ href, mod, label, description, Icon, exact }) => {
        const active = isActive(href, exact);
        const permitted = canAccessModule(staffRole, mod);
        const badge =
          href === "/admin/applications" && pendingCount > 0
            ? pendingCount
            : href === "/admin/leads" && newLeadsCount > 0
              ? newLeadsCount
              : null;

        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 transition-colors duration-300",
              active
                ? "border-crimson/35 bg-ivory text-crimson shadow-soft"
                : permitted
                  ? "border-transparent text-ink-soft hover:border-hairline-soft hover:bg-ivory/70 hover:text-ink"
                  : "border-transparent text-ink-mute opacity-75 hover:bg-ivory/40"
            )}
          >
            <div className="flex items-center gap-3 min-w-0">
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0",
                  active
                    ? "text-crimson"
                    : permitted
                      ? "text-gold-text group-hover:text-crimson"
                      : "text-ink-mute"
                )}
                strokeWidth={1.5}
              />
              <div className="min-w-0">
                <p
                  className={cn(
                    "truncate text-sm font-medium",
                    active ? "text-crimson" : permitted ? "text-ink" : "text-ink-mute"
                  )}
                >
                  {label}
                </p>
                <p className="truncate text-[11px] text-ink-soft">
                  {permitted ? description : "Role-restricted"}
                </p>
              </div>
            </div>
            {!permitted ? (
              <Lock className="h-3.5 w-3.5 shrink-0 text-ink-mute" strokeWidth={1.5} />
            ) : (
              badge !== null && (
                <span className="inline-flex h-6 min-w-[24px] items-center justify-center rounded-full border border-crimson/30 bg-lotus-soft px-2 text-[11px] font-medium tabular-nums text-crimson">
                  {badge}
                </span>
              )
            )}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-ivory text-ink flex flex-col lg:flex-row">
      {/* Desktop Light Blush-Ivory Sidebar */}
      <aside className="hidden lg:flex lg:w-[296px] lg:shrink-0 lg:flex-col lg:justify-between border-r border-hairline-soft bg-blush/65 px-5 py-6">
        <div className="space-y-6">
          {/* Logo on Plinth */}
          <div className="border-b border-hairline-soft pb-5">
            <Link
              href="/admin"
              aria-label="The Wedding Dreams Admin CMS"
              className="relative inline-flex items-center justify-center px-3 py-1.5"
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -inset-x-3 -inset-y-1 bg-logo-plinth rounded-full"
              />
              <Image
                src="/assets/aistudio/logo-full-bg-rem_14e94079.png"
                alt="The Wedding Dreams"
                width={4344}
                height={1211}
                priority
                referrerPolicy="no-referrer"
                className="relative z-10 h-10 w-auto min-w-[136px] object-contain"
              />
            </Link>
            <div className="mt-3 flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.2em] text-gold-text">
              <ShieldCheck className="h-3.5 w-3.5 text-success" strokeWidth={1.5} />
              <span>Private Concierge CMS</span>
            </div>
          </div>

          {renderNavLinks()}
        </div>

        {/* Staff Role Card + RBAC Switcher + Return Link */}
        <div className="space-y-3 border-t border-hairline-soft pt-5">
          <div className="rounded-2xl border border-hairline-soft bg-ivory/90 p-3.5 space-y-2.5">
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-gold-text">
              Staff Session · TOTP 2FA Verified
            </p>
            <div>
              <p className="font-display text-lg text-ink leading-tight">
                {staffProfile.name}
              </p>
              <p className="text-xs text-ink-soft">{staffProfile.title}</p>
            </div>
            <div
              role="group"
              aria-label="Preview staff RBAC role"
              className="grid grid-cols-3 gap-0.5 rounded-full border border-hairline bg-blush/50 p-1"
            >
              {ROLE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setStaffRole(opt.value)}
                  aria-pressed={staffRole === opt.value}
                  className={cn(
                    "h-7 rounded-full px-1 text-[10px] font-medium tracking-[0.02em] transition-colors cursor-pointer truncate",
                    staffRole === opt.value
                      ? "bg-crimson text-ivory"
                      : "text-ink-soft hover:text-ink"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <Link
            href="/"
            className="flex min-h-[42px] items-center justify-center gap-2 rounded-full border border-hairline bg-ivory px-4 text-xs font-medium uppercase tracking-[0.14em] text-ink hover:border-crimson hover:text-crimson transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
            <span>View Public Showcase</span>
          </Link>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <div className="flex lg:hidden items-center justify-between border-b border-hairline-soft bg-glass-strong px-4 py-3 sticky top-0 z-30">
        <Link href="/admin" className="relative flex items-center px-2 py-1">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -inset-x-2 -inset-y-1 bg-logo-plinth rounded-full"
          />
          <Image
            src="/assets/aistudio/logo-full-bg-rem_14e94079.png"
            alt="The Wedding Dreams Admin"
            width={4344}
            height={1211}
            referrerPolicy="no-referrer"
            className="relative z-10 h-9 w-auto min-w-[122px] object-contain"
          />
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="rounded-full border border-hairline bg-ivory px-3 py-1.5 text-[11px] font-medium text-ink"
          >
            Public Site
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open admin menu"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-hairline bg-ivory text-ink cursor-pointer"
          >
            <Menu className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Mobile Light Ivory Drawer */}
      {mobileMenuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Admin navigation menu"
          className="fixed inset-0 z-50 flex flex-col bg-ivory lg:hidden overflow-y-auto p-5"
        >
          <div className="flex items-center justify-between border-b border-hairline-soft pb-4">
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-gold-text">
              Admin CMS Modules
            </span>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close admin menu"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-hairline bg-blush/50 text-ink cursor-pointer"
            >
              <X className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </div>
          <div className="mt-5 flex-1">
            {renderNavLinks(() => setMobileMenuOpen(false))}
          </div>
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="mt-6 flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-hairline bg-blush/60 text-xs font-medium uppercase tracking-[0.14em] text-ink"
          >
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
            <span>Return to Public Showcase</span>
          </Link>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col bg-ivory">
        {/* Global Feedback Banner */}
        {notice && (
          <div
            role="status"
            aria-live="polite"
            className="border-b border-hairline bg-silk px-6 py-3 flex items-center justify-between gap-4 text-sm text-ink"
          >
            <div className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="h-2 w-2 rounded-full bg-crimson"
              />
              <span>{notice}</span>
            </div>
            <button
              type="button"
              onClick={clearNotice}
              aria-label="Dismiss notification"
              className="text-xs font-medium uppercase tracking-[0.16em] text-crimson hover:text-crimson-deep cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        <main className="flex-1 mx-auto w-full max-w-[1320px] px-5 py-8 md:px-10 md:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
