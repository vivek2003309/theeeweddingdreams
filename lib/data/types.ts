export type BudgetTier = "classic" | "grand" | "royal";

export type CitySlug = "delhi-ncr" | "jaipur" | "udaipur" | "goa";

export type VenueSettingSlug =
  | "heritage-palace"
  | "royal-courtyard"
  | "coastal-estate"
  | "garden-pavilion"
  | "historic-haveli";

export type VendorCategorySlug =
  | "decor-florals"
  | "photography-cinema"
  | "bridal-couture"
  | "culinary-hospitality"
  | "entertainment-folk"
  | "concierge-production";

export type PartnerStatus =
  | "pending_verification"
  | "under_review"
  | "approved"
  | "rejected"
  | "needs_info";

export type HeroChapterSlug =
  | "sangeet"
  | "mehendi"
  | "pheras"
  | "reception"
  | "destination"
  | "pre-wedding";

export type GuestBand = "all" | "under-100" | "100-250" | "250-500" | "500-plus";

export interface PublicHeroSlide {
  id: string;
  slug: HeroChapterSlug;
  chapterIndex: string;
  chapterName: string;
  devanagariCaption: string;
  headlinePrefix: string;
  headlineItalic: string;
  headlineSuffix: string;
  subtitle: string;
  cityLabel: string;
  citySlug: CitySlug;
  venueTitle: string;
  settingLabel: string;
  durationSeconds: number;
  hlsUrl: string;
  previewMp4Url: string;
  posterUrl: string;
  altDescription: string;
  visualMotif: {
    backdropGradient: string;
    archTint: string;
    accentGlow: string;
    architecturalLabel: string;
  };
}

export interface PublicVenue {
  id: string;
  slug: string;
  name: string;
  city: string;
  citySlug: CitySlug;
  setting: string;
  settingSlug: VenueSettingSlug;
  capacityMin: number;
  capacityMax: number;
  tier: BudgetTier;
  verified: boolean;
  tagline: string;
  posterUrl: string;
  previewMp4Url: string;
  hlsUrl: string;
  altText: string;
  visualGradient: string;
}

export interface PublicVendor {
  id: string;
  slug: string;
  name: string;
  category: string;
  categorySlug: VendorCategorySlug;
  city: string;
  citySlug: CitySlug;
  tier: BudgetTier;
  verified: boolean;
  specialty: string;
  posterUrl: string;
  previewMp4Url: string;
  hlsUrl: string;
  altText: string;
  visualGradient: string;
}

export interface PublicDecorPlate {
  id: string;
  slug: string;
  indexLabel: string;
  title: string;
  ritualLabel: string;
  cityLabel: string;
  citySlug: CitySlug;
  craftNote: string;
  aspectVariant: "tall" | "wide" | "arch";
  posterUrl: string;
  previewMp4Url: string;
  hlsUrl: string;
  altText: string;
  visualGradient: string;
}

export interface PublicExperience {
  id: string;
  slug: string;
  indexLabel: string;
  title: string;
  subtitle: string;
  cityLabel: string;
  citySlug: CitySlug;
  durationLabel: string;
  tier: BudgetTier;
  altText: string;
  visualGradient: string;
}

export interface PublicProcessionStep {
  id: string;
  stepNumber: string;
  title: string;
  devanagariCaption: string;
  summary: string;
  conciergePromise: string;
  deliverableLabel: string;
}

export interface PublicRealWedding {
  id: string;
  slug: string;
  coupleTitle: string;
  cityLabel: string;
  citySlug: CitySlug;
  venueName: string;
  seasonLabel: string;
  storyExcerpt: string;
  tier: BudgetTier;
  altText: string;
  visualGradient: string;
}

export interface PublicJournalDispatch {
  id: string;
  slug: string;
  categoryLabel: string;
  title: string;
  readTimeLabel: string;
  excerpt: string;
}

export interface PartnerStatusRecord {
  referenceId: string;
  brandName: string;
  email: string;
  status: PartnerStatus;
  submittedAt: string;
  note: string;
}

export interface DataAdapter {
  getHeroSlides(): Promise<PublicHeroSlide[]>;
  getDecorPlates(): Promise<PublicDecorPlate[]>;
  getCuratedExperiences(): Promise<PublicExperience[]>;
  getFeaturedVenues(filter?: {
    city?: CitySlug;
    setting?: VenueSettingSlug;
  }): Promise<PublicVenue[]>;
  getFeaturedVendors(filter?: {
    category?: VendorCategorySlug;
    city?: CitySlug;
  }): Promise<PublicVendor[]>;
  getProcessionSteps(): Promise<PublicProcessionStep[]>;
  getRealWeddings(): Promise<PublicRealWedding[]>;
  getJournalDispatches(): Promise<PublicJournalDispatch[]>;
}
