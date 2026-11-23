import {
  LAUNCH_CITIES,
  MOCK_HERO_SLIDES,
  MOCK_VENDORS,
  MOCK_VENUES,
} from "@/lib/data/mockAdapter";
import type { PartnerStatus } from "@/lib/data/types";
import type {
  AdminCmsState,
  AdminHeroSlide,
  AdminLead,
  AdminPartnerApplication,
  AdminVendorRecord,
  AdminVenueRecord,
  AuditLogEntry,
  LeadStage,
} from "./types";

export const CONCIERGE_DIRECTORS = [
  "Ananya Rathore",
  "Siddharth Verma",
  "Kavya Deshmukh",
] as const;

export const LEAD_STAGES: Array<{ id: LeadStage; label: string }> = [
  { id: "new", label: "New Enquiries" },
  { id: "contacted", label: "Contacted" },
  { id: "shortlist_sent", label: "Shortlist Sent" },
  { id: "site_visit", label: "Walkthroughs" },
  { id: "booked", label: "Confirmed" },
];

export function createInitialAdminState(): AdminCmsState {
  const heroSlides: AdminHeroSlide[] = MOCK_HERO_SLIDES.map((s, idx) => ({
    ...s,
    isPublished: true,
    processingStatus: "ready",
    scheduleWindow: "Nov 2026 – Mar 2027",
    orderIndex: idx,
  }));

  const venues: AdminVenueRecord[] = MOCK_VENUES.map((v, idx) => ({
    ...v,
    vault: {
      privateContactName: `Estate General Manager (${v.city})`,
      privateEmail: `gm.${v.slug.slice(0, 12)}@partner-vault.internal`,
      privatePhone: `+91 98${String(100 + idx).padStart(3, "0")} 44210`,
      rateCardBandInternal:
        v.tier === "royal"
          ? "Confidential Buyout Band R-1"
          : v.tier === "grand"
            ? "Confidential Buyout Band G-2"
            : "Confidential Buyout Band C-3",
      internalNotes:
        "Preferred concierge commission terms confirmed for Winter 2026–27 season.",
      seoTitle: `${v.name} — Luxury Wedding Venue in ${v.city} | The Wedding Dreams`,
      seoDescription: v.tagline,
      amenities: [
        "Private buyout available",
        "Heritage bridal suites",
        "Acoustic courtyard staging",
        "Curated royal kitchens",
      ],
      isPublished: true,
    },
  }));

  const vendors: AdminVendorRecord[] = MOCK_VENDORS.map((vd, idx) => ({
    ...vd,
    vault: {
      privateContactName: `Studio Principal (${vd.city})`,
      privateEmail: `studio.${vd.slug.slice(0, 12)}@partner-vault.internal`,
      privatePhone: `+91 97${String(200 + idx).padStart(3, "0")} 77810`,
      rateCardBandInternal:
        vd.tier === "royal"
          ? "Atelier Commission Tier R"
          : vd.tier === "grand"
            ? "Atelier Commission Tier G"
            : "Atelier Commission Tier C",
      internalNotes: "Verified portfolio and direct senior team commitment.",
      seoTitle: `${vd.name} — ${vd.category} in ${vd.city} | The Wedding Dreams`,
      seoDescription: vd.specialty,
      amenities: [
        "Destination travel ready",
        "Dedicated senior artisan lead",
        "Private consultation & mockup",
      ],
      isPublished: true,
    },
  }));

  const applications: AdminPartnerApplication[] = [
    {
      id: "app-1",
      referenceId: "TWD-P1042",
      role: "venue-owner",
      brandName: "Rajputana Heritage Courtyard",
      city: "Udaipur",
      categoryOrSetting: "Heritage Palace",
      tier: "royal",
      capacityBand: "250-500",
      status: "pending_verification",
      submittedAt: "2026-11-18",
      portfolioUrls: [
        "https://vimeo.com/placeholder-rajputana-4k",
        "https://vimeo.com/placeholder-rajputana-dusk",
      ],
      privateContactName: "Maharaj Devendra Singh",
      privateEmail: "concierge-demo@example.com",
      privatePhone: "+91 98290 41102",
      privateGstNumber: "08AAACR4521K1Z4",
      checklist: {
        gstVerified: true,
        video4kReviewed: true,
        highKeyImageryApproved: false,
        hospitalityReferenceChecked: false,
      },
      reviewerNotes:
        "Awaiting final review of twilight courtyard lighting samples before publishing.",
    },
    {
      id: "app-2",
      referenceId: "TWD-P1038",
      role: "vendor",
      brandName: "Atelier Padma Florals",
      city: "Jaipur",
      categoryOrSetting: "Decor & Florals",
      tier: "grand",
      capacityBand: "100-250",
      status: "under_review",
      submittedAt: "2026-11-15",
      portfolioUrls: ["https://vimeo.com/placeholder-padma-florals"],
      privateContactName: "Nandini Khandelwal",
      privateEmail: "atelier-demo@example.com",
      privatePhone: "+91 98281 90341",
      privateGstNumber: "08BBCPA8890D1Z2",
      checklist: {
        gstVerified: true,
        video4kReviewed: true,
        highKeyImageryApproved: true,
        hospitalityReferenceChecked: false,
      },
      reviewerNotes:
        "Exceptional daylight lotus installations; verifying one Jaipur palace reference.",
    },
    {
      id: "app-3",
      referenceId: "TWD-P1031",
      role: "venue-owner",
      brandName: "Salcete Palm Pavilion",
      city: "Goa",
      categoryOrSetting: "Coastal Estate",
      tier: "classic",
      capacityBand: "under-100",
      status: "needs_info",
      submittedAt: "2026-11-12",
      portfolioUrls: ["https://vimeo.com/placeholder-salcete"],
      privateContactName: "Antonio D'Souza",
      privateEmail: "estate@salcete-demo.in",
      privatePhone: "+91 98221 55091",
      privateGstNumber: "30AAACS9912G1Z9",
      checklist: {
        gstVerified: true,
        video4kReviewed: false,
        highKeyImageryApproved: false,
        hospitalityReferenceChecked: true,
      },
      reviewerNotes:
        "Requested ungraded 4K daytime lawn footage and monsoon contingency plan.",
    },
    {
      id: "app-4",
      referenceId: "TWD-P1024",
      role: "vendor",
      brandName: "Sitar & Strings Chamber",
      city: "Delhi NCR",
      categoryOrSetting: "Entertainment & Folk",
      tier: "grand",
      capacityBand: "250-500",
      status: "approved",
      submittedAt: "2026-11-08",
      portfolioUrls: ["https://vimeo.com/placeholder-sitar-chamber"],
      privateContactName: "Raghavendra Mishra",
      privateEmail: "desk@sitarstrings-demo.in",
      privatePhone: "+91 98110 76214",
      privateGstNumber: "07AADCS5541M1Z7",
      checklist: {
        gstVerified: true,
        video4kReviewed: true,
        highKeyImageryApproved: true,
        hospitalityReferenceChecked: true,
      },
      reviewerNotes: "Approved and queued for editorial listing curation.",
    },
  ];

  const leads: AdminLead[] = [
    {
      id: "lead-1",
      referenceCode: "TWD-9F4K",
      coupleName: "Aarav & Meera Kapoor",
      city: "Udaipur",
      celebrationDate: "December 2026",
      guestCount: "250-500",
      tier: "royal",
      interestType: "venue",
      requestedListing: "Aravalli Marble Courtyard",
      stage: "new",
      assignedDirector: "Ananya Rathore",
      createdAt: "2026-11-20",
      privateEmail: "kapoor.family@demo.example",
      privatePhone: "+91 98100 11223",
      notes: [
        {
          id: "n-1",
          author: "Ananya Rathore",
          createdAt: "2026-11-20 11:15",
          body: "Family seeks 3-day island palace buyout with floating pheras.",
        },
      ],
    },
    {
      id: "lead-2",
      referenceCode: "TWD-8C2M",
      coupleName: "Rhea & Vikramaditya Singhania",
      city: "Jaipur",
      celebrationDate: "February 2027",
      guestCount: "500-plus",
      tier: "royal",
      interestType: "complete-wedding",
      requestedListing: "Amer Chhatri Palace",
      stage: "contacted",
      assignedDirector: "Siddharth Verma",
      createdAt: "2026-11-19",
      privateEmail: "rhea.s@demo.example",
      privatePhone: "+91 98201 33445",
      notes: [
        {
          id: "n-2",
          author: "Siddharth Verma",
          createdAt: "2026-11-19 16:40",
          body: "Initial consultation completed. Preparing 3 Jaipur heritage shortlists.",
        },
      ],
    },
    {
      id: "lead-3",
      referenceCode: "TWD-7A9Q",
      coupleName: "Ishita & Kabir Malhotra",
      city: "Delhi NCR",
      celebrationDate: "November 2026",
      guestCount: "250-500",
      tier: "grand",
      interestType: "vendor",
      requestedListing: "Atelier Kamala Florals",
      stage: "shortlist_sent",
      assignedDirector: "Kavya Deshmukh",
      createdAt: "2026-11-17",
      privateEmail: "ishita.m@demo.example",
      privatePhone: "+91 98112 77889",
      notes: [
        {
          id: "n-3",
          author: "Kavya Deshmukh",
          createdAt: "2026-11-18 10:05",
          body: "Sent floral scenography dossier with daylight lotus & mogra studies.",
        },
      ],
    },
    {
      id: "lead-4",
      referenceCode: "TWD-6E1P",
      coupleName: "Tara & Arjun Deshpande",
      city: "Goa",
      celebrationDate: "January 2027",
      guestCount: "100-250",
      tier: "classic",
      interestType: "venue",
      requestedListing: "Mandovi Clifftop Sanctuary",
      stage: "site_visit",
      assignedDirector: "Ananya Rathore",
      createdAt: "2026-11-14",
      privateEmail: "tara.d@demo.example",
      privatePhone: "+91 98230 99112",
      notes: [
        {
          id: "n-4",
          author: "Ananya Rathore",
          createdAt: "2026-11-16 14:20",
          body: "Hosted Goa walkthrough scheduled for Friday with tasting menu.",
        },
      ],
    },
    {
      id: "lead-5",
      referenceCode: "TWD-5B8W",
      coupleName: "Diya & Neil Oberoi",
      city: "Udaipur",
      celebrationDate: "February 2027",
      guestCount: "250-500",
      tier: "royal",
      interestType: "complete-wedding",
      requestedListing: "Pichola Zenana Court",
      stage: "booked",
      assignedDirector: "Siddharth Verma",
      createdAt: "2026-11-05",
      privateEmail: "diya.o@demo.example",
      privatePhone: "+91 98190 44556",
      notes: [
        {
          id: "n-5",
          author: "Siddharth Verma",
          createdAt: "2026-11-12 18:10",
          body: "Full buyout & concierge production agreement finalized.",
        },
      ],
    },
  ];

  const auditLog: AuditLogEntry[] = [
    {
      id: "aud-1",
      timestamp: "2026-11-20 14:12",
      actor: "Ananya Rathore",
      role: "Admin",
      action: "Verified 4K HLS stream",
      target: "Hero Chapter 03 · Pheras",
    },
    {
      id: "aud-2",
      timestamp: "2026-11-20 12:04",
      actor: "Siddharth Verma",
      role: "Concierge",
      action: "Moved lead to Contacted",
      target: "TWD-8C2M · Rhea & Vikramaditya",
    },
    {
      id: "aud-3",
      timestamp: "2026-11-19 17:45",
      actor: "Ananya Rathore",
      role: "Admin",
      action: "Approved partner application",
      target: "TWD-P1024 · Sitar & Strings Chamber",
    },
  ];

  return {
    heroSlides,
    applications,
    venues,
    vendors,
    leads,
    auditLog,
  };
}

export function reorderHeroSlides(
  slides: AdminHeroSlide[],
  index: number,
  direction: -1 | 1
): AdminHeroSlide[] {
  const targetIndex = index + direction;
  if (targetIndex < 0 || targetIndex >= slides.length) return slides;
  const copy = [...slides];
  const [moved] = copy.splice(index, 1);
  copy.splice(targetIndex, 0, moved);
  return copy.map((slide, idx) => ({
    ...slide,
    orderIndex: idx,
    chapterIndex: String(idx + 1).padStart(2, "0"),
  }));
}

export function transitionPartnerApplication(
  applications: AdminPartnerApplication[],
  applicationId: string,
  nextStatus: PartnerStatus,
  reviewerNotes?: string
): AdminPartnerApplication[] {
  return applications.map((app) =>
    app.id === applicationId
      ? {
          ...app,
          status: nextStatus,
          reviewerNotes:
            reviewerNotes !== undefined ? reviewerNotes : app.reviewerNotes,
        }
      : app
  );
}

export function moveLeadToStage(
  leads: AdminLead[],
  leadId: string,
  nextStage: LeadStage
): AdminLead[] {
  return leads.map((lead) =>
    lead.id === leadId ? { ...lead, stage: nextStage } : lead
  );
}

export function appendLeadNote(
  leads: AdminLead[],
  leadId: string,
  author: string,
  body: string,
  timestampLabel?: string
): AdminLead[] {
  const cleanBody = body.trim();
  if (!cleanBody) return leads;
  const noteId = `note-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const createdAt = timestampLabel ?? "Just now";
  return leads.map((lead) =>
    lead.id === leadId
      ? {
          ...lead,
          notes: [
            { id: noteId, author, createdAt, body: cleanBody },
            ...lead.notes,
          ],
        }
      : lead
  );
}

export function prependAuditEntry(
  log: AuditLogEntry[],
  entry: Omit<AuditLogEntry, "id" | "timestamp"> & { timestamp?: string }
): AuditLogEntry[] {
  const newEntry: AuditLogEntry = {
    id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: entry.timestamp ?? "Just now",
    actor: entry.actor,
    role: entry.role,
    action: entry.action,
    target: entry.target,
  };
  return [newEntry, ...log].slice(0, 40);
}

export function getCityNameFromSlug(slug: string): string {
  return LAUNCH_CITIES.find((c) => c.slug === slug)?.name ?? "Udaipur";
}
