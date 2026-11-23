"use client";

import React, { createContext, useCallback, useContext, useState } from "react";
import {
  appendLeadNote,
  createInitialAdminState,
  getCityNameFromSlug,
  moveLeadToStage,
  prependAuditEntry,
  reorderHeroSlides,
  transitionPartnerApplication,
} from "@/lib/admin/storeLogic";
import type {
  AdminCmsState,
  AdminHeroSlide,
  AdminPartnerApplication,
  AdminVendorRecord,
  AdminVenueRecord,
  CreateVenueInput,
  LeadStage,
  VideoProcessingStatus,
} from "@/lib/admin/types";
import type {
  BudgetTier,
  CitySlug,
  PartnerStatus,
  VendorCategorySlug,
  VenueSettingSlug,
} from "@/lib/data/types";
import {
  canApproveApplications,
  canEditHero,
  canEditListings,
  canExportLeadsCsv,
  canManageLeads,
  MOCK_STAFF_PROFILES,
  type StaffProfile,
  type StaffRole,
} from "@/lib/security/rbac";

interface CreateVendorInput {
  name: string;
  citySlug: CitySlug;
  category: string;
  categorySlug: VendorCategorySlug;
  tier: BudgetTier;
  specialty: string;
}

interface AdminStoreContextValue {
  state: AdminCmsState;
  staffRole: StaffRole;
  staffProfile: StaffProfile;
  setStaffRole: (role: StaffRole) => void;
  notice: string | null;
  clearNotice: () => void;
  // Hero Manager
  reorderHero: (index: number, direction: -1 | 1) => void;
  toggleHeroPublish: (slideId: string) => void;
  updateHeroSlide: (
    slideId: string,
    patch: Partial<
      Pick<
        AdminHeroSlide,
        | "headlinePrefix"
        | "headlineItalic"
        | "headlineSuffix"
        | "subtitle"
        | "cityLabel"
        | "chapterName"
        | "venueTitle"
        | "scheduleWindow"
      >
    >
  ) => void;
  advanceHeroProcessing: (slideId: string) => void;
  addHeroSlide: (input: {
    chapterName: string;
    headlinePrefix: string;
    headlineItalic: string;
    subtitle: string;
    cityLabel: string;
    venueTitle: string;
    scheduleWindow: string;
  }) => void;
  revertHeroSlides: () => void;
  // Partner Verification Queue
  toggleChecklistItem: (
    applicationId: string,
    key: keyof AdminPartnerApplication["checklist"]
  ) => void;
  reviewApplication: (
    applicationId: string,
    nextStatus: PartnerStatus,
    reviewerNotes: string
  ) => void;
  // Listings Editor
  updateVenue: (venue: AdminVenueRecord) => void;
  createVenue: (
    input: CreateVenueInput & { settingSlug: VenueSettingSlug }
  ) => AdminVenueRecord;
  updateVendor: (vendor: AdminVendorRecord) => void;
  createVendor: (input: CreateVendorInput) => AdminVendorRecord;
  // Leads Kanban
  moveLead: (leadId: string, nextStage: LeadStage) => void;
  assignLeadDirector: (leadId: string, director: string) => void;
  addLeadNote: (leadId: string, body: string) => void;
  logLeadsCsvExport: (rowCount: number) => void;
}

const AdminStoreContext = createContext<AdminStoreContextValue | null>(null);

const PROCESSING_ORDER: VideoProcessingStatus[] = [
  "queued",
  "processing",
  "ready",
];

function roleLabel(role: StaffRole): "Admin" | "Editor" | "Concierge" {
  if (role === "admin") return "Admin";
  if (role === "editor") return "Editor";
  return "Concierge";
}

function cityNameToSlug(cityName: string): CitySlug {
  const lower = cityName.toLowerCase();
  if (lower.includes("jaipur")) return "jaipur";
  if (lower.includes("goa")) return "goa";
  if (lower.includes("delhi")) return "delhi-ncr";
  return "udaipur";
}

export function AdminStoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, setState] = useState<AdminCmsState>(() =>
    createInitialAdminState()
  );
  const [staffRole, setStaffRoleState] = useState<StaffRole>("admin");
  const [notice, setNotice] = useState<string | null>(null);

  const staffProfile = MOCK_STAFF_PROFILES[staffRole];

  const clearNotice = useCallback(() => setNotice(null), []);

  const setStaffRole = useCallback((nextRole: StaffRole) => {
    setStaffRoleState(nextRole);
    const prof = MOCK_STAFF_PROFILES[nextRole];
    setNotice(
      `Switched active RBAC view to ${prof.title} (2FA verified · SECURITY.md §2).`
    );
  }, []);

  const reorderHero = useCallback(
    (index: number, direction: -1 | 1) => {
      if (!canEditHero(staffRole)) {
        setNotice("Access restricted: only Admin or Editor roles may reorder Hero chapters.");
        return;
      }
      setState((prev) => {
        const movedSlide = prev.heroSlides[index];
        const nextSlides = reorderHeroSlides(prev.heroSlides, index, direction);
        if (nextSlides === prev.heroSlides) return prev;
        return {
          ...prev,
          heroSlides: nextSlides,
          auditLog: prependAuditEntry(prev.auditLog, {
            actor: staffProfile.name,
            role: roleLabel(staffRole),
            action:
              direction === -1
                ? "Moved hero chapter earlier"
                : "Moved hero chapter later",
            target: movedSlide
              ? `${movedSlide.chapterName} · ${movedSlide.cityLabel}`
              : "Hero sequence",
          }),
        };
      });
    },
    [staffRole, staffProfile.name]
  );

  const toggleHeroPublish = useCallback(
    (slideId: string) => {
      if (!canEditHero(staffRole)) {
        setNotice("Access restricted: only Admin or Editor roles may publish Hero chapters.");
        return;
      }
      setState((prev) => {
        const target = prev.heroSlides.find((s) => s.id === slideId);
        if (!target) return prev;
        if (!target.isPublished && target.processingStatus !== "ready") {
          setNotice(
            "Publish blocked (API_SPEC.md §3.2): 4K HLS media must reach 'ready' before going live."
          );
          return prev;
        }
        const nextPublished = !target.isPublished;
        return {
          ...prev,
          heroSlides: prev.heroSlides.map((s) =>
            s.id === slideId ? { ...s, isPublished: nextPublished } : s
          ),
          auditLog: prependAuditEntry(prev.auditLog, {
            actor: staffProfile.name,
            role: roleLabel(staffRole),
            action: nextPublished
              ? "Published hero chapter"
              : "Unpublished hero chapter",
            target: `Chapter ${target.chapterIndex} · ${target.chapterName}`,
          }),
        };
      });
    },
    [staffRole, staffProfile.name]
  );

  const updateHeroSlide = useCallback(
    (
      slideId: string,
      patch: Partial<
        Pick<
          AdminHeroSlide,
          | "headlinePrefix"
          | "headlineItalic"
          | "headlineSuffix"
          | "subtitle"
          | "cityLabel"
          | "chapterName"
          | "venueTitle"
          | "scheduleWindow"
        >
      >
    ) => {
      if (!canEditHero(staffRole)) {
        setNotice("Access restricted: only Admin or Editor roles may update Hero copy.");
        return;
      }
      setState((prev) => {
        const target = prev.heroSlides.find((s) => s.id === slideId);
        if (!target) return prev;
        return {
          ...prev,
          heroSlides: prev.heroSlides.map((s) =>
            s.id === slideId ? { ...s, ...patch } : s
          ),
          auditLog: prependAuditEntry(prev.auditLog, {
            actor: staffProfile.name,
            role: roleLabel(staffRole),
            action: "Updated hero chapter copy",
            target: patch.chapterName ?? target.chapterName,
          }),
        };
      });
      setNotice("Hero chapter updated in mock CMS store.");
    },
    [staffRole, staffProfile.name]
  );

  const advanceHeroProcessing = useCallback(
    (slideId: string) => {
      if (!canEditHero(staffRole)) return;
      setState((prev) => {
        const target = prev.heroSlides.find((s) => s.id === slideId);
        if (!target) return prev;
        const idx = PROCESSING_ORDER.indexOf(target.processingStatus);
        const nextStatus =
          PROCESSING_ORDER[(idx + 1) % PROCESSING_ORDER.length];
        return {
          ...prev,
          heroSlides: prev.heroSlides.map((s) =>
            s.id === slideId ? { ...s, processingStatus: nextStatus } : s
          ),
          auditLog: prependAuditEntry(prev.auditLog, {
            actor: staffProfile.name,
            role: roleLabel(staffRole),
            action: `Set 4K HLS transcode status to ${nextStatus}`,
            target: `${target.chapterName} · ${target.cityLabel}`,
          }),
        };
      });
    },
    [staffRole, staffProfile.name]
  );

  const addHeroSlide = useCallback(
    (input: {
      chapterName: string;
      headlinePrefix: string;
      headlineItalic: string;
      subtitle: string;
      cityLabel: string;
      venueTitle: string;
      scheduleWindow: string;
    }) => {
      if (!canEditHero(staffRole)) return;
      setState((prev) => {
        const nextIndex = prev.heroSlides.length;
        const slugSafe = input.chapterName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
        const newSlide: AdminHeroSlide = {
          id: `hero-${Date.now()}`,
          slug: "destination",
          chapterIndex: String(nextIndex + 1).padStart(2, "0"),
          chapterName: input.chapterName.trim(),
          devanagariCaption: "शुभ उत्सव",
          headlinePrefix: input.headlinePrefix.trim(),
          headlineItalic: input.headlineItalic.trim() || "celebrated",
          headlineSuffix: "in timeless grace.",
          subtitle: input.subtitle.trim(),
          cityLabel: input.cityLabel.trim() || "Udaipur",
          citySlug: "udaipur",
          venueTitle: input.venueTitle.trim() || "Heritage Courtyard",
          settingLabel: "Heritage Palace",
          durationSeconds: 7,
          hlsUrl: `/media/hero/${slugSafe || "chapter"}/master.m3u8`,
          previewMp4Url: `/media/hero/${slugSafe || "chapter"}/preview-720p.mp4`,
          posterUrl: `/placeholder/hero/${slugSafe || "chapter"}.jpg`,
          altDescription: `${input.chapterName.trim()} wedding chapter in ${input.cityLabel.trim()}`,
          visualMotif: {
            backdropGradient:
              "linear-gradient(150deg, #FFF9FA 0%, #FDEEF2 48%, #FAF5EE 100%)",
            archTint: "rgba(255, 249, 250, 0.5)",
            accentGlow: "rgba(197, 155, 39, 0.14)",
            architecturalLabel: input.venueTitle.trim() || "Heritage Courtyard",
          },
          isPublished: false,
          processingStatus: "queued",
          scheduleWindow: input.scheduleWindow.trim() || "Winter 2026–27",
          orderIndex: nextIndex,
        };
        return {
          ...prev,
          heroSlides: [...prev.heroSlides, newSlide],
          auditLog: prependAuditEntry(prev.auditLog, {
            actor: staffProfile.name,
            role: roleLabel(staffRole),
            action: "Uploaded 4K hero draft (queued for HLS)",
            target: `${newSlide.chapterName} · ${newSlide.cityLabel}`,
          }),
        };
      });
      setNotice(
        "New hero chapter queued for 4K HLS transcoding (placeholder)."
      );
    },
    [staffRole, staffProfile.name]
  );

  const revertHeroSlides = useCallback(() => {
    if (!canEditHero(staffRole)) return;
    setState((prev) => {
      const fresh = createInitialAdminState().heroSlides;
      return {
        ...prev,
        heroSlides: fresh,
        auditLog: prependAuditEntry(prev.auditLog, {
          actor: staffProfile.name,
          role: roleLabel(staffRole),
          action: "Reverted hero sequence to published snapshot",
          target: "Hero Carousel (6 chapters)",
        }),
      };
    });
    setNotice("Hero carousel sequence reverted to default published snapshot.");
  }, [staffRole, staffProfile.name]);

  const toggleChecklistItem = useCallback(
    (
      applicationId: string,
      key: keyof AdminPartnerApplication["checklist"]
    ) => {
      if (!canApproveApplications(staffRole)) return;
      setState((prev) => ({
        ...prev,
        applications: prev.applications.map((app) =>
          app.id === applicationId
            ? {
                ...app,
                checklist: {
                  ...app.checklist,
                  [key]: !app.checklist[key],
                },
              }
            : app
        ),
      }));
    },
    [staffRole]
  );

  const reviewApplication = useCallback(
    (
      applicationId: string,
      nextStatus: PartnerStatus,
      reviewerNotes: string
    ) => {
      if (!canApproveApplications(staffRole)) {
        setNotice("Access restricted: only Admin staff may approve, request info, or decline partners.");
        return;
      }

      let targetLabel = applicationId;
      let createdDraftSummary = "";

      setState((prev) => {
        const app = prev.applications.find((a) => a.id === applicationId);
        if (!app) return prev;
        targetLabel = `${app.referenceId} · ${app.brandName}`;

        const nextApps = transitionPartnerApplication(
          prev.applications,
          applicationId,
          nextStatus,
          reviewerNotes
        );

        let nextVenues = prev.venues;
        let nextVendors = prev.vendors;

        // Implement DATABASE.md §7 on_application_approved: auto-create draft listing + isolated partner_private vault
        if (nextStatus === "approved") {
          const slug = app.brandName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");
          const citySlug = cityNameToSlug(app.city);

          if (
            app.role === "venue-owner" &&
            !prev.venues.some((v) => v.slug === slug)
          ) {
            const draftVenue: AdminVenueRecord = {
              id: `venue-approved-${Date.now()}`,
              slug: slug || `venue-${Date.now()}`,
              name: app.brandName,
              city: app.city,
              citySlug,
              setting: app.categoryOrSetting,
              settingSlug: "heritage-palace",
              capacityMin: 100,
              capacityMax: 450,
              tier: app.tier,
              verified: true,
              tagline:
                "Newly verified estate awaiting editorial photography curation before going live.",
              posterUrl: `/placeholder/venues/${slug || "approved-venue"}.jpg`,
              hlsUrl: `/media/venues/${slug || "approved-venue"}/master.m3u8`,
              previewMp4Url: `/media/venues/${slug || "approved-venue"}/preview-720p.mp4`,
              altText: `${app.brandName} luxury wedding estate in ${app.city}`,
              visualGradient:
                "linear-gradient(150deg, #FDEEF2 0%, #FFF9FA 52%, #FAF5EE 100%)",
              vault: {
                privateContactName: app.privateContactName,
                privateEmail: app.privateEmail,
                privatePhone: app.privatePhone,
                rateCardBandInternal: `Verified GST ${app.privateGstNumber} · Rate band pending`,
                internalNotes: reviewerNotes || "Promoted from Partner Verification Queue.",
                seoTitle: `${app.brandName} — Wedding Venue in ${app.city} | The Wedding Dreams`,
                seoDescription: `Curated luxury wedding venue in ${app.city}.`,
                amenities: ["Private buyout available", "Concierge vetted"],
                isPublished: false,
              },
            };
            nextVenues = [draftVenue, ...prev.venues];
            createdDraftSummary = " Draft venue + private vault auto-created in Directory Editor.";
          } else if (
            app.role === "vendor" &&
            !prev.vendors.some((vd) => vd.slug === slug)
          ) {
            const draftVendor: AdminVendorRecord = {
              id: `vendor-approved-${Date.now()}`,
              slug: slug || `vendor-${Date.now()}`,
              name: app.brandName,
              category: app.categoryOrSetting,
              categorySlug: "decor-florals",
              city: app.city,
              citySlug,
              tier: app.tier,
              verified: true,
              specialty:
                "Newly verified creative atelier queued for editorial portfolio curation.",
              posterUrl: `/placeholder/vendors/${slug || "approved-vendor"}.jpg`,
              hlsUrl: `/media/vendors/${slug || "approved-vendor"}/master.m3u8`,
              previewMp4Url: `/media/vendors/${slug || "approved-vendor"}/preview-720p.mp4`,
              altText: `${app.brandName} — ${app.categoryOrSetting} in ${app.city}`,
              visualGradient:
                "linear-gradient(155deg, #FAF5EE 0%, #FFF9FA 52%, #FDEEF2 100%)",
              vault: {
                privateContactName: app.privateContactName,
                privateEmail: app.privateEmail,
                privatePhone: app.privatePhone,
                rateCardBandInternal: `Verified GST ${app.privateGstNumber} · Commission band pending`,
                internalNotes: reviewerNotes || "Promoted from Partner Verification Queue.",
                seoTitle: `${app.brandName} — ${app.categoryOrSetting} in ${app.city} | The Wedding Dreams`,
                seoDescription: `Verified luxury wedding ${app.categoryOrSetting.toLowerCase()} in ${app.city}.`,
                amenities: ["Destination travel ready", "Concierge vetted"],
                isPublished: false,
              },
            };
            nextVendors = [draftVendor, ...prev.vendors];
            createdDraftSummary = " Draft atelier + private vault auto-created in Directory Editor.";
          }
        }

        const actionLabel =
          nextStatus === "approved"
            ? "Approved partner & created draft listing"
            : nextStatus === "needs_info"
              ? "Requested additional documents"
              : nextStatus === "rejected"
                ? "Declined partner application"
                : `Marked partner as ${nextStatus}`;

        return {
          ...prev,
          applications: nextApps,
          venues: nextVenues,
          vendors: nextVendors,
          auditLog: prependAuditEntry(prev.auditLog, {
            actor: staffProfile.name,
            role: roleLabel(staffRole),
            action: actionLabel,
            target: targetLabel,
          }),
        };
      });

      const statusText =
        nextStatus === "approved"
          ? "Approval & onboarding dispatch queued"
          : nextStatus === "needs_info"
            ? "Document request email queued"
            : nextStatus === "rejected"
              ? "Polite decline note queued"
              : "Status updated";
      setNotice(`${statusText} for ${targetLabel}.${createdDraftSummary}`);
    },
    [staffRole, staffProfile.name]
  );

  const updateVenue = useCallback(
    (venue: AdminVenueRecord) => {
      if (!canEditListings(staffRole)) {
        setNotice("Access restricted: Concierge accounts have read-only directory access.");
        return;
      }
      // DATABASE.md §7 on_publish gate: require altText + private contact before publish
      if (
        venue.vault.isPublished &&
        (!venue.altText.trim() || !venue.vault.privateEmail.trim())
      ) {
        setNotice(
          "Publish blocked (DATABASE.md §7): mandatory alt text and partner private contact must be populated."
        );
        return;
      }
      setState((prev) => ({
        ...prev,
        venues: prev.venues.map((v) => (v.id === venue.id ? venue : v)),
        auditLog: prependAuditEntry(prev.auditLog, {
          actor: staffProfile.name,
          role: roleLabel(staffRole),
          action: "Saved venue record",
          target: `${venue.name} (${venue.city})`,
        }),
      }));
      setNotice(`Saved changes to ${venue.name}. Private vault remains staff-only.`);
    },
    [staffRole, staffProfile.name]
  );

  const createVenue = useCallback(
    (input: CreateVenueInput & { settingSlug: VenueSettingSlug }) => {
      const slug = input.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      const city = getCityNameFromSlug(input.citySlug);
      const created: AdminVenueRecord = {
        id: `venue-${Date.now()}`,
        slug: slug || `venue-${Date.now()}`,
        name: input.name.trim(),
        city,
        citySlug: input.citySlug,
        setting: input.setting,
        settingSlug: input.settingSlug,
        capacityMin: input.capacityMin,
        capacityMax: input.capacityMax,
        tier: input.tier,
        tagline: input.tagline.trim(),
        posterUrl: `/placeholder/venues/${slug || "new-estate"}.jpg`,
        hlsUrl: `/media/venues/${slug || "new-estate"}/master.m3u8`,
        previewMp4Url: `/media/venues/${slug || "new-estate"}/preview-720p.mp4`,
        altText: `${input.name.trim()} luxury wedding venue in ${city}`,
        visualGradient:
          "linear-gradient(150deg, #FDEEF2 0%, #FFF9FA 52%, #FAF5EE 100%)",
        verified: true,
        vault: {
          privateContactName: `Estate General Manager (${city})`,
          privateEmail: `gm.${slug.slice(0, 10) || "estate"}@partner-vault.internal`,
          privatePhone: "+91 98290 00000",
          rateCardBandInternal: "Confidential Buyout Band (Draft)",
          internalNotes: "Created via Admin CMS in-memory draft.",
          seoTitle: `${input.name.trim()} — Luxury Wedding Venue in ${city}`,
          seoDescription: input.tagline.trim(),
          amenities: ["Private buyout available", "Curated royal kitchens"],
          isPublished: false,
        },
      };

      setState((prev) => ({
        ...prev,
        venues: [created, ...prev.venues],
        auditLog: prependAuditEntry(prev.auditLog, {
          actor: staffProfile.name,
          role: roleLabel(staffRole),
          action: "Created venue draft",
          target: `${created.name} (${created.city})`,
        }),
      }));
      setNotice(`Created draft venue "${created.name}".`);
      return created;
    },
    [staffRole, staffProfile.name]
  );

  const updateVendor = useCallback(
    (vendor: AdminVendorRecord) => {
      if (!canEditListings(staffRole)) {
        setNotice("Access restricted: Concierge accounts have read-only directory access.");
        return;
      }
      if (
        vendor.vault.isPublished &&
        (!vendor.altText.trim() || !vendor.vault.privateEmail.trim())
      ) {
        setNotice(
          "Publish blocked (DATABASE.md §7): mandatory alt text and partner private contact must be populated."
        );
        return;
      }
      setState((prev) => ({
        ...prev,
        vendors: prev.vendors.map((vd) => (vd.id === vendor.id ? vendor : vd)),
        auditLog: prependAuditEntry(prev.auditLog, {
          actor: staffProfile.name,
          role: roleLabel(staffRole),
          action: "Saved vendor record",
          target: `${vendor.name} (${vendor.category})`,
        }),
      }));
      setNotice(`Saved changes to ${vendor.name}. Private vault remains staff-only.`);
    },
    [staffRole, staffProfile.name]
  );

  const createVendor = useCallback(
    (input: CreateVendorInput) => {
      const slug = input.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      const city = getCityNameFromSlug(input.citySlug);
      const created: AdminVendorRecord = {
        id: `vendor-${Date.now()}`,
        slug: slug || `vendor-${Date.now()}`,
        name: input.name.trim(),
        category: input.category,
        categorySlug: input.categorySlug,
        city,
        citySlug: input.citySlug,
        tier: input.tier,
        specialty: input.specialty.trim(),
        posterUrl: `/placeholder/vendors/${slug || "new-atelier"}.jpg`,
        hlsUrl: `/media/vendors/${slug || "new-atelier"}/master.m3u8`,
        previewMp4Url: `/media/vendors/${slug || "new-atelier"}/preview-720p.mp4`,
        altText: `${input.name.trim()} — ${input.category} in ${city}`,
        visualGradient:
          "linear-gradient(155deg, #FAF5EE 0%, #FFF9FA 52%, #FDEEF2 100%)",
        verified: true,
        vault: {
          privateContactName: `Studio Principal (${city})`,
          privateEmail: `studio.${slug.slice(0, 10) || "atelier"}@partner-vault.internal`,
          privatePhone: "+91 98110 00000",
          rateCardBandInternal: "Confidential Atelier Commission Band (Draft)",
          internalNotes: "Created via Admin CMS in-memory draft.",
          seoTitle: `${input.name.trim()} — ${input.category} in ${city}`,
          seoDescription: input.specialty.trim(),
          amenities: ["Destination travel ready", "Dedicated senior artisan lead"],
          isPublished: false,
        },
      };

      setState((prev) => ({
        ...prev,
        vendors: [created, ...prev.vendors],
        auditLog: prependAuditEntry(prev.auditLog, {
          actor: staffProfile.name,
          role: roleLabel(staffRole),
          action: "Created vendor draft",
          target: `${created.name} (${created.category})`,
        }),
      }));
      setNotice(`Created draft atelier "${created.name}".`);
      return created;
    },
    [staffRole, staffProfile.name]
  );

  const moveLead = useCallback(
    (leadId: string, nextStage: LeadStage) => {
      if (!canManageLeads(staffRole)) return;
      setState((prev) => {
        const lead = prev.leads.find((l) => l.id === leadId);
        if (!lead || lead.stage === nextStage) return prev;
        return {
          ...prev,
          leads: moveLeadToStage(prev.leads, leadId, nextStage),
          auditLog: prependAuditEntry(prev.auditLog, {
            actor: staffProfile.name,
            role: roleLabel(staffRole),
            action: `Moved lead to ${nextStage.replace("_", " ")}`,
            target: `${lead.referenceCode} · ${lead.coupleName}`,
          }),
        };
      });
    },
    [staffRole, staffProfile.name]
  );

  const assignLeadDirector = useCallback(
    (leadId: string, director: string) => {
      if (!canManageLeads(staffRole)) return;
      setState((prev) => {
        const lead = prev.leads.find((l) => l.id === leadId);
        if (!lead) return prev;
        return {
          ...prev,
          leads: prev.leads.map((l) =>
            l.id === leadId ? { ...l, assignedDirector: director } : l
          ),
          auditLog: prependAuditEntry(prev.auditLog, {
            actor: staffProfile.name,
            role: roleLabel(staffRole),
            action: `Assigned director ${director}`,
            target: `${lead.referenceCode} · ${lead.coupleName}`,
          }),
        };
      });
    },
    [staffRole, staffProfile.name]
  );

  const addLeadNote = useCallback(
    (leadId: string, body: string) => {
      if (!canManageLeads(staffRole)) return;
      const trimmed = body.trim();
      if (!trimmed) return;
      setState((prev) => {
        const lead = prev.leads.find((l) => l.id === leadId);
        if (!lead) return prev;
        return {
          ...prev,
          leads: appendLeadNote(prev.leads, leadId, staffProfile.name, trimmed),
          auditLog: prependAuditEntry(prev.auditLog, {
            actor: staffProfile.name,
            role: roleLabel(staffRole),
            action: "Added concierge note",
            target: `${lead.referenceCode} · ${lead.coupleName}`,
          }),
        };
      });
      setNotice("Concierge note appended to lead dossier.");
    },
    [staffRole, staffProfile.name]
  );

  const logLeadsCsvExport = useCallback(
    (rowCount: number) => {
      if (!canExportLeadsCsv(staffRole)) {
        setNotice("Access restricted: only Admin staff may export leads CSV.");
        return;
      }
      setState((prev) => ({
        ...prev,
        auditLog: prependAuditEntry(prev.auditLog, {
          actor: staffProfile.name,
          role: "Admin",
          action: "Exported leads CSV",
          target: `${rowCount} couple enquiries (audited)`,
        }),
      }));
      setNotice(
        `Exported ${rowCount} leads to CSV and recorded entry in Audit Log.`
      );
    },
    [staffRole, staffProfile.name]
  );

  return (
    <AdminStoreContext.Provider
      value={{
        state,
        staffRole,
        staffProfile,
        setStaffRole,
        notice,
        clearNotice,
        reorderHero,
        toggleHeroPublish,
        updateHeroSlide,
        advanceHeroProcessing,
        addHeroSlide,
        revertHeroSlides,
        toggleChecklistItem,
        reviewApplication,
        updateVenue,
        createVenue,
        updateVendor,
        createVendor,
        moveLead,
        assignLeadDirector,
        addLeadNote,
        logLeadsCsvExport,
      }}
    >
      {children}
    </AdminStoreContext.Provider>
  );
}

export function useAdminStore() {
  const ctx = useContext(AdminStoreContext);
  if (!ctx) {
    throw new Error("useAdminStore must be used inside AdminStoreProvider");
  }
  return ctx;
}
