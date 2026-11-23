import type {
  BudgetTier,
  CitySlug,
  PartnerStatus,
  PublicHeroSlide,
  PublicVendor,
  PublicVenue,
} from "@/lib/data/types";

export type VideoProcessingStatus = "queued" | "processing" | "ready";

export interface AdminHeroSlide extends PublicHeroSlide {
  isPublished: boolean;
  processingStatus: VideoProcessingStatus;
  scheduleWindow: string;
  orderIndex: number;
}

export interface AdminPartnerApplication {
  id: string;
  referenceId: string;
  role: "venue-owner" | "vendor";
  brandName: string;
  city: string;
  categoryOrSetting: string;
  tier: BudgetTier;
  capacityBand: string;
  status: PartnerStatus;
  submittedAt: string;
  portfolioUrls: string[];
  // Staff-only private fields (NEVER exposed on public routes)
  privateContactName: string;
  privateEmail: string;
  privatePhone: string;
  privateGstNumber: string;
  checklist: {
    gstVerified: boolean;
    video4kReviewed: boolean;
    highKeyImageryApproved: boolean;
    hospitalityReferenceChecked: boolean;
  };
  reviewerNotes: string;
}

export type LeadStage =
  | "new"
  | "contacted"
  | "shortlist_sent"
  | "site_visit"
  | "booked";

export interface AdminLeadNote {
  id: string;
  author: string;
  createdAt: string;
  body: string;
}

export interface AdminLead {
  id: string;
  referenceCode: string;
  coupleName: string;
  city: string;
  celebrationDate: string;
  guestCount: string;
  tier: BudgetTier;
  interestType: "venue" | "vendor" | "complete-wedding";
  requestedListing?: string;
  stage: LeadStage;
  assignedDirector: string;
  createdAt: string;
  privateEmail: string;
  privatePhone: string;
  notes: AdminLeadNote[];
}

export interface AdminListingPrivateVault {
  privateContactName: string;
  privateEmail: string;
  privatePhone: string;
  rateCardBandInternal: string;
  internalNotes: string;
  seoTitle: string;
  seoDescription: string;
  amenities: string[];
  isPublished: boolean;
}

export interface AdminVenueRecord extends PublicVenue {
  vault: AdminListingPrivateVault;
}

export interface AdminVendorRecord extends PublicVendor {
  vault: AdminListingPrivateVault;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  role: "Admin" | "Editor" | "Concierge";
  action: string;
  target: string;
}

export interface AdminCmsState {
  heroSlides: AdminHeroSlide[];
  applications: AdminPartnerApplication[];
  venues: AdminVenueRecord[];
  vendors: AdminVendorRecord[];
  leads: AdminLead[];
  auditLog: AuditLogEntry[];
}

export interface CreateVenueInput {
  name: string;
  citySlug: CitySlug;
  setting: string;
  capacityMin: number;
  capacityMax: number;
  tier: BudgetTier;
  tagline: string;
}
