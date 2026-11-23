"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Eye,
  Film,
  Lock,
  Plus,
  Save,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ArchImage } from "@/components/ui/ArchImage";
import { Button } from "@/components/ui/Button";
import { TierMarker } from "@/components/ui/TierMarker";
import {
  LAUNCH_CITIES,
  VENDOR_CATEGORIES,
  VENUE_SETTINGS,
} from "@/lib/data/mockAdapter";
import { getCityNameFromSlug } from "@/lib/admin/storeLogic";
import {
  canEditListings,
  canReadPrivateVault,
  canWritePrivateVault,
} from "@/lib/security/rbac";
import { useAdminStore } from "./AdminStoreContext";
import type { AdminVendorRecord, AdminVenueRecord } from "@/lib/admin/types";
import type {
  BudgetTier,
  CitySlug,
  VendorCategorySlug,
  VenueSettingSlug,
} from "@/lib/data/types";

type EditorTab =
  | "basics"
  | "capacity"
  | "media"
  | "amenities"
  | "private"
  | "seo"
  | "preview";

const EDITOR_TABS: Array<{ id: EditorTab; label: string }> = [
  { id: "basics", label: "Basics" },
  { id: "capacity", label: "Capacity & Tier" },
  { id: "media", label: "Media" },
  { id: "amenities", label: "Amenities" },
  { id: "private", label: "Private Details" },
  { id: "seo", label: "SEO" },
  { id: "preview", label: "Preview" },
];

export function ListingsEditorView() {
  const {
    state,
    staffRole,
    updateVenue,
    createVenue,
    updateVendor,
    createVendor,
  } = useAdminStore();

  const allowEdit = canEditListings(staffRole);
  const allowReadPrivate = canReadPrivateVault(staffRole);
  const allowWritePrivate = canWritePrivateVault(staffRole);

  const [kind, setKind] = useState<"venues" | "vendors">("venues");
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<EditorTab>("basics");
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [venueDraft, setVenueDraft] = useState<AdminVenueRecord>(
    () => state.venues[0]
  );
  const [vendorDraft, setVendorDraft] = useState<AdminVendorRecord>(
    () => state.vendors[0]
  );

  // Create form state
  const [newName, setNewName] = useState("");
  const [newCity, setNewCity] = useState<CitySlug>("udaipur");
  const [newSettingSlug, setNewSettingSlug] =
    useState<VenueSettingSlug>("heritage-palace");
  const [newCategorySlug, setNewCategorySlug] =
    useState<VendorCategorySlug>("decor-florals");
  const [newTier, setNewTier] = useState<BudgetTier>("royal");
  const [newSummary, setNewSummary] = useState("");

  // Amenity addition input
  const [newAmenity, setNewAmenity] = useState("");

  const filteredVenues = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return state.venues;
    return state.venues.filter(
      (v) =>
        v.name.toLowerCase().includes(q) ||
        v.city.toLowerCase().includes(q) ||
        v.setting.toLowerCase().includes(q)
    );
  }, [state.venues, search]);

  const filteredVendors = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return state.vendors;
    return state.vendors.filter(
      (v) =>
        v.name.toLowerCase().includes(q) ||
        v.city.toLowerCase().includes(q) ||
        v.category.toLowerCase().includes(q)
    );
  }, [state.vendors, search]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (kind === "venues") {
      updateVenue(venueDraft);
    } else {
      updateVendor(vendorDraft);
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    if (kind === "venues") {
      const settingObj =
        VENUE_SETTINGS.find((s) => s.slug === newSettingSlug) ??
        VENUE_SETTINGS[0];
      const created = createVenue({
        name: newName,
        citySlug: newCity,
        setting: settingObj.label,
        settingSlug: settingObj.slug,
        capacityMin: 120,
        capacityMax: 400,
        tier: newTier,
        tagline:
          newSummary.trim() ||
          "Private sunlit heritage estate curated for multi-day royal celebrations.",
      });
      setVenueDraft(created);
    } else {
      const catObj =
        VENDOR_CATEGORIES.find((c) => c.slug === newCategorySlug) ??
        VENDOR_CATEGORIES[0];
      const created = createVendor({
        name: newName,
        citySlug: newCity,
        category: catObj.label,
        categorySlug: catObj.slug,
        tier: newTier,
        specialty:
          newSummary.trim() ||
          "Bespoke high-craft wedding artistry vetted by our concierge.",
      });
      setVendorDraft(created);
    }
    setNewName("");
    setNewSummary("");
    setShowCreateForm(false);
    setActiveTab("basics");
  };

  const currentVault = kind === "venues" ? venueDraft.vault : vendorDraft.vault;

  const updateCurrentVault = (
    patch: Partial<AdminVenueRecord["vault"]>
  ) => {
    if (kind === "venues") {
      setVenueDraft((prev) => ({
        ...prev,
        vault: { ...prev.vault, ...patch },
      }));
    } else {
      setVendorDraft((prev) => ({
        ...prev,
        vault: { ...prev.vault, ...patch },
      }));
    }
  };

  const addAmenity = () => {
    const clean = newAmenity.trim();
    if (!clean) return;
    updateCurrentVault({ amenities: [...currentVault.amenities, clean] });
    setNewAmenity("");
  };

  const removeAmenity = (label: string) => {
    updateCurrentVault({
      amenities: currentVault.amenities.filter((a) => a !== label),
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-gold-text">
            Directory CMS · 7-Tab Showcase &amp; Vault Editor
          </p>
          <h1
            className="mt-1 font-display font-normal text-ink leading-[1.08]"
            style={{ fontSize: "var(--fs-h2)" }}
          >
            Venues &amp; <em className="italic text-crimson-deep">ateliers</em>{" "}
            editor.
          </h1>
          <p className="mt-1.5 text-sm text-ink-soft">
            Edit public showcase narratives while keeping direct contacts,
            buyout rate bands, and commission notes isolated inside the
            staff-only vault.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div
            role="tablist"
            aria-label="Listing directory type"
            className="inline-flex items-center gap-1 rounded-full border border-hairline bg-blush/60 p-1"
          >
            <button
              type="button"
              role="tab"
              aria-selected={kind === "venues"}
              onClick={() => setKind("venues")}
              className={cn(
                "min-h-[38px] rounded-full px-4 text-xs font-medium uppercase tracking-[0.14em] cursor-pointer transition-colors",
                kind === "venues"
                  ? "bg-crimson text-ivory"
                  : "text-ink-soft hover:text-ink"
              )}
            >
              Venues ({state.venues.length})
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={kind === "vendors"}
              onClick={() => setKind("vendors")}
              className={cn(
                "min-h-[38px] rounded-full px-4 text-xs font-medium uppercase tracking-[0.14em] cursor-pointer transition-colors",
                kind === "vendors"
                  ? "bg-crimson text-ivory"
                  : "text-ink-soft hover:text-ink"
              )}
            >
              Vendors ({state.vendors.length})
            </button>
          </div>

          <Button
            variant="primary"
            onClick={() => setShowCreateForm((prev) => !prev)}
          >
            <Plus className="h-4 w-4" strokeWidth={1.5} />
            <span>New {kind === "venues" ? "Venue" : "Vendor"}</span>
          </Button>
        </div>
      </header>

      {/* Inline Create Draft Form */}
      {showCreateForm && (
        <form
          onSubmit={handleCreate}
          className="rounded-[20px] border border-gold bg-silk/90 p-6 shadow-soft space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl text-ink">
              Create Draft {kind === "venues" ? "Venue Estate" : "Creative Atelier"}
            </h2>
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="text-xs uppercase tracking-[0.14em] text-ink-soft hover:text-crimson cursor-pointer"
            >
              Cancel
            </button>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <label className="block space-y-1.5 text-xs md:col-span-2">
              <span className="font-medium uppercase tracking-[0.14em] text-gold-text">
                Display Name
              </span>
              <input
                type="text"
                required
                placeholder={
                  kind === "venues"
                    ? "e.g., Suryagarh Mirror Pavilion"
                    : "e.g., Atelier Nilambari Drapery"
                }
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="h-11 w-full rounded-xl border border-hairline bg-ivory px-3.5 text-sm text-ink"
              />
            </label>
            <label className="block space-y-1.5 text-xs">
              <span className="font-medium uppercase tracking-[0.14em] text-gold-text">
                City
              </span>
              <select
                value={newCity}
                onChange={(e) => setNewCity(e.target.value as CitySlug)}
                className="h-11 w-full rounded-xl border border-hairline bg-ivory px-3 text-sm text-ink"
              >
                {LAUNCH_CITIES.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block space-y-1.5 text-xs">
              <span className="font-medium uppercase tracking-[0.14em] text-gold-text">
                Tier
              </span>
              <select
                value={newTier}
                onChange={(e) => setNewTier(e.target.value as BudgetTier)}
                className="h-11 w-full rounded-xl border border-hairline bg-ivory px-3 text-sm text-ink"
              >
                <option value="classic">◇ Classic</option>
                <option value="grand">◇◇ Grand</option>
                <option value="royal">◇◇◇ Royal</option>
              </select>
            </label>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {kind === "venues" ? (
              <label className="block space-y-1.5 text-xs">
                <span className="font-medium uppercase tracking-[0.14em] text-gold-text">
                  Venue Setting
                </span>
                <select
                  value={newSettingSlug}
                  onChange={(e) =>
                    setNewSettingSlug(e.target.value as VenueSettingSlug)
                  }
                  className="h-11 w-full rounded-xl border border-hairline bg-ivory px-3 text-sm text-ink"
                >
                  {VENUE_SETTINGS.map((s) => (
                    <option key={s.slug} value={s.slug}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </label>
            ) : (
              <label className="block space-y-1.5 text-xs">
                <span className="font-medium uppercase tracking-[0.14em] text-gold-text">
                  Craft Discipline
                </span>
                <select
                  value={newCategorySlug}
                  onChange={(e) =>
                    setNewCategorySlug(e.target.value as VendorCategorySlug)
                  }
                  className="h-11 w-full rounded-xl border border-hairline bg-ivory px-3 text-sm text-ink"
                >
                  {VENDOR_CATEGORIES.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <label className="block space-y-1.5 text-xs md:col-span-2">
              <span className="font-medium uppercase tracking-[0.14em] text-gold-text">
                Editorial Tagline / Specialty
              </span>
              <input
                type="text"
                value={newSummary}
                onChange={(e) => setNewSummary(e.target.value)}
                placeholder="One luminous sentence describing the showcase experience"
                className="h-11 w-full rounded-xl border border-hairline bg-ivory px-3.5 text-sm text-ink"
              />
            </label>
          </div>
          <div className="flex justify-end">
            <Button type="submit" variant="primary">
              Create Draft Record
            </Button>
          </div>
        </form>
      )}

      {/* Master-Detail Split */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left: Searchable Directory Selector */}
        <aside className="lg:col-span-4 space-y-3">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gold-text"
              strokeWidth={1.5}
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search ${kind}...`}
              aria-label={`Search ${kind}`}
              className="h-11 w-full rounded-full border border-hairline bg-ivory pl-10 pr-4 text-sm text-ink placeholder:text-ink-mute"
            />
          </div>

          <div className="max-h-[620px] overflow-y-auto space-y-2 pr-1">
            {kind === "venues"
              ? filteredVenues.map((v) => {
                  const selected = venueDraft.id === v.id;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setVenueDraft(v)}
                      className={cn(
                        "w-full rounded-2xl border p-3.5 text-left transition-colors cursor-pointer",
                        selected
                          ? "border-crimson/50 bg-blush/55 shadow-soft"
                          : "border-hairline-soft bg-glass hover:border-hairline"
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] uppercase tracking-[0.14em] text-gold-text">
                          {v.city} · {v.setting}
                        </span>
                        <span
                          className={cn(
                            "text-[10px] font-medium uppercase tracking-[0.12em]",
                            v.vault.isPublished
                              ? "text-success"
                              : "text-ink-mute"
                          )}
                        >
                          {v.vault.isPublished ? "Published" : "Draft"}
                        </span>
                      </div>
                      <p className="mt-1 font-display text-lg text-ink">
                        {v.name}
                      </p>
                      <div className="mt-1.5 flex items-center justify-between text-xs text-ink-soft">
                        <span className="tabular-nums">
                          {v.capacityMin}–{v.capacityMax} guests
                        </span>
                        <TierMarker tier={v.tier} />
                      </div>
                    </button>
                  );
                })
              : filteredVendors.map((vd) => {
                  const selected = vendorDraft.id === vd.id;
                  return (
                    <button
                      key={vd.id}
                      type="button"
                      onClick={() => setVendorDraft(vd)}
                      className={cn(
                        "w-full rounded-2xl border p-3.5 text-left transition-colors cursor-pointer",
                        selected
                          ? "border-crimson/50 bg-blush/55 shadow-soft"
                          : "border-hairline-soft bg-glass hover:border-hairline"
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] uppercase tracking-[0.14em] text-gold-text">
                          {vd.city} · {vd.category}
                        </span>
                        <span
                          className={cn(
                            "text-[10px] font-medium uppercase tracking-[0.12em]",
                            vd.vault.isPublished
                              ? "text-success"
                              : "text-ink-mute"
                          )}
                        >
                          {vd.vault.isPublished ? "Published" : "Draft"}
                        </span>
                      </div>
                      <p className="mt-1 font-display text-lg text-ink">
                        {vd.name}
                      </p>
                      <div className="mt-1.5 flex items-center justify-between text-xs text-ink-soft">
                        <span>{vd.category}</span>
                        <TierMarker tier={vd.tier} />
                      </div>
                    </button>
                  );
                })}
          </div>
        </aside>

        {/* Right: 7-Tab Editor */}
        <section
          aria-label="Listing 7-tab editor"
          className="lg:col-span-8 rounded-[24px] border border-hairline-soft bg-glass p-6 shadow-soft flex flex-col justify-between"
        >
          <form onSubmit={handleSave} className="space-y-6">
            {/* Title + Public Link */}
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-hairline-soft pb-4">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-gold-text">
                  Editing {kind === "venues" ? "Venue Estate" : "Verified Atelier"}
                </p>
                <h2 className="mt-1 font-display text-3xl text-ink">
                  {kind === "venues" ? venueDraft.name : vendorDraft.name}
                </h2>
              </div>
              <Link
                href={
                  kind === "venues"
                    ? `/venues/${venueDraft.slug}`
                    : `/vendors/${vendorDraft.slug}`
                }
                className="inline-flex min-h-[38px] items-center gap-1.5 rounded-full border border-hairline bg-ivory px-4 text-xs font-medium text-ink hover:border-crimson hover:text-crimson transition-colors"
              >
                <Eye className="h-3.5 w-3.5" strokeWidth={1.5} />
                <span>Public Detail Page</span>
                <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.5} />
              </Link>
            </div>

            {/* 7 Tab Bar */}
            <div
              role="tablist"
              aria-label="Listing editor sections"
              className="flex flex-wrap gap-1.5 border-b border-hairline-soft pb-4"
            >
              {EDITOR_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "inline-flex min-h-[36px] items-center gap-1.5 rounded-full border px-3.5 text-xs font-medium cursor-pointer transition-colors",
                    activeTab === tab.id
                      ? "border-crimson bg-lotus-soft text-crimson"
                      : "border-hairline bg-ivory text-ink-soft hover:border-gold hover:text-ink"
                  )}
                >
                  {tab.id === "private" && (
                    <Lock className="h-3 w-3" strokeWidth={1.5} />
                  )}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* TAB 1: BASICS */}
            {activeTab === "basics" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <label className="block space-y-1.5 text-xs">
                    <span className="font-medium uppercase tracking-[0.14em] text-gold-text">
                      Listing Name
                    </span>
                    <input
                      type="text"
                      value={
                        kind === "venues" ? venueDraft.name : vendorDraft.name
                      }
                      onChange={(e) =>
                        kind === "venues"
                          ? setVenueDraft((p) => ({
                              ...p,
                              name: e.target.value,
                            }))
                          : setVendorDraft((p) => ({
                              ...p,
                              name: e.target.value,
                            }))
                      }
                      className="h-11 w-full rounded-xl border border-hairline bg-ivory px-3.5 text-sm text-ink"
                    />
                  </label>

                  <label className="block space-y-1.5 text-xs">
                    <span className="font-medium uppercase tracking-[0.14em] text-gold-text">
                      City
                    </span>
                    <select
                      value={
                        kind === "venues"
                          ? venueDraft.citySlug
                          : vendorDraft.citySlug
                      }
                      onChange={(e) => {
                        const slug = e.target.value as CitySlug;
                        const name = getCityNameFromSlug(slug);
                        if (kind === "venues") {
                          setVenueDraft((p) => ({
                            ...p,
                            citySlug: slug,
                            city: name,
                          }));
                        } else {
                          setVendorDraft((p) => ({
                            ...p,
                            citySlug: slug,
                            city: name,
                          }));
                        }
                      }}
                      className="h-11 w-full rounded-xl border border-hairline bg-ivory px-3 text-sm text-ink"
                    >
                      {LAUNCH_CITIES.map((c) => (
                        <option key={c.slug} value={c.slug}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <label className="block space-y-1.5 text-xs">
                  <span className="font-medium uppercase tracking-[0.14em] text-gold-text">
                    {kind === "venues"
                      ? "Editorial Tagline (Public)"
                      : "Craft Specialty (Public)"}
                  </span>
                  <textarea
                    rows={3}
                    value={
                      kind === "venues"
                        ? venueDraft.tagline
                        : vendorDraft.specialty
                    }
                    onChange={(e) =>
                      kind === "venues"
                        ? setVenueDraft((p) => ({
                            ...p,
                            tagline: e.target.value,
                          }))
                        : setVendorDraft((p) => ({
                            ...p,
                            specialty: e.target.value,
                          }))
                    }
                    className="w-full rounded-xl border border-hairline bg-ivory p-3.5 text-sm text-ink"
                  />
                </label>

                <div className="flex flex-wrap items-center gap-6 pt-1">
                  <label className="inline-flex items-center gap-2.5 text-sm text-ink cursor-pointer">
                    <input
                      type="checkbox"
                      checked={currentVault.isPublished}
                      onChange={(e) =>
                        updateCurrentVault({ isPublished: e.target.checked })
                      }
                      className="h-4 w-4 accent-crimson cursor-pointer"
                    />
                    <span>Published in public directory</span>
                  </label>
                  <label className="inline-flex items-center gap-2.5 text-sm text-ink cursor-pointer">
                    <input
                      type="checkbox"
                      checked={
                        kind === "venues"
                          ? venueDraft.verified
                          : vendorDraft.verified
                      }
                      onChange={(e) =>
                        kind === "venues"
                          ? setVenueDraft((p) => ({
                              ...p,
                              verified: e.target.checked,
                            }))
                          : setVendorDraft((p) => ({
                              ...p,
                              verified: e.target.checked,
                            }))
                      }
                      className="h-4 w-4 accent-crimson cursor-pointer"
                    />
                    <span>Display Concierge Verified badge</span>
                  </label>
                </div>
              </div>
            )}

            {/* TAB 2: CAPACITY & TIER */}
            {activeTab === "capacity" && (
              <div className="space-y-5">
                {kind === "venues" && (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <label className="block space-y-1.5 text-xs">
                      <span className="font-medium uppercase tracking-[0.14em] text-gold-text">
                        Minimum Guest Capacity
                      </span>
                      <input
                        type="number"
                        min={20}
                        value={venueDraft.capacityMin}
                        onChange={(e) =>
                          setVenueDraft((p) => ({
                            ...p,
                            capacityMin: Number(e.target.value) || 0,
                          }))
                        }
                        className="h-11 w-full rounded-xl border border-hairline bg-ivory px-3.5 text-sm tabular-nums text-ink"
                      />
                    </label>
                    <label className="block space-y-1.5 text-xs">
                      <span className="font-medium uppercase tracking-[0.14em] text-gold-text">
                        Maximum Guest Capacity
                      </span>
                      <input
                        type="number"
                        min={50}
                        value={venueDraft.capacityMax}
                        onChange={(e) =>
                          setVenueDraft((p) => ({
                            ...p,
                            capacityMax: Number(e.target.value) || 0,
                          }))
                        }
                        className="h-11 w-full rounded-xl border border-hairline bg-ivory px-3.5 text-sm tabular-nums text-ink"
                      />
                    </label>
                  </div>
                )}

                <div className="space-y-2">
                  <span className="block text-xs font-medium uppercase tracking-[0.14em] text-gold-text">
                    Public Tier Diamond Marker (Replaces All Pricing Publicly)
                  </span>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {(["classic", "grand", "royal"] as BudgetTier[]).map(
                      (tier) => {
                        const active =
                          (kind === "venues"
                            ? venueDraft.tier
                            : vendorDraft.tier) === tier;
                        return (
                          <button
                            key={tier}
                            type="button"
                            onClick={() =>
                              kind === "venues"
                                ? setVenueDraft((p) => ({ ...p, tier }))
                                : setVendorDraft((p) => ({ ...p, tier }))
                            }
                            className={cn(
                              "flex flex-col items-start gap-1 rounded-2xl border p-4 text-left cursor-pointer transition-colors",
                              active
                                ? "border-crimson bg-blush/60"
                                : "border-hairline bg-ivory hover:border-gold"
                            )}
                          >
                            <TierMarker tier={tier} />
                            <span className="text-xs text-ink-soft">
                              {tier === "royal"
                                ? "Flagship royal buyouts"
                                : tier === "grand"
                                  ? "Signature destination weddings"
                                  : "Intimate luxury celebrations"}
                            </span>
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: MEDIA */}
            {activeTab === "media" && (
              <div className="space-y-4">
                <div className="rounded-2xl border border-hairline-soft bg-silk/70 p-4 flex items-center gap-3 text-xs text-ink-soft">
                  <Film className="h-4 w-4 shrink-0 text-gold-text" strokeWidth={1.5} />
                  <span>
                    All 4K master streams are stored as adaptive HLS manifests
                    with 720p muted preview reels. Mandatory alt text is
                    enforced for accessibility.
                  </span>
                </div>

                <label className="block space-y-1.5 text-xs">
                  <span className="font-medium uppercase tracking-[0.14em] text-gold-text">
                    4K HLS Master Playlist URL
                  </span>
                  <input
                    type="text"
                    value={
                      kind === "venues" ? venueDraft.hlsUrl : vendorDraft.hlsUrl
                    }
                    onChange={(e) =>
                      kind === "venues"
                        ? setVenueDraft((p) => ({ ...p, hlsUrl: e.target.value }))
                        : setVendorDraft((p) => ({ ...p, hlsUrl: e.target.value }))
                    }
                    className="h-11 w-full rounded-xl border border-hairline bg-ivory px-3.5 text-sm text-ink"
                  />
                </label>

                <label className="block space-y-1.5 text-xs">
                  <span className="font-medium uppercase tracking-[0.14em] text-gold-text">
                    720p Hover Preview MP4 URL
                  </span>
                  <input
                    type="text"
                    value={
                      kind === "venues"
                        ? venueDraft.previewMp4Url
                        : vendorDraft.previewMp4Url
                    }
                    onChange={(e) =>
                      kind === "venues"
                        ? setVenueDraft((p) => ({
                            ...p,
                            previewMp4Url: e.target.value,
                          }))
                        : setVendorDraft((p) => ({
                            ...p,
                            previewMp4Url: e.target.value,
                          }))
                    }
                    className="h-11 w-full rounded-xl border border-hairline bg-ivory px-3.5 text-sm text-ink"
                  />
                </label>

                <label className="block space-y-1.5 text-xs">
                  <span className="font-medium uppercase tracking-[0.14em] text-gold-text">
                    Mandatory Editorial Alt Text
                  </span>
                  <input
                    type="text"
                    required
                    value={
                      kind === "venues"
                        ? venueDraft.altText
                        : vendorDraft.altText
                    }
                    onChange={(e) =>
                      kind === "venues"
                        ? setVenueDraft((p) => ({
                            ...p,
                            altText: e.target.value,
                          }))
                        : setVendorDraft((p) => ({
                            ...p,
                            altText: e.target.value,
                          }))
                    }
                    className="h-11 w-full rounded-xl border border-hairline bg-ivory px-3.5 text-sm text-ink"
                  />
                </label>
              </div>
            )}

            {/* TAB 4: AMENITIES */}
            {activeTab === "amenities" && (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {currentVault.amenities.map((amenity) => (
                    <span
                      key={amenity}
                      className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-blush/45 px-3.5 py-1.5 text-xs text-ink"
                    >
                      <span>{amenity}</span>
                      <button
                        type="button"
                        onClick={() => removeAmenity(amenity)}
                        aria-label={`Remove ${amenity}`}
                        className="text-ink-soft hover:text-crimson cursor-pointer"
                      >
                        <X className="h-3.5 w-3.5" strokeWidth={1.5} />
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newAmenity}
                    onChange={(e) => setNewAmenity(e.target.value)}
                    placeholder="Add amenity or signature offering..."
                    className="h-11 flex-1 rounded-xl border border-hairline bg-ivory px-3.5 text-sm text-ink"
                  />
                  <Button type="button" variant="secondary" onClick={addAmenity}>
                    Add Tag
                  </Button>
                </div>
              </div>
            )}

            {/* TAB 5: PRIVATE DETAILS (STAFF-ONLY VAULT) */}
            {activeTab === "private" &&
              (allowReadPrivate ? (
                <div className="rounded-[20px] border border-crimson/25 bg-blush/40 p-5 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-crimson">
                      <Lock className="h-4 w-4" strokeWidth={1.5} />
                      <span>
                        Staff-Only Confidential Vault{" "}
                        {!allowWritePrivate && "(Read-Only for Concierge)"}
                      </span>
                    </div>
                    <span className="rounded-full border border-crimson/30 bg-ivory px-3 py-0.5 text-[10px] font-medium uppercase tracking-[0.14em] text-crimson">
                      Excluded from Public DTO &amp; JSON-LD
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <label className="block space-y-1.5 text-xs">
                      <span className="font-medium uppercase tracking-[0.14em] text-gold-text">
                        Direct Contact Person
                      </span>
                      <input
                        type="text"
                        disabled={!allowWritePrivate}
                        value={currentVault.privateContactName}
                        onChange={(e) =>
                          updateCurrentVault({
                            privateContactName: e.target.value,
                          })
                        }
                        className="h-11 w-full rounded-xl border border-hairline bg-ivory px-3.5 text-sm text-ink disabled:opacity-70"
                      />
                    </label>
                    <label className="block space-y-1.5 text-xs">
                      <span className="font-medium uppercase tracking-[0.14em] text-gold-text">
                        Internal Rate Card Band
                      </span>
                      <input
                        type="text"
                        disabled={!allowWritePrivate}
                        value={currentVault.rateCardBandInternal}
                        onChange={(e) =>
                          updateCurrentVault({
                            rateCardBandInternal: e.target.value,
                          })
                        }
                        className="h-11 w-full rounded-xl border border-hairline bg-ivory px-3.5 text-sm text-ink disabled:opacity-70"
                      />
                    </label>
                    <label className="block space-y-1.5 text-xs">
                      <span className="font-medium uppercase tracking-[0.14em] text-gold-text">
                        Direct Email (Private)
                      </span>
                      <input
                        type="email"
                        disabled={!allowWritePrivate}
                        value={currentVault.privateEmail}
                        onChange={(e) =>
                          updateCurrentVault({ privateEmail: e.target.value })
                        }
                        className="h-11 w-full rounded-xl border border-hairline bg-ivory px-3.5 text-sm text-ink disabled:opacity-70"
                      />
                    </label>
                    <label className="block space-y-1.5 text-xs">
                      <span className="font-medium uppercase tracking-[0.14em] text-gold-text">
                        Direct Phone / WhatsApp (Private)
                      </span>
                      <input
                        type="text"
                        disabled={!allowWritePrivate}
                        value={currentVault.privatePhone}
                        onChange={(e) =>
                          updateCurrentVault({ privatePhone: e.target.value })
                        }
                        className="h-11 w-full rounded-xl border border-hairline bg-ivory px-3.5 text-sm tabular-nums text-ink disabled:opacity-70"
                      />
                    </label>
                  </div>

                  <label className="block space-y-1.5 text-xs">
                    <span className="font-medium uppercase tracking-[0.14em] text-gold-text">
                      Internal Concierge Notes
                    </span>
                    <textarea
                      rows={3}
                      disabled={!allowWritePrivate}
                      value={currentVault.internalNotes}
                      onChange={(e) =>
                        updateCurrentVault({ internalNotes: e.target.value })
                      }
                      className="w-full rounded-xl border border-hairline bg-ivory p-3.5 text-sm text-ink disabled:opacity-70"
                    />
                  </label>
                </div>
              ) : (
                <div className="rounded-[20px] border border-hairline bg-blush/45 p-6 text-sm text-ink-soft flex items-start gap-3">
                  <Lock className="h-5 w-5 shrink-0 text-crimson mt-0.5" strokeWidth={1.5} />
                  <div>
                    <p className="font-medium text-ink">
                      Partner Private Vault hidden for Editor accounts
                    </p>
                    <p className="mt-1 text-xs leading-relaxed">
                      Per SECURITY.md §2, Editors curate public copy, media, and
                      SEO only. Direct partner phone numbers, emails, GST, and
                      internal rate bands are isolated to Admin and Concierge
                      roles.
                    </p>
                  </div>
                </div>
              ))}

            {/* TAB 6: SEO */}
            {activeTab === "seo" && (
              <div className="space-y-4">
                <label className="block space-y-1.5 text-xs">
                  <span className="font-medium uppercase tracking-[0.14em] text-gold-text">
                    SEO Meta Title
                  </span>
                  <input
                    type="text"
                    value={currentVault.seoTitle}
                    onChange={(e) =>
                      updateCurrentVault({ seoTitle: e.target.value })
                    }
                    className="h-11 w-full rounded-xl border border-hairline bg-ivory px-3.5 text-sm text-ink"
                  />
                </label>

                <label className="block space-y-1.5 text-xs">
                  <span className="font-medium uppercase tracking-[0.14em] text-gold-text">
                    SEO Meta Description
                  </span>
                  <textarea
                    rows={3}
                    value={currentVault.seoDescription}
                    onChange={(e) =>
                      updateCurrentVault({ seoDescription: e.target.value })
                    }
                    className="w-full rounded-xl border border-hairline bg-ivory p-3.5 text-sm text-ink"
                  />
                </label>

                <div className="rounded-xl border border-hairline-soft bg-silk/70 p-4 text-xs text-ink-soft">
                  <p className="font-medium text-ink">
                    Canonical Public Path:{" "}
                    <span className="text-crimson">
                      /{kind}/
                      {kind === "venues" ? venueDraft.slug : vendorDraft.slug}
                    </span>
                  </p>
                  <p className="mt-1">
                    Structured JSON-LD automatically strips phone, email, GST,
                    and pricing offers.
                  </p>
                </div>
              </div>
            )}

            {/* TAB 7: PUBLIC PREVIEW */}
            {activeTab === "preview" && (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 items-start">
                <article className="rounded-[20px] border border-hairline-soft bg-ivory p-4 shadow-soft">
                  <ArchImage
                    src={
                      kind === "venues"
                        ? venueDraft.posterUrl
                        : vendorDraft.posterUrl
                    }
                    alt={
                      kind === "venues"
                        ? venueDraft.altText
                        : vendorDraft.altText
                    }
                    ratio="4/3"
                    gradient={
                      kind === "venues"
                        ? venueDraft.visualGradient
                        : vendorDraft.visualGradient
                    }
                    caption={
                      kind === "venues"
                        ? `${venueDraft.city} · ${venueDraft.setting}`
                        : `${vendorDraft.city} · ${vendorDraft.category}`
                    }
                  />
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-xs text-ink-soft">
                      <span>
                        {kind === "venues"
                          ? `${venueDraft.city} · ${venueDraft.setting}`
                          : `${vendorDraft.category} · ${vendorDraft.city}`}
                      </span>
                      <span className="inline-flex items-center gap-1 font-medium text-success">
                        <ShieldCheck className="h-3.5 w-3.5" strokeWidth={1.5} />
                        Verified
                      </span>
                    </div>
                    <h3 className="font-display text-2xl text-ink">
                      {kind === "venues" ? venueDraft.name : vendorDraft.name}
                    </h3>
                    <p className="text-sm text-ink-soft">
                      {kind === "venues"
                        ? venueDraft.tagline
                        : vendorDraft.specialty}
                    </p>
                    <div className="flex items-center justify-between border-t border-hairline-soft pt-3 text-xs">
                      <span className="text-ink-soft">
                        {kind === "venues"
                          ? `${venueDraft.capacityMin}–${venueDraft.capacityMax} guests`
                          : "Personally introduced"}
                      </span>
                      <TierMarker
                        tier={
                          kind === "venues" ? venueDraft.tier : vendorDraft.tier
                        }
                      />
                    </div>
                  </div>
                </article>

                <div className="rounded-[20px] border border-success/35 bg-silk/70 p-5 space-y-2 text-xs text-ink-soft">
                  <p className="inline-flex items-center gap-1.5 font-medium uppercase tracking-[0.16em] text-success">
                    <ShieldCheck className="h-4 w-4" strokeWidth={1.5} />
                    <span>Privacy Guard Verified</span>
                  </p>
                  <p>
                    Public preview omits direct contact email, phone number,
                    internal buyout band, and concierge notes. Couples connect
                    exclusively through Request Concierge Quote.
                  </p>
                </div>
              </div>
            )}

            {/* Save Footer */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-hairline-soft pt-5">
              <span className="text-xs text-ink-soft">
                {allowEdit
                  ? "Publish gate verifies alt text and partner private vault before going live."
                  : "Concierge role has read-only access to listings and partner private contacts."}
              </span>
              {allowEdit && (
                <Button type="submit" variant="primary">
                  <Save className="h-4 w-4" strokeWidth={1.5} />
                  <span>Save {kind === "venues" ? "Venue" : "Atelier"}</span>
                </Button>
              )}
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
